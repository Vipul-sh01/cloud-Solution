import ApiError from '../utils/ApiError.js'; 
import asyncHandler from '../utils/asyncHandler.js'; 
import ApiResponse from '../utils/ApiResponse.js';
import { db } from '../db/server.db.js';

const { FolderModel, UserModel } = db;

const createFolder = asyncHandler(async (req, res) => {
    const { name, ownerid, parentfolderid } = req.body;

    const user = await UserModel.findByPk(ownerid);
    if (!user) {
        throw new ApiError(404, 'Owner not found');
    }

    const folder = await FolderModel.create({
        name,
        ownerid,
        parentfolderid: parentfolderid || null,
    });

    res.status(201).json(new ApiResponse(210, folder, 'Folder created successfully'));
});

const renameFolder = asyncHandler(async (req, res) => {
    const { folderid } = req.params;
    const { name } = req.body;

    const folder = await FolderModel.findByPk(folderid);
    if (!folder) {
        throw new ApiError(404, 'Folder not found');
    }

    folder.name = name;
    await folder.save();

    res.status(200).json(new ApiResponse(200, folder, 'Folder renamed successfully'));
});

const moveFolder = asyncHandler(async (req, res) => {
    const { folderid } = req.params;
    const { newParentFolderId } = req.body;

    const folder = await FolderModel.findByPk(folderid);
    if (!folder) {
        throw new ApiError(404, 'Folder not found');
    }

    folder.parentfolderid = newParentFolderId;
    await folder.save();

    res.status(200).json(new ApiResponse(200, folder, 'Folder moved successfully'));
});

const deleteFolder = asyncHandler(async (req, res) => {
    const { folderid } = req.params;

    const folder = await FolderModel.findByPk(folderid);
    if (!folder) {
        throw new ApiError(404, 'Folder not found');
    }

    await folder.destroy();
    res.status(200).json(new ApiResponse(200, null, 'Folder deleted successfully'));
});

export {createFolder, renameFolder, moveFolder, deleteFolder};
