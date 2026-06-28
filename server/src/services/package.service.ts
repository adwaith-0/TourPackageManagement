import crypto from 'crypto';
import { Package, type PackageDocument, type PackageStatus, type ContactDetails, type CostPackage, type Itinerary, type PaymentDetails } from '../models/package.model.js';

export type CreatePackageInput = {
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
    status?: PackageStatus;
};

export type UpdatePackageInput = CreatePackageInput & {
    packageId: string;
};

export type PackageListItem = {
    packageName: string;
    packageId: string;
    place: string;
    startDate: string;
    endDate: string;
    description: string;
    minNumGuests: number;
    maxNumGuests: number;
    minAmount: number | null;
};

export class PackageService {
    static async createPackage(input: CreatePackageInput): Promise<PackageDocument> {
        const packageId = crypto.randomUUID();
        const status: PackageStatus = input.status ?? 'Active';

        const created = await Package.create({
            packageId,
            status,
            userId: input.userId.trim(),
            place: input.place.trim(),
            packageName: input.packageName.trim(),
            startDate: input.startDate.trim(),
            endDate: input.endDate.trim(),
            description: input.description.trim(),
            pickupLocation: input.pickupLocation.trim(),
            dropoffLocation: input.dropoffLocation.trim(),
            minNumGuests: input.minNumGuests,
            maxNumGuests: input.maxNumGuests,
            gallery: input.gallery.map((x) => x.trim()),
            experiencesOffered: input.experiencesOffered.map((x) => x.trim()),
            shopping: input.shopping.map((x) => x.trim()),
            itineraries: input.itineraries.map((it) => ({ dayNumber: it.dayNumber, items: it.items.map((x) => x.trim()) })),
            inclusions: input.inclusions.map((x) => x.trim()),
            exclusions: input.exclusions.map((x) => x.trim()),
            costPackages: input.costPackages.map((p) => ({
                name: p.name.trim(),
                hotel: p.hotel.trim(),
                inclusions: p.inclusions.map((x) => x.trim()),
                amount: p.amount.trim(),
                currency: p.currency.trim(),
            })),
            paymentDetails: {
                upiId: input.paymentDetails.upiId.trim(),
                upiPhoneNumber: input.paymentDetails.upiPhoneNumber.trim(),
                accountNumber: input.paymentDetails.accountNumber.trim(),
                bank: input.paymentDetails.bank.trim(),
                ifsc: input.paymentDetails.ifsc.trim(),
            },
            contact: {
                name: input.contact.name.trim(),
                phoneNumber: input.contact.phoneNumber.trim(),
                email: input.contact.email.trim().toLowerCase(),
            },
        });

        return {
            packageId: created.packageId,
            status: created.status,
            userId: created.userId,
            place: created.place,
            packageName: created.packageName,
            startDate: created.startDate,
            endDate: created.endDate,
            description: created.description,
            pickupLocation: created.pickupLocation,
            dropoffLocation: created.dropoffLocation,
            minNumGuests: created.minNumGuests,
            maxNumGuests: created.maxNumGuests,
            gallery: created.gallery,
            experiencesOffered: created.experiencesOffered,
            shopping: created.shopping,
            itineraries: created.itineraries,
            inclusions: created.inclusions,
            exclusions: created.exclusions,
            costPackages: created.costPackages,
            paymentDetails: created.paymentDetails,
            contact: created.contact,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
        };
    }

