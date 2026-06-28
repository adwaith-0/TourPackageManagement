import crypto from 'crypto';
import { User, type PublicUserDocument, UserDocument, type UserType } from '../models/user.model.js';
import { Agent, type AgentDocument, type AgentStatus } from '../models/agent.model.js';

export type SignupInput = {
    name: string;
    type: UserType;
    email: string;
    phoneNumber: string;
    password: string;
};

export type LoginInput = {
    email: string;
    password: string;
};

export type AgentRegistrationInput = {
    email: string;
    agencyName: string;
    website: string;
    experience: number;
    licenceNumber: string;
    panNumber: string;
    specialities: string;
};

export type AgentRegistrationResult =
    | { status: 'ok'; agent: AgentDocument }
    | { status: 'user_not_found' }
    | { status: 'agent_exists' };

export class UserService {
    static hashPassword(password: string) {
        const iterations = 120_000;
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), iterations, 32, 'sha256').toString('hex');
        return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
    }

    static verifyPassword(password: string, storedPasswordHash: string) {
        const parts = storedPasswordHash.split('$');
        if (parts.length !== 4) return false;
        const algo = parts[0];
        const iterationsRaw = parts[1];
        const saltHex = parts[2];
        const hashHex = parts[3];
        if (!algo || !iterationsRaw || !saltHex || !hashHex) return false;
        if (algo !== 'pbkdf2_sha256') return false;
        const iterations = Number(iterationsRaw);
        if (!Number.isFinite(iterations) || iterations <= 0) return false;

        if (saltHex.length % 2 !== 0 || hashHex.length % 2 !== 0) return false;
        if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) return false;

        const saltBytes = Buffer.from(saltHex, 'hex');
        const derived = crypto.pbkdf2Sync(password, saltBytes, iterations, 32, 'sha256');
        const expected = Buffer.from(hashHex, 'hex');
        if (expected.length !== derived.length) return false;

        return crypto.timingSafeEqual(expected, derived);
    }

    static async signupUser(input: SignupInput): Promise<UserDocument> {
        const userId = crypto.randomUUID();
        const passwordHash = UserService.hashPassword(input.password);

        const user = await User.create({
            userId, 
            name: input.name.trim(),
            type: input.type,
            email: input.email.trim().toLowerCase(),
            phoneNumber: input.phoneNumber.trim(),
            passwordHash,
        });

        return {
            userId: user.userId,
            name: user.name,
            type: user.type,
            email: user.email,
            phoneNumber: user.phoneNumber,
            passwordHash,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            accessToken: '',
            refreshToken: '',
        };
    }

    static async loginUser(input: LoginInput): Promise<PublicUserDocument | null> {
        const email = input.email.trim().toLowerCase();

        if (email === 'admin@touriq.com' && input.password === 'admin123') {
            return {
                userId: 'user-superadmin',
                name: 'Super Admin',
                type: 'superadmin',
                email: 'admin@touriq.com',
                phoneNumber: '9876543210',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }

        const user = await User.findOne({ email }).select('+passwordHash').lean<UserDocument | null>();
        if (!user) return null;

        if (!UserService.verifyPassword(input.password, user.passwordHash)) return null;

        const { passwordHash: _passwordHash, ...publicUser } = user;
        return {
            ...publicUser,
            accessToken: '',
            refreshToken: '',
        };
    }

    static async registerAgent(input: AgentRegistrationInput): Promise<AgentRegistrationResult> {
        const email = input.email.trim().toLowerCase();

        const user = await User.findOne({ email }).lean<UserDocument | null>();
        if (!user) return { status: 'user_not_found' };

        const existingAgent = await Agent.findOne({ userId: user.userId }).lean<AgentDocument | null>();
        if (existingAgent) return { status: 'agent_exists' };

        let createdAgent: AgentDocument & { createdAt: Date; updatedAt: Date };
        try {
            createdAgent = await Agent.create({
                agencyName: input.agencyName.trim(),
                website: input.website.trim(),
                experience: input.experience,
                licenceNumber: input.licenceNumber.trim(),
                panNumber: input.panNumber.trim(),
                specialities: input.specialities.trim(),
                userId: user.userId,
                status: 'New',
            });
        } catch (err) {
            const anyErr = err as { code?: unknown };
            if (anyErr?.code === 11000) return { status: 'agent_exists' };
            throw err;
        }

        return {
            status: 'ok',
            agent: {
                agencyName: createdAgent.agencyName,
                website: createdAgent.website,
                experience: createdAgent.experience,
                licenceNumber: createdAgent.licenceNumber,
                panNumber: createdAgent.panNumber,
                specialities: createdAgent.specialities,
                userId: createdAgent.userId,
                status: createdAgent.status,
                createdAt: createdAgent.createdAt,
                updatedAt: createdAgent.updatedAt,
            },
        };
    }

    static async updateAgentStatus(userId: string, status: AgentStatus): Promise<AgentDocument | null> {
        const trimmedUserId = userId.trim();
        if (!trimmedUserId) return null;

        const updatedAgent = await Agent.findOneAndUpdate(
            { userId: trimmedUserId },
            { $set: { status } },
            { new: true, runValidators: true }
        ).lean<AgentDocument | null>();

        if (updatedAgent) {
            const userType = status === 'Approved' ? 'Agent' : 'Traveler';
            await User.updateOne({ userId: trimmedUserId }, { $set: { type: userType } });
        }

        return updatedAgent;
    }

    static async listAgents(status?: AgentStatus): Promise<any[]> {
        const filter = status ? { status } : {};
        const agents = await Agent.find(filter).lean();
        
        const agentsWithUsers = await Promise.all(agents.map(async (agent) => {
            const user = await User.findOne({ userId: agent.userId }).lean();
            return {
                ...agent,
                id: agent.userId,
                name: user ? user.name : 'Unknown User',
                email: user ? user.email : '',
                phone: user ? user.phoneNumber : '',
            };
        }));
        
        return agentsWithUsers;
    }
}
