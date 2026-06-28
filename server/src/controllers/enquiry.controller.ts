import { Response } from '../models/response.model.js';
import { type EnquiryDocument, type EnquiryStatus } from '../models/enquiry.model.js';
import { CollectionResponse } from '../models/response-collection.model.js';
import { EnquiryService } from '../services/enquiry.service.js';
import { ValidationUtil } from '../utilities/validation.util.js';

type CreateEnquiryBody = {
    packageId?: unknown;
    costPackage?: unknown;
    name?: unknown;
    email?: unknown;
    phoneNumber?: unknown;
    travelerCount?: unknown;
    departureDate?: unknown;
    fromLocation?: unknown;
    message?: unknown;
};

export class EnquiryController {
    static async create(body: CreateEnquiryBody) {
        const response: Response<EnquiryDocument> = {
            code: 201,
            success: true,
            message: 'Enquiry created successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(body.packageId)) { response.code = 400; response.success = false; response.errorMessage = 'PackageId is required.'; response.message = 'Failed to create enquiry.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.costPackage)) { response.code = 400; response.success = false; response.errorMessage = 'CostPackage is required.'; response.message = 'Failed to create enquiry.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.name)) { response.code = 400; response.success = false; response.errorMessage = 'Name is required.'; response.message = 'Failed to create enquiry.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.email)) { response.code = 400; response.success = false; response.errorMessage = 'Email is required.'; response.message = 'Failed to create enquiry.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.phoneNumber)) { response.code = 400; response.success = false; response.errorMessage = 'PhoneNumber is required.'; response.message = 'Failed to create enquiry.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.departureDate)) { response.code = 400; response.success = false; response.errorMessage = 'DepartureDate is required.'; response.message = 'Failed to create enquiry.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.fromLocation)) { response.code = 400; response.success = false; response.errorMessage = 'FromLocation is required.'; response.message = 'Failed to create enquiry.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.message)) { response.code = 400; response.success = false; response.errorMessage = 'Message is required.'; response.message = 'Failed to create enquiry.'; return response; }

        const travelerCount = EnquiryController.parseInt(body.travelerCount);
        if (travelerCount === null || travelerCount < 1) { response.code = 400; response.success = false; response.errorMessage = 'TravelerCount must be an integer >= 1.'; response.message = 'Failed to create enquiry.'; return response; }

        try {
            const result = await EnquiryService.createEnquiry({
                packageId: body.packageId,
                costPackage: body.costPackage,
                name: body.name,
                email: body.email,
                phoneNumber: body.phoneNumber,
                travelerCount,
                departureDate: body.departureDate,
                fromLocation: body.fromLocation,
                message: body.message,
            });

            if (result.status === 'package_not_found') {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'Package not found.';
                response.message = 'Failed to create enquiry.';
                return response;
            }

            if (result.status === 'cost_package_not_found') {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'CostPackage not found for the package.';
                response.message = 'Failed to create enquiry.';
                return response;
            }

            response.code = 201;
            response.success = true;
            response.errorMessage = '';
            response.message = 'Enquiry created successfully.';
            response.data = result.enquiry;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to create enquiry.';
            response.message = 'Failed to create enquiry.';
            return response;
        }
    }

    static async updateStatus(enquiryId: unknown, status: unknown) {
        const response: Response<EnquiryDocument> = {
            code: 200,
            success: true,
            message: 'Enquiry status updated successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(enquiryId)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'EnquiryId is required.';
            response.message = 'Failed to update enquiry status.';
            return response;
        }

        const parsedStatus = EnquiryController.parseStatus(status);
        if (parsedStatus === 'invalid' || parsedStatus === null) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'Status must be New, Contacted, Booked, Closed or Rejected.';
            response.message = 'Failed to update enquiry status.';
            return response;
        }

        try {
            const enquiry = await EnquiryService.updateEnquiryStatus(enquiryId, parsedStatus);
            if (!enquiry) {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'Enquiry not found.';
                response.message = 'Failed to update enquiry status.';
                return response;
            }

            response.code = 200;
            response.success = true;
            response.errorMessage = '';
            response.message = 'Enquiry status updated successfully.';
            response.data = enquiry;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to update enquiry status.';
            response.message = 'Failed to update enquiry status.';
            return response;
        }
    }

    static async list(packageId: unknown, status: unknown) {
        const response: CollectionResponse<EnquiryDocument> = {
            code: 200,
            success: true,
            message: 'Enquiries fetched successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(packageId)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'PackageId is required.';
            response.message = 'Failed to fetch enquiries.';
            return response;
        }

        const parsedStatus = EnquiryController.parseStatus(status);
        if (parsedStatus === 'invalid') {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'Status must be New, Contacted, Booked, Closed or Rejected.';
            response.message = 'Failed to fetch enquiries.';
            return response;
        }

        try {
            const enquiries = await EnquiryService.listEnquiriesByPackage(packageId, parsedStatus ?? undefined);
            response.code = 200;
            response.success = true;
            response.errorMessage = '';
            response.message = 'Enquiries fetched successfully.';
            response.data = enquiries;
            response.count = enquiries.length;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to fetch enquiries.';
            response.message = 'Failed to fetch enquiries.';
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

    private static parseStatus(value: unknown): EnquiryStatus | null | 'invalid' {
        if (value === undefined || value === null || value === '') return null;
        if (value === 'New' || value === 'Contacted' || value === 'Booked' || value === 'Closed' || value === 'Rejected') return value;
        return 'invalid';
    }
}