    static async updatePackage(input: UpdatePackageInput): Promise<PackageDocument | null> {
        const packageId = input.packageId.trim();

        const updateBase = {
            userId: input.userId.trim(),
            place: input.place.trim(),
            packageName: input.packageName.trim(),
            startDate: input.startDate.trim(),
            endDate: input.endDate.trim(),
            description: input.description.trim(),
            pickupLocation: input.pickupLocation.trim(),
            dropoffLocation: input.dropoffLocation.trim(),
            minNumGuests: input.minNumGuests,
            maxNumGuests: input.maxNumGuests,
            gallery: input.gallery.map((x) => x.trim()),
            experiencesOffered: input.experiencesOffered.map((x) => x.trim()),
            shopping: input.shopping.map((x) => x.trim()),
            itineraries: input.itineraries.map((it) => ({ dayNumber: it.dayNumber, items: it.items.map((x) => x.trim()) })),
            inclusions: input.inclusions.map((x) => x.trim()),
            exclusions: input.exclusions.map((x) => x.trim()),
            costPackages: input.costPackages.map((p) => ({
                name: p.name.trim(),
                hotel: p.hotel.trim(),
                inclusions: p.inclusions.map((x) => x.trim()),
                amount: p.amount.trim(),
                currency: p.currency.trim(),
            })),
            paymentDetails: {
                upiId: input.paymentDetails.upiId.trim(),
                upiPhoneNumber: input.paymentDetails.upiPhoneNumber.trim(),
                accountNumber: input.paymentDetails.accountNumber.trim(),
                bank: input.paymentDetails.bank.trim(),
                ifsc: input.paymentDetails.ifsc.trim(),
            },
            contact: {
                name: input.contact.name.trim(),
                phoneNumber: input.contact.phoneNumber.trim(),
                email: input.contact.email.trim().toLowerCase(),
            },
        } as const;

        const update = input.status ? { ...updateBase, status: input.status } : updateBase;

        const updated = await Package.findOneAndUpdate({ packageId }, { $set: update }, { new: true, runValidators: true })
            .lean<PackageDocument | null>();

        return updated;
    }

    static async inactivatePackage(packageId: string): Promise<PackageDocument | null> {
        const id = packageId.trim();
        if (!id) return null;

        const updated = await Package.findOneAndUpdate(
            { packageId: id },
            { $set: { status: 'Inactive' } },
            { new: true, runValidators: true }
        ).lean<PackageDocument | null>();

        return updated;
    }

    static async activatePackage(packageId: string): Promise<PackageDocument | null> {
        const id = packageId.trim();
        if (!id) return null;

        const updated = await Package.findOneAndUpdate(
            { packageId: id },
            { $set: { status: 'Active' } },
            { new: true, runValidators: true }
        ).lean<PackageDocument | null>();

        return updated;
    }

    static async listPackages(place?: string, status?: PackageStatus): Promise<PackageDocument[]> {
        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (place && place.trim()) {
            const placeTrimmed = place.trim();
            const regex = new RegExp(PackageService.escapeRegex(placeTrimmed), 'i');
            filter.$or = [
                { place: regex },
                { packageName: regex }
            ];
        }
        const results = await Package.find(filter).lean<PackageDocument[]>();
        return results;
    }

    static async listPackagesByUser(userId: string, status?: PackageStatus): Promise<PackageDocument[]> {
        const userIdTrimmed = userId.trim();
        if (!userIdTrimmed) return [];

        const filter = status ? { userId: userIdTrimmed, status } : { userId: userIdTrimmed };
        const results = await Package.find(filter).lean<PackageDocument[]>();
        return results;
    }

    static async getPackageById(packageId: string): Promise<PackageDocument | null> {
        const id = packageId.trim();
        if (!id) return null;

        const doc = await Package.findOne({ packageId: id }).lean<PackageDocument | null>();
        return doc;
    }

    static toListItem(doc: PackageDocument): PackageListItem {
        const amounts = doc.costPackages
            .map((p) => Number.parseFloat(p.amount))
            .filter((n) => Number.isFinite(n));

        const minAmount = amounts.length > 0 ? Math.min(...amounts) : null;

        return {
            packageName: doc.packageName,
            packageId: doc.packageId,
            place: doc.place,
            startDate: doc.startDate,
            endDate: doc.endDate,
            description: doc.description,
            minNumGuests: doc.minNumGuests,
            maxNumGuests: doc.maxNumGuests,
            minAmount,
        };
    }

    private static escapeRegex(value: string) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
