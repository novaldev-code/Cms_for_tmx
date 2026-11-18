import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email wajib diisi' })
    .trim()
    .toLowerCase()
    .max(254, 'Email maksimal 254 karakter')
    .email('Format email tidak valid'),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi')
    .max(200, 'Password maksimal 200 karakter'),
});
