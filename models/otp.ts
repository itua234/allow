import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

// Define the OtpAttributes interface
interface OtpAttributes extends Model<InferAttributes<OtpAttributes>, InferCreationAttributes<OtpAttributes>> {
    id: number;
    otpable_id: number;
    otpable_type: string;
    code: string;
    valid: boolean;
    purpose: 'email_verification' | 'phone_verification' | 'password_reset' | 'password_change';
}

// Define the OtpModelStatic type
type OtpModelStatic = typeof Model & {
    new (values?: object, options?: object): OtpAttributes;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const Otp = <OtpModelStatic>sequelize.define<OtpAttributes>('Otp', {
        id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
        otpable_id: {type: DataTypes.UUIDV4, allowNull: false},
        otpable_type: {type: DataTypes.STRING, allowNull: false},
        code: {type: DataTypes.STRING, allowNull: false},
        valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            get() {
                return Boolean(this.getDataValue('valid'));
            }
        },
        purpose: {
            type: DataTypes.ENUM(
                'email_verification',
                'phone_verification',
                'password_reset',
                'password_change'
            ),
            defaultValue: 'email_verification',
        },
    }, {
        tableName: 'otps',
        timestamps: true, // Enable timestamps for createdAt and updatedAt
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
    });

    return Otp;
};