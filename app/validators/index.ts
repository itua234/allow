// import { sequelize, models } from '../models';
// import { Op, QueryTypes } from 'sequelize';
// import { returnValidationError } from '../util/helper';
// import { Validator } from 'node-input-validator';

// export class BaseValidator {
//     protected validator: typeof Validator;

//     constructor() {
//         this.validator = Validator;

//         // Extend custom rules
//         this.validator.extend('hasSpecialCharacter', ({ value }) => {
//             return /[^a-zA-Z0-9]/.test(value);
//         });

//         this.validator.extend('containsNumber', ({ value }) => {
//             return /\d/.test(value);
//         });

//         this.validator.extend('isSingleWord', ({ value }) => {
//             return !value.includes(' ');
//         });

//         this.validator.extend('unique', async ({ value, args }) => {
//             const field = args[1] || 'id';
//             const query = args[2]
//                 ? `SELECT * FROM ${args[0]} WHERE ${field}=? AND id != ? LIMIT 1`
//                 : `SELECT * FROM ${args[0]} WHERE ${field}=? LIMIT 1`;

//             const replacements = args[2] ? [value, args[2]] : [value];
//             const result = await sequelize.query(query, {
//                 replacements,
//                 type: QueryTypes.SELECT,
//             });

//             return result.length === 0;
//         });

//         this.validator.extend('exists', async ({ attr, value, args }) => {
//             const field = args[1] || attr;
//             const result = await sequelize.query(
//                 `SELECT * FROM ${args[0]} WHERE ${field}=? LIMIT 1`,
//                 {
//                     replacements: [value],
//                     type: QueryTypes.SELECT,
//                 }
//             );

//             return result.length > 0;
//         });

//         this.validator.extend('confirmed', ({ attr, value }, validator) => {
//             const confirmationField = `${attr}_confirmation`;
//             return value === validator.inputs[confirmationField];
//         });

//         this.validator.extend('phoneWithCountryCode', ({ value }) => {
//             const regex = /^\+[1-9]{1}[0-9]{1,14}$/;
//             return regex.test(value);
//         });

//         this.validator.extend('phoneVerified', async ({ value }) => {
//             const user = await models.User.findOne({
//                 where: {
//                     phone: value,
//                     phone_verified_at: { [Op.not]: null },
//                 },
//             });

//             return !user;
//         });

//         // Extend custom messages
//         this.validator.extendMessages({
//             hasSpecialCharacter: 'The :attribute field must have a special character',
//             containsNumber: 'The :attribute field must contain a number',
//             isSingleWord: 'The :attribute field must be a single word',
//             exists: 'The selected :attribute is invalid.',
//             phoneVerified: 'This :attribute already exists',
//             phoneWithCountryCode: 'The phone number must include a valid country code and be in the correct format.',
//         });
//     }

//     protected async validate(req: any, rules: any, res: any, errorMessage: string, next: Function) {
//         const v = new this.validator(req.body || req.params, rules);

//         const matched = await v.check();
//         if (!matched) {
//             return returnValidationError(v.errors, res, errorMessage);
//         }

//         if (!req.value) {
//             req.value = {};
//         }
//         req.body = v.inputs;
//         next();
//     }
// }