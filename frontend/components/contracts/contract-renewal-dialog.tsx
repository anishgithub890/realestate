'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { format } from 'date-fns';

const renewalSchema = z.object({
  contract_date: z.string().min(1, 'Contract date is required'),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  amount: z.string().min(1, 'Amount is required'),
  security_amount: z.string().min(1, 'Security amount is required'),
  service_amount: z.string().min(1, 'Service amount is required'),
  payment_terms: z.string().optional(),
  grace_period: z.string().optional(),
  tentative_move_in: z.string().min(1, 'Tentative move-in date is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  vat_amount: z.string().optional(),
  management_fee: z.string().optional(),
});

type RenewalFormData = z.infer<typeof renewalSchema>;

interface ContractRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
  onSuccess?: () => void;
}

export function ContractRenewalDialog({
  open,
  onOpenChange,
  contract,
  onSuccess,
}: ContractRenewalDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
  });

  useEffect(() => {
    if (contract && open) {
      // Pre-fill form with current contract data
      const today = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      setValue('contract_date', format(today, 'yyyy-MM-dd'));
      setValue('from_date', format(contract.to_date || today, 'yyyy-MM-dd'));
      setValue('to_date', format(nextYear, 'yyyy-MM-dd'));
      setValue('amount', contract.amount?.toString() || '');
      setValue('security_amount', contract.security_amount?.toString() || '');
      setValue('service_amount', contract.service_amount?.toString() || '');
      setValue('payment_terms', contract.payment_terms || '');
      setValue('grace_period', contract.grace_period || '');
      setValue('tentative_move_in', format(contract.to_date || today, 'yyyy-MM-dd'));
      setValue('payment_method', contract.payment_method || '');
      setValue('vat_amount', contract.vat_amount?.toString() || '');
      setValue('management_fee', contract.management_fee?.toString() || '');
    }
  }, [contract, open, setValue]);

  const onSubmit = async (data: RenewalFormData) => {
    setIsSubmitting(true);
    try {
      await api.post(`/contracts/rental-contracts/${contract.id}/renew`, {
        contract_date: data.contract_date,
        from_date: data.from_date,
        to_date: data.to_date,
        amount: parseFloat(data.amount),
        security_amount: parseFloat(data.security_amount),
        service_amount: parseFloat(data.service_amount),
        payment_terms: data.payment_terms,
        grace_period: data.grace_period,
        tentative_move_in: data.tentative_move_in,
        payment_method: data.payment_method,
        vat_amount: data.vat_amount ? parseFloat(data.vat_amount) : null,
        management_fee: data.management_fee ? parseFloat(data.management_fee) : null,
      });

      toast({
        title: 'Success',
        description: 'Contract renewed successfully',
      });

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to renew contract',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renew Rental Contract</DialogTitle>
          <DialogDescription>
            Create a new contract based on contract {contract?.contract_no}. The new contract will
            be linked to this contract in the renewal hierarchy.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract_date">Contract Date *</Label>
              <Input
                id="contract_date"
                type="date"
                {...register('contract_date')}
                className={errors.contract_date ? 'border-red-500' : ''}
              />
              {errors.contract_date && (
                <p className="text-sm text-red-500 mt-1">{errors.contract_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="from_date">From Date *</Label>
              <Input
                id="from_date"
                type="date"
                {...register('from_date')}
                className={errors.from_date ? 'border-red-500' : ''}
              />
              {errors.from_date && (
                <p className="text-sm text-red-500 mt-1">{errors.from_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="to_date">To Date *</Label>
              <Input
                id="to_date"
                type="date"
                {...register('to_date')}
                className={errors.to_date ? 'border-red-500' : ''}
              />
              {errors.to_date && (
                <p className="text-sm text-red-500 mt-1">{errors.to_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tentative_move_in">Tentative Move-in Date *</Label>
              <Input
                id="tentative_move_in"
                type="date"
                {...register('tentative_move_in')}
                className={errors.tentative_move_in ? 'border-red-500' : ''}
              />
              {errors.tentative_move_in && (
                <p className="text-sm text-red-500 mt-1">{errors.tentative_move_in.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Amount (AED) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount')}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="security_amount">Security Amount (AED) *</Label>
              <Input
                id="security_amount"
                type="number"
                step="0.01"
                {...register('security_amount')}
                className={errors.security_amount ? 'border-red-500' : ''}
              />
              {errors.security_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.security_amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="service_amount">Service Amount (AED) *</Label>
              <Input
                id="service_amount"
                type="number"
                step="0.01"
                {...register('service_amount')}
                className={errors.service_amount ? 'border-red-500' : ''}
              />
              {errors.service_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.service_amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Input
                id="payment_method"
                {...register('payment_method')}
                className={errors.payment_method ? 'border-red-500' : ''}
              />
              {errors.payment_method && (
                <p className="text-sm text-red-500 mt-1">{errors.payment_method.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input id="payment_terms" {...register('payment_terms')} />
            </div>

            <div>
              <Label htmlFor="grace_period">Grace Period</Label>
              <Input id="grace_period" {...register('grace_period')} />
            </div>

            <div>
              <Label htmlFor="vat_amount">VAT Amount (AED)</Label>
              <Input
                id="vat_amount"
                type="number"
                step="0.01"
                {...register('vat_amount')}
              />
            </div>

            <div>
              <Label htmlFor="management_fee">Management Fee (AED)</Label>
              <Input
                id="management_fee"
                type="number"
                step="0.01"
                {...register('management_fee')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Renewing...' : 'Renew Contract'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

