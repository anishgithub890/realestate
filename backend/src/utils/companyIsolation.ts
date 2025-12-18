/**
 * Company Data Isolation Utilities
 * 
 * This module provides utilities to ensure complete data isolation between companies.
 * All database queries must filter by company_id to prevent cross-company data access.
 */

import { NotFoundError, ForbiddenError } from '../utils/errors';
import prisma from '../config/database';

/**
 * Validates that a resource belongs to the specified company
 * Throws NotFoundError if resource doesn't exist or belongs to different company
 */
export async function validateCompanyOwnership(
  model: string,
  id: number,
  companyId: number,
  companyField: string = 'company_id'
): Promise<void> {
  const resource = await (prisma as any)[model].findFirst({
    where: {
      id,
      [companyField]: companyId,
    },
  });

  if (!resource) {
    throw new NotFoundError(`${model} not found or does not belong to your company`);
  }
}

/**
 * Ensures a where clause includes company_id filter
 */
export function enforceCompanyFilter(where: any, companyId: number, companyField: string = 'company_id'): any {
  return {
    ...where,
    [companyField]: companyId,
  };
}

/**
 * Validates that all IDs in an array belong to the specified company
 */
export async function validateCompanyOwnershipBatch(
  model: string,
  ids: number[],
  companyId: number,
  companyField: string = 'company_id'
): Promise<void> {
  if (ids.length === 0) return;

  const resources = await (prisma as any)[model].findMany({
    where: {
      id: { in: ids },
      [companyField]: companyId,
    },
    select: { id: true },
  });

  if (resources.length !== ids.length) {
    throw new ForbiddenError('Some resources do not belong to your company');
  }
}

/**
 * Middleware helper to ensure company_id is always present in request body for creation
 */
export function enforceCompanyIdInBody(data: any, companyId: number): any {
  return {
    ...data,
    company_id: companyId,
  };
}

