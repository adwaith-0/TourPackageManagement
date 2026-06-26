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

        return router;
    }
}
