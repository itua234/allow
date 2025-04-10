import { Sequelize, DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
const { encrypt, decrypt } = require('@util/helper');

export default interface UserAttributes extends Model<InferAttributes<UserAttributes>, InferCreationAttributes<UserAttributes>> {
    id: string;
    //id: CreationOptional<number>;
    name: string;
    email: string;
    phone: string;
    dob: string;
    verified: boolean;
    verified_at: Date;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    address?: string;
    is_blacklisted: string

    // photo?: string;
    // country?: string;
    // state?: string;
    // city?: string;
    // zip_code?: string;
}

type UserModelStatic = typeof Model & {
    new (values?: object, options?: object): UserAttributes;
    associate: (models: { Permission: any; Document: any }) => void;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const User = <UserModelStatic>sequelize.define('User', {
        id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const encryptedValue = this.getDataValue('name');
                return encryptedValue ? decrypt(encryptedValue) : null;
            },
            set(value: string) {
                value = value.toLowerCase();
                this.setDataValue('name', encrypt(value));
            }
        },
        email: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING, 
            unique: true, 
            allowNull: false,
            get() {
                const encryptedValue = this.getDataValue('phone');
                return encryptedValue ? decrypt(encryptedValue) : null;
            },
            set(value: string) {
                this.setDataValue('phone', encrypt(value));
            }
        },
        dob: {
            type: DataTypes.STRING, 
            allowNull: false,
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
        verified_at: {type: DataTypes.DATE, allowNull: false},
        status: {
            type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
            defaultValue: 'PENDING'
        },
        address: {type: DataTypes.TEXT, allowNull: true},
        is_blacklisted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            get() {
                return Boolean(this.getDataValue('is_blacklisted'));
            }
        },

        // photo: {type: DataTypes.STRING, allowNull: true},
        // country: {type: DataTypes.STRING, allowNull: true},
        // state: {type: DataTypes.STRING, allowNull: true},
        // city: {type: DataTypes.STRING, allowNull: true},
        // zip_code: {type: DataTypes.STRING, allowNull: true}
    },{
        hooks: {
            beforeCreate: async (user) => {
               
            },
            beforeUpdate: async (user) => {
                
            }
        },
        tableName: 'users',
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
    });

    // Define relationships
    User.associate = (models: { Permission: any; Document: any }) => {
        User.hasMany(models.Permission);
        User.hasMany(models.Document, { as: 'verification_documents' });
    };

    return User;
}