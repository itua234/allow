import express, { Request as ExpressRequest, NextFunction, Response } from 'express';
//const { cloudinaryUpload, uploadToBlob } = require('../../services/cloudinary');
const { models: { Request, Customer } } = require('@models').default;
import crypto from 'crypto';
const { encrypt, decrypt } = require('@util/helper');

/**
 * Initiates a KYC process.
 * @param {object} req.body - The request body containing KYC initiation details.
 * @param {object} req.body.customer - Information about the customer.
 * @param {string} req.body.customer.name - The name of the customer.
 * @param {string} req.body.customer.email - The email address of the customer.
 * @param {string} req.body.customer.address - The address of the customer.
 * @param {object} req.body.customer.identity - Identity information of the customer.
 * @param {string} req.body.customer.identity.number - The identity number.
 * @param {string} req.body.customer.identity.type - The type of identity (e.g., "bvn").
 * @param {string} req.body.reference - Unique reference for this KYC request.
 * @param {string} req.body.redirect_url - URL to redirect the user after KYC completion.
 * @param {string} req.body.kyc_level - The desired KYC level for the customer.
 * @param {boolean} req.body.bank_accounts - A boolean that determines if bank details should be verified.
 * @param {ExpressRequest} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - Returns a JSON response indicating the success or failure of the initiation.
*/
exports.initiate = async(req: ExpressRequest, res: Response) => {
    // return res.json(req.body);
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

        const request = await Request.create({
            company_id: (req.app as any).company_id,
            reference,
            redirect_url,
            kyc_level,
            bank_accounts,
            kyc_token: kyc_token,
            //allow_url: `https://api.allow.com/${token}`,
            token_expires_at: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        });

        return res.json(request);

        let existingCustomer = null;
        // 1. Search by primary identifiers (if available)
        if (customer.email || customer.phone) {
            const query: Record<string, any> = {};
            customer.email && (query.email = encrypt(customer.email));
            customer.phone && (query.phone = encrypt(customer.phone));
            
            existingCustomer = await Customer.findOne({
                where: query
            });
        }

        if(!existingCustomer){
            if (customer.identity_type === 'NIN') {
                let hash = generateIdentityHash('NIN', customer.identity_number);
                
                existingCustomer = await Customer.findOne({
                    attributes: ['id', 'name', 'email'], // Specify Customer attributes
                    include: [{
                        model: Document,
                        where: { identity_hash: hash },
                        required: true,
                        attributes: ['identity_type', 'identity_number', 'verified']
                    }]
                });
            } else if(customer.identity_type === 'BVN'){
                let hash = generateIdentityHash('BVN', customer.identity_number);
                
                existingCustomer = await Customer.findOne({
                    attributes: ['id', 'name', 'email'], // Specify Customer attributes
                    include: [{
                        model: Document,
                        where: { identity_hash: hash },
                        required: true,
                        attributes: ['identity_type', 'identity_number', 'verified']
                    }]
                });
            }
        }

        if (existingCustomer) {
            await request.update({
                customer_id: existingCustomer.id
            });
        }

        
        // Create new customer if not found
        const newCustomer = await Customer.create({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            dob: customer.dob,
            identity_type: customer.identity_type,
            identity_number: customer.identity_number,
            identity_hash: identityHash
        });
        // Link customer to request
        await request.update({
            customer_id: newCustomer.id
        });

        return res.status(200).json({
            message: 'KYC process initiated successfully',
            request_id: request.id,
            kyc_token,
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

// /**
//  * Attempts to find an existing customer by identity hash, trying both BVN and NIN.
//  * @param {Object} customer - The customer data from the KYC request.
//  * @returns {Promise<Customer|null>} Found customer or null.
//  */
// async function findExistingCustomer(customer) {
//     const primaryHash = generateIdentityHash(customer.identity_type, customer.identity_number);
//     let existingCustomer = await Customer.findOne({ where: { identity_hash: primaryHash } });
  
//     if (!existingCustomer) {
//       // Try alternate identity
//       if (customer.identity_type === 'NIN' && customer.bvn) {
//         const bvnHash = generateIdentityHash('BVN', customer.bvn);
//         existingCustomer = await Customer.findOne({ where: { identity_hash: bvnHash } });
//       } else if (customer.identity_type === 'BVN' && customer.nin) {
//         const ninHash = generateIdentityHash('NIN', customer.nin);
//         existingCustomer = await Customer.findOne({ where: { identity_hash: ninHash } });
//       }
//     }
  
//     return existingCustomer;
//   }