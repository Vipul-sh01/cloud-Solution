import { UserModel } from './User.model.js';
import { FolderModel } from './Folder.model.js';
import { FileModel } from './File.model.js';
import { PermissionModel } from './Permission.model.js';
import { ActivityLogModel } from './ActivityLog.model.js';
import { VersionModel } from './Version.model.js';

export const initModels = (sequelize) => {
    const db = {};

    db.User = UserModel(sequelize, sequelize.Sequelize.DataTypes);
    db.Folder = FolderModel(sequelize, sequelize.Sequelize.DataTypes);
    db.File = FileModel(sequelize, sequelize.Sequelize.DataTypes);
    db.Permission = PermissionModel(sequelize, sequelize.Sequelize.DataTypes);
    db.ActivityLog = ActivityLogModel(sequelize, sequelize.Sequelize.DataTypes);
    db.Version = VersionModel(sequelize, sequelize.Sequelize.DataTypes);

    db.User.hasMany(db.Folder, { foreignKey: 'ownerid' });
    db.Folder.belongsTo(db.User, { foreignKey: 'ownerid' });

    db.User.hasMany(db.File, { foreignKey: 'ownerid' });
    db.Folder.hasMany(db.File, { foreignKey: 'folderid' });
    db.File.belongsTo(db.Folder, { foreignKey: 'folderid' });
    db.File.belongsTo(db.User, { foreignKey: 'ownerid' });

    db.User.hasMany(db.Permission, { foreignKey: 'userid' });
    db.File.hasMany(db.Permission, { foreignKey: 'fileid' });
    db.Permission.belongsTo(db.User, { foreignKey: 'userid' });
    db.Permission.belongsTo(db.File, { foreignKey: 'fileid' });

    db.User.hasMany(db.ActivityLog, { foreignKey: 'userid' });
    db.File.hasMany(db.ActivityLog, { foreignKey: 'fileid' });
    db.ActivityLog.belongsTo(db.User, { foreignKey: 'userid' });
    db.ActivityLog.belongsTo(db.File, { foreignKey: 'fileid' });

    db.File.hasMany(db.Version, { foreignKey: 'fileid' });
    db.Version.belongsTo(db.File, { foreignKey: 'fileid' });
    db.User.hasMany(db.Version, { foreignKey: 'updatedby' });
    db.Version.belongsTo(db.User, { foreignKey: 'updatedby' });

    return db;
};
