'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    counts: {
      created: number;
      skipped: number;
      failed: number;
    };
    details: {
      created: Array<{ id: string; fullPath: string; level: string }>;
      skipped: Array<{ fullPath: string; reason: string }>;
      failed: Array<{ fullPath: string; reason: string; row?: number }>;
    };
    meta: {
      totalRows: number;
      detailLimit: number;
      truncated: {
        created: boolean;
        skipped: boolean;
        failed: boolean;
      };
    };
  };
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('file', file);

      // Use axios directly for file uploads
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api';
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_URL}/locations/bulk-upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadResult(data);
      toast({
        title: 'Upload Complete',
        description: data.message || 'CSV file processed successfully',
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload CSV file',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      handleReset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Locations</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk create locations. The CSV should contain columns for:
            emirate, neighbourhood, cluster, building, building_lvl1, building_lvl2
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          {!uploadResult && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Select CSV/Excel File</Label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    id="csv-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <span className="text-muted-foreground">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: CSV, Excel (.csv, .xlsx, .xls)
                </p>
              </div>

              {/* CSV Format Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CSV Format Guide</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-muted-foreground">
                    Your CSV should have the following columns (case-insensitive):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li><strong>emirate</strong> - Top-level location (e.g., Dubai, Abu Dhabi)</li>
                    <li><strong>neighbourhood</strong> or <strong>neighborhood</strong> - Area within emirate</li>
                    <li><strong>cluster</strong> - Group of buildings</li>
                    <li><strong>building</strong> - Individual building</li>
                    <li><strong>building_lvl1</strong> or <strong>building lvl1</strong> - Building level 1</li>
                    <li><strong>building_lvl2</strong> or <strong>building lvl2</strong> - Building level 2</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Locations are created hierarchically. Parent locations must exist before child locations.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing CSV file...</span>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && uploadResult.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-2xl font-bold text-green-600">
                          {uploadResult.data.counts.created}
                        </p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Skipped</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {uploadResult.data.counts.skipped}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-600">
                          {uploadResult.data.counts.failed}
                        </p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              {(uploadResult.data.details.created.length > 0 ||
                uploadResult.data.details.skipped.length > 0 ||
                uploadResult.data.details.failed.length > 0) && (
                <div className="space-y-4">
                  {uploadResult.data.details.created.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Created Locations
                          {uploadResult.data.meta.truncated.created && (
                            <Badge variant="outline" className="text-xs">
                              Showing first {uploadResult.data.details.created.length} of{' '}
                              {uploadResult.data.counts.created}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {uploadResult.data.details.created.map((item, idx) => (
                            <div key={idx} className="text-sm flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.level}
                              </Badge>
                              <span className="text-muted-foreground">{item.fullPath}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {uploadResult.data.details.failed.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Failed Locations
                          {uploadResult.data.meta.truncated.failed && (
                            <Badge variant="outline" className="text-xs">
                              Showing first {uploadResult.data.details.failed.length} of{' '}
                              {uploadResult.data.counts.failed}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {uploadResult.data.details.failed.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="text-xs">
                                  Row {item.row || 'N/A'}
                                </Badge>
                                <span className="text-muted-foreground">{item.fullPath}</span>
                              </div>
                              <p className="text-xs text-red-600 ml-12">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {uploadResult.data.details.skipped.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          Skipped Locations
                          {uploadResult.data.meta.truncated.skipped && (
                            <Badge variant="outline" className="text-xs">
                              Showing first {uploadResult.data.details.skipped.length} of{' '}
                              {uploadResult.data.counts.skipped}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {uploadResult.data.details.skipped.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-muted-foreground">{item.fullPath}</span>
                              <p className="text-xs text-yellow-600 ml-2">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {uploadResult ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <Button variant="outline" onClick={handleReset}>
                Upload Another File
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Upload CSV
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

