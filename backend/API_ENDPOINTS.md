# API Endpoints Reference

## Base URL
- **Development**: `http://localhost:3000` (or `http://localhost:3007` if configured)
- **API Prefix**: `/api`

## Public Endpoints (No Authentication Required)

### Health Check
```
GET /health
```

### API Information
```
GET /api
```
Returns API information and available endpoints.

### Authentication
```
POST /api/auth/login
POST /api/auth/oauth/token
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/refresh
```

### Provider Signup
```
POST /api/providers/signup
```

---

## Protected Endpoints (Authentication Required)

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Authentication (Protected)
```
GET /api/auth/me
GET /api/auth/companies
POST /api/auth/select-company
POST /api/auth/logout
```

### Users
```
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

### Tenants
```
GET /api/tenants
GET /api/tenants/:id
POST /api/tenants
PUT /api/tenants/:id
DELETE /api/tenants/:id
GET /api/tenants/:id/kyc
POST /api/tenants/:id/kyc
GET /api/tenants/:id/contracts
GET /api/tenants/:id/units
```

### Landlords
```
GET /api/landlords
GET /api/landlords/:id
POST /api/landlords
PUT /api/landlords/:id
DELETE /api/landlords/:id
GET /api/landlords/:id/kyc
GET /api/landlords/:id/units
```

### Properties
```
GET /api/buildings
GET /api/buildings/:id
POST /api/buildings
PUT /api/buildings/:id
DELETE /api/buildings/:id

GET /api/units
GET /api/units/available
GET /api/units/:id
POST /api/units
PUT /api/units/:id
DELETE /api/units/:id

GET /api/unit-types
POST /api/unit-types

GET /api/amenities
POST /api/amenities

GET /api/parkings
POST /api/parkings
```

### Contracts
```
GET /api/rental-contracts
GET /api/rental-contracts/:id
POST /api/rental-contracts
PUT /api/rental-contracts/:id
POST /api/rental-contracts/:id/renew

GET /api/sales-contracts
GET /api/sales-contracts/:id
POST /api/sales-contracts
PUT /api/sales-contracts/:id

POST /api/handovers
```

### Viewings
```
GET /api/viewings
GET /api/viewings/:id
POST /api/viewings
PUT /api/viewings/:id
PUT /api/viewings/:id/status
DELETE /api/viewings/:id
GET /api/viewings/units/:unitId
```

### Brokers
```
GET /api/brokers
GET /api/brokers/:id
GET /api/brokers/:id/stats
POST /api/brokers
PUT /api/brokers/:id
DELETE /api/brokers/:id
```

### Two-Factor Authentication
```
GET /api/2fa/status
POST /api/2fa/enable
POST /api/2fa/verify-enable
POST /api/2fa/disable
POST /api/2fa/verify
POST /api/2fa/regenerate-backup-codes
```

### Sessions
```
GET /api/sessions
GET /api/sessions/stats
DELETE /api/sessions/:session_token
DELETE /api/sessions/all/revoke
```

### Providers
```
GET /api/providers
POST /api/providers/link
DELETE /api/providers/unlink/:provider
```

### Property Advanced Features
```
# Favorites
POST /api/favorites
GET /api/favorites
DELETE /api/favorites/:unitId
GET /api/favorites/leads/:leadId

# Inspections
GET /api/inspections
POST /api/inspections
GET /api/inspections/units/:unitId

# Valuations
GET /api/valuations
POST /api/valuations
GET /api/valuations/units/:unitId

# Insurance
GET /api/insurances
POST /api/insurances
GET /api/insurances/units/:unitId

# Maintenance History
GET /api/maintenance-history
POST /api/maintenance-history
GET /api/maintenance-history/units/:unitId

# Notifications
GET /api/notifications
PUT /api/notifications/:id/read
PUT /api/notifications/read-all
GET /api/notifications/unread-count

# Analytics
POST /api/analytics/track-view/:unitId
GET /api/analytics/units/:unitId
POST /api/analytics/track/:unitId/:metric
```

---

## Example Usage

### 1. Check API Status
```bash
curl http://localhost:3007/health
```

### 2. Get API Information
```bash
curl http://localhost:3007/api
```

### 3. Login
```bash
curl -X POST http://localhost:3007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "company_id": 1
  }'
```

### 4. Access Protected Endpoint
```bash
curl http://localhost:3007/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "error": "No token provided",
  "code": "UNAUTHORIZED"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Route not found",
  "code": "NOT_FOUND"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation error message",
  "code": "VALIDATION_ERROR"
}
```

---

## Notes

- All timestamps are in ISO 8601 format
- All IDs are integers
- Pagination is available on list endpoints using `?page=1&limit=10`
- Most endpoints support filtering and sorting via query parameters

