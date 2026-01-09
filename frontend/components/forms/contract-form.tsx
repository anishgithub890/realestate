'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const rentalContractSchema = z.object({
  contract_date: z.string().min(1, 'Contract date is required'),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  amount: z.string().min(1, 'Amount is required'),
  security_amount: z.string().min(1, 'Security amount is required'),
  service_amount: z.string().min(1, 'Service amount is required'),
  payment_terms: z.string().min(1, 'Payment terms is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  tentative_move_in: z.string().min(1, 'Tentative move-in date is required'),
  tenant_id: z.string().min(1, 'Tenant is required'),
  salesman_id: z.string().min(1, 'Salesman is required'),
  broker_id: z.string().optional(),
  unit_ids: z.array(z.string()).min(1, 'At least one unit is required'),
  grace_period: z.string().optional(),
  vat_details: z.string().optional(),
  vat_amount: z.string().optional(),
  management_fee: z.string().optional(),
  ejari_registered: z.boolean().default(false),
  ejari_number: z.string().optional(),
  ejari_registration_date: z.string().optional(),
  ejari_expiry_date: z.string().optional(),
  agent_commission: z.string().optional(),
  broker_commission: z.string().optional(),
});

const salesContractSchema = z.object({
  contract_date: z.string().min(1, 'Contract date is required'),
  amount: z.string().min(1, 'Amount is required'),
  service_amount: z.string().min(1, 'Service amount is required'),
  payment_terms: z.string().min(1, 'Payment terms is required'),
  seller_id: z.string().min(1, 'Seller is required'),
  buyer_id: z.string().min(1, 'Buyer is required'),
  salesman_id: z.string().min(1, 'Salesman is required'),
  broker_id: z.string().optional(),
  unit_ids: z.array(z.string()).min(1, 'At least one unit is required'),
  status: z.string().optional(),
  agent_commission: z.string().optional(),
  broker_commission: z.string().optional(),
});

type RentalContractFormData = z.infer<typeof rentalContractSchema>;
type SalesContractFormData = z.infer<typeof salesContractSchema>;

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: any;
  mode: 'create' | 'edit';
  contractType?: 'rental' | 'sales';
  onSuccess?: () => void;
}

