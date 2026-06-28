import crypto from 'crypto';
import { Enquiry, type EnquiryDocument, type EnquiryStatus } from '../models/enquiry.model.js';
import { Package, type PackageDocument } from '../models/package.model.js';

export type CreateEnquiryInput = {
    packageId: string;
    costPackage: string;
    name: string;
    email: string;
    phoneNumber: string;
    travelerCount: number;
    departureDate: string;
    fromLocation: string;
    message: string;
};

export type CreateEnquiryResult =
    | { status: 'ok'; enquiry: EnquiryDocument }
    | { status: 'package_not_found' }
    | { status: 'cost_package_not_found' };

export class EnquiryService {
    static async createEnquiry(input: CreateEnquiryInput): Promise<CreateEnquiryResult> {
        const packageId = input.packageId.trim();
        const costPackage = input.costPackage.trim();
        const enquiryId = crypto.randomUUID();

        const pkg = await Package.findOne({ packageId }).lean<PackageDocument | null>();
        if (!pkg) return { status: 'package_not_found' };

        const hasCostPackage = pkg.costPackages.some((item) => item.name.trim().toLowerCase() === costPackage.toLowerCase());
        if (!hasCostPackage) return { status: 'cost_package_not_found' };

        const created = await Enquiry.create({
            enquiryId,
            packageId,
            costPackage,
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            phoneNumber: input.phoneNumber.trim(),
            travelerCount: input.travelerCount,
            departureDate: input.departureDate.trim(),
            fromLocation: input.fromLocation.trim(),
            message: input.message.trim(),
            status: 'New',
        });

        return {
            status: 'ok',
            enquiry: {
                enquiryId: created.enquiryId,
                packageId: created.packageId,
                costPackage: created.costPackage,
                name: created.name,
                email: created.email,
                phoneNumber: created.phoneNumber,
                travelerCount: created.travelerCount,
                departureDate: created.departureDate,
                fromLocation: created.fromLocation,
                message: created.message,
                status: created.status,
                createdAt: created.createdAt,
                updatedAt: created.updatedAt,
            },
        };
    }

    static async updateEnquiryStatus(enquiryId: string, status: EnquiryStatus): Promise<EnquiryDocument | null> {
        const trimmedEnquiryId = enquiryId.trim();
        if (!trimmedEnquiryId) return null;

        const updatedEnquiry = await Enquiry.findOneAndUpdate(
            { enquiryId: trimmedEnquiryId },
            { $set: { status } },
            { new: true, runValidators: true }
        ).lean<EnquiryDocument | null>();

        return updatedEnquiry;
    }

    static async listEnquiriesByPackage(packageId: string, status?: EnquiryStatus): Promise<EnquiryDocument[]> {
        const trimmedPackageId = packageId.trim();
        if (!trimmedPackageId) return [];

        const filter = status ? { packageId: trimmedPackageId, status } : { packageId: trimmedPackageId };
        const enquiries = await Enquiry.find(filter).lean<EnquiryDocument[]>();
        return enquiries;
    }
}
