import { UserModel } from './User.model.js';
import { FolderModel } from './Folder.model.js';
import { FileModel } from './File.model.js';
import { PermissionModel } from './Permission.model.js';
import { ActivityLogModel } from './ActivityLog.model.js';
import { VersionModel } from './Version.model.js';
import { MetadataModel } from './MetaData.model.js';

export const initModels = (sequelize) => {
    const db = {};

    db.User = UserModel(sequelize, sequelize.Sequelize.DataTypes);
    db.Folder = FolderModel(sequelize, sequelize.Sequelize.DataTypes);
    db.File = FileModel(sequelize, sequelize.Sequelize.DataTypes);
    db.Permission = PermissionModel(sequelize, sequelize.Sequelize.DataTypes);
    db.ActivityLog = ActivityLogModel(sequelize, sequelize.Sequelize.DataTypes);
    db.Version = VersionModel(sequelize, sequelize.Sequelize.DataTypes);
    db.Metadata = MetadataModel(sequelize, sequelize.Sequelize.DataTypes);

    db.User.hasMany(db.Folder, { foreignKey: 'ownerid', onDelete: 'CASCADE' });
    db.Folder.belongsTo(db.User, { foreignKey: 'ownerid' });

    db.User.hasMany(db.File, { foreignKey: 'ownerid', onDelete: 'CASCADE' });
    db.File.belongsTo(db.User, { foreignKey: 'ownerid' });

    db.Folder.belongsTo(db.Folder, { foreignKey: 'parentfolderid', as: 'ParentFolder' });
    db.Folder.hasMany(db.Folder, { foreignKey: 'parentfolderid', as: 'Subfolders', onDelete: 'CASCADE' });

    db.Folder.hasMany(db.File, { foreignKey: 'folderid', onDelete: 'CASCADE' });
    db.File.belongsTo(db.Folder, { foreignKey: 'folderid' });

    db.User.hasMany(db.Permission, { foreignKey: 'userid', onDelete: 'CASCADE' });
    db.Permission.belongsTo(db.User, { foreignKey: 'userid' });

    db.File.hasMany(db.Permission, { foreignKey: 'fileid', onDelete: 'CASCADE' });
    db.Permission.belongsTo(db.File, { foreignKey: 'fileid' });

    db.Folder.hasMany(db.Permission, { foreignKey: 'folderid', onDelete: 'CASCADE' });
    db.Permission.belongsTo(db.Folder, { foreignKey: 'folderid' });


    db.User.hasMany(db.ActivityLog, { foreignKey: 'userid', onDelete: 'CASCADE' });
    db.ActivityLog.belongsTo(db.User, { foreignKey: 'userid' });

    db.File.hasMany(db.ActivityLog, { foreignKey: 'fileid', onDelete: 'CASCADE' });
    db.ActivityLog.belongsTo(db.File, { foreignKey: 'fileid' });

    db.Folder.hasMany(db.ActivityLog, { foreignKey: 'folderid', onDelete: 'CASCADE' });
    db.ActivityLog.belongsTo(db.Folder, { foreignKey: 'folderid' });

    db.Version.hasMany(db.ActivityLog, { foreignKey: 'previousversionid', onDelete: 'CASCADE' });
    db.ActivityLog.belongsTo(db.Version, { foreignKey: 'previousversionid' });

    db.File.hasMany(db.Version, { foreignKey: 'fileid', onDelete: 'CASCADE' });
    db.Version.belongsTo(db.File, { foreignKey: 'fileid' });

    db.User.hasMany(db.Version, { foreignKey: 'createdby', onDelete: 'CASCADE' });
    db.Version.belongsTo(db.User, { foreignKey: 'createdby' });

    db.File.hasOne(db.Metadata, { foreignKey: 'fileid', onDelete: 'CASCADE' });
    db.Metadata.belongsTo(db.File, { foreignKey: 'fileid' });

    return db;
};