export function ContractForm({
  open,
  onOpenChange,
  contract,
  mode,
  contractType: initialContractType,
  onSuccess,
}: ContractFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractType, setContractType] = useState<'rental' | 'sales'>(
    initialContractType || (contract?.type === 'sales' ? 'sales' : 'rental')
  );

  const rentalForm = useForm<RentalContractFormData>({
    resolver: zodResolver(rentalContractSchema),
  });

  const salesForm = useForm<SalesContractFormData>({
    resolver: zodResolver(salesContractSchema),
  });

  // Fetch dependencies
  const { data: tenants } = useQuery<any>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants', { limit: 1000 }),
    enabled: open,
  });

  const { data: landlords } = useQuery<any>({
    queryKey: ['landlords'],
    queryFn: () => api.get('/landlords', { limit: 1000 }),
    enabled: open,
  });

  const { data: units } = useQuery<any>({
    queryKey: ['units'],
    queryFn: () => api.get('/properties/units', { limit: 1000 }),
    enabled: open,
  });

  const { data: users } = useQuery<any>({
    queryKey: ['users'],
    queryFn: () => api.get('/users', { limit: 1000 }),
    enabled: open,
  });

  const { data: brokers } = useQuery<any>({
    queryKey: ['brokers'],
    queryFn: () => api.get('/brokers', { limit: 1000 }),
    enabled: open,
  });

  useEffect(() => {
    if (contract && open && mode === 'edit') {
      const isRental = contractType === 'rental';
      if (isRental) {
        rentalForm.reset({
          contract_date: contract.contract_date
            ? new Date(contract.contract_date).toISOString().split('T')[0]
            : '',
          from_date: contract.from_date
            ? new Date(contract.from_date).toISOString().split('T')[0]
            : '',
          to_date: contract.to_date
            ? new Date(contract.to_date).toISOString().split('T')[0]
            : '',
          amount: contract.amount?.toString() || '',
          security_amount: contract.security_amount?.toString() || '',
          service_amount: contract.service_amount?.toString() || '',
          payment_terms: contract.payment_terms || '',
          payment_method: contract.payment_method || '',
          tentative_move_in: contract.tentative_move_in
            ? new Date(contract.tentative_move_in).toISOString().split('T')[0]
            : '',
          tenant_id: contract.tenant_id?.toString() || '',
          salesman_id: contract.salesman_id?.toString() || '',
          broker_id: contract.broker_id?.toString() || 'none',
          unit_ids: contract.units?.map((u: any) => u.unit_id.toString()) || [],
          grace_period: contract.grace_period || '',
          vat_details: contract.vat_details || '',
          vat_amount: contract.vat_amount?.toString() || '',
          management_fee: contract.management_fee?.toString() || '',
          ejari_registered: contract.ejari_registered || false,
          ejari_number: contract.ejari_number || '',
          ejari_registration_date: contract.ejari_registration_date
            ? new Date(contract.ejari_registration_date).toISOString().split('T')[0]
            : '',
          ejari_expiry_date: contract.ejari_expiry_date
            ? new Date(contract.ejari_expiry_date).toISOString().split('T')[0]
            : '',
          agent_commission: contract.agent_commission?.toString() || '',
          broker_commission: contract.broker_commission?.toString() || '',
        });
      } else {
        salesForm.reset({
          contract_date: contract.contract_date
            ? new Date(contract.contract_date).toISOString().split('T')[0]
            : '',
          amount: contract.amount?.toString() || '',
          service_amount: contract.service_amount?.toString() || '',
          payment_terms: contract.payment_terms || '',
          seller_id: contract.seller_id?.toString() || '',
          buyer_id: contract.buyer_id?.toString() || '',
          salesman_id: contract.salesman_id?.toString() || '',
          broker_id: contract.broker_id?.toString() || 'none',
          unit_ids: contract.units?.map((u: any) => u.unit_id.toString()) || [],
          status: contract.status || '',
          agent_commission: contract.agent_commission?.toString() || '',
          broker_commission: contract.broker_commission?.toString() || '',
        });
      }
    } else if (open && mode === 'create') {
      rentalForm.reset();
      salesForm.reset();
    }
  }, [contract, open, mode, contractType, rentalForm, salesForm]);

  const rentalMutation = useMutation({
    mutationFn: (data: RentalContractFormData) => {
      const payload: any = {
        contract_date: new Date(data.contract_date),
        from_date: new Date(data.from_date),
        to_date: new Date(data.to_date),
        amount: parseFloat(data.amount),
        security_amount: parseFloat(data.security_amount),
        service_amount: parseFloat(data.service_amount),
        payment_terms: data.payment_terms,
        payment_method: data.payment_method,
        tentative_move_in: new Date(data.tentative_move_in),
        tenant_id: parseInt(data.tenant_id),
        salesman_id: parseInt(data.salesman_id),
        broker_id: data.broker_id && data.broker_id !== 'none' ? parseInt(data.broker_id) : null,
        unit_ids: data.unit_ids.map((id) => parseInt(id)),
        grace_period: data.grace_period || null,
        vat_details: data.vat_details || null,
        vat_amount: data.vat_amount ? parseFloat(data.vat_amount) : null,
        management_fee: data.management_fee ? parseFloat(data.management_fee) : null,
        ejari_registered: data.ejari_registered,
        ejari_number: data.ejari_number || null,
        ejari_registration_date: data.ejari_registration_date
          ? new Date(data.ejari_registration_date)
          : null,
        ejari_expiry_date: data.ejari_expiry_date ? new Date(data.ejari_expiry_date) : null,
        agent_commission: data.agent_commission ? parseFloat(data.agent_commission) : null,
        broker_commission: data.broker_commission ? parseFloat(data.broker_commission) : null,
      };

      if (mode === 'create') {
        return api.post('/contracts/rental-contracts', payload);
      } else {
        return api.put(`/contracts/rental-contracts/${contract.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create'
            ? 'Rental contract created successfully'
            : 'Rental contract updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['rental-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      rentalForm.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} rental contract`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const salesMutation = useMutation({
    mutationFn: (data: SalesContractFormData) => {
      const payload: any = {
        contract_date: new Date(data.contract_date),
        amount: parseFloat(data.amount),
        service_amount: parseFloat(data.service_amount),
        payment_terms: data.payment_terms,
        seller_id: parseInt(data.seller_id),
        buyer_id: parseInt(data.buyer_id),
        salesman_id: parseInt(data.salesman_id),
        broker_id: data.broker_id && data.broker_id !== 'none' ? parseInt(data.broker_id) : null,
        unit_ids: data.unit_ids.map((id) => parseInt(id)),
        status: data.status || null,
        agent_commission: data.agent_commission ? parseFloat(data.agent_commission) : null,
        broker_commission: data.broker_commission ? parseFloat(data.broker_commission) : null,
      };

      if (mode === 'create') {
        return api.post('/contracts/sales-contracts', payload);
      } else {
        return api.put(`/contracts/sales-contracts/${contract.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create'
            ? 'Sales contract created successfully'
            : 'Sales contract updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['sales-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      salesForm.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} sales contract`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onRentalSubmit = (data: RentalContractFormData) => {
    setIsSubmitting(true);
    rentalMutation.mutate(data);
  };

  const onSalesSubmit = (data: SalesContractFormData) => {
    setIsSubmitting(true);
    salesMutation.mutate(data);
  };

  const tenantsList = tenants?.data || [];
  const landlordsList = landlords?.data || [];
  const unitsList = units?.data || [];
  const usersList = users?.data || [];
  const brokersList = brokers?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Contract' : 'Edit Contract'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new rental or sales contract'
              : 'Update contract information'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={contractType} onValueChange={(v) => setContractType(v as 'rental' | 'sales')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rental">Rental Contract</TabsTrigger>
            <TabsTrigger value="sales">Sales Contract</TabsTrigger>
          </TabsList>

          <TabsContent value="rental" className="space-y-4">
            <form onSubmit={rentalForm.handleSubmit(onRentalSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract_date">Contract Date *</Label>
                  <Input
                    id="contract_date"
                    type="date"
                    {...rentalForm.register('contract_date')}
                    className={
                      rentalForm.formState.errors.contract_date ? 'border-red-500' : ''
                    }
                  />
                  {rentalForm.formState.errors.contract_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.contract_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tentative_move_in">Tentative Move-In *</Label>
                  <Input
                    id="tentative_move_in"
                    type="date"
                    {...rentalForm.register('tentative_move_in')}
                    className={
                      rentalForm.formState.errors.tentative_move_in ? 'border-red-500' : ''
                    }
                  />
                  {rentalForm.formState.errors.tentative_move_in && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.tentative_move_in.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_date">From Date *</Label>
                  <Input
                    id="from_date"
                    type="date"
                    {...rentalForm.register('from_date')}
                    className={rentalForm.formState.errors.from_date ? 'border-red-500' : ''}
                  />
                  {rentalForm.formState.errors.from_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.from_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="to_date">To Date *</Label>
                  <Input
                    id="to_date"
                    type="date"
                    {...rentalForm.register('to_date')}
                    className={rentalForm.formState.errors.to_date ? 'border-red-500' : ''}
                  />
                  {rentalForm.formState.errors.to_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.to_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Rent Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...rentalForm.register('amount')}
                    className={rentalForm.formState.errors.amount ? 'border-red-500' : ''}
                  />
                  {rentalForm.formState.errors.amount && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="security_amount">Security Amount *</Label>
                  <Input
                    id="security_amount"
                    type="number"
                    step="0.01"
                    {...rentalForm.register('security_amount')}
                    className={
                      rentalForm.formState.errors.security_amount ? 'border-red-500' : ''
                    }
                  />
                  {rentalForm.formState.errors.security_amount && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.security_amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="service_amount">Service Amount *</Label>
                  <Input
                    id="service_amount"
                    type="number"
                    step="0.01"
                    {...rentalForm.register('service_amount')}
                    className={
                      rentalForm.formState.errors.service_amount ? 'border-red-500' : ''
                    }
                  />
                  {rentalForm.formState.errors.service_amount && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.service_amount.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenant_id">Tenant *</Label>
                  <Select
                    value={rentalForm.watch('tenant_id') || ''}
                    onValueChange={(value) => rentalForm.setValue('tenant_id', value)}
                  >
                    <SelectTrigger
                      className={
                        rentalForm.formState.errors.tenant_id ? 'border-red-500' : ''
                      }
                    >
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenantsList.map((tenant: any) => (
                        <SelectItem key={tenant.id} value={tenant.id.toString()}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rentalForm.formState.errors.tenant_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.tenant_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="salesman_id">Salesman *</Label>
                  <Select
                    value={rentalForm.watch('salesman_id') || ''}
                    onValueChange={(value) => rentalForm.setValue('salesman_id', value)}
                  >
                    <SelectTrigger
                      className={
                        rentalForm.formState.errors.salesman_id ? 'border-red-500' : ''
                      }
                    >
                      <SelectValue placeholder="Select salesman" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersList.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rentalForm.formState.errors.salesman_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.salesman_id.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_terms">Payment Terms *</Label>
                  <Input
                    id="payment_terms"
                    {...rentalForm.register('payment_terms')}
                    placeholder="e.g., Monthly, Quarterly"
                    className={
                      rentalForm.formState.errors.payment_terms ? 'border-red-500' : ''
                    }
                  />
                  {rentalForm.formState.errors.payment_terms && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.payment_terms.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select
                    value={rentalForm.watch('payment_method') || ''}
                    onValueChange={(value) => rentalForm.setValue('payment_method', value)}
                  >
                    <SelectTrigger
                      className={
                        rentalForm.formState.errors.payment_method ? 'border-red-500' : ''
                      }
                    >
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  {rentalForm.formState.errors.payment_method && (
                    <p className="text-sm text-red-500 mt-1">
                      {rentalForm.formState.errors.payment_method.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="unit_ids">Properties *</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const current = rentalForm.watch('unit_ids') || [];
                    if (!current.includes(value)) {
                      rentalForm.setValue('unit_ids', [...current, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select properties" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsList
                      .filter(
                        (unit: any) =>
                          !rentalForm.watch('unit_ids')?.includes(unit.id.toString())
                      )
                      .map((unit: any) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.name} - {unit.building?.name || 'N/A'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {rentalForm.watch('unit_ids') && rentalForm.watch('unit_ids')!.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rentalForm
                      .watch('unit_ids')!
                      .map((unitId) => {
                        const unit = unitsList.find((u: any) => u.id.toString() === unitId);
                        return unit ? (
                          <span
                            key={unitId}
                            className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm"
                          >
                            {unit.name}
                            <button
                              type="button"
                              onClick={() => {
                                const current = rentalForm.watch('unit_ids') || [];
                                rentalForm.setValue(
                                  'unit_ids',
                                  current.filter((id) => id !== unitId)
                                );
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                  </div>
                )}
                {rentalForm.formState.errors.unit_ids && (
                  <p className="text-sm text-red-500 mt-1">
                    {rentalForm.formState.errors.unit_ids.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="broker_id">Broker</Label>
                <Select
                  value={rentalForm.watch('broker_id') || 'none'}
                  onValueChange={(value) => rentalForm.setValue('broker_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select broker (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {brokersList.map((broker: any) => (
                      <SelectItem key={broker.id} value={broker.id.toString()}>
                        {broker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ejari_registered"
                  checked={rentalForm.watch('ejari_registered')}
                  onChange={(e) => rentalForm.setValue('ejari_registered', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="ejari_registered">Ejari Registered</Label>
              </div>

              {rentalForm.watch('ejari_registered') && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ejari_number">Ejari Number</Label>
                    <Input id="ejari_number" {...rentalForm.register('ejari_number')} />
                  </div>
                  <div>
                    <Label htmlFor="ejari_registration_date">Registration Date</Label>
                    <Input
                      id="ejari_registration_date"
                      type="date"
                      {...rentalForm.register('ejari_registration_date')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ejari_expiry_date">Expiry Date</Label>
                    <Input
                      id="ejari_expiry_date"
                      type="date"
                      {...rentalForm.register('ejari_expiry_date')}
                    />
                  </div>
                </div>
              )}

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
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === 'create' ? 'Create Rental Contract' : 'Update Rental Contract'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="contract_date">Contract Date *</Label>
                <Input
                  id="contract_date"
                  type="date"
                  {...salesForm.register('contract_date')}
                  className={salesForm.formState.errors.contract_date ? 'border-red-500' : ''}
                />
                {salesForm.formState.errors.contract_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {salesForm.formState.errors.contract_date.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Sale Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...salesForm.register('amount')}
                    className={salesForm.formState.errors.amount ? 'border-red-500' : ''}
                  />
                  {salesForm.formState.errors.amount && (
                    <p className="text-sm text-red-500 mt-1">
                      {salesForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="service_amount">Service Amount *</Label>
                  <Input
                    id="service_amount"
                    type="number"
                    step="0.01"
                    {...salesForm.register('service_amount')}
                    className={salesForm.formState.errors.service_amount ? 'border-red-500' : ''}
                  />
                  {salesForm.formState.errors.service_amount && (
                    <p className="text-sm text-red-500 mt-1">
                      {salesForm.formState.errors.service_amount.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seller_id">Seller *</Label>
                  <Select
                    value={salesForm.watch('seller_id') || ''}
                    onValueChange={(value) => salesForm.setValue('seller_id', value)}
                  >
                    <SelectTrigger
                      className={salesForm.formState.errors.seller_id ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select seller" />
                    </SelectTrigger>
                    <SelectContent>
                      {landlordsList.map((landlord: any) => (
                        <SelectItem key={landlord.id} value={landlord.id.toString()}>
                          {landlord.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {salesForm.formState.errors.seller_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {salesForm.formState.errors.seller_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="buyer_id">Buyer *</Label>
                  <Select
                    value={salesForm.watch('buyer_id') || ''}
                    onValueChange={(value) => salesForm.setValue('buyer_id', value)}
                  >
                    <SelectTrigger
                      className={salesForm.formState.errors.buyer_id ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {landlordsList.map((landlord: any) => (
                        <SelectItem key={landlord.id} value={landlord.id.toString()}>
                          {landlord.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {salesForm.formState.errors.buyer_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {salesForm.formState.errors.buyer_id.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salesman_id">Salesman *</Label>
                  <Select
                    value={salesForm.watch('salesman_id') || ''}
                    onValueChange={(value) => salesForm.setValue('salesman_id', value)}
                  >
                    <SelectTrigger
                      className={salesForm.formState.errors.salesman_id ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select salesman" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersList.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {salesForm.formState.errors.salesman_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {salesForm.formState.errors.salesman_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="payment_terms">Payment Terms *</Label>
                  <Input
                    id="payment_terms"
                    {...salesForm.register('payment_terms')}
                    placeholder="e.g., Full Payment, Installments"
                    className={salesForm.formState.errors.payment_terms ? 'border-red-500' : ''}
                  />
                  {salesForm.formState.errors.payment_terms && (
                    <p className="text-sm text-red-500 mt-1">
                      {salesForm.formState.errors.payment_terms.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="unit_ids">Properties *</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const current = salesForm.watch('unit_ids') || [];
                    if (!current.includes(value)) {
                      salesForm.setValue('unit_ids', [...current, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select properties" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsList
                      .filter(
                        (unit: any) => !salesForm.watch('unit_ids')?.includes(unit.id.toString())
                      )
                      .map((unit: any) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.name} - {unit.building?.name || 'N/A'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {salesForm.watch('unit_ids') && salesForm.watch('unit_ids')!.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {salesForm
                      .watch('unit_ids')!
                      .map((unitId) => {
                        const unit = unitsList.find((u: any) => u.id.toString() === unitId);
                        return unit ? (
                          <span
                            key={unitId}
                            className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm"
                          >
                            {unit.name}
                            <button
                              type="button"
                              onClick={() => {
                                const current = salesForm.watch('unit_ids') || [];
                                salesForm.setValue(
                                  'unit_ids',
                                  current.filter((id) => id !== unitId)
                                );
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                  </div>
                )}
                {salesForm.formState.errors.unit_ids && (
                  <p className="text-sm text-red-500 mt-1">
                    {salesForm.formState.errors.unit_ids.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="broker_id">Broker</Label>
                <Select
                  value={salesForm.watch('broker_id') || 'none'}
                  onValueChange={(value) => salesForm.setValue('broker_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select broker (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {brokersList.map((broker: any) => (
                      <SelectItem key={broker.id} value={broker.id.toString()}>
                        {broker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === 'create' ? 'Create Sales Contract' : 'Update Sales Contract'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

