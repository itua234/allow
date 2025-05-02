import express, { Request as ExpressRequest, NextFunction, Response } from 'express';
//const { cloudinaryUpload, uploadToBlob } = require('../../services/cloudinary');
const { sequelize, models: { Request, Customer, Document } } = require('@models').default;
import crypto from 'crypto';
const { encrypt, decrypt } = require('@util/helper');
import { Transaction } from 'sequelize';
import { ref } from 'process';
const tokenVaultService = require('@services/tokenVaultService');

function generateToken() {
    return crypto.randomBytes(24).toString('hex'); // Generate a 64-character hex token
}
// Function to generate a unique hash for the identity document
function generateIdentityHash(type: string, number: string) {
    const identityString = `${type}:${number}`;
    return crypto.createHash('sha256').update(identityString).digest('hex');
}

exports.initiate = async(req: ExpressRequest, res: Response) => {
    const {
        customer,
        reference,
        redirect_url,
        kyc_level,
        bank_accounts,
    } = req.body;
    try{
        const kyc_token = generateToken();
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

            // Store the token mapping securely
            await tokenVaultService.storeToken(kyc_token, customer);

            return { request, customer };
        });

        const data = {
            "id": result.request.id,
            "customer": result.request.kyc_token,
            "allow_url": result.request.allow_url,
            reference: result.request.reference,
            "redirect_url": result.request.redirect_url,
            "bank_accounts": result.request.bank_accounts,
            "kyc_level": result.request.kyc_level,
            is_blacklisted: false
        };

        return res.status(200).json({
            message: 'KYC process initiated successfully',
            results: data,
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

