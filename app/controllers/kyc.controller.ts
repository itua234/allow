import express, { Request as ExpressRequest, NextFunction, Response } from 'express';
//const { cloudinaryUpload, uploadToBlob } = require('../../services/cloudinary');
const { sequelize, models: { Request, Customer, Document } } = require('@models').default;
import crypto from 'crypto';
const { encrypt, decrypt } = require('@util/helper');
import { Transaction } from 'sequelize';

exports.initiate = async(req: ExpressRequest, res: Response) => {
    return res.json(await Customer.findByPk("2f19f5a9-b4f0-4c37-9fb9-786933c50864"))
    const {
        customer,
        reference,
        redirect_url,
        kyc_level,
        bank_accounts,
    } = req.body;
    try{
        const identityString = `${customer.identity_type}:${customer.identity_number}`;
        const identityHash = crypto.createHash('sha256').update(identityString).digest('hex');
        const kyc_token = crypto.randomBytes(24).toString('hex');
        // Create request and customer atomically
        const result = await sequelize.transaction(async (t: Transaction) => {
            const request = await Request.create({
                company_id: (req.app as any).company_id,
                reference,
                redirect_url,
                kyc_level,
                bank_accounts,
                kyc_token: kyc_token,
                token_expires_at: new Date(Date.now() + 3600 * 1000), // 1 hour from now
            }, { transaction: t });

            let existingCustomer = await findExistingCustomer(customer, t);

            if (existingCustomer) {
                await request.update({
                    customer_id: existingCustomer.id
                }, { transaction: t });

                return { request, customer: existingCustomer };
            }

            const newCustomer = await Customer.create({
                name: customer.name ? encrypt(customer.name) : null,
                email: customer.email ? encrypt(customer.email) : null,
            }, { transaction: t });

            // Create the initial document
            await Document.create({
                customer_id: newCustomer.id,
                identity_type: customer.identity.type.toUpperCase(),
                identity_number: customer.identity.number,
                identity_hash: identityHash,
                verified: false
            }, { transaction: t });

            await request.update({
                customer_id: newCustomer.id
            }, { transaction: t });

            return { request, customer: newCustomer };
        });

        return res.status(200).json({
            message: 'KYC process initiated successfully',
            results: result,
            error: false
        });
    } catch (error) {
        console.log('Error initiating kyc process:', error);
        return res.status(500).json({
            message: 'An error occurred while initiating the KYC process',
            error: true
        });
    }
}

async function findExistingCustomer(customer: any, transaction: Transaction) {
    const identityHash = generateIdentityHash(
        customer.identity.type.toUpperCase(),
        customer.identity.number
    );

    // First try to find by the current identity document
    const existingDocument = await Document.findOne({
        where: { 
            identity_type: customer.identity.type.toUpperCase(),
            identity_number: customer.identity.number
        },
        include: [{
            model: Customer,
            as: "customer",
            attributes: ['id', 'name', 'email']
        }],
        transaction
    });

    if (existingDocument?.Customer) {
        return existingDocument.Customer;
    }

    // If not found by current identity, check if customer exists with other identity types
    if (customer.email) {
        const customerByEmail = await Customer.findOne({
            where: { email: encrypt(customer.email) },
            include: [{
                model: Document,
                required: true,
                as: "documents",
                attributes: ['identity_type', 'identity_number', 'verified']
            }],
            transaction
        });

        if (customerByEmail) {
            // Create new document for existing customer
            await Document.create({
                customer_id: customerByEmail.id,
                identity_type: customer.identity.type.toUpperCase(),
                identity_number: customer.identity.number,
                identity_hash: identityHash,
                verified: false
            }, { transaction });

            return customerByEmail;
        }
    }

    return null;
}


/**
 * Generates a SHA-256 hash for the given identity.
 * @param {string} type - The type of identity, e.g., "BVN" or "NIN".
 * @param {string} number - The identity number.
 * @returns {string} Hashed identity string.
*/
function generateIdentityHash(type: string, number: string) {
    const identityString = `${type}:${number}`;
    return crypto.createHash('sha256').update(identityString).digest('hex');
}