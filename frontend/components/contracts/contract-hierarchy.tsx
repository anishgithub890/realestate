'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ContractHierarchyProps {
  contract: any;
}

export function ContractHierarchy({ contract }: ContractHierarchyProps) {
  // Build the full hierarchy chain
  const buildHierarchy = (contract: any): any[] => {
    if (!contract) return [];

    const chain: any[] = [];
    let current: any = contract;

    // Go backwards to find the original contract
    while (current?.previous_contract) {
      current = current.previous_contract;
    }

    // Now traverse forward to build the chain
    const visited = new Set<number>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      chain.push(current);
      
      // Find the next contract in the chain
      if (current.renewed_contracts && current.renewed_contracts.length > 0) {
        // Sort by creation date to get the first renewal
        const sortedRenewals = [...current.renewed_contracts].sort(
          (a, b) => new Date(a.created_at || a.from_date).getTime() - new Date(b.created_at || b.from_date).getTime()
        );
        current = sortedRenewals[0];
      } else {
        break;
      }
    }

    return chain;
  };

  const hierarchy = buildHierarchy(contract);

  if (!hierarchy || hierarchy.length <= 1) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            This is the original contract. No renewals yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Contract Renewal History
        </CardTitle>
        <CardDescription>
          Complete rental contract history for this tenant showing all renewals in chronological order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hierarchy.map((contractItem, index) => {
            const isCurrent = contractItem.id === contract.id;
            const isExpired = new Date(contractItem.to_date) < new Date();
            const isActive = !isExpired && new Date(contractItem.from_date) <= new Date();

            return (
              <div key={contractItem.id} className="relative">
                <div
                  className={`p-4 rounded-lg border-2 ${
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : isExpired
                      ? 'border-gray-200 bg-gray-50'
                      : isActive
                      ? 'border-green-200 bg-green-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-lg">{contractItem.contract_no}</span>
                        {isCurrent && (
                          <Badge variant="default" className="ml-2">
                            Current
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="secondary" className="ml-2">
                            Expired
                          </Badge>
                        )}
                        {isActive && !isCurrent && (
                          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">From:</span>
                          <span className="font-medium">
                            {format(new Date(contractItem.from_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">To:</span>
                          <span className="font-medium">
                            {format(new Date(contractItem.to_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Amount: </span>
                          <span className="font-semibold">
                            AED {contractItem.amount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {index < hierarchy.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowDown className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Total Contracts:</strong> {hierarchy.length} |{' '}
            <strong>Renewals:</strong> {hierarchy.length - 1}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

