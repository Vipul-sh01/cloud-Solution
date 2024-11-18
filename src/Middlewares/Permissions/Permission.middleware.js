import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { db } from '../../db/server.db.js';

const { Folder, Permission, User } = db;

const canPerformAction = (userPermission, accessType) => {
  const permissionLevels = ['view', 'edit', 'owner'];
  const userIndex = permissionLevels.indexOf(userPermission);
  const requiredIndex = permissionLevels.indexOf(accessType);

  return userIndex >= requiredIndex;
};

const checkPermission = (accessType) => {
  return asyncHandler(async (req, res, next) => {
    const { folderid } = req.params;
    const userId = req.user?.userid;  

    if (!userId) {
      throw new ApiError(400, 'User ID is missing');

    }

    const file = await Folder.findOne({ where: { folderid: folderid } });

    if (!file) {
      throw new ApiError(404, 'File not found');
    }

    const sharedUser = await Permission.findOne({
      where: { folderid: folderid, userid: userId },
      include: [{ model: User, attributes: ['userid', 'email'] }],
    });

    if (!sharedUser) {
      throw new ApiError(403, 'File not shared with the user');
    }

    if (!canPerformAction(sharedUser.accesstype, accessType)) {
      throw new ApiError(403, 'Permission denied');
    }
    req.file = file;
    next();
  });
};

export { checkPermission };
