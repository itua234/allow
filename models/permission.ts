import { Sequelize, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

// Define the PermissionAttributes interface
interface PermissionAttributes extends Model<InferAttributes<PermissionAttributes>, InferCreationAttributes<PermissionAttributes>> {
    id: string;
    user_id: string;
    customer_id: string;
    shared_personal_info: Record<string, boolean>; // JSON object with boolean values
    shared_documents: Record<string, boolean>; // JSON object with boolean values
    granted_at: Date;
    revoked_at: Date;
    status: 'ACTIVE' | 'REVOKED';
    granted: boolean;
}

// Define the PermissionModelStatic type
type PermissionModelStatic = typeof Model & {
    new (values?: object, options?: object): PermissionAttributes;
    associate: (models: { User: any; Customer: any }) => void;
};

module.exports = (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes) => {
    const Permission = <PermissionModelStatic>sequelize.define<PermissionAttributes>('Permission', {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: { tableName: 'users' },
                key: 'id'
            },
            allowNull: false
        },
        customer_id: {
            type: DataTypes.UUID,
            references: {
                model: { tableName: 'customers' },
                key: 'id'
            },
            allowNull: false
        },
        shared_personal_info: {
            type: DataTypes.JSON,
            allowNull: false
        },
        shared_documents: {
            type: DataTypes.JSON,
            allowNull: false
        },
        granted_at: { type: DataTypes.DATE, allowNull: false },
        revoked_at: { type: DataTypes.DATE, allowNull: false },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'REVOKED'),
            defaultValue: 'ACTIVE'
        },
        granted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        tableName: 'permissions',
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
    });

    // Define relationships
    Permission.associate = (models: { User: any; Customer: any }) => {
        Permission.belongsTo(models.User, {
            as: 'users',
            foreignKey: 'user_id'
        });
        Permission.belongsTo(models.Customer, {
            as: 'customers',
            foreignKey: 'customer_id'
        });
    };

    return Permission;
};