import { v4 as uuidv4 } from 'uuid';

const FileModel = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        fileid: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        filetype: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ownerid: {
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
        version_number: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        timestamps: true, 
        tableName: 'file',
    });
    return File;
};

export { FileModel };

