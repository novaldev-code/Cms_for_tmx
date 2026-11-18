import { env } from '../config/env.js';
import { sendSuccess } from '../utils/http.js';

export function getSiteInfo(req, res) {
  sendSuccess(
    res,
    {
      name: env.siteName,
      description: 'Mini CMS untuk mengelola dan menerbitkan artikel.',
    },
    'Informasi situs berhasil diambil',
  );
}
