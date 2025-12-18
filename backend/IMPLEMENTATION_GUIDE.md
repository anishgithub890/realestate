# Backend Implementation Guide

This document provides a comprehensive guide for implementing the remaining modules in the Real Estate Management System backend.

## ✅ Completed Modules

1. **Authentication & Authorization** - OAuth2, JWT, RBAC
2. **User Management** - CRUD, Roles, Permissions
3. **Tenant Management** - CRUD, KYC, Contracts, Units
4. **Landlord Management** - CRUD, KYC, Units
5. **Property Management** - Buildings, Units, Floors, Amenities, Parking
6. **Infrastructure** - Redis caching, Email service, File upload, Docker

## 📋 Remaining Modules

### Pattern for Implementation

Each module should follow this structure:

```
src/
├── services/
│   └── {module}Service.ts      # Business logic
├── controllers/
│   └── {module}Controller.ts   # Request/Response handling
└── routes/
    └── {module}Routes.ts       # Route definitions
```

### 1. Contract Management Module

**Files to create:**
- `src/services/contractService.ts`
- `src/controllers/contractController.ts`
- `src/routes/contractRoutes.ts`

**Key Features:**
- Rental contract CRUD
- Sales contract CRUD
- Contract renewal
- Contract handover
- Contract document management

**Example Service Method:**
```typescript
async createRentalContract(data: any, companyId: number, createdBy: number) {
  // Generate contract number
  const contractNo = await this.generateContractNumber('RENTAL', companyId);
  
  // Create contract with units
  const contract = await prisma.rentalContract.create({
    data: {
      contract_no: contractNo,
      contract_date: new Date(data.contract_date),
      from_date: new Date(data.from_date),
      to_date: new Date(data.to_date),
      amount: parseFloat(data.amount),
      security_amount: parseFloat(data.security_amount),
      service_amount: parseFloat(data.service_amount),
      payment_terms: data.payment_terms,
      tenant_id: data.tenant_id,
      salesman_id: data.salesman_id,
      company_id: companyId,
      created_by: createdBy,
      units: {
        create: data.unit_ids.map((uid: number) => ({
          unit_id: uid,
        })),
      },
    },
    include: {
      tenant: true,
      units: {
        include: { unit: true },
      },
    },
  });

  // Update unit status
  await prisma.unit.updateMany({
    where: { id: { in: data.unit_ids } },
    data: { status: 'occupied' },
  });

  return contract;
}
```

**Routes:**
- `GET /api/rental-contracts` - List rental contracts
- `GET /api/rental-contracts/:id` - Get contract details
- `POST /api/rental-contracts` - Create rental contract
- `PUT /api/rental-contracts/:id` - Update contract
- `POST /api/rental-contracts/:id/renew` - Renew contract
- `POST /api/rental-contracts/:id/handover` - Contract handover
- Similar routes for sales contracts

### 2. Payment & Receipt Management Module

**Key Features:**
- Receipt creation
- Multiple payment methods (Cheque, Online Transfer, Cash)
- Cheque tracking (deposited, cleared, returned)
- Payment status management

**Example Service Method:**
```typescript
async createReceipt(data: any, companyId: number, createdBy: number) {
  const receiptNo = await this.generateReceiptNumber(companyId);
  
  const receipt = await prisma.receipt.create({
    data: {
      receipt_no: receiptNo,
      date: new Date(data.date),
      contract_id: data.contract_id,
      contract_type: data.contract_type, // 'rental' or 'sales'
      company_id: companyId,
      created_by: createdBy,
      payments: {
        create: data.payments.map((payment: any) => ({
          payment_type: payment.payment_type,
          amount_incl: parseFloat(payment.amount_incl),
          status: payment.status || 'Actual',
          instrument_no: payment.instrument_no,
          description: payment.description,
          vat_amount: payment.vat_amount ? parseFloat(payment.vat_amount) : null,
          payment_under_id: payment.payment_under_id,
          cheque: payment.payment_type === 'Cheque' ? {
            create: {
              date: new Date(payment.cheque_date),
              bank_name: payment.bank_name,
              is_received: payment.is_received || false,
            },
          } : undefined,
        })),
      },
    },
    include: {
      payments: {
        include: {
          cheque: true,
          payment_under: true,
        },
      },
    },
  });

  return receipt;
}

async updateChequeStatus(paymentId: number, status: 'deposited' | 'cleared' | 'returned', companyId: number) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId },
    include: { receipt: true },
  });

  if (!payment || payment.receipt.company_id !== companyId) {
    throw new NotFoundError('Payment');
  }

  const updateData: any = {};
  if (status === 'deposited') {
    updateData.is_deposited = true;
    updateData.deposited_on = new Date();
  } else if (status === 'cleared') {
    updateData.is_deposited = true;
    updateData.cleared_on = new Date();
  } else if (status === 'returned') {
    updateData.is_deposited = false;
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'Returned', returned_on: new Date() },
    });
  }

  return prisma.cheque.update({
    where: { payment_id: paymentId },
    data: updateData,
  });
}
```

