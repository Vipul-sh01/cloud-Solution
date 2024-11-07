import { v4 as uuidv4 } from 'uuid';

const PermissionModel = (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
        permissionid: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        fileid: {
            type: DataTypes.UUID,
            allowNull: true,  
            references: {
                model: 'file', 
                key: 'fileid',
            },
            onDelete: 'CASCADE',
        },
        userid: {
            type: DataTypes.UUID,
            allowNull: true,  
            references: {
                model: 'User',  
                key: 'userid',
            },
            onDelete: 'CASCADE', 
        },
        folderid: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'folder',
                key: 'folderid',
            },
            onDelete: 'CASCADE', 
        },
        accesstype: {
            type: DataTypes.ENUM('view', 'edit', 'comment', 'owner'),
            allowNull: false,
        },
        grantedat: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        expiresat: {
            type: DataTypes.DATE,
            allowNull: true,  
        },
        isrevoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        timestamps: true,  
        tableName: 'permissions', 
    });
    return Permission;
};

export { PermissionModel };