'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key, Loader2, CheckCircle2, XCircle, QrCode } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecuritySettingsFormProps {
  twoFactorStatus?: any;
  isLoading?: boolean;
}

export function SecuritySettingsForm({ twoFactorStatus, isLoading }: SecuritySettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const is2FAEnabled = twoFactorStatus?.enabled || false;

  const enable2FAMutation = useMutation({
    mutationFn: () => api.post('/2fa/enable'),
    onSuccess: (response: any) => {
      const data = response.data;
      setQrCodeUrl(data.qr_code_url || null);
      setBackupCodes(data.backup_codes || []);
      setShowBackupCodes(true);
      toast({
        title: '2FA Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to enable 2FA',
        variant: 'destructive',
      });
    },
  });

  const verifyAndEnableMutation = useMutation({
    mutationFn: (token: string) => api.post('/2fa/verify-enable', { token }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Two-factor authentication enabled successfully',
      });
      setVerificationCode('');
      setQrCodeUrl(null);
      setShowBackupCodes(false);
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Invalid verification code',
        variant: 'destructive',
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: () => api.post('/2fa/disable'),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Two-factor authentication disabled successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    },
  });

  const regenerateBackupCodesMutation = useMutation({
    mutationFn: () => api.post('/2fa/regenerate-backup-codes'),
    onSuccess: (response: any) => {
      setBackupCodes(response.data?.backup_codes || []);
      setShowBackupCodes(true);
      toast({
        title: 'Success',
        description: 'Backup codes regenerated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to regenerate backup codes',
        variant: 'destructive',
      });
    },
  });

  const handleEnable2FA = () => {
    enable2FAMutation.mutate();
  };

  const handleVerifyAndEnable = () => {
    if (!verificationCode) {
      toast({
        title: 'Error',
        description: 'Please enter a verification code',
        variant: 'destructive',
      });
      return;
    }
    verifyAndEnableMutation.mutate(verificationCode);
  };

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      disable2FAMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading security settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication Status
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {is2FAEnabled ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-600">2FA Enabled</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-600">2FA Disabled</span>
                </>
              )}
            </div>
            {!is2FAEnabled ? (
              <Button
                onClick={handleEnable2FA}
                disabled={enable2FAMutation.isPending}
              >
                {enable2FAMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Enable 2FA
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={disable2FAMutation.isPending}
              >
                {disable2FAMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Disable 2FA
              </Button>
            )}
          </div>

          {qrCodeUrl && (
            <div className="space-y-4 pt-4 border-t">
              <Alert>
                <QrCode className="w-4 h-4" />
                <AlertDescription>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <img
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  className="border rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="verification_code">Enter Verification Code</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="verification_code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="font-mono text-center text-lg"
                  />
                  <Button
                    onClick={handleVerifyAndEnable}
                    disabled={verifyAndEnableMutation.isPending || !verificationCode}
                  >
                    {verifyAndEnableMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Verify & Enable
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showBackupCodes && backupCodes.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <Alert>
                <Key className="w-4 h-4" />
                <AlertDescription>
                  <strong>Save these backup codes!</strong> You can use them to access your account if you lose your authenticator device. Each code can only be used once.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm text-center p-2 bg-white rounded border">
                    {code}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  toast({
                    title: 'Copied',
                    description: 'Backup codes copied to clipboard',
                  });
                }}
              >
                Copy All Codes
              </Button>
            </div>
          )}

          {is2FAEnabled && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => regenerateBackupCodesMutation.mutate()}
                disabled={regenerateBackupCodesMutation.isPending}
              >
                {regenerateBackupCodesMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Regenerate Backup Codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Enable two-factor authentication for enhanced security</p>
            <p>• Use a strong, unique password</p>
            <p>• Never share your authentication codes</p>
            <p>• Keep your backup codes in a safe place</p>
            <p>• Regularly review your account activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

