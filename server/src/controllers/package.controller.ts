import { Response } from '../models/response.model.js';
import { CollectionResponse } from '../models/response-collection.model.js';
import { type PackageDocument, type PackageStatus, type Itinerary, type CostPackage, type PaymentDetails, type ContactDetails } from '../models/package.model.js';
import { PackageService, type PackageListItem } from '../services/package.service.js';
import { ValidationUtil } from '../utilities/validation.util.js';

type CreatePackageBody = {
    userId?: unknown;
    place?: unknown;
    packageName?: unknown;
    startDate?: unknown;
    endDate?: unknown;
    description?: unknown;
    pickupLocation?: unknown;
    dropoffLocation?: unknown;
    minNumGuests?: unknown;
    maxNumGuests?: unknown;
    gallery?: unknown;
    experiencesOffered?: unknown;
    shopping?: unknown;
    itineraries?: unknown;
    inclusions?: unknown;
    exclusions?: unknown;
    costPackages?: unknown;
    paymentDetails?: unknown;
    contact?: unknown;
    status?: unknown;
};

type UpdatePackageBody = CreatePackageBody & {
    packageId?: unknown;
};

export class PackageController {
    static async create(body: CreatePackageBody) {
        let response: Response<PackageDocument> = {
            code: 201,
            success: true,
            message: 'Package created successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(body.userId)) { response.code = 400; response.success = false; response.errorMessage = 'UserId is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.place)) { response.code = 400; response.success = false; response.errorMessage = 'Place is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.packageName)) { response.code = 400; response.success = false; response.errorMessage = 'Package name is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.startDate)) { response.code = 400; response.success = false; response.errorMessage = 'Start date is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.endDate)) { response.code = 400; response.success = false; response.errorMessage = 'End date is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.description)) { response.code = 400; response.success = false; response.errorMessage = 'Description is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.pickupLocation)) { response.code = 400; response.success = false; response.errorMessage = 'Pickup location is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.dropoffLocation)) { response.code = 400; response.success = false; response.errorMessage = 'Dropoff location is required.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isStringArray(body.gallery)) { response.code = 400; response.success = false; response.errorMessage = 'Gallery must be an array of non-empty strings.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isStringArray(body.experiencesOffered)) { response.code = 400; response.success = false; response.errorMessage = 'ExperiencesOffered must be an array of non-empty strings.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isStringArray(body.shopping)) { response.code = 400; response.success = false; response.errorMessage = 'Shopping must be an array of non-empty strings.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isStringArray(body.inclusions)) { response.code = 400; response.success = false; response.errorMessage = 'Inclusions must be an array of non-empty strings.'; response.message = 'Failed to create package.'; return response; }
        if (!ValidationUtil.isStringArray(body.exclusions)) { response.code = 400; response.success = false; response.errorMessage = 'Exclusions must be an array of non-empty strings.'; response.message = 'Failed to create package.'; return response; }

        const minNumGuests = PackageController.parseInt(body.minNumGuests);
        if (minNumGuests === null || minNumGuests < 1) { response.code = 400; response.success = false; response.errorMessage = 'MinNumGuests must be an integer >= 1.'; response.message = 'Failed to create package.'; return response; }

        const maxNumGuests = PackageController.parseInt(body.maxNumGuests);
        if (maxNumGuests === null || maxNumGuests < 1) { response.code = 400; response.success = false; response.errorMessage = 'MaxNumGuests must be an integer >= 1.'; response.message = 'Failed to create package.'; return response; }

        if (minNumGuests > maxNumGuests) { response.code = 400; response.success = false; response.errorMessage = 'MinNumGuests cannot be greater than MaxNumGuests.'; response.message = 'Failed to create package.'; return response; }

        const status = PackageController.parseStatus(body.status);
        if (status === 'invalid') { response.code = 400; response.success = false; response.errorMessage = 'Status must be Active or Inactive.'; response.message = 'Failed to create package.'; return response; }

        const itineraries = PackageController.parseItineraries(body.itineraries);
        if (!itineraries) { response.code = 400; response.success = false; response.errorMessage = 'Itineraries must be an array of { dayNumber: int>=1, items: string[] }.'; response.message = 'Failed to create package.'; return response; }

        const costPackages = PackageController.parseCostPackages(body.costPackages);
        if (!costPackages) { response.code = 400; response.success = false; response.errorMessage = 'CostPackages must be an array of { name, hotel, inclusions, amount, currency }.'; response.message = 'Failed to create package.'; return response; }

        const paymentDetails = PackageController.parsePaymentDetails(body.paymentDetails);
        if (!paymentDetails) { response.code = 400; response.success = false; response.errorMessage = 'PaymentDetails is invalid.'; response.message = 'Failed to create package.'; return response; }

        const contact = PackageController.parseContact(body.contact);
        if (!contact) { response.code = 400; response.success = false; response.errorMessage = 'Contact is invalid.'; response.message = 'Failed to create package.'; return response; }

        try {
            const input = {
                userId: body.userId,
                place: body.place,
                packageName: body.packageName,
                startDate: body.startDate,
                endDate: body.endDate,
                description: body.description,
                pickupLocation: body.pickupLocation,
                dropoffLocation: body.dropoffLocation,
                minNumGuests,
                maxNumGuests,
                gallery: body.gallery,
                experiencesOffered: body.experiencesOffered,
                shopping: body.shopping,
                itineraries,
                inclusions: body.inclusions,
                exclusions: body.exclusions,
                costPackages,
                paymentDetails,
                contact,
            } as const;

            const created = await PackageService.createPackage(status === null ? input : { ...input, status });

            response.code = 201;
            response.success = true;
            response.message = 'Package created successfully.';
            response.data = created;
            return response;
        } catch (err) {
            const anyErr = err as { code?: unknown };
            if (anyErr?.code === 11000) {
                response.code = 409;
                response.success = false;
                response.errorMessage = 'Package already exists.';
                response.message = 'Failed to create package.';
                return response;
            }
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to create package.';
            response.message = 'Failed to create package.';
            return response;
        }
    }

    static async update(body: UpdatePackageBody) {
        let response: Response<PackageDocument> = {
            code: 200,
            success: true,
            message: 'Package updated successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(body.packageId)) { response.code = 400; response.success = false; response.errorMessage = 'PackageId is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.userId)) { response.code = 400; response.success = false; response.errorMessage = 'UserId is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.place)) { response.code = 400; response.success = false; response.errorMessage = 'Place is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.packageName)) { response.code = 400; response.success = false; response.errorMessage = 'Package name is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.startDate)) { response.code = 400; response.success = false; response.errorMessage = 'Start date is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.endDate)) { response.code = 400; response.success = false; response.errorMessage = 'End date is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.description)) { response.code = 400; response.success = false; response.errorMessage = 'Description is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.pickupLocation)) { response.code = 400; response.success = false; response.errorMessage = 'Pickup location is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.dropoffLocation)) { response.code = 400; response.success = false; response.errorMessage = 'Dropoff location is required.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isStringArray(body.gallery)) { response.code = 400; response.success = false; response.errorMessage = 'Gallery must be an array of non-empty strings.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isStringArray(body.experiencesOffered)) { response.code = 400; response.success = false; response.errorMessage = 'ExperiencesOffered must be an array of non-empty strings.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isStringArray(body.shopping)) { response.code = 400; response.success = false; response.errorMessage = 'Shopping must be an array of non-empty strings.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isStringArray(body.inclusions)) { response.code = 400; response.success = false; response.errorMessage = 'Inclusions must be an array of non-empty strings.'; response.message = 'Failed to update package.'; return response; }
        if (!ValidationUtil.isStringArray(body.exclusions)) { response.code = 400; response.success = false; response.errorMessage = 'Exclusions must be an array of non-empty strings.'; response.message = 'Failed to update package.'; return response; }

        const minNumGuests = PackageController.parseInt(body.minNumGuests);
        if (minNumGuests === null || minNumGuests < 1) { response.code = 400; response.success = false; response.errorMessage = 'MinNumGuests must be an integer >= 1.'; response.message = 'Failed to update package.'; return response; }

        const maxNumGuests = PackageController.parseInt(body.maxNumGuests);
        if (maxNumGuests === null || maxNumGuests < 1) { response.code = 400; response.success = false; response.errorMessage = 'MaxNumGuests must be an integer >= 1.'; response.message = 'Failed to update package.'; return response; }

        if (minNumGuests > maxNumGuests) { response.code = 400; response.success = false; response.errorMessage = 'MinNumGuests cannot be greater than MaxNumGuests.'; response.message = 'Failed to update package.'; return response; }

        const status = PackageController.parseStatus(body.status);
        if (status === 'invalid') { response.code = 400; response.success = false; response.errorMessage = 'Status must be Active or Inactive.'; response.message = 'Failed to update package.'; return response; }

        const itineraries = PackageController.parseItineraries(body.itineraries);
        if (!itineraries) { response.code = 400; response.success = false; response.errorMessage = 'Itineraries must be an array of { dayNumber: int>=1, items: string[] }.'; response.message = 'Failed to update package.'; return response; }

        const costPackages = PackageController.parseCostPackages(body.costPackages);
        if (!costPackages) { response.code = 400; response.success = false; response.errorMessage = 'CostPackages must be an array of { name, hotel, inclusions, amount, currency }.'; response.message = 'Failed to update package.'; return response; }

        const paymentDetails = PackageController.parsePaymentDetails(body.paymentDetails);
        if (!paymentDetails) { response.code = 400; response.success = false; response.errorMessage = 'PaymentDetails is invalid.'; response.message = 'Failed to update package.'; return response; }

        const contact = PackageController.parseContact(body.contact);
        if (!contact) { response.code = 400; response.success = false; response.errorMessage = 'Contact is invalid.'; response.message = 'Failed to update package.'; return response; }

        try {
            const input = {
                packageId: body.packageId,
                userId: body.userId,
                place: body.place,
                packageName: body.packageName,
                startDate: body.startDate,
                endDate: body.endDate,
                description: body.description,
                pickupLocation: body.pickupLocation,
                dropoffLocation: body.dropoffLocation,
                minNumGuests,
                maxNumGuests,
                gallery: body.gallery,
                experiencesOffered: body.experiencesOffered,
                shopping: body.shopping,
                itineraries,
                inclusions: body.inclusions,
                exclusions: body.exclusions,
                costPackages,
                paymentDetails,
                contact,
            } as const;

            const updated = await PackageService.updatePackage(status === null ? input : { ...input, status });
            if (!updated) {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'Package not found.';
                response.message = 'Failed to update package.';
                return response;
            }

            response.code = 200;
            response.success = true;
            response.message = 'Package updated successfully.';
            response.data = updated;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to update package.';
            response.message = 'Failed to update package.';
            return response;
        }
    }

    static async inactivate(packageId: unknown) {
        let response: Response<PackageDocument> = {
            code: 200,
            success: true,
            message: 'Package inactivated successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(packageId)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'PackageId is required.';
            response.message = 'Failed to inactivate package.';
            return response;
        }

        try {
            const updated = await PackageService.inactivatePackage(packageId);
            if (!updated) {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'Package not found.';
                response.message = 'Failed to inactivate package.';
                return response;
            }

            response.code = 200;
            response.success = true;
            response.message = 'Package inactivated successfully.';
            response.data = updated;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to inactivate package.';
            response.message = 'Failed to inactivate package.';
            return response;
        }
    }

    static async activate(packageId: unknown) {
        let response: Response<PackageDocument> = {
            code: 200,
            success: true,
            message: 'Package activated successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(packageId)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'PackageId is required.';
            response.message = 'Failed to activate package.';
            return response;
        }

        try {
            const updated = await PackageService.activatePackage(packageId);
            if (!updated) {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'Package not found.';
                response.message = 'Failed to activate package.';
                return response;
            }

            response.code = 200;
            response.success = true;
            response.message = 'Package activated successfully.';
            response.data = updated;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to activate package.';
            response.message = 'Failed to activate package.';
            return response;
        }
    }

    /**
     * Lists active or inactive tour packages.
     * Supports optional 'place' (partial match on name/destination) and 'date' (exact departure date match).
     */
    static async list(place: unknown, date: unknown, status: unknown) {
        let response: CollectionResponse<PackageListItem> = {
            code: 200,
            success: true,
            message: 'Packages fetched successfully.',
        };

        const parsedStatus = PackageController.parseStatus(status);
        if (parsedStatus === 'invalid') {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'Status must be Active or Inactive.';
            response.message = 'Failed to fetch packages.';
            return response;
        }

        // Place and date are now optional query parameters
        const placeStr = ValidationUtil.isNonEmptyString(place) ? place : undefined;

        let queryDate: Date | null = null;
        if (ValidationUtil.isNonEmptyString(date)) {
            queryDate = PackageController.parseDate(date);
            if (!queryDate) {
                response.code = 400;
                response.success = false;
                response.errorMessage = 'Date is invalid.';
                response.message = 'Failed to fetch packages.';
                return response;
            }
        }

        try {
            const docs = await PackageService.listPackages(placeStr, parsedStatus ?? undefined);

            let matches = docs;
            // If departure date is provided, filter by exact start/departure date match to filter out pre-departed tours
            if (queryDate) {
                matches = docs.filter((doc) => {
                    const start = PackageController.parseDate(doc.startDate);
                    if (!start) return false;
                    return queryDate!.getTime() === start.getTime();
                });
            }

            const items = matches.map((doc) => PackageService.toListItem(doc));
            return PackageController.buildListResponse(items);
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to fetch packages.';
            response.message = 'Failed to fetch packages.';
            return response;
        }
    }

    static async listByUser(userId: unknown, status: unknown) {
        let response: CollectionResponse<PackageListItem> = {
            code: 200,
            success: true,
            message: 'Packages fetched successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(userId)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'UserId is required.';
            response.message = 'Failed to fetch packages.';
            return response;
        }

        const parsedStatus = PackageController.parseStatus(status);
        if (parsedStatus === 'invalid') {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'Status must be Active or Inactive.';
            response.message = 'Failed to fetch packages.';
            return response;
        }

        try {
            const docs = await PackageService.listPackagesByUser(userId, parsedStatus ?? undefined);
            const items = docs.map((doc) => PackageService.toListItem(doc));
            return PackageController.buildListResponse(items);
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to fetch packages.';
            response.message = 'Failed to fetch packages.';
            return response;
        }
    }

    static async getDetails(packageId: unknown) {
        let response: Response<PackageDocument> = {
            code: 200,
            success: true,
            message: 'Package fetched successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(packageId)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'PackageId is required.';
            response.message = 'Failed to fetch package.';
            return response;
        }

        try {
            const doc = await PackageService.getPackageById(packageId);
            if (!doc) {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'Package not found.';
                response.message = 'Failed to fetch package.';
                return response;
            }

            response.code = 200;
            response.success = true;
            response.errorMessage = '';
            response.message = 'Package fetched successfully.';
            response.data = doc;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to fetch package.';
            response.message = 'Failed to fetch package.';
            return response;
        }
    }

    private static parseInt(value: unknown): number | null {
        if (typeof value === 'number') return Number.isInteger(value) ? value : null;
        if (typeof value === 'string' && value.trim().length > 0) {
            const n = Number(value.trim());
            return Number.isFinite(n) && Number.isInteger(n) ? n : null;
        }
        return null;
    }

    private static parseStatus(value: unknown): PackageStatus | null | 'invalid' {
        if (value === undefined || value === null || value === '') return null;
        if (value === 'Active' || value === 'Inactive') return value;
        return 'invalid';
    }

    private static parseItineraries(value: unknown): Itinerary[] | null {
        if (!Array.isArray(value) || value.length === 0) return null;
        const parsed: Itinerary[] = [];
        for (const item of value) {
            if (!ValidationUtil.isObject(item)) return null;
            const dayNumber = PackageController.parseInt(item.dayNumber);
            if (dayNumber === null || dayNumber < 1) return null;
            if (!ValidationUtil.isStringArray(item.items)) return null;
            parsed.push({ dayNumber, items: item.items });
        }
        return parsed;
    }

    private static parseCostPackages(value: unknown): CostPackage[] | null {
        if (!Array.isArray(value) || value.length === 0) return null;
        const parsed: CostPackage[] = [];
        for (const item of value) {
            if (!ValidationUtil.isObject(item)) return null;
            if (!ValidationUtil.isNonEmptyString(item.name)) return null;
            if (!ValidationUtil.isNonEmptyString(item.hotel)) return null;
            if (!ValidationUtil.isStringArray(item.inclusions)) return null;
            if (!ValidationUtil.isNonEmptyString(item.amount)) return null;
            if (!ValidationUtil.isNonEmptyString(item.currency)) return null;
            parsed.push({ name: item.name, hotel: item.hotel, inclusions: item.inclusions, amount: item.amount, currency: item.currency });
        }
        return parsed;
    }

    private static parsePaymentDetails(value: unknown): PaymentDetails | null {
        if (!ValidationUtil.isObject(value)) return null;
        if (!ValidationUtil.isNonEmptyString(value.upiId)) return null;
        if (!ValidationUtil.isNonEmptyString(value.upiPhoneNumber)) return null;
        if (!ValidationUtil.isNonEmptyString(value.accountNumber)) return null;
        if (!ValidationUtil.isNonEmptyString(value.bank)) return null;
        if (!ValidationUtil.isNonEmptyString(value.ifsc)) return null;
        return {
            upiId: value.upiId,
            upiPhoneNumber: value.upiPhoneNumber,
            accountNumber: value.accountNumber,
            bank: value.bank,
            ifsc: value.ifsc,
        };
    }

    private static parseContact(value: unknown): ContactDetails | null {
        if (!ValidationUtil.isObject(value)) return null;
        if (!ValidationUtil.isNonEmptyString(value.name)) return null;
        if (!ValidationUtil.isNonEmptyString(value.phoneNumber)) return null;
        if (!ValidationUtil.isNonEmptyString(value.email)) return null;
        return {
            name: value.name,
            phoneNumber: value.phoneNumber,
            email: value.email,
        };
    }

    private static parseDate(value: string): Date | null {
        const trimmed = value.trim();
        const iso = new Date(trimmed);
        if (!Number.isNaN(iso.getTime())) return iso;

        const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(trimmed);
        if (!m) return null;
        const day = Number(m[1] || '0');
        const monStr = (m[2] || '').toLowerCase();
        const year = Number(m[3] || '0');
        if (!Number.isInteger(day) || !Number.isInteger(year) || day < 1 || day > 31) return null;

        const months: Record<string, number> = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11,
        };

        const month = months[monStr];
        if (month === undefined) return null;

        const d = new Date(Date.UTC(year, month, day));
        if (Number.isNaN(d.getTime())) return null;
        return d;
    }

    private static buildListResponse(items: PackageListItem[]): CollectionResponse<PackageListItem> {
        if (items.length === 0) {
            return {
                code: 200,
                success: true,
                message: 'There are no packages matching given criteria.',
                errorMessage: '',
                data: [],
                count: 0,
            };
        }

        return {
            code: 200,
            success: true,
            message: 'Packages fetched successfully.',
            errorMessage: '',
            data: items,
            count: items.length,
        };
    }
}
