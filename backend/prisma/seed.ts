import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Company
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Default Real Estate Company',
    },
  });

  console.log('✅ Company created:', company.name);

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@realestate.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@realestate.com',
      password: hashedPassword,
      is_admin: 'true',
      is_active: 'true',
      company_id: company.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create Default Permissions
  const permissions = [
    { name: 'users.view', category: 'users', description: 'View users' },
    { name: 'users.create', category: 'users', description: 'Create users' },
    { name: 'users.update', category: 'users', description: 'Update users' },
    { name: 'users.delete', category: 'users', description: 'Delete users' },
    { name: 'tenants.view', category: 'tenants', description: 'View tenants' },
    { name: 'tenants.create', category: 'tenants', description: 'Create tenants' },
    { name: 'tenants.update', category: 'tenants', description: 'Update tenants' },
    { name: 'tenants.delete', category: 'tenants', description: 'Delete tenants' },
    { name: 'landlords.view', category: 'landlords', description: 'View landlords' },
    { name: 'landlords.create', category: 'landlords', description: 'Create landlords' },
    { name: 'contracts.view', category: 'contracts', description: 'View contracts' },
    { name: 'contracts.create', category: 'contracts', description: 'Create contracts' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: {
        id: perm.name === 'users.view' ? 1 : undefined,
      },
      update: {},
      create: {
        ...perm,
        company_id: company.id,
      },
    });
  }

  console.log('✅ Permissions created');

  // Create Default Role
  const allPermissions = await prisma.permission.findMany({
    where: { company_id: company.id },
  });

  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Admin',
      company_id: company.id,
      permissions: {
        connect: allPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Admin role created');

  // Create Default Master Data
  const country = await prisma.country.create({
    data: {
      name: 'United Arab Emirates',
      company_id: company.id,
    },
  });

  const state = await prisma.state.create({
    data: {
      name: 'Dubai',
      authorative_name: 'Dubai',
      country_id: country.id,
      company_id: company.id,
    },
  });

  const area = await prisma.area.create({
    data: {
      name: 'Downtown Dubai',
      state_id: state.id,
      company_id: company.id,
    },
  });

  console.log('✅ Master data created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

