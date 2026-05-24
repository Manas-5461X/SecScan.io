import { Router } from 'express';
import { scanController } from '../controllers/ScanController';

const router = Router();

router.post('/scan', scanController.scan.bind(scanController));

export default router;
