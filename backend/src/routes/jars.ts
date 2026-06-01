import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import Jar from '../models/Jar';

const router = Router();

// ── GET /api/jars — public jars (most recent first) ─────────────────────────
router.get('/', async (_req: Request, res: Response) => {
    try {
        const jars = await Jar.find({ isPublic: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('owner', 'name avatar');
        res.json(jars);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── GET /api/jars/mine — authenticated user's jars ──────────────────────────
router.get('/mine', requireAuth, async (req: Request, res: Response) => {
    try {
        const jars = await Jar.find({ owner: (req as any).userId })
            .sort({ createdAt: -1 });
        res.json(jars);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── POST /api/jars — create a jar ────────────────────────────────────────────
router.post(
    '/',
    requireAuth,
    [
        body('title')
            .optional()
            .trim()
            .isLength({ max: 80 }).withMessage('Title must be 80 characters or fewer'),
        body('message')
            .trim()
            .notEmpty().withMessage('Message is required')
            .isLength({ max: 2000 }).withMessage('Message must be 2000 characters or fewer'),
        body('isPublic')
            .optional()
            .isBoolean().withMessage('isPublic must be a boolean'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        try {
            const jar = await Jar.create({
                owner: (req as any).userId,
                title: req.body.title || undefined,
                message: req.body.message,
                isPublic: req.body.isPublic ?? true,
            });
            // Populate owner so the frontend gets name/avatar immediately
            await jar.populate('owner', 'name avatar');
            res.status(201).json(jar);
        } catch {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// ── DELETE /api/jars/:id — owner only ────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const jar = await Jar.findById(req.params.id);
        if (!jar) {
            res.status(404).json({ error: 'Jar not found' });
            return;
        }
        if (jar.owner.toString() !== (req as any).userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await jar.deleteOne();
        res.json({ message: 'Deleted' });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
