export const IMPORT_CSV_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const IMPORT_CSV_MAX_FILE_SIZE_MB = IMPORT_CSV_MAX_FILE_SIZE_BYTES / (1024 * 1024)
export const IMPORT_CSV_MAX_FILE_SIZE_LABEL = `${IMPORT_CSV_MAX_FILE_SIZE_MB} MB`

export const IMPORT_CSV_ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/csv',
  'text/plain',
  '',
] as const

export const IMPORT_CSV_ALLOWED_MIME_TYPE_SET = new Set<string>(IMPORT_CSV_ALLOWED_MIME_TYPES)