### 3. Lead/Inquiry Management Module

**Key Features:**
- Lead CRUD
- Lead follow-up tracking
- AI-powered unit matching
- Lead assignment

**AI Matching Algorithm:**
```typescript
async getMatchedUnits(leadId: number, companyId: number) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      preferred_areas: { include: { area: true } },
      preferred_unit_types: { include: { unit_type: true } },
      preferred_amenities: { include: { amenity: true } },
    },
  });

  if (!lead) throw new NotFoundError('Lead');

  const availableUnits = await prisma.unit.findMany({
    where: {
      company_id: companyId,
      status: 'available',
      property_type: lead.property_type,
    },
    include: {
      building: { include: { area: true } },
      unit_type: true,
      amenities: { include: { amenity: true } },
    },
  });

  // Calculate match scores
  const scoredUnits = availableUnits.map((unit) => {
    let score = 0;

    // Price match (30% weight)
    if (unit.basic_rent) {
      if (unit.basic_rent >= lead.min_price && unit.basic_rent <= lead.max_price) {
        score += 30;
      } else {
        const priceDiff = Math.min(
          Math.abs(unit.basic_rent - lead.min_price),
          Math.abs(unit.basic_rent - lead.max_price)
        );
        const priceRange = lead.max_price - lead.min_price;
        score += Math.max(0, 30 * (1 - priceDiff / priceRange));
      }
    }

    // Area match (25% weight)
    const preferredAreaIds = lead.preferred_areas.map((pa) => pa.area_id);
    if (preferredAreaIds.includes(unit.building.area_id)) {
      score += 25;
    }

    // Unit type match (20% weight)
    const preferredUnitTypeIds = lead.preferred_unit_types.map((put) => put.unit_type_id);
    if (preferredUnitTypeIds.includes(unit.unit_type_id)) {
      score += 20;
    }

    // Amenities match (15% weight)
    const preferredAmenityIds = lead.preferred_amenities.map((pa) => pa.amenity_id);
    const unitAmenityIds = unit.amenities.map((ua) => ua.amenity_id);
    const matchedAmenities = preferredAmenityIds.filter((id) => unitAmenityIds.includes(id));
    if (preferredAmenityIds.length > 0) {
      score += 15 * (matchedAmenities.length / preferredAmenityIds.length);
    }

    // Building match (10% weight)
    score += 10; // Basic match if property type matches

    return { unit, score };
  });

  // Sort by score descending
  return scoredUnits
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Top 10 matches
    .map((item) => ({
      ...item.unit,
      match_score: item.score,
    }));
}
```

### 4. Request Management Module

**Key Features:**
- Request CRUD
- Request status tracking
- Request type management

**Implementation Pattern:**
Follow the same pattern as Tenant/Landlord management with:
- Service methods for CRUD operations
- Controller methods for request/response handling
- Routes with authentication middleware

### 5. Ticket/Maintenance Management Module

**Key Features:**
- Ticket CRUD
- Ticket comments
- Ticket follow-ups
- Job assignment

