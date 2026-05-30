import jwt from 'jsonwebtoken';

interface TokenPayload {
    sub: string;
}

export function signAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
    });
}

export function signRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN ?? '30d') as jwt.SignOptions['expiresIn'],
    });
}

export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
    } catch {
        return null;
    }
}

