import express from 'express';
import { getTopIndiaFinanceNews } from '../controllers/newsController.js';

const router = express.Router();

router.get('/top-india-finance', getTopIndiaFinanceNews);

export default router;
