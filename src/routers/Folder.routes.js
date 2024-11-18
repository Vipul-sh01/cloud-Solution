import { Router } from 'express';
import { getFolderStructure, createFolder, renameFolder, moveFolder, deleteFolder } from '../Controllers/Folder.controllers/folder.controller.js';
import {verifySession} from '../Middlewares/AuthMiddleware/auth.middlewares.js';
import {shareFolder} from '../Controllers/Folder.controllers/ShareFolder.controller.js';
import {checkPermission} from '../Middlewares/Permissions/Permission.middleware.js'

const router = Router();


router.route('/GetAll-Folder/:ownerid').post(getFolderStructure); 
router.route('/Create-Folder').post(verifySession,createFolder); 
router.route('/Create-Folder/:parentfolderid').post(verifySession,createFolder); 
router.route('/Rename-Folder/:folderid').put(verifySession,renameFolder); 
router.route('/Move-Folder/:folderid').put(verifySession,moveFolder); 
router.route('/Delete-Folder/:folderid').delete(verifySession,deleteFolder); 

router.route('/ShareFolder/:folderid').post(shareFolder);

router.route('/Rename-Folder/:folderid').put(verifySession, checkPermission('edit'), renameFolder);  
router.route('/Move-Folder/:folderid').put(verifySession, checkPermission('edit'), moveFolder); 
router.route('/Delete-Folder/:folderid').delete(verifySession, checkPermission('owner'), deleteFolder);


export default router;
