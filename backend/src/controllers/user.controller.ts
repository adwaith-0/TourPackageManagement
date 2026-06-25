import { UserService } from '../services/user.service.js';
import { type PublicUserDocument, UserDocument } from '../models/user.model.js';
import { type AgentDocument } from '../models/agent.model.js';
import { ValidationUtil } from '../utilities/validation.util.js';
import { Response } from '../models/response.model.js';

type SignupBody = {
    name?: unknown;
    type?: unknown;
    email?: unknown;
    phoneNumber?: unknown;
    password?: unknown;
};

type LoginBody = {
    email?: unknown;
    password?: unknown;
};

type AgentRegistrationBody = {
    email?: unknown;
    agencyName?: unknown;
    website?: unknown;
    experience?: unknown;
    licenceNumber?: unknown;
    panNumber?: unknown;
    specialities?: unknown;
};

export class UserController {
    static async signup(body: SignupBody) {
        let response: Response<UserDocument> = {
            code: 201,
            success: true,
            errorMessage: '',
            message: 'User created successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(body.name)) { response.code = 400; response.success = false; response.errorMessage = 'Name is required.'; return response; }
        if (body.type !== 'Traveler' && body.type !== 'Agent') { response.code = 400; response.success = false; response.errorMessage = 'Type must be Traveler or Agent.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.email)) { response.code = 400; response.success = false; response.errorMessage = 'Email is required.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.phoneNumber)) { response.code = 400; response.success = false; response.errorMessage = 'PhoneNumber is required.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.password)) { response.code = 400; response.success = false; response.errorMessage = 'Password is required.'; return response; }

        try {
            const createdUser = await UserService.signupUser({
                name: body.name,
                type: body.type,
                email: body.email,
                phoneNumber: body.phoneNumber,
                password: body.password,
            });
            
            response.code = 201;
            response.success = true;
            response.message = 'User created successfully.';
            response.errorMessage = '';
            response.data = createdUser;

            return response;
        } catch (err) {
            console.error("Signup error:", err);
            const anyErr = err as { code?: unknown; keyValue?: unknown };
            if (anyErr?.code === 11000) {
                response.code = 409; response.success = false; response.errorMessage = 'User already exists.'; response.message='Failed to create user.'; return response;
            }
            response.code = 500; response.success = false; response.errorMessage = 'Failed to create user.'; response.message='Failed to create user.'; return response;
        }
    }

    static async login(body: LoginBody) {
        let response: Response<PublicUserDocument> = {
            code: 200,
            success: true,
            message: 'Login successful.',
        };

        if (!ValidationUtil.isNonEmptyString(body.email)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'Email is required.';
            response.message = 'Login failed.';
            return response;
        }

        if (!ValidationUtil.isNonEmptyString(body.password)) {
            response.code = 400;
            response.success = false;
            response.errorMessage = 'Password is required.';
            response.message = 'Login failed.';
            return response;
        }

        const user = await UserService.loginUser({ email: body.email, password: body.password });
        if (!user) {
            response.code = 404;
            response.success = false;
            response.errorMessage = 'User not found or invalid credentials.';
            response.message = 'Login failed.';
            return response;
        }

        response.code = 200;
        response.success = true;
        response.message = 'Login successful.';
        response.data = user;
        return response;
    }

    static async agentRegistration(body: AgentRegistrationBody) {
        let response: Response<AgentDocument> = {
            code: 200,
            success: true,
            message: 'Agent registered successfully.',
        };

        if (!ValidationUtil.isNonEmptyString(body.email)) { response.code = 400; response.success = false; response.errorMessage = 'Email is required.'; response.message = 'Agent registration failed.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.agencyName)) { response.code = 400; response.success = false; response.errorMessage = 'Agency name is required.'; response.message = 'Agent registration failed.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.website)) { response.code = 400; response.success = false; response.errorMessage = 'Website is required.'; response.message = 'Agent registration failed.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.licenceNumber)) { response.code = 400; response.success = false; response.errorMessage = 'Licence number is required.'; response.message = 'Agent registration failed.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.panNumber)) { response.code = 400; response.success = false; response.errorMessage = 'PAN number is required.'; response.message = 'Agent registration failed.'; return response; }
        if (!ValidationUtil.isNonEmptyString(body.specialities)) { response.code = 400; response.success = false; response.errorMessage = 'Specialities is required.'; response.message = 'Agent registration failed.'; return response; }
        if (body.specialities.trim().length > 500) { response.code = 400; response.success = false; response.errorMessage = 'Specialities must be 500 characters or fewer.'; response.message = 'Agent registration failed.'; return response; }

        let experience: number | null = null;
        if (typeof body.experience === 'number') {
            experience = Number.isInteger(body.experience) ? body.experience : null;
        } else if (typeof body.experience === 'string' && body.experience.trim().length > 0) {
            const n = Number(body.experience.trim());
            experience = Number.isFinite(n) && Number.isInteger(n) ? n : null;
        }

        if (experience === null || experience < 0) { response.code = 400; response.success = false; response.errorMessage = 'Experience must be a non-negative integer.'; response.message = 'Agent registration failed.'; return response; }

        try {
            const result = await UserService.registerAgent({
                email: body.email,
                agencyName: body.agencyName,
                website: body.website,
                experience,
                licenceNumber: body.licenceNumber,
                panNumber: body.panNumber,
                specialities: body.specialities,
            });

            if (result.status === 'user_not_found') {
                response.code = 404;
                response.success = false;
                response.errorMessage = 'User not found.';
                response.message = 'Agent registration failed.';
                return response;
            }

            if (result.status === 'agent_exists') {
                response.code = 409;
                response.success = false;
                response.errorMessage = 'Agent already exists.';
                response.message = 'Agent registration failed.';
                return response;
            }

            response.code = 200;
            response.success = true;
            response.message = 'Agent registered successfully.';
            response.data = result.agent;
            return response;
        } catch {
            response.code = 500;
            response.success = false;
            response.errorMessage = 'Failed to register agent.';
            response.message = 'Agent registration failed.';
            return response;
        }
    }
}
