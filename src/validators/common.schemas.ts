import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS - Reusable schemas for common patterns
// ============================================================================

/**
 * CUID validation (Prisma default ID format)
 */
export const cuidSchema = z.string().min(1, 'ID is required');

/**
 * Optional CUID
 */
export const optionalCuidSchema = z.string().min(1).optional();

/**
 * Date string validation (ISO 8601 date: YYYY-MM-DD)
 */
export const dateStringSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)' }
);

/**
 * Optional date string
 */
export const optionalDateStringSchema = dateStringSchema.optional();

/**
 * Time string validation (HH:MM format)
 */
export const timeStringSchema = z.string().regex(
  /^([01]\d|2[0-3]):([0-5]\d)$/,
  'Invalid time format. Use HH:MM format'
);

/**
 * Optional time string
 */
export const optionalTimeStringSchema = timeStringSchema.optional();

/**
 * Positive decimal (for money amounts)
 */
export const positiveDecimalSchema = z.number().nonnegative('Amount must be non-negative');

/**
 * Optional positive decimal
 */
export const optionalPositiveDecimalSchema = positiveDecimalSchema.optional();

/**
 * Percentage (0-100)
 */
export const percentageSchema = z.number().min(0).max(100, 'Percentage must be between 0 and 100');

/**
 * Optional percentage
 */
export const optionalPercentageSchema = percentageSchema.optional();

/**
 * Interest rate (0-1 as decimal, e.g., 0.045 for 4.5%)
 */
export const interestRateSchema = z.number().min(0).max(1, 'Interest rate must be between 0 and 1');

/**
 * Optional interest rate
 */
export const optionalInterestRateSchema = interestRateSchema.optional();

/**
 * US State code (2 letters)
 */
export const stateCodeSchema = z.string().length(2, 'State code must be 2 characters').toUpperCase();

/**
 * Optional state code
 */
export const optionalStateCodeSchema = stateCodeSchema.optional();

/**
 * Country code (2 letters, defaults to US)
 */
export const countryCodeSchema = z.string().length(2, 'Country code must be 2 characters').toUpperCase().default('US');

/**
 * Optional country code
 */
export const optionalCountryCodeSchema = z.string().length(2).toUpperCase().optional();

/**
 * ZIP code (US format)
 */
export const zipCodeSchema = z.string().regex(
  /^\d{5}(-\d{4})?$/,
  'Invalid ZIP code format. Use 12345 or 12345-6789'
);

/**
 * Optional ZIP code
 */
export const optionalZipCodeSchema = zipCodeSchema.optional();

/**
 * Phone number (digits only, 10 digits for US)
 */
export const phoneNumberSchema = z.string().regex(
  /^\d{10,15}$/,
  'Phone number must be 10-15 digits'
);

/**
 * Optional phone number
 */
export const optionalPhoneNumberSchema = phoneNumberSchema.optional();

/**
 * Email address
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Optional email
 */
export const optionalEmailSchema = emailSchema.optional();

/**
 * SSN (Social Security Number) - 9 digits
 */
export const ssnSchema = z.string().regex(
  /^\d{9}$/,
  'SSN must be exactly 9 digits (no dashes)'
);

/**
 * Optional SSN
 */
export const optionalSsnSchema = ssnSchema.optional();

/**
 * Non-empty string
 */
export const nonEmptyStringSchema = z.string().min(1, 'This field cannot be empty');

/**
 * Optional non-empty string (if provided, must not be empty)
 */
export const optionalNonEmptyStringSchema = z.string().min(1).optional();

/**
 * Priority (1-5, where 1 is highest)
 */
export const prioritySchema = z.number().int().min(1).max(5).default(3);

/**
 * Optional priority
 */
export const optionalPrioritySchema = z.number().int().min(1).max(5).optional();

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

/**
 * Pagination query parameters
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: cuidSchema,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create an enum schema from Prisma enum values
 */
export const createEnumSchema = <T extends string>(
  enumObj: Record<string, T>,
  fieldName: string
) => {
  const values = Object.values(enumObj) as [T, ...T[]];
  return z.enum(values, {
    errorMap: () => ({
      message: `${fieldName} must be one of: ${values.join(', ')}`,
    }),
  });
};

/**
 * Create an optional enum schema
 */
export const createOptionalEnumSchema = <T extends string>(
  enumObj: Record<string, T>,
  fieldName: string
) => {
  return createEnumSchema(enumObj, fieldName).optional();
};
