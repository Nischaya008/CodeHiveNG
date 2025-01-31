import express from 'express';
import {
  createFile,
  getRoomFiles,
  getFile,
  deleteFile
} from '../controllers/file_controller.js';
import { auth } from '../auth_backend.js';

const router = express.Router();

router.post('/', auth, createFile);
router.get('/room/:roomId', auth, getRoomFiles);
router.get('/:fileId', auth, getFile);
router.delete('/:fileId', auth, deleteFile);

export default router; 