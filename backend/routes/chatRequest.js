import express from 'express';
import { handleChat, getHistory, linkHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', handleChat);
router.get('/history/:sessionId', getHistory);
router.post('/link-history', linkHistory);

export default router;
