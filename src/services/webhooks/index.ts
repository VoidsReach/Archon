import express from 'express';
import clockifyHandler from './clockify';

const router = express.Router();

router.post('/clockify', clockifyHandler);

export default router;