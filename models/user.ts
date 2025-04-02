import { Sequelize, DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

interface UserAttributes extends Model<InferAttributes<UserAttributes>, InferCreationAttributes<UserAttributes>> {
    id: string;
    //id: CreationOptional<number>;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    dob: string;
    verified: boolean;
    verified_at: Date;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    photo?: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    zip_code?: string;
}

type UserModelStatic = typeof Model & {
    new (values?: object, options?: object): UserAttributes;
    associate: (models: { Permission: any; Document: any }) => void;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const User = <UserModelStatic>sequelize.define('User', {
        id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('firstname');
                return rawValue ? rawValue : null;
            },
            set(value: string) {
                value = value.toLowerCase();
                value = value.charAt(0).toUpperCase() + value.slice(1);
                this.setDataValue('firstname', value);
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('lastname');
                return rawValue ? rawValue : null;
            },
            set(value: string) {
                value = value.toLowerCase();
                value = value.charAt(0).toUpperCase() + value.slice(1);
                this.setDataValue('lastname', value);
            }
        },
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
        phone: {type: DataTypes.STRING, unique: true, allowNull: false},
        dob: {type: DataTypes.STRING, allowNull: false},
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

        photo: {type: DataTypes.STRING, allowNull: true},
        address: {type: DataTypes.TEXT, allowNull: true},
        country: {type: DataTypes.STRING, allowNull: true},
        state: {type: DataTypes.STRING, allowNull: true},
        city: {type: DataTypes.STRING, allowNull: true},
        zip_code: {type: DataTypes.STRING, allowNull: true}
    },{
        hooks: {
            beforeCreate: async (user) => {
                // if(user.password){
                //     const salt = await bcrypt.genSalt(10);
                //     user.password = await bcrypt.hash(user.password, salt);
                // };
            },
            beforeUpdate: async (user) => {
                // if(user.changed('password')){
                //     const salt = await bcrypt.genSalt(10);
                //     user.password = await bcrypt.hash(user.password, salt);
                // }
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