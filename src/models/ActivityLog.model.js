import { v4 as uuidv4 } from 'uuid';

const ActivityLogModel = (sequelize, DataTypes) => {
    const ActivityLog = sequelize.define('ActivityLog', {
        activityid: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        userid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'User', 
                key: 'userid',
            },
            onDelete: 'CASCADE', 
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
        folderid: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'folder', 
                key: 'folderid',
            },
            onDelete: 'CASCADE', 
        },
        action: {
            type: DataTypes.ENUM('create', 'update', 'delete', 'share', 'access', 'comment', 'move', 'rename', 'download'),
            allowNull: false,
            default: "download"
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        ipaddress: {
            type: DataTypes.STRING(45), 
            allowNull: true,  
        },
        useragent: {
            type: DataTypes.STRING(255),
            allowNull: true, 
        },
        previousversionid: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Version',  
                key: 'versionid',
            },
            onDelete: 'SET NULL', 
        },
        changedescription: {
            type: DataTypes.TEXT,
            allowNull: true,  
        },
        downloadsize: {
            type: DataTypes.INTEGER,
            allowNull: true, 
        },
        downloadformat: {
            type: DataTypes.STRING(20),
            allowNull: true,  
        },
    }, {
        timestamps: true, 
        tableName: 'activitylogs',  
    });
    return ActivityLog;
};

export { ActivityLogModel };
