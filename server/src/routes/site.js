import { Router } from 'express';
import { getSiteInfo } from '../controllers/siteController.js';

export const siteRouter = Router();

siteRouter.get('/', getSiteInfo);
