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
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// export function testEncryption() {
//     const text = 'Hello, World!';
//     const encrypted = encrypt(text);
//     const decrypted = decrypt(encrypted);
//     console.log('Original:', text);
//     console.log('Encrypted:', encrypted);
//     console.log('Decrypted:', decrypted);
// }

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

exports.showVerificationpage = async(req: ExpressRequest, res: Response) => {
    const { kyc_token } = req.params;
    try {
        // Retrieve the customer data securely using the token
        const customer = await tokenVaultService.retrieveIdentity(kyc_token);
        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found or token expired',
                error: true
            });
        }
        const request = await Request.findOne({ where: { kyc_token } });
        // Decrypt the customer data before sending it to the client
        //const decryptedCustomer = decrypt(customer);

        return res.status(200).json({
            message: 'Customer data retrieved successfully',
            customer: {request, customer},
            error: false
        });
    } catch (error) {
        console.log('Error retrieving customer data:', error);
        return res.status(500).json({
            message: 'An error occurred while retrieving customer data',
            error: true
        });
    }
}

exports.verifyPhone = async(req: ExpressRequest, res: Response) => {
    const { phone, kyc_token } = req.body;
    try {
        // Check if token is valid
        const request = await Request.findOne({ where: { kyc_token } });
        if (!request) {
            return res.status(404).json({
                message: 'Invalid or expired token',
                error: true
            });
        }
        // Generate and store OTP securely
        const otp = generateOTP();
        const encryptedPhone = encrypt(phone);
        
        // Store OTP and phone temporarily (expires in 10 minutes)
        await tokenVaultService.storeOTP(kyc_token, {
            phone: encryptedPhone,
            otp,
            expires: Date.now() + (10 * 60 * 1000)
        });

        // TODO: Send OTP via SMS service
        console.log('OTP for testing:', otp);

        return res.status(200).json({
            message: 'OTP sent successfully',
            error: false
        });
    } catch (error) {
        console.log('Error in phone verification:', error);
        return res.status(500).json({
            message: 'An error occurred during phone verification',
            error: true
        });
    }
}

exports.verifyOTP = async(req: ExpressRequest, res: Response) => {
    const { otp, kyc_token } = req.body;
    try {
        // Retrieve stored OTP data
        const otpData = await tokenVaultService.retrieveOTP(kyc_token);
        if (!otpData || otpData.expires < Date.now()) {
            return res.status(400).json({
                message: 'OTP expired or invalid',
                error: true
            });
        }
        if (otp !== otpData.otp) {
            return res.status(400).json({
                message: 'Invalid OTP',
                error: true
            });
        }

        // Check for existing customer with this phone
        const existingCustomer = await Customer.findOne({
            where: { phone: encrypt(otpData.phone) },
            attributes: ['id', 'verified_at'],
        });

        // Clear OTP data
        await tokenVaultService.clearOTP(kyc_token);

        return res.status(200).json({
            message: 'OTP verified successfully',
            hasExistingVerification: !!existingCustomer?.verified_at,
            error: false
        });
    } catch (error) {
        console.log('Error in OTP verification:', error);
        return res.status(500).json({
            message: 'An error occurred during OTP verification',
            error: true
        });
    }
}