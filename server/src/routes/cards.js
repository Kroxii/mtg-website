import express from 'express';
const router = express.Router();
router.get('/test', (req, res) => res.json({ cards: true }));
export default router;
