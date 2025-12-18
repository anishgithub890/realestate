# Schema Enhancements - Dubai Real Estate Advanced Features

## ✅ New Features Added

### 1. **Two-Step Verification (2FA)**
- Added to `User` model:
  - `two_factor_enabled` - Boolean flag
  - `two_factor_secret` - TOTP secret key
  - `two_factor_backup_codes` - JSON array of backup codes
  - `email_verified` - Email verification status
  - `email_verification_token` - Token for email verification
  - `email_verification_expires` - Token expiry

### 2. **Session Management**
- New `Session` model for advanced session control:
  - Tracks IP address, user agent, device type
  - Session expiry management
  - Last activity tracking
  - Multiple device support
  - Active session management

### 3. **Provider Signup (OAuth)**
- New `ProviderAccount` model:
  - Support for Google, Facebook, Apple, Microsoft
  - Stores provider account details
  - Access/refresh token management
  - Links external accounts to users

### 4. **Unit Images (Array)**
- New `UnitImage` model:
  - Multiple images per unit
  - Image types: main, interior, exterior, amenity, floor_plan, virtual_tour
  - Display order management
  - Primary image flag
  - Caption support

### 5. **Unit Documents**
- New `UnitDocument` model:
  - Title deed storage
  - Ejari documents
  - DEWA bills
  - Municipality documents
  - Expiry date tracking

### 6. **Dubai Real Estate Specific Features**

#### Ejari Integration
- Added to `RentalContract`:
  - `ejari_registered` - Registration status
  - `ejari_number` - Ejari registration number
  - `ejari_registration_date` - Registration date
  - `ejari_expiry_date` - Expiry date
- Added to `unit`:
  - `ejari_number` - Unit Ejari number
  - `ejari_expiry` - Ejari expiry date

#### DEWA Integration
- Added to `unit`:
  - `dewa_account` - DEWA account number
  - `municipality_fees` - Annual municipality fees

#### Enhanced Unit Properties
- `furnished_type` - furnished/semi-furnished/unfurnished
- `view_type` - sea/city/park/pool view
- `floor_number` - Unit floor number
- `total_floors` - Total floors in building
- `year_built` - Construction year
- `listing_type` - rent/sale/both
- `is_featured` - Featured listing flag
- `is_verified` - Verified property flag
- `virtual_tour_url` - 360 virtual tour
- `description` - Detailed description
- `latitude` / `longitude` - GPS coordinates

#### Broker/Agent Management
- New `Broker` model:
  - RERA license number tracking
  - License expiry management
  - Commission rate configuration
  - Active/inactive status

#### Property Viewing/Appointments
- New `PropertyViewing` model:
  - Scheduled viewings
  - Lead/tenant viewing tracking
  - Status management (scheduled/completed/cancelled/no_show)
  - Feedback and ratings
  - Agent assignment

#### Property Favorites
- New `UnitFavorite` model:
  - User favorites/bookmarks
  - Lead favorites
  - Guest favorites (by email)
  - Notes on favorites

#### Property Inspection Reports
- New `PropertyInspection` model:
  - Move-in/move-out inspections
  - Routine inspections
  - Pre-sale inspections
  - Condition ratings
  - Defects tracking
  - Photo documentation

#### Property Valuation
- New `PropertyValuation` model:
  - Rental valuation
  - Sale valuation
  - Market analysis
  - Comparable units tracking
  - Valuer information

#### Property Insurance
- New `PropertyInsurance` model:
  - Building insurance
  - Contents insurance
  - Liability insurance
  - Comprehensive insurance
  - Policy tracking
  - Renewal management

#### Property Maintenance History
- New `PropertyMaintenanceHistory` model:
  - Preventive maintenance
  - Corrective maintenance
  - Emergency maintenance
  - Upgrade tracking
  - Cost tracking
  - Vendor management

#### Property Notifications
- New `PropertyNotification` model:
  - Price drop alerts
  - New listing notifications
  - Contract expiry reminders
  - Payment due alerts
  - Maintenance due reminders
  - Read/unread status

#### Property Analytics
- New `PropertyAnalytics` model:
  - Daily view counts
  - Favorites count
  - Inquiries count
  - Viewings count
  - Offers count
  - Performance tracking

### 7. **Commission Tracking**
- Added to `RentalContract` and `SalesContract`:
  - `agent_commission` - Agent commission amount
  - `broker_commission` - Broker commission amount
  - `commission_paid` - Payment status
  - `broker_id` - Broker reference

## 📊 Database Indexes Added

### User Model
- `email_verified` - For filtering verified users
- `two_factor_enabled` - For 2FA users

### Unit Model
- `ejari_number` - For Ejari lookups
- `is_featured` - For featured listings
- `listing_type` - For listing type filtering

### RentalContract Model
- `ejari_number` - For Ejari contract lookups

### Session Model
- `session_token` - For session lookups
- `expires_at` - For session cleanup

### ProviderAccount Model
- `provider` + `provider_account_id` - Unique constraint
- `provider` - For provider filtering

## 🔐 Security Enhancements

1. **Two-Factor Authentication**
   - TOTP-based 2FA
   - Backup codes support
   - Email verification

2. **Session Management**
   - Device tracking
   - IP address logging
   - Session expiry
   - Multiple device support

3. **OAuth Provider Support**
   - Secure provider account linking
   - Token management
   - Multiple provider support

## 🏗️ Implementation Notes

### Unit Images
```typescript
// Example: Get unit with images
const unit = await prisma.unit.findUnique({
  where: { id: unitId },
  include: {
    images: {
      orderBy: [
        { is_primary: 'desc' },
        { display_order: 'asc' }
      ]
    }
  }
});
```

### Session Management
```typescript
// Example: Create session
const session = await prisma.session.create({
  data: {
    user_id: userId,
    session_token: generateToken(),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    device_type: detectDevice(req),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});
```

### Two-Factor Authentication
```typescript
// Example: Enable 2FA
await prisma.user.update({
  where: { id: userId },
  data: {
    two_factor_enabled: true,
    two_factor_secret: generateTOTPSecret(),
    two_factor_backup_codes: JSON.stringify(generateBackupCodes())
  }
});
```

### Provider Signup
```typescript
// Example: Link Google account
await prisma.providerAccount.create({
  data: {
    user_id: userId,
    provider: 'google',
    provider_account_id: googleUserId,
    provider_email: googleEmail,
    access_token: encryptedToken,
    expires_at: tokenExpiry
  }
});
```

## 📝 Migration Steps

1. Run Prisma migration:
```bash
npm run prisma:migrate
```

2. Update Prisma Client:
```bash
npm run prisma:generate
```

3. Update seed script if needed

4. Update services to use new models

## 🎯 Next Steps

1. Implement 2FA service
2. Implement session management service
3. Implement OAuth provider services
4. Implement unit image upload service
5. Implement property viewing service
6. Implement analytics tracking
7. Implement notification service

