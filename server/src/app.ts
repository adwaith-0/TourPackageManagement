import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import UserRoutes from './routes/user.routes.js';
import PackageRoutes from './routes/package.routes.js';
import EnquiryRoutes from './routes/enquiry.routes.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Tour IQ API');
});

app.use('/users', UserRoutes.router(), (req, res) => {
    res.status(404).send('Not Found');
});

app.use('/packages', PackageRoutes.router(), (req, res) => {
    res.status(404).send('Not Found');
});

app.use('/enquiries', EnquiryRoutes.router(), (req, res) => {
    res.status(404).send('Not Found');
});

async function start() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set.');
    }

    await mongoose.connect(mongoUri);

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

start().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
