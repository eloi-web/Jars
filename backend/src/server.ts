import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { connectDB } from './config/db';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import authRouter from './routes/auth';
import jarsRouter from './routes/jars';

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
const corsOrigins = (process.env.CLIENT_URL ?? 'http://localhost:3000').split(',').map(url => url.trim());
app.use(
    cors({
        origin: corsOrigins,
        credentials: true, // allow cookies
    })
);

// ── Body / cookie parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ── Dev request logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ── Passport (OAuth strategy only — no sessions) ────────────────────────────
app.use(passport.initialize() as unknown as express.RequestHandler);

// ── Rate limiting ────────────────────────────────────────────────────────────
app.use('/auth', authLimiter as unknown as express.RequestHandler);
app.use('/api', apiLimiter as unknown as express.RequestHandler);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/api/jars', jarsRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler (never sends stack traces to client) ────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 5000);

connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`[server] running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('[server] failed to connect to DB:', err);
        process.exit(1);
    });
