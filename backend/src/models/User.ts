import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        googleId: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        name: { type: String, required: true, trim: true },
        avatar: { type: String, default: '' },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
