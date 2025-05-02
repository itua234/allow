import { Sequelize, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
const { encrypt, decrypt } = require('@util/helper');

export interface CustomerAttributes extends Model<InferAttributes<CustomerAttributes>, InferCreationAttributes<CustomerAttributes>> {
    id: string;
    name: string;
    email: string;
    phone?: string;
    phone_verified_at?: Date;
    dob?: string;
    verified: boolean;
    verified_at?: Date;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    address?: string;
    is_blacklisted: boolean;
}

type CustomerModelStatic = typeof Model & {
    new (values?: object, options?: object): CustomerAttributes;
    associate: (models: { Permission: any; Document: any }) => void;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const Customer = <CustomerModelStatic>sequelize.define('Customer', {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                try {
                    const encryptedValue = this.getDataValue('name');
                    if (!encryptedValue) return null;
                    const decryptedValue = decrypt(encryptedValue);
                    return decryptedValue;
                } catch (error) {
                    console.error('Decryption error:', error);
                    return null;
                }
            },
            set(value: string) {
                this.setDataValue('name', encrypt(value));
            }
        },
        email: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
            get() {
                const encryptedValue = this.getDataValue('email');
                return encryptedValue ? decrypt(encryptedValue) : null;
            },
            set(value: string) {
                this.setDataValue('email', encrypt(value.toLowerCase()));
            }
        },
        phone: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: true,
            get() {
                const encryptedValue = this.getDataValue('phone');
                return encryptedValue ? decrypt(encryptedValue) : null;
            },
            set(value: string) {
                this.setDataValue('phone', encrypt(value));
            }
        },
        phone_verified_at: { type: DataTypes.DATE, allowNull: true },
        dob: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const encryptedValue = this.getDataValue('dob');
                return encryptedValue ? decrypt(encryptedValue) : null;
            },
            set(value: string) {
                this.setDataValue('dob', encrypt(value));
            }
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            get() {
                return Boolean(this.getDataValue('verified'));
            }
        },
        verified_at: { type: DataTypes.DATE, allowNull: true },
        status: {
            type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
            defaultValue: 'PENDING'
        },
        address: { type: DataTypes.TEXT, allowNull: true },
        is_blacklisted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            get() {
                return Boolean(this.getDataValue('is_blacklisted'));
            }
        },
    }, {
        hooks: {
            // afterFind: (customers: CustomerAttributes[]) => {
            //     if (!Array.isArray(customers)) customers = [customers];
            //     customers.forEach((customer: CustomerAttributes) => {
            //         customer.email = decrypt(customer.email);
            //         customer.phone = decrypt(customer.phone);
            //     });
            // }
        },
        tableName: 'customers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        defaultScope: {
            //attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
    });

    Customer.associate = (models) => {
        Customer.hasMany(models.Permission);
        Customer.hasMany(models.Document, {
            foreignKey: 'customer_id',
            as: 'documents'
        });
    };

    return Customer;
};