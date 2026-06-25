import { Router } from 'express';
import { PackageController } from '../controllers/package.controller.js';

export default class PackageRoutes {
    static router() {
        const router = Router();

        router.post('/create', async (req, res) => {
            const response = await PackageController.create(req.body);
            return res.status(response.code).json(response);
        });

        router.put('/update', async (req, res) => {
            const response = await PackageController.update(req.body);
            return res.status(response.code).json(response);
        });

        router.put('/inactivate', async (req, res) => {
            const packageId = typeof req.query.packageId === 'string' ? req.query.packageId : undefined;
            const response = await PackageController.inactivate(packageId);
            return res.status(response.code).json(response);
        });

        router.put('/activate', async (req, res) => {
            const packageId = typeof req.query.packageId === 'string' ? req.query.packageId : undefined;
            const response = await PackageController.activate(packageId);
            return res.status(response.code).json(response);
        });

        router.get('/list', async (req, res) => {
            const place = typeof req.query.place === 'string' ? req.query.place : undefined;
            const date = typeof req.query.date === 'string' ? req.query.date : undefined;
            const response = await PackageController.list(place, date);
            return res.status(response.code).json(response);
        });

        router.get('/details', async (req, res) => {
            const packageId = typeof req.query.packageId === 'string' ? req.query.packageId : undefined;
            const response = await PackageController.getDetails(packageId);
            return res.status(response.code).json(response);
        });

        router.get('/listByUser', async (req, res) => {
            const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;
            const response = await PackageController.listByUser(userId, status);
            return res.status(response.code).json(response);
        });

        return router;
    }
}
