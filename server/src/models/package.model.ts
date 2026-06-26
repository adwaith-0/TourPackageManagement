import mongoose, { Schema } from 'mongoose';

export type PackageStatus = 'Active' | 'Inactive';

export type PaymentDetails = {
    upiId: string;
    upiPhoneNumber: string;
    accountNumber: string;
    bank: string;
    ifsc: string;
};

export type ContactDetails = {
    name: string;
    phoneNumber: string;
    email: string;
};

export type Itinerary = {
    dayNumber: number;
    items: string[];
};

export type CostPackage = {
    name: string;
    hotel: string;
    inclusions: string[];
    amount: string;
    currency: string;
};

export type PackageDocument = {
    packageId: string;
    status: PackageStatus;
    userId: string;
    place: string;
    packageName: string;
    startDate: string;
    endDate: string;
    description: string;
    pickupLocation: string;
    dropoffLocation: string;
    minNumGuests: number;
    maxNumGuests: number;
    gallery: string[];
    experiencesOffered: string[];
    shopping: string[];
    itineraries: Itinerary[];
    inclusions: string[];
    exclusions: string[];
    costPackages: CostPackage[];
    paymentDetails: PaymentDetails;
    contact: ContactDetails;
    createdAt: Date;
    updatedAt: Date;
};

const itinerarySchema = new Schema<Itinerary>(
    {
        dayNumber: { type: Number, required: true, min: 1 },
        items: { type: [String], required: true },
    },
    { _id: false }
);

const costPackageSchema = new Schema<CostPackage>(
    {
        name: { type: String, required: true, trim: true },
        hotel: { type: String, required: true, trim: true },
        inclusions: { type: [String], required: true },
        amount: { type: String, required: true, trim: true },
        currency: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const paymentDetailsSchema = new Schema<PaymentDetails>(
    {
        upiId: { type: String, required: true, trim: true },
        upiPhoneNumber: { type: String, required: true, trim: true },
        accountNumber: { type: String, required: true, trim: true },
        bank: { type: String, required: true, trim: true },
        ifsc: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const contactSchema = new Schema<ContactDetails>(
    {
        name: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
    },
    { _id: false }
);

const packageSchema = new Schema<PackageDocument>(
    {
        packageId: { type: String, required: true, unique: true, index: true },
        status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
        userId: { type: String, required: true, index: true },
        place: { type: String, required: true, trim: true },
        packageName: { type: String, required: true, trim: true },
        startDate: { type: String, required: true, trim: true },
        endDate: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        pickupLocation: { type: String, required: true, trim: true },
        dropoffLocation: { type: String, required: true, trim: true },
        minNumGuests: { type: Number, required: true, min: 1 },
        maxNumGuests: { type: Number, required: true, min: 1 },
        gallery: { type: [String], required: true },
        experiencesOffered: { type: [String], required: true },
        shopping: { type: [String], required: true },
        itineraries: { type: [itinerarySchema], required: true },
        inclusions: { type: [String], required: true },
        exclusions: { type: [String], required: true },
        costPackages: { type: [costPackageSchema], required: true },
        paymentDetails: { type: paymentDetailsSchema, required: true },
        contact: { type: contactSchema, required: true },
    },
    { timestamps: true }
);

export const Package =
    (mongoose.models.Package as mongoose.Model<PackageDocument> | undefined) ??
    mongoose.model<PackageDocument>('Package', packageSchema, 'Packages');
