import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { db } from '../../db/server.db.js';

const { User, Folder } = db;

const getFolderStructure = asyncHandler(async (req, res) => {
    const { ownerid } = req.params;

    const user = await User.findByPk(ownerid);
    if (!user) {
        throw new ApiError(404, 'Owner not found');
    }

    const folders = await Folder.findAll({
        where: { ownerid, parentfolderid: null },
        include: [
            {
                model: Folder,
                as: 'Subfolders',
                hierarchy: true,
            },
        ],
    });

    res.status(200).json(new ApiResponse(200, folders, 'Folder structure retrieved successfully'));
});

const createFolder = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const ownerid = req.user.userid;
    const { parentfolderid } = req.params;

   
    if (!name || !ownerid) {
        throw new ApiError(400, 'Folder name and owner ID are required');
    }

    
    const user = await User.findByPk(ownerid);
    if (!user) {
        throw new ApiError(404, 'Owner not found');
    }

    const folder = await Folder.create({
        name,
        ownerid,
        parentfolderid: parentfolderid || null,
    });

    res.status(201).json(new ApiResponse(201, folder, 'Folder created successfully'));
});


const renameFolder = asyncHandler(async (req, res) => {
    const { folderid } = req.params;
    const { name } = req.body;
    const ownerid = req.user.userid;

    if (!name) {
        throw new ApiError(400, 'New folder name is required');
    }
    if (!ownerid) {
        throw new ApiError(400, 'Owner ID is required');
    }

    const folder = await Folder.findByPk(folderid);
    if (!folder) {
        throw new ApiError(404, 'Folder not found');
    }

    folder.name = name;
    await folder.save();

    res.status(200).json(new ApiResponse(200, folder, 'Folder renamed successfully'));
});

const moveFolder = asyncHandler(async (req, res) => {
    const { folderName } = req.params;
    const { newParentFolderName } = req.body;
    const ownerid = req.user.userid;

    if (!newParentFolderName) {
        throw new ApiError(400, 'New parent folder name is required');
    }
    if (!ownerid) {
        throw new ApiError(400, 'Owner ID is required');
    }

    const folder = await Folder.findOne({ where: { name: folderName, ownerid } });
    if (!folder) {
        throw new ApiError(404, 'Folder not found');
    }

    const newParentFolder = await Folder.findOne({ where: { name: newParentFolderName, ownerid } });
    if (!newParentFolder) {
        throw new ApiError(404, 'New parent folder not found');
    }

    
    folder.parentfolderid = newParentFolder.id;
    await folder.save();

    res.status(200).json(new ApiResponse(200, folder, 'Folder moved successfully'));
});


const deleteFolder = asyncHandler(async (req, res) => {
    const { folderid } = req.params;
    const ownerid = req.user.userid;

    
    if (!ownerid) {
        throw new ApiError(400, 'Owner ID is required');
    }

    const folder = await Folder.findByPk(folderid);
    if (!folder) {
        throw new ApiError(404, 'Folder not found');
    }

    await folder.destroy();
    res.status(200).json(new ApiResponse(200, null, 'Folder deleted successfully'));
});

export { getFolderStructure, createFolder, renameFolder, moveFolder, deleteFolder };