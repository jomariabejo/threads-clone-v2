import { Router, type RequestHandler } from 'express';
import { ROUTES } from '../config/constants';
import { getSitemap } from '../controllers/sitemap';

const router = Router();
const passToVite: RequestHandler = (_req, _res, next) => {
  next();
};

// Sitemap route - must be before other routes
router.get(ROUTES.SITEMAP, getSitemap);

// Page routes - pass to Vite for rendering (SPA, client-side routing).
// Auth is enforced client-side (JWT from backend-v2), so every page route
// is simply handed off to Vite.
router.get(ROUTES.HOME, passToVite);
router.get(ROUTES.LOGIN, passToVite);
router.get(ROUTES.REGISTER, passToVite);
router.get(ROUTES.FEED, passToVite);
router.get(ROUTES.CREATE, passToVite);
router.get(ROUTES.SEARCH, passToVite);
router.get(ROUTES.ACTIVITY, passToVite);
router.get(ROUTES.PROFILE, passToVite);
router.get(ROUTES.PROFILE_EDIT, passToVite);
router.get(ROUTES.PROFILE_USER, passToVite);

export default router;

