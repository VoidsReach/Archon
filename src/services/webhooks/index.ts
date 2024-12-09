import express from 'express';
import clockifyTimeEntryHandler from './clockify';

const router = express.Router();

// Register Clockify Time Entry Webhook
router.post('/clockify', clockifyTimeEntryHandler);

export default router;