import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { supportedFormats } from '../../Middlewares/Multer/multer.middleware.js';
import { db } from '../../db/server.db.js';
import { saveToLocalStorage } from '../../utils/LocalStorege.js'; 

const { Folder, File } = db;

const uploadFiles = asyncHandler(async (req, res) => {
    const { folderid } = req.params; 

    const folder = await Folder.findByPk(folderid);
    if (!folder) {
        throw new ApiError(404, 'Folder not found.');
    }

    if (folder.ownerid !== req.user.userid) {
        throw new ApiError(403, 'You are not the owner of this folder.');
    }

    
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'No files uploaded.');
    }

    const invalidFiles = req.files.filter(file => !supportedFormats.includes(file.mimetype));
    if (invalidFiles.length > 0) {
        throw new ApiError(400, `Unsupported file types: ${invalidFiles.map(f => f.originalname).join(', ')}`);
    }

    try {
        const filePromises = req.files.map(async (file) => {
            const fileSaved = await saveToLocalStorage(file.path);
            console.log(fileSaved);
            
            if (!fileSaved) {
                throw new ApiError(500, 'Failed to save the file locally.');
            }

            const fileData = {
                name: file.originalname,
                filetype: file.mimetype,
                size: file.size,
                ownerid: req.user.userid,
                folderid: folderid, 
                isshared: false, 
                sharedwith: req.body.sharedwith || [], 
                description: req.body.description || '', 
                visibility: req.body.visibility || 'private', 
                version_number: 1, 
            };
            const newFile = await File.create(fileData);
            return newFile;
        });

        const uploadedFiles = await Promise.all(filePromises);
        return res.status(200).json(new ApiResponse(200, uploadedFiles, 'Files uploaded successfully.'));
    } catch (error) {
        throw new ApiError(500, error.message || 'An error occurred while uploading files.');
    }
});

export { uploadFiles };
