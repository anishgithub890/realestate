'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, DollarSign, Edit, Trash2, CreditCard, Banknote } from 'lucide-react';
import { PaymentForm } from '@/components/forms/payment-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column, SortDirection } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';

interface Payment {
  id: number;
  receipt_id: number;
  payment_type: string;
  amount_incl: number;
  status: string;
  instrument_no: string | null;
  description: string | null;
  vat_amount: number | null;
  payment_under_id: number | null;
  created_at: string;
  receipt?: {
    id: number;
    receipt_no: string;
    date: string;
    rental_contract?: {
      tenant?: {
        name: string;
        email: string;
      };
    };
    sales_contract?: {
      seller?: {
        name: string;
        email: string;
      };
      buyer?: {
        name: string;
        email: string;
      };
    };
  };
  payment_under?: {
    id: number;
    name: string;
  };
  cheque?: {
    id: number;
    date: string;
    bank_name: string | null;
    is_deposited: boolean;
    is_received: boolean;
  };
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: number; description: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ data: Payment[]; pagination: any }>({
    queryKey: ['payments', searchTerm, currentPage, sortBy, sortOrder],
    queryFn: async (): Promise<{ data: Payment[]; pagination: any }> => {
      const response = await api.get('/payments', {
        search: searchTerm,
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      });
      return response as { data: Payment[]; pagination: any };
    },
  });

  const payments: Payment[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleCreate = () => {
    setSelectedPayment(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete({
      id: payment.id,
      description: `Payment #${payment.id} - ${payment.payment_type} - ${payment.amount_incl}`,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    try {
      await api.delete(`/payments/${paymentToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
      });
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete payment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      case 'returned':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'cheque':
      case 'bank_transfer':
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (payment) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <DollarSign className="h-4 w-4" />
          </div>
          <span className="font-medium">#{payment.id}</span>
        </div>
      ),
    },
    {
      key: 'receipt',
      header: 'Receipt',
      sortable: true,
      sortKey: 'receipt.receipt_no',
      render: (payment) => (
        <div>
          <div className="font-medium">#{payment.receipt?.receipt_no || payment.receipt_id}</div>
          {payment.receipt?.rental_contract?.tenant && (
            <div className="text-sm text-gray-500">{payment.receipt.rental_contract.tenant.name}</div>
          )}
          {payment.receipt?.sales_contract?.seller && (
            <div className="text-sm text-gray-500">{payment.receipt.sales_contract.seller.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'payment_type',
      header: 'Type',
      sortable: true,
      render: (payment) => (
        <div className="flex items-center gap-2">
          {getPaymentTypeIcon(payment.payment_type)}
          <span className="capitalize">{payment.payment_type.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      key: 'amount_incl',
      header: 'Amount',
      sortable: true,
      render: (payment) => (
        <div>
          <div className="font-semibold">AED {payment.amount_incl.toFixed(2)}</div>
          {payment.vat_amount && (
            <div className="text-sm text-gray-500">VAT: AED {payment.vat_amount.toFixed(2)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (payment) => (
        <Badge variant={getStatusBadgeVariant(payment.status)}>
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'payment_under',
      header: 'Payment Under',
      sortable: true,
      sortKey: 'payment_under.name',
      render: (payment) => payment.payment_under?.name || 'N/A',
    },
    {
      key: 'cheque',
      header: 'Cheque Info',
      sortable: false,
      render: (payment) => {
        if (payment.payment_type.toLowerCase() === 'cheque' && payment.cheque) {
          return (
            <div className="text-sm">
              {payment.cheque.bank_name && <div>{payment.cheque.bank_name}</div>}
              <div className="text-gray-500">
                {payment.cheque.is_received ? 'Received' : 'Not Received'} /{' '}
                {payment.cheque.is_deposited ? 'Deposited' : 'Not Deposited'}
              </div>
            </div>
          );
        }
        return 'N/A';
      },
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (payment) => new Date(payment.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (payment) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Payment',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(payment),
          },
          {
            label: 'Delete Payment',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(payment),
            variant: 'destructive',
          },
        ];
        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (payment: Payment): React.ReactNode => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            {getPaymentTypeIcon(payment.payment_type)}
          </div>
          <div>
            <h3 className="font-semibold">Payment #{payment.id}</h3>
            <p className="text-sm text-gray-600">
              Receipt: #{payment.receipt?.receipt_no || payment.receipt_id}
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(payment.status)}>
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Type:</span>
          <span className="font-medium capitalize">{payment.payment_type.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Amount:</span>
          <span className="font-semibold">AED {payment.amount_incl.toFixed(2)}</span>
        </div>
        {payment.vat_amount && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">VAT:</span>
            <span className="font-medium">AED {payment.vat_amount.toFixed(2)}</span>
          </div>
        )}
        {payment.payment_under && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Payment Under:</span>
            <span className="font-medium">{payment.payment_under.name}</span>
          </div>
        )}
        {payment.payment_type.toLowerCase() === 'cheque' && payment.cheque && (
          <div className="text-sm">
            <div className="text-gray-500">Cheque Details:</div>
            {payment.cheque.bank_name && <div>{payment.cheque.bank_name}</div>}
            <div className="text-gray-500">
              {payment.cheque.is_received ? 'Received' : 'Not Received'} /{' '}
              {payment.cheque.is_deposited ? 'Deposited' : 'Not Deposited'}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Date:</span>
          <span className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(payment)}
          className="flex-1"
          title="Edit Payment"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteClick(payment)}
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Delete Payment"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage payment records</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4">
          <DataView
            data={payments}
            columns={columns}
            renderGridItem={renderGridItem}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No payments found."
            pagination={
              pagination
                ? {
                    currentPage: pagination.page || 1,
                    totalPages: pagination.totalPages || 1,
                    onPageChange: (page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    },
                  }
                : undefined
            }
            onSort={(by, order) => {
              setSortBy(by);
              setSortOrder(order);
            }}
            defaultView="table"
            gridCols={3}
            showViewSwitcher={true}
            storageKey="payments-view-mode"
          />
        </div>
      </div>

      <PaymentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        payment={selectedPayment}
        mode={formMode}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment"
        itemName={paymentToDelete?.description}
        description={`Are you sure you want to delete this payment? This action cannot be undone and will permanently remove this payment record.`}
      />
    </div>
  );
}

