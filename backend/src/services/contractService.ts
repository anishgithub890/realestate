import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class ContractService {
  // Generate contract number
  private async generateContractNumber(type: 'RENTAL' | 'SALES', companyId: number): Promise<string> {
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

  // Rental Contracts
  async getRentalContracts(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.tenant_id) where.tenant_id = parseInt(filters.tenant_id);
    if (filters.status) where.status = filters.status;
    if (filters.ejari_registered !== undefined) where.ejari_registered = filters.ejari_registered === 'true';
    if (filters.contract_no) where.contract_no = { contains: filters.contract_no };

    const [contracts, total] = await Promise.all([
      prisma.rentalContract.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          tenant: true,
          salesman: {
            select: { id: true, name: true, email: true },
          },
          broker: true,
          units: {
            include: {
              unit: {
                include: {
                  building: true,
                  floor: true,
                },
              },
            },
          },
        },
      }),
      prisma.rentalContract.count({ where }),
    ]);

    return { items: contracts, pagination: { page, limit, total } };
  }

  async getRentalContractById(id: number, companyId: number) {
    const contract = await prisma.rentalContract.findFirst({
      where: { id, company_id: companyId },
      include: {
        tenant: true,
        salesman: {
          select: { id: true, name: true, email: true },
        },
        broker: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        units: {
          include: {
            unit: {
              include: {
                building: true,
                floor: true,
                unit_type: true,
              },
            },
          },
        },
        parkings: {
          include: {
            parking: true,
            vehicle: true,
          },
        },
        receipts: {
          include: {
            payments: true,
          },
        },
        handover: {
          include: {
            documents: {
              include: { doc_type: true },
            },
          },
        },
      },
    });

    if (!contract) throw new NotFoundError('Rental Contract');
    return contract;
  }

  async createRentalContract(data: any, companyId: number, createdBy: number) {
    const contractNo = await this.generateContractNumber('RENTAL', companyId);

    // Verify tenant exists
    const tenant = await prisma.tenant.findFirst({
      where: { id: data.tenant_id, company_id: companyId },
    });
    if (!tenant) throw new NotFoundError('Tenant');

    // Verify units exist
    if (data.unit_ids && data.unit_ids.length > 0) {
      const units = await prisma.unit.findMany({
        where: {
          id: { in: data.unit_ids },
          company_id: companyId,
        },
      });
      if (units.length !== data.unit_ids.length) {
        throw new NotFoundError('One or more units not found');
      }
    }

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
        grace_period: data.grace_period || null,
        tentative_move_in: new Date(data.tentative_move_in),
        vat_details: data.vat_details || null,
        payment_method: data.payment_method,
        preclose_date: data.preclose_date ? new Date(data.preclose_date) : null,
        preclose_reason: data.preclose_reason || null,
        vat_amount: data.vat_amount ? parseFloat(data.vat_amount) : null,
        management_fee: data.management_fee ? parseFloat(data.management_fee) : null,
        // Ejari
        ejari_registered: data.ejari_registered === true,
        ejari_number: data.ejari_number || null,
        ejari_registration_date: data.ejari_registration_date ? new Date(data.ejari_registration_date) : null,
        ejari_expiry_date: data.ejari_expiry_date ? new Date(data.ejari_expiry_date) : null,
        // Commission
        agent_commission: data.agent_commission ? parseFloat(data.agent_commission) : null,
        broker_commission: data.broker_commission ? parseFloat(data.broker_commission) : null,
        commission_paid: data.commission_paid === true,
        tenant_id: data.tenant_id,
        salesman_id: data.salesman_id,
        broker_id: data.broker_id || null,
        company_id: companyId,
        created_by: createdBy,
        units: {
          create: (data.unit_ids || []).map((uid: number) => ({
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

    // Update unit status to occupied
    if (data.unit_ids && data.unit_ids.length > 0) {
      await prisma.unit.updateMany({
        where: { id: { in: data.unit_ids } },
        data: { status: 'occupied' },
      });
    }

    return contract;
  }

  async updateRentalContract(id: number, data: any, companyId: number) {
    const contract = await prisma.rentalContract.findFirst({
      where: { id, company_id: companyId },
    });

    if (!contract) throw new NotFoundError('Rental Contract');

    const updateData: any = { ...data };
    if (data.contract_date) updateData.contract_date = new Date(data.contract_date);
    if (data.from_date) updateData.from_date = new Date(data.from_date);
    if (data.to_date) updateData.to_date = new Date(data.to_date);
    if (data.tentative_move_in) updateData.tentative_move_in = new Date(data.tentative_move_in);
    if (data.preclose_date) updateData.preclose_date = new Date(data.preclose_date);
    if (data.ejari_registration_date) updateData.ejari_registration_date = new Date(data.ejari_registration_date);
    if (data.ejari_expiry_date) updateData.ejari_expiry_date = new Date(data.ejari_expiry_date);
    if (data.amount) updateData.amount = parseFloat(data.amount);
    if (data.security_amount) updateData.security_amount = parseFloat(data.security_amount);
    if (data.service_amount) updateData.service_amount = parseFloat(data.service_amount);
    if (data.vat_amount) updateData.vat_amount = parseFloat(data.vat_amount);
    if (data.management_fee) updateData.management_fee = parseFloat(data.management_fee);
    if (data.agent_commission) updateData.agent_commission = parseFloat(data.agent_commission);
    if (data.broker_commission) updateData.broker_commission = parseFloat(data.broker_commission);

    return prisma.rentalContract.update({
      where: { id },
      data: updateData,
      include: {
        tenant: true,
        units: {
          include: { unit: true },
        },
      },
    });
  }

  async renewRentalContract(id: number, data: any, companyId: number, createdBy: number) {
    const oldContract = await prisma.rentalContract.findFirst({
      where: { id, company_id: companyId },
    });

    if (!oldContract) throw new NotFoundError('Rental Contract');

    const newContractNo = await this.generateContractNumber('RENTAL', companyId);

    // Get units from old contract
    const oldContractUnits = await prisma.rentalContractunit.findMany({
      where: { contract_id: id },
      select: { unit_id: true },
    });

    const newContract = await prisma.rentalContract.create({
      data: {
        contract_no: newContractNo,
        contract_date: new Date(data.contract_date || new Date()),
        from_date: new Date(data.from_date),
        to_date: new Date(data.to_date),
        amount: parseFloat(data.amount),
        security_amount: parseFloat(data.security_amount),
        service_amount: parseFloat(data.service_amount),
        payment_terms: data.payment_terms || oldContract.payment_terms,
        grace_period: data.grace_period || oldContract.grace_period,
        tentative_move_in: new Date(data.tentative_move_in),
        vat_details: data.vat_details || oldContract.vat_details,
        payment_method: data.payment_method || oldContract.payment_method,
        vat_amount: data.vat_amount ? parseFloat(data.vat_amount) : oldContract.vat_amount,
        management_fee: data.management_fee ? parseFloat(data.management_fee) : oldContract.management_fee,
        previous_contract_id: id,
        tenant_id: oldContract.tenant_id,
        salesman_id: oldContract.salesman_id,
        broker_id: oldContract.broker_id,
        company_id: companyId,
        created_by: createdBy,
        units: {
          create: oldContractUnits.map((uc) => ({
            unit_id: uc.unit_id,
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

    return newContract;
  }

  // Sales Contracts
  async getSalesContracts(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.seller_id) where.seller_id = parseInt(filters.seller_id);
    if (filters.buyer_id) where.buyer_id = parseInt(filters.buyer_id);
    if (filters.status) where.status = filters.status;
    if (filters.contract_no) where.contract_no = { contains: filters.contract_no };

    const [contracts, total] = await Promise.all([
      prisma.salesContract.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          seller: true,
          buyer: true,
          salesman: {
            select: { id: true, name: true, email: true },
          },
          broker: true,
          units: {
            include: {
              unit: {
                include: {
                  building: true,
                  floor: true,
                },
              },
            },
          },
        },
      }),
      prisma.salesContract.count({ where }),
    ]);

    return { items: contracts, pagination: { page, limit, total } };
  }

  async getSalesContractById(id: number, companyId: number) {
    const contract = await prisma.salesContract.findFirst({
      where: { id, company_id: companyId },
      include: {
        seller: true,
        buyer: true,
        salesman: {
          select: { id: true, name: true, email: true },
        },
        broker: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        units: {
          include: {
            unit: {
              include: {
                building: true,
                floor: true,
                unit_type: true,
              },
            },
          },
        },
        parkings: {
          include: {
            parking: true,
            vehicle: true,
          },
        },
        receipts: {
          include: {
            payments: true,
          },
        },
        handover: {
          include: {
            documents: {
              include: { doc_type: true },
            },
          },
        },
      },
    });

    if (!contract) throw new NotFoundError('Sales Contract');
    return contract;
  }

  async createSalesContract(data: any, companyId: number, createdBy: number) {
    const contractNo = await this.generateContractNumber('SALES', companyId);

    // Verify seller and buyer exist
    const seller = await prisma.landlord.findFirst({
      where: { id: data.seller_id, company_id: companyId },
    });
    if (!seller) throw new NotFoundError('Seller');

    const buyer = await prisma.landlord.findFirst({
      where: { id: data.buyer_id, company_id: companyId },
    });
    if (!buyer) throw new NotFoundError('Buyer');

    // Verify units exist
    if (data.unit_ids && data.unit_ids.length > 0) {
      const units = await prisma.unit.findMany({
        where: {
          id: { in: data.unit_ids },
          company_id: companyId,
        },
      });
      if (units.length !== data.unit_ids.length) {
        throw new NotFoundError('One or more units not found');
      }
    }

    const contract = await prisma.salesContract.create({
      data: {
        contract_no: contractNo,
        contract_date: new Date(data.contract_date),
        amount: parseFloat(data.amount),
        service_amount: parseFloat(data.service_amount),
        payment_terms: data.payment_terms,
        status: data.status || null,
        // Commission
        agent_commission: data.agent_commission ? parseFloat(data.agent_commission) : null,
        broker_commission: data.broker_commission ? parseFloat(data.broker_commission) : null,
        commission_paid: data.commission_paid === true,
        seller_id: data.seller_id,
        buyer_id: data.buyer_id,
        salesman_id: data.salesman_id,
        broker_id: data.broker_id || null,
        company_id: companyId,
        created_by: createdBy,
        units: {
          create: (data.unit_ids || []).map((uid: number) => ({
            unit_id: uid,
          })),
        },
      },
      include: {
        seller: true,
        buyer: true,
        units: {
          include: { unit: true },
        },
      },
    });

    // Update unit ownership
    if (data.unit_ids && data.unit_ids.length > 0) {
      await prisma.unit.updateMany({
        where: { id: { in: data.unit_ids } },
        data: { owned_by: data.buyer_id, status: 'sold' },
      });
    }

    return contract;
  }

  async updateSalesContract(id: number, data: any, companyId: number) {
    const contract = await prisma.salesContract.findFirst({
      where: { id, company_id: companyId },
    });

    if (!contract) throw new NotFoundError('Sales Contract');

    const updateData: any = { ...data };
    if (data.contract_date) updateData.contract_date = new Date(data.contract_date);
    if (data.amount) updateData.amount = parseFloat(data.amount);
    if (data.service_amount) updateData.service_amount = parseFloat(data.service_amount);
    if (data.agent_commission) updateData.agent_commission = parseFloat(data.agent_commission);
    if (data.broker_commission) updateData.broker_commission = parseFloat(data.broker_commission);

    return prisma.salesContract.update({
      where: { id },
      data: updateData,
      include: {
        seller: true,
        buyer: true,
        units: {
          include: { unit: true },
        },
      },
    });
  }

  // Handover
  async createHandover(data: any, companyId: number) {
    const { contract_id, contract_type, no_of_keys_given, no_of_cards_given, additional_details, date, documents } = data;

    // Verify contract exists
    if (contract_type === 'rental') {
      const contract = await prisma.rentalContract.findFirst({
        where: { id: contract_id, company_id: companyId },
      });
      if (!contract) throw new NotFoundError('Rental Contract');
    } else {
      const contract = await prisma.salesContract.findFirst({
        where: { id: contract_id, company_id: companyId },
      });
      if (!contract) throw new NotFoundError('Sales Contract');
    }

    const handover = await prisma.handover.create({
      data: {
        contract_id,
        contract_type,
        no_of_keys_given: no_of_keys_given || null,
        no_of_cards_given: no_of_cards_given || null,
        additional_details: additional_details || null,
        date: new Date(date),
        documents: {
          create: (documents || []).map((doc: any) => ({
            doc_type_id: doc.doc_type_id,
            path: doc.path,
          })),
        },
      },
      include: {
        documents: {
          include: { doc_type: true },
        },
      },
    });

    return handover;
  }
}

