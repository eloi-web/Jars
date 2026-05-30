import { Router, Request, Response } from 'express';
import passport from 'passport';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token';
import { requireAuth } from '../middleware/auth';
import User from '../models/User';

const router = Router();

const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
};

// ── Kick off Google OAuth ────────────────────────────────────────────────────
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// ── Google OAuth callback ────────────────────────────────────────────────────
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/?auth=failed` }),
    (req: Request, res: Response) => {
        const user = req.user as any;

        const accessToken = signAccessToken(user._id.toString());
        const refreshToken = signRefreshToken(user._id.toString());

        // Refresh token lives in a secure httpOnly cookie
        res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

        // Access token passed to frontend via URL param (one-time, then stored in memory)
        res.redirect(`${process.env.CLIENT_URL}/?token=${accessToken}`);
    }
);

// ── Refresh access token using cookie ───────────────────────────────────────
router.post('/refresh', (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        res.status(401).json({ error: 'No refresh token' });
        return;
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
    }

    const accessToken = signAccessToken(payload.sub);
    res.json({ accessToken });
});

// ── Current user ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).userId).select('name email avatar createdAt');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Logout (clear cookie) ────────────────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.json({ message: 'Logged out' });
});

export default router;
