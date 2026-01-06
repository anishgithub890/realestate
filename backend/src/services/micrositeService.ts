import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class MicrositeService {
  /**
   * Generate unique slug for microsite
   */
  private async generateSlug(unitId: number, companyId: number): Promise<string> {
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        company_id: companyId,
      },
      include: {
        building: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundError('Unit');
    }

    const baseSlug = `${unit.building.area.name.toLowerCase().replace(/\s+/g, '-')}-${unit.name.toLowerCase().replace(/\s+/g, '-')}`;
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists
    while (await prisma.microsite.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Get microsites
   */
  async getMicrosites(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.is_published !== undefined) {
      where.is_published = filters.is_published === 'true' || filters.is_published === true;
    }

    if (filters.unit_id) {
      where.unit_id = parseInt(filters.unit_id);
    }

    if (filters.search) {
      where.OR = [
        { slug: { contains: filters.search } },
        { seo_title: { contains: filters.search } },
      ];
    }

    const [microsites, total] = await Promise.all([
      prisma.microsite.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          unit: {
            include: {
              building: {
                include: {
                  area: true,
                },
              },
              images: {
                take: 1,
                orderBy: {
                  is_primary: 'desc',
                },
              },
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.microsite.count({ where }),
    ]);

    return {
      items: microsites,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get microsite by ID
   */
  async getMicrositeById(id: number, companyId: number) {
    const microsite = await prisma.microsite.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        unit: {
          include: {
            building: {
              include: {
                area: {
                  include: {
                    state: {
                      include: {
                        country: true,
                      },
                    },
                  },
                },
              },
            },
            images: {
              orderBy: {
                is_primary: 'desc',
              },
            },
            unit_type: true,
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
        },
        template: true,
      },
    });

    if (!microsite) {
      throw new NotFoundError('Microsite');
    }

    return microsite;
  }

  /**
   * Get microsite by slug (public)
   */
  async getMicrositeBySlug(slug: string) {
    const microsite = await prisma.microsite.findUnique({
      where: {
        slug,
        is_published: true,
      },
      include: {
        unit: {
          include: {
            building: {
              include: {
                area: {
                  include: {
                    state: {
                      include: {
                        country: true,
                      },
                    },
                  },
                },
              },
            },
            images: {
              orderBy: {
                is_primary: 'desc',
              },
            },
            unit_type: true,
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
        },
        template: true,
      },
    });

    if (!microsite) {
      throw new NotFoundError('Microsite');
    }

    return microsite;
  }

  /**
   * Create microsite
   */
  async createMicrosite(data: any, companyId: number) {
    // Validate unit
    const unit = await prisma.unit.findFirst({
      where: {
        id: data.unit_id,
        company_id: companyId,
      },
    });

    if (!unit) {
      throw new NotFoundError('Unit');
    }

    // Validate template if provided
    if (data.template_id) {
      const template = await prisma.micrositeTemplate.findFirst({
        where: {
          id: data.template_id,
          company_id: companyId,
        },
      });

      if (!template) {
        throw new NotFoundError('Microsite Template');
      }
    }

    // Always auto-generate unique slug (users cannot provide slugs manually)
    const slug = await this.generateSlug(data.unit_id, companyId);

    const microsite = await prisma.microsite.create({
      data: {
        unit_id: data.unit_id,
        company_id: companyId,
        slug: slug,
        template_id: data.template_id || null,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        seo_keywords: data.seo_keywords || null,
        custom_css: data.custom_css || null,
        custom_js: data.custom_js || null,
        is_published: data.is_published || false,
        published_at: data.is_published ? new Date() : null,
      },
      include: {
        unit: {
          include: {
            building: {
              include: {
                area: true,
              },
            },
          },
        },
        template: true,
      },
    });

    return microsite;
  }

  /**
   * Update microsite
   */
  async updateMicrosite(id: number, data: any, companyId: number) {
    const microsite = await prisma.microsite.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!microsite) {
      throw new NotFoundError('Microsite');
    }

    // Validate template if provided
    if (data.template_id !== undefined) {
      if (data.template_id) {
        const template = await prisma.micrositeTemplate.findFirst({
          where: {
            id: data.template_id,
            company_id: companyId,
          },
        });

        if (!template) {
          throw new NotFoundError('Microsite Template');
        }
      }
    }

    // Slug cannot be changed after creation (it's auto-generated and unique)
    // Remove slug from update data if provided
    const updateData: any = {};
    if (data.template_id !== undefined) updateData.template_id = data.template_id;
    if (data.seo_title !== undefined) updateData.seo_title = data.seo_title;
    if (data.seo_description !== undefined) updateData.seo_description = data.seo_description;
    if (data.seo_keywords !== undefined) updateData.seo_keywords = data.seo_keywords;
    if (data.custom_css !== undefined) updateData.custom_css = data.custom_css;
    if (data.custom_js !== undefined) updateData.custom_js = data.custom_js;
    if (data.is_published !== undefined) {
      updateData.is_published = data.is_published;
      if (data.is_published && !microsite.published_at) {
        updateData.published_at = new Date();
      }
    }

    const updatedMicrosite = await prisma.microsite.update({
      where: { id },
      data: updateData,
      include: {
        unit: {
          include: {
            building: {
              include: {
                area: true,
              },
            },
          },
        },
        template: true,
      },
    });

    return updatedMicrosite;
  }

  /**
   * Delete microsite
   */
  async deleteMicrosite(id: number, companyId: number) {
    const microsite = await prisma.microsite.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!microsite) {
      throw new NotFoundError('Microsite');
    }

    await prisma.microsite.delete({
      where: { id },
    });

    return { message: 'Microsite deleted successfully' };
  }

  /**
   * Get microsite templates
   */
  async getMicrositeTemplates(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.micrositeTemplate.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
      }),
      prisma.micrositeTemplate.count({ where }),
    ]);

    return {
      items: templates,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get microsite template by ID
   */
  async getMicrositeTemplateById(id: number, companyId: number) {
    const template = await prisma.micrositeTemplate.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!template) {
      throw new NotFoundError('Microsite Template');
    }

    return template;
  }

  /**
   * Create microsite template
   */
  async createMicrositeTemplate(data: any, companyId: number) {
    // If setting as default, unset other defaults
    if (data.is_default) {
      await prisma.micrositeTemplate.updateMany({
        where: {
          company_id: companyId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const template = await prisma.micrositeTemplate.create({
      data: {
        company_id: companyId,
        name: data.name,
        description: data.description || null,
        template_html: data.template_html,
        template_css: data.template_css || null,
        template_js: data.template_js || null,
        is_default: data.is_default || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });

    return template;
  }

  /**
   * Update microsite template
   */
  async updateMicrositeTemplate(id: number, data: any, companyId: number) {
    const template = await prisma.micrositeTemplate.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!template) {
      throw new NotFoundError('Microsite Template');
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.template_html !== undefined) updateData.template_html = data.template_html;
    if (data.template_css !== undefined) updateData.template_css = data.template_css;
    if (data.template_js !== undefined) updateData.template_js = data.template_js;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.is_default !== undefined) updateData.is_default = data.is_default;

    // If setting as default, unset other defaults
    if (data.is_default === true) {
      await prisma.micrositeTemplate.updateMany({
        where: {
          company_id: companyId,
          is_default: true,
          id: { not: id },
        },
        data: {
          is_default: false,
        },
      });
    }

    const updatedTemplate = await prisma.micrositeTemplate.update({
      where: { id },
      data: updateData,
    });

    return updatedTemplate;
  }

  /**
   * Delete microsite template
   */
  async deleteMicrositeTemplate(id: number, companyId: number) {
    const template = await prisma.micrositeTemplate.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!template) {
      throw new NotFoundError('Microsite Template');
    }

    await prisma.micrositeTemplate.delete({
      where: { id },
    });

    return { message: 'Microsite template deleted successfully' };
  }

  /**
   * Render microsite HTML (for public access)
   */
  async renderMicrosite(slug: string): Promise<string> {
    const microsite = await this.getMicrositeBySlug(slug);

    // Get template HTML
    let html = '';
    if (microsite.template) {
      html = microsite.template.template_html;
    } else {
      // Default template
      html = this.getDefaultTemplate();
    }

    // Replace template variables with unit data
    html = this.replaceTemplateVariables(html, microsite);

    // Add custom CSS
    if (microsite.custom_css) {
      html = html.replace('</head>', `<style>${microsite.custom_css}</style></head>`);
    }

    // Add custom JS
    if (microsite.custom_js) {
      html = html.replace('</body>', `<script>${microsite.custom_js}</script></body>`);
    }

    // Add SEO meta tags
    if (microsite.seo_title || microsite.seo_description || microsite.seo_keywords) {
      let metaTags = '';
      if (microsite.seo_title) {
        metaTags += `<meta name="title" content="${microsite.seo_title}">`;
      }
      if (microsite.seo_description) {
        metaTags += `<meta name="description" content="${microsite.seo_description}">`;
      }
      if (microsite.seo_keywords) {
        metaTags += `<meta name="keywords" content="${microsite.seo_keywords}">`;
      }
      html = html.replace('</head>', `${metaTags}</head>`);
    }

    return html;
  }

  /**
   * Replace template variables
   */
  private replaceTemplateVariables(html: string, microsite: any): string {
    const unit = microsite.unit;
    const building = unit.building;
    const area = building.area;

    return html
      .replace(/\{\{unit_name\}\}/g, unit.name || '')
      .replace(/\{\{unit_type\}\}/g, unit.unit_type?.name || '')
      .replace(/\{\{property_type\}\}/g, unit.property_type || '')
      .replace(/\{\{bedrooms\}\}/g, unit.no_of_bedrooms?.toString() || '0')
      .replace(/\{\{bathrooms\}\}/g, unit.no_of_bathrooms?.toString() || '0')
      .replace(/\{\{area_sqft\}\}/g, unit.gross_area_in_sqft?.toString() || '0')
      .replace(/\{\{basic_rent\}\}/g, unit.basic_rent?.toString() || '0')
      .replace(/\{\{basic_sale_value\}\}/g, unit.basic_sale_value?.toString() || '0')
      .replace(/\{\{building_name\}\}/g, building.name || '')
      .replace(/\{\{area_name\}\}/g, area.name || '')
      .replace(/\{\{description\}\}/g, unit.description || '')
      .replace(/\{\{images\}\}/g, this.formatImages(unit.images || []))
      .replace(/\{\{amenities\}\}/g, this.formatAmenities(unit.amenities || []));
  }

  /**
   * Format images for template
   */
  private formatImages(images: any[]): string {
    if (images.length === 0) return '';
    return images.map((img) => `<img src="${img.image_url}" alt="${img.caption || ''}" />`).join('');
  }

  /**
   * Format amenities for template
   */
  private formatAmenities(amenities: any[]): string {
    if (amenities.length === 0) return '';
    return amenities.map((a) => `<span>${a.amenity.name}</span>`).join(', ');
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{unit_name}} - Property Listing</title>
</head>
<body>
  <h1>{{unit_name}}</h1>
  <p><strong>Type:</strong> {{unit_type}}</p>
  <p><strong>Bedrooms:</strong> {{bedrooms}}</p>
  <p><strong>Bathrooms:</strong> {{bathrooms}}</p>
  <p><strong>Area:</strong> {{area_sqft}} sqft</p>
  <p><strong>Rent:</strong> AED {{basic_rent}}</p>
  <p><strong>Location:</strong> {{building_name}}, {{area_name}}</p>
  <div>{{images}}</div>
  <p>{{description}}</p>
  <div>Amenities: {{amenities}}</div>
</body>
</html>
    `.trim();
  }
}

