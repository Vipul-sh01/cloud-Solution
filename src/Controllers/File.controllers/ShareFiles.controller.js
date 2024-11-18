import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { db } from '../../db/server.db.js';

const { File, User, Permission } = db;

const shareFile = asyncHandler(async (req, res) => {
    const {  accesstype, userid } = req.body;
    const {fileid} = req.params

    if (!fileid || !accesstype || !userid) {
        throw new ApiError(400, 'All fields (fileid, accesstype, userid) are required');
    }

    if (!['view', 'edit', 'comment', 'owner'].includes(accesstype)) {
        throw new ApiError(400, 'Invalid access type. Must be one of: view, edit, comment, owner');
    }

    const targetUser = await User.findOne({ where: { userid } });
    if (!targetUser) {
        throw new ApiError(404, 'Target user not found');
    }

    const file = await File.findOne({ where: { fileid } });
    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    const existingPermission = await Permission.findOne({
        where: { fileid, userid },
    });

    if (existingPermission) {
        existingPermission.accesstype = accesstype;
        existingPermission.grantedat = new Date(); 
        await existingPermission.save();
    } else {
        await Permission.create({
            fileid,
            userid,
            accesstype,
            grantedat: new Date(),
            expiresat: null, 
            isrevoked: false,
        });
    }

    const updatedPermissions = await Permission.findAll({
        where: { fileid },
        include: [{ model: User, attributes: ['userid', 'email'] }],
    });

    const sharedWith = updatedPermissions.map((perm) => ({
        userid: perm.userid,
        accesstype: perm.accesstype,
        email: perm.User.email,
    }));

    res.status(200).json({
        message: 'File shared successfully',
        resource: {
            fileid: file.fileid,
            name: file.name,
            owner: file.ownerid,
            sharedWith,
        },
    });
});

export { shareFile };
