import multer from 'multer';
import fs from 'fs';
import path from 'path';

const supportedFormats = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'video/mp4', 
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.resolve('./public/temp'); 
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            console.log(`Directory created at: ${uploadPath}`); 
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'); 
        cb(null, `${Date.now()}-${sanitizedFilename}`);
    },
});


const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (!supportedFormats.includes(file.mimetype)) {
            const errorMessage = `Unsupported file type. Allowed types are: ${supportedFormats
                .map((type) => type.split('/').pop().toUpperCase())
                .join(', ')}.`;
            return cb(new Error(errorMessage), false);
        }
        cb(null, true);
    },
});

export const Upload = uploadMiddleware.array('files', 10); 

export { supportedFormats };
