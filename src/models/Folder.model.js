import { v4 as uuidv4 } from 'uuid';

const FolderModel = (sequelize, DataTypes) => {
    const Folder = sequelize.define('Folder', {
       folderid: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'User', 
                key: 'userid',     
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        parentfolderid: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'folder', 
                key: 'folderid',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        isshared: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        sharedwith: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        visibility: {
            type: DataTypes.ENUM('private', 'shared', 'public'),  
            defaultValue: 'private',
        },
    }, {
        timestamps: true,
        tableName: 'folder', 
    });
    
    return Folder;
};

export { FolderModel };
