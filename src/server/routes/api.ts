import { Router } from 'express';
import { API_PATHS } from '../config/constants';
import { getKey } from '../controllers/api';

const router = Router();

// Public: returns the local-storage encryption key used to persist
// client-side state (Connectly's own JWT auth is handled separately).
router.get(API_PATHS.KEY, getKey);

export default router;

