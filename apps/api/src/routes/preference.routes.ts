import { Router } from 'express';
import { getLastPreferences } from '../controllers/preference.controller';

const router = Router();

router.get('/:clientId', getLastPreferences);

export default router;
