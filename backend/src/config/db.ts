import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in environment variables');

    try {
        await mongoose.connect(uri, {
            // Force IPv4 DNS — avoids SRV resolution failures on some networks/ISPs
            family: 4,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('[db] MongoDB connected');
    } catch (err: any) {
        console.error('[db] Connection failed:', err.message);
        // Surface the underlying cause (DNS, network, auth, etc.)
        if (err.cause) console.error('[db] Cause:', err.cause);
        throw err;
    }
}
