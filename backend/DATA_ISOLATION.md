# Company Data Isolation - Security Implementation

## Overview
This document describes the complete data isolation implementation to ensure that users from one company cannot access data from another company.

## Security Principles

1. **Token-Based Isolation**: The JWT token contains `companyId` which is extracted and validated on every request
2. **Query-Level Filtering**: All database queries MUST filter by `company_id`
3. **Validation Layer**: All getById, update, and delete operations validate company ownership
4. **No Bypass**: There are no endpoints that allow cross-company data access

## Implementation Details

### 1. Authentication Middleware (`src/middleware/auth.ts`)

The authentication middleware:
- Extracts `companyId` from JWT token
- Validates that the user belongs to that company
- Sets `req.user.companyId` for all subsequent requests

```typescript
// CRITICAL: Always filter by company_id
const user = await prisma.user.findFirst({
  where: { 
    id: payload.userId,
    company_id: payload.companyId, // Enforce company isolation
  },
});
```

### 2. Controller Layer

All controllers use `req.user.companyId` which is guaranteed to be set by the authentication middleware:

```typescript
async getUsers(req: Request, res: Response) {
  // req.user.companyId is always present after authentication
  const result = await userService.getUsers(
    req.user.companyId, // Passed to service layer
    req.query,
    req.query
  );
}
```

### 3. Service Layer

All service methods:
- Accept `companyId` as the first parameter
- Filter all queries by `company_id`
- Validate company ownership for getById, update, delete operations

```typescript
async getUsers(companyId: number, pagination: any, filters: any) {
  const where: any = {
    company_id: companyId, // CRITICAL: Always filter by company
  };
  // ... rest of query
}
```

### 4. Database Query Pattern

**✅ CORRECT - Always filter by company_id:**
```typescript
const user = await prisma.user.findFirst({
  where: {
    id,
    company_id: companyId, // Required for isolation
  },
});
```

**❌ WRONG - Missing company_id filter:**
```typescript
const user = await prisma.user.findUnique({
  where: { id }, // Missing company_id - SECURITY RISK!
});
```

## Data Isolation Checklist

### ✅ Implemented Isolation

- [x] **Authentication**: JWT token contains and validates companyId
- [x] **User Management**: All user queries filter by company_id
- [x] **Tenant Management**: All tenant queries filter by company_id
- [x] **Landlord Management**: All landlord queries filter by company_id
- [x] **Property Management**: All property queries filter by company_id
- [x] **Contract Management**: All contract queries filter by company_id
- [x] **Lead Management**: All lead queries filter by company_id
- [x] **Ticket Management**: All ticket queries filter by company_id
- [x] **Complaint Management**: All complaint queries filter by company_id
- [x] **Payment Management**: All payment queries filter by company_id
- [x] **Session Management**: All session queries filter by company_id
- [x] **Broker Management**: All broker queries filter by company_id
- [x] **Viewing Management**: All viewing queries filter by company_id

### Security Measures

1. **Token Validation**: Company ID is validated on every request
2. **Query Filtering**: All queries include `company_id` in WHERE clause
3. **Ownership Validation**: getById methods verify company ownership
4. **Update Protection**: Update operations verify company ownership before allowing changes
5. **Delete Protection**: Delete operations verify company ownership before deletion
6. **Create Protection**: Create operations automatically set company_id from token

## Testing Data Isolation

### Test Scenarios

1. **Cross-Company Access Prevention**:
   - User from Company A tries to access User ID from Company B
   - Expected: 404 Not Found (not 403 to avoid information leakage)

2. **Token Manipulation**:
   - User tries to modify companyId in JWT token
   - Expected: 401 Unauthorized (company mismatch detected)

3. **Direct ID Access**:
   - User tries to access resource by ID without company filter
   - Expected: All queries include company_id filter, so cross-company access is impossible

### Example Test

```typescript
// User from Company 1 (companyId: 1)
// Tries to access User ID 5 which belongs to Company 2

const user = await userService.getUserById(5, 1); // companyId: 1
// Returns null or throws NotFoundError
// User 5 is not returned because it belongs to Company 2
```

## Utility Functions

A utility module (`src/utils/companyIsolation.ts`) provides helper functions:

- `validateCompanyOwnership()`: Validates resource belongs to company
- `enforceCompanyFilter()`: Ensures WHERE clause includes company_id
- `validateCompanyOwnershipBatch()`: Validates multiple resources
- `enforceCompanyIdInBody()`: Ensures company_id in request body

## Best Practices

1. **Always use `findFirst` with company_id** instead of `findUnique` when company isolation is required
2. **Never trust client-provided company_id** - always use `req.user.companyId`
3. **Validate ownership** before update/delete operations
4. **Log security violations** when company mismatch is detected
5. **Use transactions** when operations span multiple tables to maintain consistency

## Monitoring

Monitor for:
- Company mismatch errors (potential token manipulation)
- Unauthorized access attempts
- Queries without company_id filter (code review required)

## Status

✅ **COMPLETE** - All endpoints enforce company data isolation. Users can only access data from their own company.

