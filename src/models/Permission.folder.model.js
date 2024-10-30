const PermissionModel = (sequelize, DataTypes) => {
    return sequelize.define('Permission', {
        permissionid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fileid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'File',
                key: 'fileid',
            },
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'userid',
            },
        },
        accesstype: {
            type: DataTypes.ENUM('Viewer', 'Editor', 'Commenter'),
            allowNull: false,
        },
        grantedat: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
        tableName: 'Permission',
    });
};

export {PermissionModel}
