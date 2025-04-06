import { Request, Response, NextFunction } from 'express';
import niv from 'node-input-validator';
import { Sequelize, QueryTypes, Op } from 'sequelize';
const { sequelize }: { 
    sequelize: Sequelize; 
} = require('@models');
const User = require('@models/user'); // Assuming User is the default export
const {returnValidationError} = require("@util/helper");

niv.extend('hasSpecialCharacter', ({ value }: { value: string }) => {
    if(!value.match(/[^a-zA-Z0-9]/)){
        //Return an error if the value does not contain a special character
        return false;
    }
    return true;
})
niv.extend('containsNumber', ({ value }: { value: string }) => {
    if(!value.match(/\d/)){
        //Return an error if the value does not contain a special character
        return false;
    }
    return true;
})
niv.extend('isSingleWord', ({ value }: { value: string }) => {
    if(value.includes(" ")){
        //Return an error if the value does not contain a special character
        return false;
    }
    return true;
})
niv.extend('unique', async ({ attr, value, args }: { attr: string; value: string; args: string[] }) => {
    const field = args[1] || attr;
    let emailExist;
    if(args[2]){
        emailExist = await sequelize.query(`SELECT * FROM ${args[0]} WHERE ${field}=? AND id != ? LIMIT 1`,{
            replacements: [value, args[2]],
            type: QueryTypes.SELECT
        })
    }else{
        emailExist = await sequelize.query(`SELECT * FROM ${args[0]} WHERE ${field}=? LIMIT 1`,{
            replacements: [value],
            type: QueryTypes.SELECT
        })
    }
    
    if(emailExist.length !== 0){
        return false;
    }
    return true;
})
niv.extend('exists', async ({ attr, value, args }: { attr: string; value: string; args: string[] }) => {
    const field = args[1] || attr;
    let emailExist = await sequelize.query(`SELECT * FROM ${args[0]} WHERE ${field}=? LIMIT 1`,{
        replacements: [value],
        type: QueryTypes.SELECT
    })
    if(emailExist.length === 0){
        return false;
    }
    return true;
});
niv.extend('confirmed', ({ attr, value }: { attr: string; value: string }, validator: niv.Validator) => {
    const field = `${attr}_confirmation`;
    const secondValue = validator.inputs[field];
    if (value !== secondValue) {
        return false;
    }
    return true;
});
niv.extend('phoneWithCountryCode', ({value}: {value: string}) => {
    const phoneWithCountryCodeRegex = /^\+[1-9]{1}[0-9]{1,14}$/; // Adjust regex based on your requirements
    return phoneWithCountryCodeRegex.test(value);
});
niv.extend('phoneVerified', async ({value}: {value: string}) => {
    let phoneVerified = await User.findOne({
        where: {
            phone: value,
            phone_verified_at: {
                [Op.not]: null
            }
        }
    });
    if(phoneVerified){
        return false;
    }
    return true;
});
niv.extendMessages({
    hasSpecialCharacter: 'The :attribute field must have a special character',
    containsNumber: 'The :attribute field must contain a number',
    isSingleWord: 'The :attribute field must be a single word',
    exists: 'The selected :attribute is invalid.',
    phoneVerified: 'This :attribute already exist',
    phoneWithCountryCode: 'The phone number must include a valid country code and be in the correct format.'
});

//export the schemas
export default {
    login: async(req: Request, res: Response, next: NextFunction) => {
        const v = new niv.Validator(req.body, {
            email: 'required|email',
            password: 'required|string',
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "Login failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },

    google_login: async(req: Request, res: Response, next: NextFunction) => {
        const v = new niv.Validator(req.body, {
            email: 'required|string|email',
            firstname: 'required|string',
            lastname: 'required|string',
            photo: 'required|string',
            googleId: 'required|string',
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "Google authentication failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    }
}