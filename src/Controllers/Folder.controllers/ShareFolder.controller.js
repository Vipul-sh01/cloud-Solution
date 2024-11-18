import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { db } from '../../db/server.db.js';

const { Folder, User, Permission } = db;

const shareFolder = asyncHandler(async (req, res) => {
    const {accesstype, userid } = req.body;
    const {folderid} = req.params

    if (!folderid || !accesstype || !userid) {
        throw new ApiError(400, 'All fields (folderid, accesstype, userid) are required');
    }

    if (!['view', 'edit', 'comment', 'owner'].includes(accesstype)) {
        throw new ApiError(400, 'Invalid access type. Must be one of: view, edit, comment, owner');
    }

    const targetUser = await User.findOne({ where: { userid } });
    if (!targetUser) {
        throw new ApiError(404, 'Target user not found');
    }

    const folder = await Folder.findOne({ where: { folderid } });
    if (!folder) {
        throw new ApiError(404, 'Folder not found');
    }

    const existingPermission = await Permission.findOne({
        where: { folderid, userid },
    });

    if (existingPermission) {
        existingPermission.accesstype = accesstype;
        existingPermission.grantedat = new Date();
        await existingPermission.save();
    } else {
        await Permission.create({
            folderid,
            userid,
            accesstype,
            grantedat: new Date(),
            expiresat: null, 
            isrevoked: false, 
        });
    }

    const updatedPermissions = await Permission.findAll({
        where: { folderid },
        include: [{ model: User, attributes: ['userid', 'email'] }],
    });

    const sharedWith = updatedPermissions.map((perm) => ({
        userid: perm.userid,
        accesstype: perm.accesstype,
        email: perm.User.email,
    }));

    res.status(200).json({
        message: 'Folder shared successfully',
        resource: {
            folderid: folder.folderid,
            name: folder.name,
            owner: folder.ownerid,
            sharedWith,
        },
    });
});

export { shareFolder };