**Example Service Method:**
```typescript
async createTicket(data: any, companyId: number, createdBy: number) {
  const ticketNo = await this.generateTicketNumber(companyId);
  
  return prisma.ticket.create({
    data: {
      ticket_no: ticketNo,
      type_id: data.type_id,
      status_id: data.status_id,
      description: data.description,
      tenant_id: data.tenant_id,
      landlord_id: data.landlord_id,
      unit_id: data.unit_id,
      company_id: companyId,
      assigned_to: data.assigned_to,
      created_by: createdBy,
    },
    include: {
      type: true,
      status: true,
      tenant: true,
      unit: true,
    },
  });
}

async addComment(ticketId: number, comment: string, createdBy: number, companyId: number) {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, company_id: companyId },
  });

  if (!ticket) throw new NotFoundError('Ticket');

  return prisma.ticketComment.create({
    data: {
      ticket_id: ticketId,
      comment,
      created_by: createdBy,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
```

### 6. Complaint & Suggestion Management Module

Similar pattern to Request Management with:
- Complaint CRUD
- Complaint follow-ups
- Status tracking

### 7. Reports Module

**Key Features:**
- Building-wise reports
- Tenant-wise reports
- Landlord-wise reports
- Cheques summary
- Analytics

**Example Service Method:**
```typescript
async getBuildingReport(companyId: number, filters: any) {
  const where: any = { company_id: companyId };
  
  if (filters.building_id) where.id = parseInt(filters.building_id);
  if (filters.date_from) where.created_at = { gte: new Date(filters.date_from) };
  if (filters.date_to) {
    where.created_at = {
      ...where.created_at,
      lte: new Date(filters.date_to),
    };
  }

  const buildings = await prisma.building.findMany({
    where,
    include: {
      units: {
        include: {
          rental_contracts: {
            include: {
              contract: {
                include: {
                  receipts: {
                    include: { payments: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Calculate statistics
  return buildings.map((building) => ({
    building: {
      id: building.id,
      name: building.name,
    },
    total_units: building.units.length,
    occupied_units: building.units.filter((u) => u.status === 'occupied').length,
    available_units: building.units.filter((u) => u.status === 'available').length,
    total_revenue: building.units.reduce((sum, unit) => {
      const contractRevenue = unit.rental_contracts.reduce((s, rc) => {
        const receiptRevenue = rc.contract.receipts.reduce((r, receipt) => {
          return r + receipt.payments.reduce((p, payment) => p + payment.amount_incl, 0);
        }, 0);
        return s + receiptRevenue;
      }, 0);
      return sum + contractRevenue;
    }, 0),
  }));
}
```

### 8. Master Data Management Module

**Master Data Types:**
- Countries
- States
- Areas
- Activity Sources
- Lead Status
- Follow-up Types
- Maintenance Types
- Maintenance Status
- Request Types
- Request Status
- KYC Doc Types
- Payment Under
- Complaint Status
- Vehicle Master

**Generic Master Service Pattern:**
```typescript
export class MasterDataService {
  async getAll(modelName: string, companyId: number) {
    const model = prisma[modelName.toLowerCase()];
    return model.findMany({
      where: { company_id: companyId },
      orderBy: { name: 'asc' },
    });
  }

  async getById(modelName: string, id: number, companyId: number) {
    const model = prisma[modelName.toLowerCase()];
    const item = await model.findFirst({
      where: { id, company_id: companyId },
    });
    if (!item) throw new NotFoundError(modelName);
    return item;
  }

  async create(modelName: string, data: any, companyId: number) {
    const model = prisma[modelName.toLowerCase()];
    return model.create({
      data: {
        ...data,
        company_id: companyId,
      },
    });
  }

  async update(modelName: string, id: number, data: any, companyId: number) {
    const model = prisma[modelName.toLowerCase()];
    const item = await model.findFirst({
      where: { id, company_id: companyId },
    });
    if (!item) throw new NotFoundError(modelName);

    return model.update({
      where: { id },
      data,
    });
  }

  async delete(modelName: string, id: number, companyId: number) {
    const model = prisma[modelName.toLowerCase()];
    const item = await model.findFirst({
      where: { id, company_id: companyId },
    });
    if (!item) throw new NotFoundError(modelName);

    await model.delete({ where: { id } });
    return { message: `${modelName} deleted successfully` };
  }
}
```

