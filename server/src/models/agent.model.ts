import mongoose, { Schema } from 'mongoose';

export type AgentDocument = {
    agencyName: string;
    website: string;
    experience: number;
    licenceNumber: string;
    panNumber: string;
    specialities: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

const agentSchema = new Schema<AgentDocument>(
    {
        agencyName: { type: String, required: true, trim: true },
        website: { type: String, required: true, trim: true },
        experience: { type: Number, required: true, min: 0 },
        licenceNumber: { type: String, required: true, trim: true },
        panNumber: { type: String, required: true, trim: true },
        specialities: { type: String, required: true, trim: true, maxlength: 500 },
        userId: { type: String, required: true, unique: true, index: true },
    },
    { timestamps: true }
);

export const Agent =
    (mongoose.models.Agent as mongoose.Model<AgentDocument> | undefined) ??
    mongoose.model<AgentDocument>('Agent', agentSchema, 'Agents');
