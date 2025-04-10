import { Sequelize, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

// Define the CustomerAttributes interface
interface RequestAttributes extends Model<InferAttributes<RequestAttributes>, InferCreationAttributes<RequestAttributes>> {
    id: string;
    reference: string;
    redirect_url: string;
    kyc_level: string;
    bank_accounts: boolean;
    allow_url?: string;
    user_id: string;
}

// Define the CustomerModelStatic type
type ModelStatic = typeof Model & {
    new (values?: object, options?: object): RequestAttributes;
    //associate: (models: { User: any; Customer: any }) => void;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const Request = <ModelStatic>sequelize.define<RequestAttributes>('Customer', {
        id: { 
            type: DataTypes.UUID, 
            primaryKey: true, 
            defaultValue:  () => {
                'REQ-'+ Math.random().toString(36).substring(2, 15).toUpperCase()
            }
        },
        reference: { type: DataTypes.STRING, allowNull: false },
        redirect_url: { type: DataTypes.STRING, allowNull: false },
        kyc_level: { type: DataTypes.STRING, allowNull: false },
        bank_accounts: { type: DataTypes.BOOLEAN, allowNull: false },
        allow_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: { tableName: 'users' },
                key: 'id',
            },
            allowNull: false,
        },
    }, {
        hooks: {
            beforeCreate: (request) => {
                if (!request.allow_url) {
                    request.allow_url = `https://api.allow.com/${request.id}`;
                }
            },
        },
        tableName: 'requests',
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
    });

    return Request;
};

// const newRequest = await Request.create({
//     reference: 'ref123',
//     redirect_url: 'https://example.com',
//     kyc_level: 'tier_1',
//     bank_accounts: true,
//     user_id: 'user-uuid',
// });