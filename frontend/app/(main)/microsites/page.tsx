'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Globe, Eye, Edit, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MicrositesPage() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<any>({
    queryKey: ['microsites'],
    queryFn: () => api.get('/microsites'),
  });

  const microsites = data?.data || [];

  const handleViewPublic = (slug: string) => {
    const url = `${window.location.origin}/microsite/${slug}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Microsites</h1>
          <p className="text-gray-600 mt-2">Create and manage property microsites</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Microsite
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading microsites...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {microsites.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No microsites found. Create your first microsite to showcase properties.
            </div>
          ) : (
            microsites.map((microsite: any) => (
              <Card key={microsite.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {microsite.unit?.name || 'Untitled Microsite'}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        /{microsite.slug}
                      </CardDescription>
                    </div>
                    <Badge variant={microsite.is_published ? 'default' : 'secondary'}>
                      {microsite.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {microsite.seo_title && (
                      <div>
                        <div className="text-sm font-medium">SEO Title</div>
                        <div className="text-sm text-muted-foreground">{microsite.seo_title}</div>
                      </div>
                    )}

                    {microsite.published_at && (
                      <div className="text-xs text-muted-foreground">
                        Published: {new Date(microsite.published_at).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewPublic(microsite.slug)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

