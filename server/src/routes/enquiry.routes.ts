import { Router } from 'express';
import { EnquiryController } from '../controllers/enquiry.controller.js';

export default class EnquiryRoutes {
    static router() {
        const router = Router();

        router.post('/create', async (req, res) => {
            const response = await EnquiryController.create(req.body);
            return res.status(response.code).json(response);
        });

        router.put('/status', async (req, res) => {
            const enquiryId = typeof req.query.enquiryId === 'string' ? req.query.enquiryId : undefined;
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;
            const response = await EnquiryController.updateStatus(enquiryId, status);
            return res.status(response.code).json(response);
        });

        router.get('/list', async (req, res) => {
            const packageId = typeof req.query.packageId === 'string' ? req.query.packageId : undefined;
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;
            const response = await EnquiryController.list(packageId, status);
            return res.status(response.code).json(response);
        });

        return router;
    }
}
