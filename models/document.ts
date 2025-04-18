import { Sequelize, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
const { encrypt, decrypt } = require('@util/helper');

// Define the DocumentAttributes interface
export interface DocumentAttributes extends Model<InferAttributes<DocumentAttributes>, InferCreationAttributes<DocumentAttributes>> {
    id: string;
    customer_id: string;
    identity_type: 'BVN' | 'NIN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD' | 'RESIDENT_PERMIT' | 'WORK_PERMIT' | 'NATIONAL_ID' | 'OTHER';
    identity_number: string;
    identity_hash: string;
    image?: string;
    verified: boolean;
    verified_at?: Date;
    expired_at?: Date;
}

type DocumentModelStatic = typeof Model & {
    new (values?: object, options?: object): DocumentAttributes;
    associate: (models: { Customer: any }) => void;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const Document = <DocumentModelStatic>sequelize.define('Document', {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        customer_id: {
            type: DataTypes.UUID,
            references: {
              model: 'customers',
              key: 'id'
            },
            allowNull: false
        },
        identity_type: { type: DataTypes.STRING, allowNull: false },
        identity_number: { 
            type: DataTypes.STRING, 
            allowNull: false,
            get() {
                const encryptedValue = this.getDataValue('identity_number');
                return encryptedValue ? decrypt(encryptedValue) : null;
            },
            set(value: string) {
                this.setDataValue('identity_number', encrypt(value));
            }
        },
        identity_hash: { type: DataTypes.STRING, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: true },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            get() {
                const rawValue = this.getDataValue('verified');
                return Boolean(rawValue);
            }
        },
        verified_at: { type: DataTypes.DATE, allowNull: true },
        expired_at: { type: DataTypes.DATE, allowNull: true }
    }, {
        tableName: 'documents',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        defaultScope: {
            //attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
    });

    Document.associate = (models) => {
        Document.belongsTo(models.Customer, {
            foreignKey: 'customer_id',
            as: 'customer'
        });
    };

    return Document;
};

// import { Model, Optional, DataTypes, Sequelize } from 'sequelize';

// interface DocumentAttributes {
//     id: string;
//     customer_id: string;
//     identity_type: 'BVN' | 'NIN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD' | 'RESIDENT_PERMIT' | 'WORK_PERMIT' | 'NATIONAL_ID' | 'OTHER';
//     identity_number: string;
//     identity_hash: string;
//     image?: string;
//     verified: boolean;
//     verified_at?: Date;
//     expired_at?: Date;
// }

// interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'verified' | 'verified_at' | 'expired_at' | 'image'> {}

// export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
//   public id!: string;
//   public customer_id!: string;
//   public identity_type!: 'BVN' | 'NIN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD' | 'RESIDENT_PERMIT' | 'WORK_PERMIT' | 'NATIONAL_ID' | 'OTHER';
//   public identity_number!: string;
//   public identity_hash!: string;
//   public image?: string;
//   public verified!: boolean;
//   public verified_at?: Date;
//   public expired_at?: Date;

//   // Timestamps
//   public readonly createdAt!: Date;
//   public readonly updatedAt!: Date;

//   // Associations
//   static associate(models: any) {
//     Document.belongsTo(models.Customer, {
//       foreignKey: 'customer_id',
//       as: 'customer'
//     });
//   }
// }

// export function initDocument(sequelize: Sequelize): typeof Document {
//   Document.init({
//     id: { 
//       type: DataTypes.UUID, 
//       primaryKey: true, 
//       defaultValue: DataTypes.UUIDV4 
//     },
//     customer_id: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },
//     identity_type: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     identity_number: { 
//       type: DataTypes.STRING, 
//       allowNull: false
//     },
//     identity_hash: { 
//       type: DataTypes.STRING, 
//       allowNull: false 
//     },
//     image: { 
//       type: DataTypes.STRING, 
//       allowNull: true 
//     },
//     verified: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     verified_at: { 
//       type: DataTypes.DATE, 
//       allowNull: true 
//     },
//     expired_at: { 
//       type: DataTypes.DATE, 
//       allowNull: true 
//     }
//   }, {
//     tableName: 'documents',
//     sequelize
//   });
  
//   return Document;
// }