### 9. Announcement Management Module

**Key Features:**
- Announcement CRUD
- Announcement scheduling
- Role-based targeting

### 10. Rental Approval Module

**Key Features:**
- Approval request creation
- Approval workflow
- Status tracking

### 11. Company Management Module

**Key Features:**
- Company info management
- Logo upload
- SMTP configuration

### 12. Dashboard Module

**Key Features:**
- Admin dashboard analytics
- Tenant dashboard
- Landlord dashboard

**Example Service Method:**
```typescript
async getAdminDashboard(companyId: number) {
  const [
    totalTenants,
    totalLandlords,
    totalUnits,
    availableUnits,
    activeContracts,
    totalRevenue,
    pendingTickets,
    activeLeads,
  ] = await Promise.all([
    prisma.tenant.count({ where: { company_id: companyId } }),
    prisma.landlord.count({ where: { company_id: companyId } }),
    prisma.unit.count({ where: { company_id: companyId } }),
    prisma.unit.count({ where: { company_id: companyId, status: 'available' } }),
    prisma.rentalContract.count({
      where: {
        company_id: companyId,
        to_date: { gte: new Date() },
      },
    }),
    // Calculate revenue from receipts
    prisma.receipt.findMany({
      where: {
        company_id: companyId,
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      include: { payments: true },
    }).then((receipts) =>
      receipts.reduce((sum, r) => sum + r.payments.reduce((p, pay) => p + pay.amount_incl, 0), 0)
    ),
    prisma.ticket.count({
      where: {
        company_id: companyId,
        status: { name: { not: 'Closed' } },
      },
    }),
    prisma.lead.count({
      where: {
        company_id: companyId,
        status: { is_qualified: true },
      },
    }),
  ]);

  return {
    stats: {
      totalTenants,
      totalLandlords,
      totalUnits,
      availableUnits,
      occupiedUnits: totalUnits - availableUnits,
      activeContracts,
      totalRevenue,
      pendingTickets,
      activeLeads,
    },
  };
}
```

## 🔧 Utility Functions Needed

### Generate Contract Number
```typescript
async generateContractNumber(type: 'RENTAL' | 'SALES', companyId: number): Promise<string> {
  const prefix = type === 'RENTAL' ? 'RENT' : 'SALE';
  const year = new Date().getFullYear();
  const count = await prisma.rentalContract.count({
    where: {
      company_id: companyId,
      contract_no: { startsWith: `${prefix}-${year}` },
    },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
}
```

### Generate Receipt Number
```typescript
async generateReceiptNumber(companyId: number): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.receipt.count({
    where: {
      company_id: companyId,
      receipt_no: { startsWith: `RCP-${year}` },
    },
  });
  return `RCP-${year}-${String(count + 1).padStart(5, '0')}`;
}
```

## 📝 Adding Routes to Server

After creating routes, add them to `src/server.ts`:

```typescript
import contractRoutes from './routes/contractRoutes';
import paymentRoutes from './routes/paymentRoutes';
// ... other imports

app.use(`${config.API_PREFIX}/contracts`, contractRoutes);
app.use(`${config.API_PREFIX}/payments`, paymentRoutes);
// ... other routes
```

## 🧪 Testing

Create test files following this pattern:
- `src/__tests__/services/{module}Service.test.ts`
- `src/__tests__/controllers/{module}Controller.test.ts`

## 📚 Additional Resources

- Prisma Documentation: https://www.prisma.io/docs
- Express.js Documentation: https://expressjs.com/
- TypeScript Documentation: https://www.typescriptlang.org/docs/

## 🚀 Next Steps

1. Implement Contract Management module
2. Implement Payment & Receipt Management module
3. Implement Lead Management with AI matching
4. Implement remaining modules following the patterns above
5. Add comprehensive error handling and validation
6. Write unit tests for all services
7. Add API documentation with Swagger/OpenAPI

