import mongoose, { Schema } from 'mongoose';

export type EnquiryStatus = 'New' | 'Contacted' | 'Booked' | 'Closed' | 'Rejected';

export type EnquiryDocument = {
    enquiryId: string;
    packageId: string;
    costPackage: string;
    name: string;
    email: string;
    phoneNumber: string;
    travelerCount: number;
    departureDate: string;
    fromLocation: string;
    message: string;
    status: EnquiryStatus;
    createdAt: Date;
    updatedAt: Date;
};

const enquirySchema = new Schema<EnquiryDocument>(
    {
        enquiryId: { type: String, required: true, unique: true, index: true },
        packageId: { type: String, required: true, index: true },
        costPackage: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phoneNumber: { type: String, required: true, trim: true },
        travelerCount: { type: Number, required: true, min: 1 },
        departureDate: { type: String, required: true, trim: true },
        fromLocation: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        status: { type: String, required: true, enum: ['New', 'Contacted', 'Booked', 'Closed', 'Rejected'], default: 'New' },
    },
    { timestamps: true }
);

export const Enquiry =
    (mongoose.models.Enquiry as mongoose.Model<EnquiryDocument> | undefined) ??
    mongoose.model<EnquiryDocument>('Enquiry', enquirySchema, 'Enquiries');
