import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJar extends Document {
    owner: Types.ObjectId;
    title?: string;
    message: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const JarSchema = new Schema<IJar>(
    {
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, trim: true, maxlength: 80, default: undefined },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IJar>('Jar', JarSchema);
