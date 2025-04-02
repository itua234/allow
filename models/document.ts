import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
const { encrypt, decrypt } = require('@util/helper');

// Define the DocumentAttributes interface
interface DocumentAttributes extends Model<InferAttributes<DocumentAttributes>, InferCreationAttributes<DocumentAttributes>> {
    id: string;
    user_id: string;
    type: 'BVN' | 'NIN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD' | 'RESIDENT_PERMIT' | 'WORK_PERMIT' | 'NATIONAL_ID' | 'OTHER';
    text: string;
    image: string;
    verified: boolean;
    verified_at: Date;
    expired_at: Date;
}

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const Document = sequelize.define<DocumentAttributes>('Document', {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: { tableName: 'users' },
                key: 'id'
            },
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(
                'BVN',
                'NIN',
                'PASSPORT',
                'DRIVERS_LICENSE',
                'VOTERS_CARD',
                'RESIDENT_PERMIT',
                'WORK_PERMIT',
                'NATIONAL_ID',
                'OTHER'
            ),
            allowNull: false
        },
        text: { 
            type: DataTypes.STRING, 
            allowNull: false,
            get() {
                const encryptedValue = this.getDataValue('text');
                return encryptedValue ? decrypt(encryptedValue) : null;
            },
            set(value: string) {
                this.setDataValue('text', encrypt(value));
            }
        },
        image: { type: DataTypes.STRING, allowNull: false },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            get() {
                const rawValue = this.getDataValue('verified');
                return Boolean(rawValue);
            }
        },
        verified_at: { type: DataTypes.DATE, allowNull: false },
        expired_at: { type: DataTypes.DATE, allowNull: false }
    }, {
        tableName: 'documents',
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
    });

    return Document;
};