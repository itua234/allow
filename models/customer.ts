import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

// Define the CustomerAttributes interface
interface CustomerAttributes extends Model<InferAttributes<CustomerAttributes>, InferCreationAttributes<CustomerAttributes>> {
    id: string;
    name: string;
    logo?: string;
    email: string;
    password?: string;
    apiKey?: string;
    domain?: string;
    webhookUrl?: string;
    verified: boolean;
    notificationsEnabled: boolean;
    email_verified_at?: Date;
}

// Define the CustomerModelStatic type
type CustomerModelStatic = typeof Model & {
    new (values?: object, options?: object): CustomerAttributes;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const Customer = <CustomerModelStatic>sequelize.define<CustomerAttributes>('Customer', {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        name: { type: DataTypes.STRING, allowNull: false },
        logo: { type: DataTypes.STRING, allowNull: true },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('email');
                return rawValue ? rawValue : null;
            },
            set(value: string) {
                this.setDataValue('email', value.toLowerCase());
            }
        },
        password: { type: DataTypes.STRING, allowNull: true },
        apiKey: { type: DataTypes.STRING, unique: true, allowNull: true },
        domain: { type: DataTypes.STRING, allowNull: true },
        webhookUrl: { type: DataTypes.STRING, allowNull: true },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            get() {
                const rawValue = this.getDataValue('verified');
                return Boolean(rawValue);
            }
        },
        notificationsEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
        email_verified_at: { type: DataTypes.DATE, allowNull: true },
    }, {
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
    });

    return Customer;
};