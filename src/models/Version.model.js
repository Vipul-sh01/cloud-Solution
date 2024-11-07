import { v4 as uuidv4 } from 'uuid';

const VersionModel = (sequelize, DataTypes) => {
    const Version = sequelize.define('Version', {
        versionid: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        fileid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'file',
                key: 'fileid',
            },
            onDelete: 'CASCADE',
        },
        versionnumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdat: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        createdby: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'User',
                key: 'userid',
            },
        },
        changedescription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        filesize: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        iscurrent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        timestamps: false,
        tableName: 'Version',
    });
    return Version;
};

export { VersionModel };