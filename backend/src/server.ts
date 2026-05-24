import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const port = env.PORT;

const server = app.listen(port, () => {
    logger.info(`🚀 Server running on port ${port} in ${env.NODE_ENV} mode`);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err: any) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // In production, you might want to restart the server
    // server.close(() => process.exit(1));
});
