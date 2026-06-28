import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

export default class UserRoutes {
    static router() {
        const router = Router();

        router.post('/signup', async (req, res) => {
            const response = await UserController.signup(req.body);
            return res.status(response.code).json(response);
        });

        router.post('/login', async (req, res) => {
            const response = await UserController.login(req.body);
            return res.status(response.code).json(response);
        });

        router.post('/agent/register', async (req, res) => {
            const response = await UserController.agentRegistration(req.body);
            return res.status(response.code).json(response);
        });

        router.post('/agent/create', async (req, res) => {
            const response = await UserController.agentRegistration(req.body);
            return res.status(response.code).json(response);
        });

        router.put('/agent/approve', async (req, res) => {
            const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
            const response = await UserController.approveAgent(userId);
            return res.status(response.code).json(response);
        });

        router.put('/agent/suspend', async (req, res) => {
            const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
            const response = await UserController.suspendAgent(userId);
            return res.status(response.code).json(response);
        });

        router.get('/agent/list', async (req, res) => {
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;
            const response = await UserController.listAgents(status);
            return res.status(response.code).json(response);
        });

        return router;
    }
}
