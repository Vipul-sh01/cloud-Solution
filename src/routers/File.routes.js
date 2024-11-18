import Routes from 'express';
import { uploadFiles } from '../Controllers/File.controllers/file.controller.js';
import { Upload } from '../Middlewares/Multer/multer.middleware.js';
import {verifySession} from '../Middlewares/AuthMiddleware/auth.middlewares.js';
import {shareFile} from '../Controllers/File.controllers/ShareFiles.controller.js'

const router = Routes();

router.route('/upload-file/:folderid').post(verifySession,Upload, uploadFiles);

router.route('/Share-file/:fileid').post(shareFile);



export default router;