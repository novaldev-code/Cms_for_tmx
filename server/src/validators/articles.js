import { z } from 'zod';

function emptyToNull(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  return value;
}

function emptyToUndefined(value) {
  return value === '' || value === null ? undefined : value;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const titleField = z
  .string({ error: 'Judul wajib diisi' })
  .trim()
  .min(1, 'Judul wajib diisi')
  .max(200, 'Judul maksimal 200 karakter');

const contentField = z
  .string({ error: 'Isi artikel wajib diisi' })
  .trim()
  .min(1, 'Isi artikel wajib diisi')
  .max(100000, 'Isi artikel maksimal 100.000 karakter');

const slugField = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    return typeof value === 'string' ? value.trim() : value;
  },
  z
    .string({ error: 'Slug harus berupa teks' })
    .max(160, 'Slug maksimal 160 karakter')
    .optional(),
);

const excerptField = z.preprocess(
  emptyToNull,
  z
    .string({ error: 'Excerpt harus berupa teks' })
    .trim()
    .max(500, 'Excerpt maksimal 500 karakter')
    .nullable(),
);

const coverImageUrlField = z.preprocess(
  emptyToNull,
  z
    .string({ error: 'URL gambar harus berupa teks' })
    .trim()
    .max(2048, 'URL gambar maksimal 2048 karakter')
    .refine(isHttpUrl, 'URL gambar harus berupa URL http atau https yang valid')
    .nullable(),
);

const statusField = z.enum(['draft', 'published'], {
  error: 'Status harus draft atau published',
});

const pageField = z.coerce
  .number({ error: 'Halaman harus berupa angka' })
  .int('Halaman harus berupa bilangan bulat')
  .min(1, 'Halaman minimal 1')
  .default(1);

function limitField(max, defaultValue) {
  return z.coerce
    .number({ error: 'Limit harus berupa angka' })
    .int('Limit harus berupa bilangan bulat')
    .min(1, 'Limit minimal 1')
    .max(max, `Limit maksimal ${max}`)
    .default(defaultValue);
}

export const createArticleSchema = z.object({
  title: titleField,
  slug: slugField,
  excerpt: excerptField,
  content: contentField,
  cover_image_url: coverImageUrlField,
  status: statusField.default('draft'),
});

export const updateArticleSchema = z.object({
  title: titleField,
  slug: slugField,
  excerpt: excerptField,
  content: contentField,
  cover_image_url: coverImageUrlField,
  status: statusField.optional(),
});

export const publicArticlesQuerySchema = z.object({
  page: pageField,
  limit: limitField(24, 6),
});

export const adminArticlesQuerySchema = z.object({
  page: pageField,
  limit: limitField(50, 10),
  q: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Pencarian harus berupa teks' })
      .trim()
      .max(100, 'Pencarian maksimal 100 karakter')
      .optional(),
  ),
  status: z.preprocess(emptyToUndefined, statusField.optional()),
});

export const articleIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: 'ID artikel harus berupa angka' })
    .int('ID artikel harus berupa bilangan bulat')
    .positive('ID artikel tidak valid'),
});

export const articleSlugParamsSchema = z.object({
  slug: z
    .string({ error: 'Slug artikel tidak valid' })
    .trim()
    .min(1, 'Slug artikel tidak valid')
    .max(160, 'Slug artikel tidak valid'),
});
