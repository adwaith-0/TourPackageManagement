import mongoose, { Schema } from 'mongoose';

export type UserType = 'Traveler' | 'Agent';

export type SignupBody = {
    name?: unknown;
    type?: unknown;
    email?: unknown;
    phoneNumber?: unknown;
    password?: unknown;
};

export type UserDocument = {
    userId: string;
    name: string;
    type: UserType;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
    accessToken?: string;
    refreshToken?: string;
};

export type PublicUserDocument = Omit<UserDocument, 'passwordHash'> & {
    accessToken?: string;
    refreshToken?: string;
};

const userSchema = new Schema<UserDocument>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ['Traveler', 'Agent'] },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
    },
    { timestamps: true }
);

export const User =
    (mongoose.models.User as mongoose.Model<UserDocument> | undefined) ?? mongoose.model<UserDocument>('User', userSchema, 'Users');
