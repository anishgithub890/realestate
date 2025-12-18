'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const paymentSchema = z.object({
  receipt_id: z.number().min(1, 'Receipt is required'),
  payment_type: z.enum(['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'other']),
  amount_incl: z.number().min(0.01, 'Amount must be greater than 0'),
  status: z.enum(['pending', 'completed', 'failed', 'returned', 'cancelled']),
  instrument_no: z.string().optional(),
  description: z.string().optional(),
  vat_amount: z.number().optional(),
  payment_under_id: z.number().optional(),
  cheque: z.object({
    date: z.string().optional(),
    bank_name: z.string().optional(),
    is_deposited: z.boolean().optional(),
    is_received: z.boolean().optional(),
    deposited_on: z.string().optional(),
    cleared_on: z.string().optional(),
  }).optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: any;
  mode: 'create' | 'edit';
}

export function PaymentForm({ open, onOpenChange, payment, mode }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [showChequeFields, setShowChequeFields] = useState(false);

  // Fetch payment under options
  const { data: paymentUnderOptions } = useQuery<any>({
    queryKey: ['payment-under-options'],
    queryFn: () => api.get('/payments/payment-under-options'),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_type: 'cash',
      status: 'pending',
      amount_incl: 0,
    },
  });

  const paymentType = watch('payment_type');

  useEffect(() => {
    setShowChequeFields(paymentType === 'cheque');
  }, [paymentType]);

  // Reset form when payment prop changes
  useEffect(() => {
    if (open && mode === 'edit' && payment) {
      reset({
        receipt_id: payment.receipt_id,
        payment_type: payment.payment_type,
        amount_incl: payment.amount_incl,
        status: payment.status,
        instrument_no: payment.instrument_no || '',
        description: payment.description || '',
        vat_amount: payment.vat_amount || undefined,
        payment_under_id: payment.payment_under_id || undefined,
        cheque: payment.cheque ? {
          date: payment.cheque.date ? new Date(payment.cheque.date).toISOString().split('T')[0] : '',
          bank_name: payment.cheque.bank_name || '',
          is_deposited: payment.cheque.is_deposited || false,
          is_received: payment.cheque.is_received || false,
          deposited_on: payment.cheque.deposited_on ? new Date(payment.cheque.deposited_on).toISOString().split('T')[0] : '',
          cleared_on: payment.cheque.cleared_on ? new Date(payment.cheque.cleared_on).toISOString().split('T')[0] : '',
        } : undefined,
      });
    } else if (open && mode === 'create') {
      reset({
        payment_type: 'cash',
        status: 'pending',
        amount_incl: 0,
      });
    }
  }, [open, mode, payment, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const payload: any = {
        receipt_id: data.receipt_id,
        payment_type: data.payment_type,
        amount_incl: data.amount_incl,
        status: data.status,
        instrument_no: data.instrument_no || null,
        description: data.description || null,
        vat_amount: data.vat_amount || null,
        payment_under_id: data.payment_under_id || null,
      };

      if (data.payment_type === 'cheque' && data.cheque) {
        payload.cheque = {
          date: data.cheque.date || new Date().toISOString(),
          bank_name: data.cheque.bank_name || null,
          is_deposited: data.cheque.is_deposited || false,
          is_received: data.cheque.is_received || false,
          deposited_on: data.cheque.deposited_on || null,
          cleared_on: data.cheque.cleared_on || null,
        };
      }

      if (mode === 'create') {
        await api.post('/payments', payload);
        toast({
          title: 'Success',
          description: 'Payment created successfully',
        });
      } else {
        await api.put(`/payments/${payment.id}`, payload);
        toast({
          title: 'Success',
          description: 'Payment updated successfully',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save payment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Payment' : 'Edit Payment'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new payment record'
              : 'Update payment information'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receipt_id">Receipt ID *</Label>
              <Input
                id="receipt_id"
                type="number"
                {...register('receipt_id', { valueAsNumber: true })}
              />
              {errors.receipt_id && (
                <p className="text-sm text-red-600">{errors.receipt_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_type">Payment Type *</Label>
              <select
                id="payment_type"
                {...register('payment_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="other">Other</option>
              </select>
              {errors.payment_type && (
                <p className="text-sm text-red-600">{errors.payment_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_incl">Amount (Incl. VAT) *</Label>
              <Input
                id="amount_incl"
                type="number"
                step="0.01"
                {...register('amount_incl', { valueAsNumber: true })}
              />
              {errors.amount_incl && (
                <p className="text-sm text-red-600">{errors.amount_incl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="returned">Returned</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instrument_no">Instrument No</Label>
              <Input id="instrument_no" {...register('instrument_no')} />
              {errors.instrument_no && (
                <p className="text-sm text-red-600">{errors.instrument_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_amount">VAT Amount</Label>
              <Input
                id="vat_amount"
                type="number"
                step="0.01"
                {...register('vat_amount', { valueAsNumber: true })}
              />
              {errors.vat_amount && (
                <p className="text-sm text-red-600">{errors.vat_amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_under_id">Payment Under</Label>
            <select
              id="payment_under_id"
              {...register('payment_under_id', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Payment Under</option>
              {paymentUnderOptions?.data?.map((option: any) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.payment_under_id && (
              <p className="text-sm text-red-600">{errors.payment_under_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {showChequeFields && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold">Cheque Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cheque.date">Cheque Date</Label>
                  <Input
                    id="cheque.date"
                    type="date"
                    {...register('cheque.date')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cheque.bank_name">Bank Name</Label>
                  <Input id="cheque.bank_name" {...register('cheque.bank_name')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cheque.is_received"
                    {...register('cheque.is_received')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="cheque.is_received">Is Received</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cheque.is_deposited"
                    {...register('cheque.is_deposited')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="cheque.is_deposited">Is Deposited</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cheque.deposited_on">Deposited On</Label>
                  <Input
                    id="cheque.deposited_on"
                    type="date"
                    {...register('cheque.deposited_on')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cheque.cleared_on">Cleared On</Label>
                  <Input
                    id="cheque.cleared_on"
                    type="date"
                    {...register('cheque.cleared_on')}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

