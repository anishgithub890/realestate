import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class PaymentService {
  async getPayments(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      receipt: {
        company_id: companyId,
      },
    };

    if (filters.search) {
      where.OR = [
        { payment_type: { contains: filters.search } },
        { instrument_no: { contains: filters.search } },
        { description: { contains: filters.search } },
        { receipt: { receipt_no: { contains: filters.search } } },
      ];
    }

    if (filters.receipt_id) {
      where.receipt_id = parseInt(filters.receipt_id);
    }

    if (filters.payment_type) {
      where.payment_type = filters.payment_type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.payment_under_id) {
      where.payment_under_id = parseInt(filters.payment_under_id);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          receipt: {
            include: {
              rental_contract: {
                include: {
                  tenant: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              sales_contract: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                  buyer: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          payment_under: {
            select: {
              id: true,
              name: true,
            },
          },
          cheque: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        sortBy,
        sortOrder,
      },
    };
  }

  async getPaymentById(id: number, companyId: number) {
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        receipt: {
          company_id: companyId,
        },
      },
      include: {
        receipt: {
          include: {
            rental_contract: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            sales_contract: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                buyer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payment_under: {
          select: {
            id: true,
            name: true,
          },
        },
        cheque: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    return payment;
  }

  async createPayment(data: any, companyId: number, _userId: number) {
    // Verify receipt belongs to company
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: data.receipt_id,
        company_id: companyId,
      },
    });

    if (!receipt) {
      throw new NotFoundError('Receipt');
    }

    // Validate payment type
    const validPaymentTypes = ['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'other'];
    if (!validPaymentTypes.includes(data.payment_type?.toLowerCase())) {
      throw new ValidationError('Invalid payment type');
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'returned', 'cancelled'];
    if (!validStatuses.includes(data.status?.toLowerCase())) {
      throw new ValidationError('Invalid payment status');
    }

    // Enforce company isolation (receipt_id is already validated to belong to company)
    const paymentData = data;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        receipt_id: paymentData.receipt_id,
        payment_type: paymentData.payment_type,
        amount_incl: paymentData.amount_incl,
        status: paymentData.status,
        instrument_no: paymentData.instrument_no || null,
        description: paymentData.description || null,
        returned_on: paymentData.returned_on ? new Date(paymentData.returned_on) : null,
        vat_amount: paymentData.vat_amount || null,
        payment_under_id: paymentData.payment_under_id || null,
      },
      include: {
        receipt: {
          include: {
            rental_contract: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            sales_contract: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                buyer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        payment_under: {
          select: {
            id: true,
            name: true,
          },
        },
        cheque: true,
      },
    });

    // If payment type is cheque, create cheque record
    if (paymentData.payment_type?.toLowerCase() === 'cheque' && paymentData.cheque) {
      await prisma.cheque.create({
        data: {
          payment_id: payment.id,
          date: new Date(paymentData.cheque.date),
          is_deposited: paymentData.cheque.is_deposited || false,
          is_received: paymentData.cheque.is_received || false,
          deposited_on: paymentData.cheque.deposited_on ? new Date(paymentData.cheque.deposited_on) : null,
          cleared_on: paymentData.cheque.cleared_on ? new Date(paymentData.cheque.cleared_on) : null,
          bank_name: paymentData.cheque.bank_name || null,
        },
      });

      // Reload payment with cheque
      return this.getPaymentById(payment.id, companyId);
    }

    return payment;
  }

  async updatePayment(id: number, data: any, companyId: number) {
    // Verify payment belongs to company
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        receipt: {
          company_id: companyId,
        },
      },
    });

    if (!existingPayment) {
      throw new NotFoundError('Payment');
    }

    // Validate payment type if provided
    if (data.payment_type) {
      const validPaymentTypes = ['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'other'];
      if (!validPaymentTypes.includes(data.payment_type.toLowerCase())) {
        throw new ValidationError('Invalid payment type');
      }
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = ['pending', 'completed', 'failed', 'returned', 'cancelled'];
      if (!validStatuses.includes(data.status.toLowerCase())) {
        throw new ValidationError('Invalid payment status');
      }
    }

    // Update payment
    const updateData: any = {};
    if (data.payment_type !== undefined) updateData.payment_type = data.payment_type;
    if (data.amount_incl !== undefined) updateData.amount_incl = data.amount_incl;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.instrument_no !== undefined) updateData.instrument_no = data.instrument_no;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.returned_on !== undefined) updateData.returned_on = data.returned_on ? new Date(data.returned_on) : null;
    if (data.vat_amount !== undefined) updateData.vat_amount = data.vat_amount;
    if (data.payment_under_id !== undefined) updateData.payment_under_id = data.payment_under_id;

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        receipt: {
          include: {
            rental_contract: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            sales_contract: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                buyer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        payment_under: {
          select: {
            id: true,
            name: true,
          },
        },
        cheque: true,
      },
    });

    // Update cheque if payment type is cheque and cheque data provided
    if (data.payment_type?.toLowerCase() === 'cheque' && data.cheque) {
      const existingCheque = await prisma.cheque.findUnique({
        where: { payment_id: id },
      });

      if (existingCheque) {
        await prisma.cheque.update({
          where: { payment_id: id },
          data: {
            date: data.cheque.date ? new Date(data.cheque.date) : existingCheque.date,
            is_deposited: data.cheque.is_deposited !== undefined ? data.cheque.is_deposited : existingCheque.is_deposited,
            is_received: data.cheque.is_received !== undefined ? data.cheque.is_received : existingCheque.is_received,
            deposited_on: data.cheque.deposited_on ? new Date(data.cheque.deposited_on) : null,
            cleared_on: data.cheque.cleared_on ? new Date(data.cheque.cleared_on) : null,
            bank_name: data.cheque.bank_name || null,
          },
        });
      } else {
        await prisma.cheque.create({
          data: {
            payment_id: id,
            date: new Date(data.cheque.date),
            is_deposited: data.cheque.is_deposited || false,
            is_received: data.cheque.is_received || false,
            deposited_on: data.cheque.deposited_on ? new Date(data.cheque.deposited_on) : null,
            cleared_on: data.cheque.cleared_on ? new Date(data.cheque.cleared_on) : null,
            bank_name: data.cheque.bank_name || null,
          },
        });
      }

      // Reload payment with cheque
      return this.getPaymentById(id, companyId);
    }

    return payment;
  }

  async deletePayment(id: number, companyId: number) {
    // Verify payment belongs to company
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        receipt: {
          company_id: companyId,
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    await prisma.payment.delete({
      where: { id },
    });

    return { message: 'Payment deleted successfully' };
  }

  async getPaymentUnderOptions(companyId: number) {
    const options = await prisma.paymentUnder.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return options;
  }
}

