// File & form validation

export interface ValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
}


const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
]);

const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|heic|heif)$/i;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (HEIC from iPhone can be large)

export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, code: 'NO_FILE', message: 'No file selected.' };
  }

  const typeOk = ACCEPTED_TYPES.has(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
  if (!typeOk) {
    return {
      valid: false,
      code: 'INVALID_TYPE',
      message: `Unsupported file type. Please upload a JPG, PNG, or HEIC photo.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      code: 'TOO_LARGE',
      message: `File is too large (${mb} MB). Maximum size is 25 MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      code: 'EMPTY_FILE',
      message: 'The file appears to be empty or corrupt.',
    };
  }

  return { valid: true };
}

export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, code: 'REQUIRED', message: 'Name is required.' };
  }
  if (trimmed.length > 60) {
    return { valid: false, code: 'TOO_LONG', message: 'Name must be 60 characters or less.' };
  }
  return { valid: true };
}

export function validateRole(role: string): ValidationResult {
  const trimmed = role.trim();
  if (!trimmed) {
    return { valid: false, code: 'REQUIRED', message: 'Role / Stack is required.' };
  }
  if (trimmed.length > 80) {
    return { valid: false, code: 'TOO_LONG', message: 'Role must be 80 characters or less.' };
  }
  return { valid: true };
}

export function validateSecondary(value: string): ValidationResult {
  if (value.trim().length > 80) {
    return { valid: false, code: 'TOO_LONG', message: 'Secondary field must be 80 characters or less.' };
  }
  return { valid: true };
}

/** Sanitize text for use in HTML attributes / metadata */
export function sanitizeText(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim()
    .slice(0, 200);
}
