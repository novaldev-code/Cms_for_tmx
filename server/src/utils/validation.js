import { ApiError } from './http.js';

export function parseInput(schema, input, message = 'Data yang dikirim tidak valid') {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  const errors = {};

  for (const issue of result.error.issues) {
    const field = issue.path.join('.') || 'form';

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  throw new ApiError(400, message, errors);
}
