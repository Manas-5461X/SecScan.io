import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';
import scanRoutes from './routes/scan';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
    cors({
        origin: '*', // Adjust for production
        methods: ['GET', 'POST'],
    })
);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Built-in body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// App Routes
app.use('/api', scanRoutes);

// Error Handling (should be last)
app.use(errorHandler);

export default app;
