// =============================================================================
// ACORD XML API Validation Schemas
// =============================================================================

import { z } from 'zod';

// Import Options Schema
export const importOptionsSchema = z.object({
  updateExisting: z.boolean().optional().default(false),
  validateOnly: z.boolean().optional().default(false),
});

export type ImportOptions = z.infer<typeof importOptionsSchema>;

// Export Options Schema
export const exportOptionsSchema = z.object({
  includeParties: z.boolean().optional().default(true),
  includeHoldings: z.boolean().optional().default(true),
  includeRelations: z.boolean().optional().default(true),
  includeCoverages: z.boolean().optional().default(true),
  includeActivities: z.boolean().optional().default(false),
  partyIds: z.array(z.string()).optional(),
  holdingIds: z.array(z.string()).optional(),
  transactionType: z.string().optional(),
  vendorCode: z.string().optional(),
  vendorName: z.string().optional(),
  appName: z.string().optional(),
  appVersion: z.string().optional(),
});

export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;

// Export by Party ID Schema
export const exportByPartySchema = z.object({
  partyId: z.string().min(1, 'Party ID is required'),
});

// Export by Holding ID Schema
export const exportByHoldingSchema = z.object({
  holdingId: z.string().min(1, 'Holding ID is required'),
});

// Bulk Export Schema
export const bulkExportSchema = z.object({
  partyIds: z.array(z.string()).optional(),
  holdingIds: z.array(z.string()).optional(),
  includeParties: z.boolean().optional().default(true),
  includeHoldings: z.boolean().optional().default(true),
  includeRelations: z.boolean().optional().default(true),
}).refine(
  (data) => (data.partyIds && data.partyIds.length > 0) || (data.holdingIds && data.holdingIds.length > 0),
  { message: 'At least one partyId or holdingId must be provided' }
);

export type BulkExportInput = z.infer<typeof bulkExportSchema>;
