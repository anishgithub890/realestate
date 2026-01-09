-- ============================================================================
-- Real Estate Management System - Sample Data
-- ============================================================================
-- 
-- This SQL script inserts sample data for testing and development.
-- Make sure to run mysql-schema.sql first before running this script.
--
-- Usage:
--   mysql -u root -p realestate < sample_data.sql
--
-- Or in MySQL Workbench:
--   File -> Run SQL Script -> Select sample_data.sql
--
-- ============================================================================

USE `realestate`;

-- Disable foreign key checks temporarily for faster import
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- COMPANY & HOSTING
-- ============================================================================

INSERT IGNORE INTO `Hosting` (`id`, `name`) VALUES
(1, 'Main Hosting'),
(2, 'Premium Hosting');

INSERT IGNORE INTO `Company` (`id`, `name`, `hosting_id`, `created_at`) VALUES
(1, 'Dubai Real Estate Management', 1, NOW()),
(2, 'Premium Properties LLC', 2, NOW());

-- ============================================================================
-- ROLES & PERMISSIONS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Permission` (`id`, `name`, `category`, `description`, `company_id`, `created_at`) VALUES
(1, 'users.view', 'users', 'View users', 1, NOW()),
(2, 'users.create', 'users', 'Create users', 1, NOW()),
(3, 'users.update', 'users', 'Update users', 1, NOW()),
(4, 'users.delete', 'users', 'Delete users', 1, NOW()),
(5, 'tenants.view', 'tenants', 'View tenants', 1, NOW()),
(6, 'tenants.create', 'tenants', 'Create tenants', 1, NOW()),
(7, 'tenants.update', 'tenants', 'Update tenants', 1, NOW()),
(8, 'tenants.delete', 'tenants', 'Delete tenants', 1, NOW()),
(9, 'landlords.view', 'landlords', 'View landlords', 1, NOW()),
(10, 'landlords.create', 'landlords', 'Create landlords', 1, NOW()),
(11, 'properties.view', 'properties', 'View properties', 1, NOW()),
(12, 'properties.create', 'properties', 'Create properties', 1, NOW()),
(13, 'contracts.view', 'contracts', 'View contracts', 1, NOW()),
(14, 'contracts.create', 'contracts', 'Create contracts', 1, NOW()),
(15, 'reports.view', 'reports', 'View reports', 1, NOW());

INSERT IGNORE INTO `Role` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Super Admin', 1, NOW()),
(2, 'Property Manager', 1, NOW()),
(3, 'Sales Agent', 1, NOW()),
(4, 'Tenant', 1, NOW()),
(5, 'Landlord', 1, NOW());

-- Link permissions to roles (Admin gets all permissions) - COMPANY 1
INSERT IGNORE INTO `_PermissionToRole` (`A`, `B`) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1),
(9, 1), (10, 1), (11, 1), (12, 1), (13, 1), (14, 1), (15, 1),
-- Property Manager permissions
(5, 2), (6, 2), (7, 2), (9, 2), (10, 2), (11, 2), (12, 2), (13, 2), (14, 2),
-- Sales Agent permissions
(5, 3), (6, 3), (11, 3), (13, 3), (14, 3);

-- ============================================================================
-- ROLES & PERMISSIONS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Permission` (`id`, `name`, `category`, `description`, `company_id`, `created_at`) VALUES
(101, 'users.view', 'users', 'View users', 2, NOW()),
(102, 'users.create', 'users', 'Create users', 2, NOW()),
(103, 'users.update', 'users', 'Update users', 2, NOW()),
(104, 'users.delete', 'users', 'Delete users', 2, NOW()),
(105, 'tenants.view', 'tenants', 'View tenants', 2, NOW()),
(106, 'tenants.create', 'tenants', 'Create tenants', 2, NOW()),
(107, 'tenants.update', 'tenants', 'Update tenants', 2, NOW()),
(108, 'tenants.delete', 'tenants', 'Delete tenants', 2, NOW()),
(109, 'landlords.view', 'landlords', 'View landlords', 2, NOW()),
(110, 'landlords.create', 'landlords', 'Create landlords', 2, NOW()),
(111, 'properties.view', 'properties', 'View properties', 2, NOW()),
(112, 'properties.create', 'properties', 'Create properties', 2, NOW()),
(113, 'contracts.view', 'contracts', 'View contracts', 2, NOW()),
(114, 'contracts.create', 'contracts', 'Create contracts', 2, NOW()),
(115, 'reports.view', 'reports', 'View reports', 2, NOW());

INSERT IGNORE INTO `Role` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Super Admin', 2, NOW()),
(102, 'Property Manager', 2, NOW()),
(103, 'Sales Agent', 2, NOW()),
(104, 'Tenant', 2, NOW()),
(105, 'Landlord', 2, NOW());

-- Link permissions to roles - COMPANY 2
INSERT IGNORE INTO `_PermissionToRole` (`A`, `B`) VALUES
(101, 101), (102, 101), (103, 101), (104, 101), (105, 101), (106, 101), (107, 101), (108, 101),
(109, 101), (110, 101), (111, 101), (112, 101), (113, 101), (114, 101), (115, 101),
-- Property Manager permissions
(105, 102), (106, 102), (107, 102), (109, 102), (110, 102), (111, 102), (112, 102), (113, 102), (114, 102),
-- Sales Agent permissions
(105, 103), (106, 103), (111, 103), (113, 103), (114, 103);

-- ============================================================================
-- USERS - COMPANY 1
-- ============================================================================
-- Password: admin123 (bcrypt hash)
INSERT IGNORE INTO `User` (`id`, `name`, `email`, `password`, `phone`, `is_admin`, `is_active`, `role_id`, `company_id`, `two_factor_enabled`, `email_verified`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@realestate.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971501234567', 'true', 'true', 1, 1, false, true, NOW(), NOW()),
(2, 'Ahmed Al Maktoum', 'ahmed.manager@realestate.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971501234568', 'false', 'true', 2, 1, false, true, NOW(), NOW()),
(3, 'Fatima Hassan', 'fatima.agent@realestate.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971501234569', 'false', 'true', 3, 1, false, true, NOW(), NOW()),
(4, 'Mohammed Ali', 'mohammed@realestate.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971501234570', 'false', 'true', 3, 1, false, true, NOW(), NOW());

-- ============================================================================
-- USERS - COMPANY 2
-- ============================================================================
-- Password: admin123 (bcrypt hash)
INSERT IGNORE INTO `User` (`id`, `name`, `email`, `password`, `phone`, `is_admin`, `is_active`, `role_id`, `company_id`, `two_factor_enabled`, `email_verified`, `created_at`, `updated_at`) VALUES
(101, 'Premium Admin', 'admin@premiumproperties.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971502234567', 'true', 'true', 101, 2, false, true, NOW(), NOW()),
(102, 'Khalid Al Suwaidi', 'khalid.manager@premiumproperties.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971502234568', 'false', 'true', 102, 2, false, true, NOW(), NOW()),
(103, 'Layla Al Mansoori', 'layla.agent@premiumproperties.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971502234569', 'false', 'true', 103, 2, false, true, NOW(), NOW()),
(104, 'Omar Al Zaabi', 'omar@premiumproperties.com', '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu', '+971502234570', 'false', 'true', 103, 2, false, true, NOW(), NOW());

-- ============================================================================
-- MASTER DATA - LOCATIONS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Country` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'United Arab Emirates', 1, NOW());

INSERT IGNORE INTO `State` (`id`, `name`, `authorative_name`, `country_id`, `company_id`, `created_at`) VALUES
(1, 'Dubai', 'Dubai', 1, 1, NOW()),
(2, 'Abu Dhabi', 'Abu Dhabi', 1, 1, NOW());

INSERT IGNORE INTO `Area` (`id`, `name`, `state_id`, `company_id`, `created_at`) VALUES
(1, 'Downtown Dubai', 1, 1, NOW()),
(2, 'Dubai Marina', 1, 1, NOW()),
(3, 'Business Bay', 1, 1, NOW()),
(4, 'Jumeirah', 1, 1, NOW()),
(5, 'Palm Jumeirah', 1, 1, NOW()),
(6, 'Al Barsha', 1, 1, NOW());

-- ============================================================================
-- LOCATIONS - HIERARCHICAL DATA - COMPANY 1
-- ============================================================================
-- Hierarchy: EMIRATE → NEIGHBOURHOOD → CLUSTER → BUILDING

-- EMIRATES (Top Level)
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Dubai', 'dubai', 'Dubai Emirate', NULL, 'EMIRATE', 'Dubai', 25.2048, 55.2708, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Abu Dhabi', 'abu-dhabi', 'Abu Dhabi Emirate', NULL, 'EMIRATE', 'Abu Dhabi', 24.4539, 54.3773, true, 2, 1, NOW(), NOW());

-- NEIGHBOURHOODS (Parent: EMIRATE)
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Downtown Dubai', 'downtown-dubai', 'Downtown Dubai neighbourhood', '550e8400-e29b-41d4-a716-446655440001', 'NEIGHBOURHOOD', 'Dubai > Downtown Dubai', 25.1972, 55.2744, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Dubai Marina', 'dubai-marina', 'Dubai Marina neighbourhood', '550e8400-e29b-41d4-a716-446655440001', 'NEIGHBOURHOOD', 'Dubai > Dubai Marina', 25.0764, 55.1392, true, 2, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'Business Bay', 'business-bay', 'Business Bay neighbourhood', '550e8400-e29b-41d4-a716-446655440001', 'NEIGHBOURHOOD', 'Dubai > Business Bay', 25.1867, 55.2644, true, 3, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'Jumeirah', 'jumeirah', 'Jumeirah neighbourhood', '550e8400-e29b-41d4-a716-446655440001', 'NEIGHBOURHOOD', 'Dubai > Jumeirah', 25.1972, 55.2244, true, 4, 1, NOW(), NOW());

-- CLUSTERS (Parent: NEIGHBOURHOOD)
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Burj Khalifa Area', 'burj-khalifa-area', 'Area around Burj Khalifa', '550e8400-e29b-41d4-a716-446655440011', 'CLUSTER', 'Dubai > Downtown Dubai > Burj Khalifa Area', 25.1972, 55.2744, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'Marina Walk', 'marina-walk', 'Marina Walk cluster', '550e8400-e29b-41d4-a716-446655440012', 'CLUSTER', 'Dubai > Dubai Marina > Marina Walk', 25.0764, 55.1392, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', 'Bay Avenue', 'bay-avenue', 'Bay Avenue cluster', '550e8400-e29b-41d4-a716-446655440013', 'CLUSTER', 'Dubai > Business Bay > Bay Avenue', 25.1867, 55.2644, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'Jumeirah Beach', 'jumeirah-beach', 'Jumeirah Beach cluster', '550e8400-e29b-41d4-a716-446655440014', 'CLUSTER', 'Dubai > Jumeirah > Jumeirah Beach', 25.1972, 55.2244, true, 1, 1, NOW(), NOW());

-- BUILDINGS (Parent: CLUSTER) - Linked to existing Building records
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'Burj Khalifa Residences', 'burj-khalifa-residences', 'Burj Khalifa Residences building', '550e8400-e29b-41d4-a716-446655440021', 'BUILDING', 'Dubai > Downtown Dubai > Burj Khalifa Area > Burj Khalifa Residences', 25.1972, 55.2744, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440032', 'Marina Heights Tower', 'marina-heights-tower', 'Marina Heights Tower building', '550e8400-e29b-41d4-a716-446655440022', 'BUILDING', 'Dubai > Dubai Marina > Marina Walk > Marina Heights Tower', 25.0764, 55.1392, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440033', 'Business Bay Tower', 'business-bay-tower', 'Business Bay Tower building', '550e8400-e29b-41d4-a716-446655440023', 'BUILDING', 'Dubai > Business Bay > Bay Avenue > Business Bay Tower', 25.1867, 55.2644, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440034', 'Jumeirah Beach Residences', 'jumeirah-beach-residences', 'Jumeirah Beach Residences building', '550e8400-e29b-41d4-a716-446655440024', 'BUILDING', 'Dubai > Jumeirah > Jumeirah Beach > Jumeirah Beach Residences', 25.1972, 55.2244, true, 1, 1, NOW(), NOW());

-- BUILDING_LVL1 (Parent: BUILDING) - Optional sub-levels
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'Tower A', 'tower-a', 'Tower A section', '550e8400-e29b-41d4-a716-446655440031', 'BUILDING_LVL1', 'Dubai > Downtown Dubai > Burj Khalifa Area > Burj Khalifa Residences > Tower A', 25.1972, 55.2744, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440042', 'Tower B', 'tower-b', 'Tower B section', '550e8400-e29b-41d4-a716-446655440031', 'BUILDING_LVL1', 'Dubai > Downtown Dubai > Burj Khalifa Area > Burj Khalifa Residences > Tower B', 25.1972, 55.2744, true, 2, 1, NOW(), NOW());

-- BUILDING_LVL2 (Parent: BUILDING_LVL1) - Optional sub-sub-levels
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440051', 'Block 1', 'block-1', 'Block 1 of Tower A', '550e8400-e29b-41d4-a716-446655440041', 'BUILDING_LVL2', 'Dubai > Downtown Dubai > Burj Khalifa Area > Burj Khalifa Residences > Tower A > Block 1', 25.1972, 55.2744, true, 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440052', 'Block 2', 'block-2', 'Block 2 of Tower A', '550e8400-e29b-41d4-a716-446655440041', 'BUILDING_LVL2', 'Dubai > Downtown Dubai > Burj Khalifa Area > Burj Khalifa Residences > Tower A > Block 2', 25.1972, 55.2744, true, 2, 1, NOW(), NOW());

-- Link existing Buildings to Locations
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440031' WHERE `id` = 1 AND `company_id` = 1;
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440032' WHERE `id` = 2 AND `company_id` = 1;
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440033' WHERE `id` = 3 AND `company_id` = 1;
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440034' WHERE `id` = 4 AND `company_id` = 1;

-- ============================================================================
-- MASTER DATA - LOCATIONS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Country` (`id`, `name`, `company_id`, `created_at`) VALUES
(2, 'United Arab Emirates', 2, NOW());

INSERT IGNORE INTO `State` (`id`, `name`, `authorative_name`, `country_id`, `company_id`, `created_at`) VALUES
(101, 'Abu Dhabi', 'Abu Dhabi', 2, 2, NOW()),
(102, 'Sharjah', 'Sharjah', 2, 2, NOW());

INSERT IGNORE INTO `Area` (`id`, `name`, `state_id`, `company_id`, `created_at`) VALUES
(101, 'Al Reem Island', 101, 2, NOW()),
(102, 'Yas Island', 101, 2, NOW()),
(103, 'Saadiyat Island', 101, 2, NOW()),
(104, 'Al Qasimia', 102, 2, NOW()),
(105, 'Al Majaz', 102, 2, NOW());

-- ============================================================================
-- LOCATIONS - HIERARCHICAL DATA - COMPANY 2
-- ============================================================================
-- Hierarchy: EMIRATE → NEIGHBOURHOOD → CLUSTER → BUILDING

-- EMIRATES (Top Level)
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Abu Dhabi', 'abu-dhabi', 'Abu Dhabi Emirate', NULL, 'EMIRATE', 'Abu Dhabi', 24.4539, 54.3773, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440102', 'Sharjah', 'sharjah', 'Sharjah Emirate', NULL, 'EMIRATE', 'Sharjah', 25.3573, 55.4033, true, 2, 2, NOW(), NOW());

-- NEIGHBOURHOODS (Parent: EMIRATE)
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440111', 'Al Reem Island', 'al-reem-island', 'Al Reem Island neighbourhood', '550e8400-e29b-41d4-a716-446655440101', 'NEIGHBOURHOOD', 'Abu Dhabi > Al Reem Island', 24.5200, 54.4200, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440112', 'Yas Island', 'yas-island', 'Yas Island neighbourhood', '550e8400-e29b-41d4-a716-446655440101', 'NEIGHBOURHOOD', 'Abu Dhabi > Yas Island', 24.5300, 54.6000, true, 2, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440113', 'Saadiyat Island', 'saadiyat-island', 'Saadiyat Island neighbourhood', '550e8400-e29b-41d4-a716-446655440101', 'NEIGHBOURHOOD', 'Abu Dhabi > Saadiyat Island', 24.5400, 54.4300, true, 3, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440114', 'Al Qasimia', 'al-qasimia', 'Al Qasimia neighbourhood', '550e8400-e29b-41d4-a716-446655440102', 'NEIGHBOURHOOD', 'Sharjah > Al Qasimia', 25.3600, 55.3900, true, 1, 2, NOW(), NOW());

-- CLUSTERS (Parent: NEIGHBOURHOOD)
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440121', 'Al Reem Central', 'al-reem-central', 'Al Reem Central cluster', '550e8400-e29b-41d4-a716-446655440111', 'CLUSTER', 'Abu Dhabi > Al Reem Island > Al Reem Central', 24.5200, 54.4200, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440122', 'Yas Marina', 'yas-marina', 'Yas Marina cluster', '550e8400-e29b-41d4-a716-446655440112', 'CLUSTER', 'Abu Dhabi > Yas Island > Yas Marina', 24.5300, 54.6000, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440123', 'Saadiyat Beach', 'saadiyat-beach', 'Saadiyat Beach cluster', '550e8400-e29b-41d4-a716-446655440113', 'CLUSTER', 'Abu Dhabi > Saadiyat Island > Saadiyat Beach', 24.5400, 54.4300, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440124', 'Al Qasimia Heights', 'al-qasimia-heights', 'Al Qasimia Heights cluster', '550e8400-e29b-41d4-a716-446655440114', 'CLUSTER', 'Sharjah > Al Qasimia > Al Qasimia Heights', 25.3600, 55.3900, true, 1, 2, NOW(), NOW());

-- BUILDINGS (Parent: CLUSTER) - Linked to existing Building records
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440131', 'Al Reem Tower', 'al-reem-tower', 'Al Reem Tower building', '550e8400-e29b-41d4-a716-446655440121', 'BUILDING', 'Abu Dhabi > Al Reem Island > Al Reem Central > Al Reem Tower', 24.5200, 54.4200, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440132', 'Yas Island Residences', 'yas-island-residences', 'Yas Island Residences building', '550e8400-e29b-41d4-a716-446655440122', 'BUILDING', 'Abu Dhabi > Yas Island > Yas Marina > Yas Island Residences', 24.5300, 54.6000, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440133', 'Saadiyat Luxury Villas', 'saadiyat-luxury-villas', 'Saadiyat Luxury Villas building', '550e8400-e29b-41d4-a716-446655440123', 'BUILDING', 'Abu Dhabi > Saadiyat Island > Saadiyat Beach > Saadiyat Luxury Villas', 24.5400, 54.4300, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440134', 'Al Qasimia Heights', 'al-qasimia-heights-building', 'Al Qasimia Heights building', '550e8400-e29b-41d4-a716-446655440124', 'BUILDING', 'Sharjah > Al Qasimia > Al Qasimia Heights > Al Qasimia Heights', 25.3600, 55.3900, true, 1, 2, NOW(), NOW());

-- BUILDING_LVL1 (Parent: BUILDING) - Optional sub-levels
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440141', 'Villa Complex A', 'villa-complex-a', 'Villa Complex A section', '550e8400-e29b-41d4-a716-446655440133', 'BUILDING_LVL1', 'Abu Dhabi > Saadiyat Island > Saadiyat Beach > Saadiyat Luxury Villas > Villa Complex A', 24.5400, 54.4300, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440142', 'Villa Complex B', 'villa-complex-b', 'Villa Complex B section', '550e8400-e29b-41d4-a716-446655440133', 'BUILDING_LVL1', 'Abu Dhabi > Saadiyat Island > Saadiyat Beach > Saadiyat Luxury Villas > Villa Complex B', 24.5400, 54.4300, true, 2, 2, NOW(), NOW());

-- BUILDING_LVL2 (Parent: BUILDING_LVL1) - Optional sub-sub-levels
INSERT IGNORE INTO `location` (`id`, `name`, `slug`, `description`, `parent_id`, `level`, `full_path`, `latitude`, `longitude`, `is_active`, `sort_order`, `company_id`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440151', 'Block A1', 'block-a1', 'Block A1 of Villa Complex A', '550e8400-e29b-41d4-a716-446655440141', 'BUILDING_LVL2', 'Abu Dhabi > Saadiyat Island > Saadiyat Beach > Saadiyat Luxury Villas > Villa Complex A > Block A1', 24.5400, 54.4300, true, 1, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440152', 'Block A2', 'block-a2', 'Block A2 of Villa Complex A', '550e8400-e29b-41d4-a716-446655440141', 'BUILDING_LVL2', 'Abu Dhabi > Saadiyat Island > Saadiyat Beach > Saadiyat Luxury Villas > Villa Complex A > Block A2', 24.5400, 54.4300, true, 2, 2, NOW(), NOW());

-- Link existing Buildings to Locations
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440131' WHERE `id` = 101 AND `company_id` = 2;
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440132' WHERE `id` = 102 AND `company_id` = 2;
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440133' WHERE `id` = 103 AND `company_id` = 2;
UPDATE `Building` SET `location_id` = '550e8400-e29b-41d4-a716-446655440134' WHERE `id` = 104 AND `company_id` = 2;

-- ============================================================================
-- UNIT TYPES & AMENITIES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `unitType` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Studio', 1, NOW()),
(2, '1 Bedroom', 1, NOW()),
(3, '2 Bedroom', 1, NOW()),
(4, '3 Bedroom', 1, NOW()),
(5, '4 Bedroom', 1, NOW()),
(6, 'Penthouse', 1, NOW()),
(7, 'Villa', 1, NOW());

INSERT IGNORE INTO `Amenity` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Swimming Pool', 1, NOW()),
(2, 'Gym', 1, NOW()),
(3, 'Parking', 1, NOW()),
(4, 'Balcony', 1, NOW()),
(5, 'Maid Room', 1, NOW()),
(6, 'Storage', 1, NOW()),
(7, 'Security', 1, NOW()),
(8, 'Elevator', 1, NOW()),
(9, 'Central AC', 1, NOW()),
(10, 'Furnished', 1, NOW());

-- ============================================================================
-- UNIT TYPES & AMENITIES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `unitType` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Studio', 2, NOW()),
(102, '1 Bedroom', 2, NOW()),
(103, '2 Bedroom', 2, NOW()),
(104, '3 Bedroom', 2, NOW()),
(105, '4 Bedroom', 2, NOW()),
(106, 'Penthouse', 2, NOW()),
(107, 'Villa', 2, NOW());

INSERT IGNORE INTO `Amenity` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Swimming Pool', 2, NOW()),
(102, 'Gym', 2, NOW()),
(103, 'Parking', 2, NOW()),
(104, 'Balcony', 2, NOW()),
(105, 'Maid Room', 2, NOW()),
(106, 'Storage', 2, NOW()),
(107, 'Security', 2, NOW()),
(108, 'Elevator', 2, NOW()),
(109, 'Central AC', 2, NOW()),
(110, 'Furnished', 2, NOW());

-- ============================================================================
-- BUILDINGS & FLOORS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Building` (`id`, `name`, `completion_date`, `is_exempt`, `status`, `area_id`, `company_id`, `created_at`) VALUES
(1, 'Burj Khalifa Residences', '2010-01-01', 'false', 'active', 1, 1, NOW()),
(2, 'Marina Heights Tower', '2015-06-15', 'false', 'active', 2, 1, NOW()),
(3, 'Business Bay Tower', '2018-03-20', 'false', 'active', 3, 1, NOW()),
(4, 'Jumeirah Beach Residences', '2012-08-10', 'false', 'active', 4, 1, NOW());

INSERT IGNORE INTO `Floor` (`id`, `name`, `building_id`, `created_at`) VALUES
(1, 'Ground Floor', 1, NOW()),
(2, '1st Floor', 1, NOW()),
(3, '2nd Floor', 1, NOW()),
(4, '3rd Floor', 1, NOW()),
(5, '4th Floor', 1, NOW()),
(6, 'Ground Floor', 2, NOW()),
(7, '1st Floor', 2, NOW()),
(8, '2nd Floor', 2, NOW()),
(9, 'Ground Floor', 3, NOW()),
(10, '1st Floor', 3, NOW());

-- ============================================================================
-- BUILDINGS & FLOORS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Building` (`id`, `name`, `completion_date`, `is_exempt`, `status`, `area_id`, `company_id`, `created_at`) VALUES
(101, 'Al Reem Tower', '2016-05-10', 'false', 'active', 101, 2, NOW()),
(102, 'Yas Island Residences', '2019-08-20', 'false', 'active', 102, 2, NOW()),
(103, 'Saadiyat Luxury Villas', '2020-03-15', 'false', 'active', 103, 2, NOW()),
(104, 'Al Qasimia Heights', '2017-11-30', 'false', 'active', 104, 2, NOW());

INSERT IGNORE INTO `Floor` (`id`, `name`, `building_id`, `created_at`) VALUES
(101, 'Ground Floor', 101, NOW()),
(102, '1st Floor', 101, NOW()),
(103, '2nd Floor', 101, NOW()),
(104, '3rd Floor', 101, NOW()),
(105, 'Ground Floor', 102, NOW()),
(106, '1st Floor', 102, NOW()),
(107, '2nd Floor', 102, NOW()),
(108, 'Ground Floor', 103, NOW()),
(109, '1st Floor', 103, NOW()),
(110, 'Ground Floor', 104, NOW());

-- ============================================================================
-- UNITS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `unit` (`id`, `name`, `gross_area_in_sqft`, `ownership`, `basic_rent`, `basic_sale_value`, `is_exempt`, `premise_no`, `status`, `property_type`, `no_of_bathrooms`, `no_of_bedrooms`, `no_of_parkings`, `ejari_number`, `ejari_expiry`, `dewa_account`, `municipality_fees`, `furnished_type`, `view_type`, `floor_number`, `total_floors`, `year_built`, `listing_type`, `is_featured`, `is_verified`, `description`, `latitude`, `longitude`, `building_id`, `floor_id`, `unit_type_id`, `owned_by`, `company_id`, `created_at`, `updated_at`) VALUES
(1, 'Unit 101', 850.00, 'Company', 45000.00, 1200000.00, 'false', 'BKH-101', 'available', 'Apartment', 2, 1, 1, 'EJ-2024-001', '2025-12-31', 'DEWA-12345', 5000.00, 'furnished', 'city_view', 1, 50, 2010, 'both', true, true, 'Spacious 1 bedroom apartment with city view in Burj Khalifa', 25.1972, 55.2744, 1, 2, 2, NULL, 1, NOW(), NOW()),
(2, 'Unit 201', 1200.00, 'Company', 65000.00, 1800000.00, 'false', 'BKH-201', 'available', 'Apartment', 2, 2, 2, 'EJ-2024-002', '2025-12-31', 'DEWA-12346', 6000.00, 'semi-furnished', 'city_view', 2, 50, 2010, 'rent', false, true, 'Modern 2 bedroom apartment with premium finishes', 25.1972, 55.2744, 1, 3, 3, NULL, 1, NOW(), NOW()),
(3, 'Unit 301', 1500.00, 'Company', 85000.00, 2500000.00, 'false', 'BKH-301', 'occupied', 'Apartment', 3, 3, 2, 'EJ-2024-003', '2025-12-31', 'DEWA-12347', 7000.00, 'unfurnished', 'city_view', 3, 50, 2010, 'rent', true, true, 'Luxury 3 bedroom apartment with panoramic views', 25.1972, 55.2744, 1, 4, 4, NULL, 1, NOW(), NOW()),
(4, 'Unit 102', 950.00, 'Company', 50000.00, 1350000.00, 'false', 'MHT-102', 'available', 'Apartment', 2, 1, 1, 'EJ-2024-004', '2025-12-31', 'DEWA-12348', 5500.00, 'furnished', 'sea_view', 1, 30, 2015, 'both', false, true, 'Beautiful 1 bedroom with sea view in Marina', 25.0764, 55.1392, 2, 6, 2, NULL, 1, NOW(), NOW()),
(5, 'Unit 202', 1300.00, 'Company', 70000.00, 2000000.00, 'false', 'MHT-202', 'available', 'Apartment', 2, 2, 2, 'EJ-2024-005', '2025-12-31', 'DEWA-12349', 6500.00, 'furnished', 'sea_view', 2, 30, 2015, 'rent', true, true, 'Stunning 2 bedroom with marina and sea views', 25.0764, 55.1392, 2, 7, 3, NULL, 1, NOW(), NOW());

-- Link amenities to units - COMPANY 1
INSERT IGNORE INTO `unitAmenity` (`id`, `unit_id`, `amenity_id`) VALUES
(1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 4), (5, 1, 7), (6, 1, 8), (7, 1, 9), (8, 1, 10),
(9, 2, 1), (10, 2, 2), (11, 2, 3), (12, 2, 4), (13, 2, 5), (14, 2, 7), (15, 2, 8), (16, 2, 9),
(17, 3, 1), (18, 3, 2), (19, 3, 3), (20, 3, 4), (21, 3, 5), (22, 3, 6), (23, 3, 7), (24, 3, 8), (25, 3, 9),
(26, 4, 1), (27, 4, 2), (28, 4, 3), (29, 4, 4), (30, 4, 7), (31, 4, 8), (32, 4, 9), (33, 4, 10),
(34, 5, 1), (35, 5, 2), (36, 5, 3), (37, 5, 4), (38, 5, 5), (39, 5, 7), (40, 5, 8), (41, 5, 9), (42, 5, 10);

-- ============================================================================
-- UNITS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `unit` (`id`, `name`, `gross_area_in_sqft`, `ownership`, `basic_rent`, `basic_sale_value`, `is_exempt`, `premise_no`, `status`, `property_type`, `no_of_bathrooms`, `no_of_bedrooms`, `no_of_parkings`, `ejari_number`, `ejari_expiry`, `dewa_account`, `municipality_fees`, `furnished_type`, `view_type`, `floor_number`, `total_floors`, `year_built`, `listing_type`, `is_featured`, `is_verified`, `description`, `latitude`, `longitude`, `building_id`, `floor_id`, `unit_type_id`, `owned_by`, `company_id`, `created_at`, `updated_at`) VALUES
(101, 'Villa A1', 2500.00, 'Company', 120000.00, 3500000.00, 'false', 'ART-A1', 'available', 'Villa', 4, 4, 3, 'EJ-2024-101', '2025-12-31', 'ADWEA-101', 8000.00, 'furnished', 'sea_view', 1, 2, 2016, 'both', true, true, 'Luxury 4 bedroom villa with private pool in Al Reem Island', 24.5200, 54.4200, 101, 101, 105, NULL, 2, NOW(), NOW()),
(102, 'Unit 201', 1100.00, 'Company', 55000.00, 1600000.00, 'false', 'YIR-201', 'available', 'Apartment', 2, 2, 2, 'EJ-2024-102', '2025-12-31', 'ADWEA-102', 6000.00, 'semi-furnished', 'island_view', 2, 25, 2019, 'rent', true, true, 'Modern 2 bedroom apartment overlooking Yas Island', 24.5300, 54.6000, 102, 106, 103, NULL, 2, NOW(), NOW()),
(103, 'Unit 301', 1400.00, 'Company', 75000.00, 2200000.00, 'false', 'YIR-301', 'occupied', 'Apartment', 3, 3, 2, 'EJ-2024-103', '2025-12-31', 'ADWEA-103', 7000.00, 'furnished', 'island_view', 3, 25, 2019, 'rent', false, true, 'Spacious 3 bedroom apartment with premium amenities', 24.5300, 54.6000, 102, 107, 104, NULL, 2, NOW(), NOW()),
(104, 'Villa B2', 3000.00, 'Company', 150000.00, 4500000.00, 'false', 'SLV-B2', 'available', 'Villa', 5, 5, 4, 'EJ-2024-104', '2025-12-31', 'ADWEA-104', 10000.00, 'furnished', 'beach_view', 1, 2, 2020, 'both', true, true, 'Premium 5 bedroom beachfront villa in Saadiyat Island', 24.5400, 54.4300, 103, 108, 105, NULL, 2, NOW(), NOW()),
(105, 'Unit 101', 900.00, 'Company', 48000.00, 1400000.00, 'false', 'AQH-101', 'available', 'Apartment', 2, 1, 1, 'EJ-2024-105', '2025-12-31', 'SEWA-105', 5500.00, 'furnished', 'city_view', 1, 20, 2017, 'rent', false, true, 'Cozy 1 bedroom apartment in Al Qasimia Heights', 25.3600, 55.3900, 104, 110, 102, NULL, 2, NOW(), NOW());

-- Link amenities to units - COMPANY 2
INSERT IGNORE INTO `unitAmenity` (`id`, `unit_id`, `amenity_id`) VALUES
(101, 101, 101), (102, 101, 102), (103, 101, 103), (104, 101, 104), (105, 101, 105), (106, 101, 107), (107, 101, 109), (108, 101, 110),
(109, 102, 101), (110, 102, 102), (111, 102, 103), (112, 102, 104), (113, 102, 107), (114, 102, 108), (115, 102, 109), (116, 102, 110),
(117, 103, 101), (118, 103, 102), (119, 103, 103), (120, 103, 104), (121, 103, 105), (122, 103, 106), (123, 103, 107), (124, 103, 108), (125, 103, 109),
(126, 104, 101), (127, 104, 102), (128, 104, 103), (129, 104, 104), (130, 104, 105), (131, 104, 106), (132, 104, 107), (133, 104, 109), (134, 104, 110),
(135, 105, 101), (136, 105, 102), (137, 105, 103), (138, 105, 104), (139, 105, 107), (140, 105, 108), (141, 105, 109), (142, 105, 110);

-- ============================================================================
-- PARKING & VEHICLES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Parking` (`id`, `name`, `building_id`, `company_id`, `created_at`) VALUES
(1, 'Parking Spot P1', 1, 1, NOW()),
(2, 'Parking Spot P2', 1, 1, NOW()),
(3, 'Parking Spot P3', 1, 1, NOW()),
(4, 'Parking Spot P4', 2, 1, NOW()),
(5, 'Parking Spot P5', 2, 1, NOW());

INSERT IGNORE INTO `Vehicle` (`id`, `vehicle_no`, `vehicle_type`, `company_id`, `created_at`) VALUES
(1, 'DXB-12345', 'Sedan', 1, NOW()),
(2, 'DXB-67890', 'SUV', 1, NOW()),
(3, 'DXB-11111', 'Sedan', 1, NOW());

-- ============================================================================
-- PARKING & VEHICLES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Parking` (`id`, `name`, `building_id`, `company_id`, `created_at`) VALUES
(101, 'Parking Spot P1', 101, 2, NOW()),
(102, 'Parking Spot P2', 101, 2, NOW()),
(103, 'Parking Spot P3', 102, 2, NOW()),
(104, 'Parking Spot P4', 102, 2, NOW()),
(105, 'Parking Spot P5', 103, 2, NOW());

INSERT IGNORE INTO `Vehicle` (`id`, `vehicle_no`, `vehicle_type`, `company_id`, `created_at`) VALUES
(101, 'AUH-12345', 'Sedan', 2, NOW()),
(102, 'AUH-67890', 'SUV', 2, NOW()),
(103, 'SHJ-11111', 'Sedan', 2, NOW());

-- ============================================================================
-- TENANTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Tenant` (`id`, `name`, `email`, `phone_no`, `mobile_no`, `emirates_id`, `emirates_id_expiry`, `residential`, `nationality`, `passport_no`, `passport_expiry`, `address`, `company_id`, `created_at`) VALUES
(1, 'John Smith', 'john.smith@email.com', '+97141234567', '+971501111111', '784-1985-1234567-1', '2026-12-31', 'Dubai Marina', 'British', 'GB123456789', '2027-06-30', 'Dubai Marina, Building 1, Apartment 301', 1, NOW()),
(2, 'Sarah Johnson', 'sarah.j@email.com', '+97141234568', '+971502222222', '784-1990-2345678-2', '2026-12-31', 'Downtown Dubai', 'American', 'US987654321', '2027-08-15', 'Downtown Dubai, Burj Khalifa Area', 1, NOW()),
(3, 'Ahmed Al Mansoori', 'ahmed.mansoori@email.com', '+97141234569', '+971503333333', '784-1988-3456789-3', '2026-12-31', 'Business Bay', 'Emirati', 'AE111222333', '2027-12-31', 'Business Bay, Tower 2', 1, NOW());

-- ============================================================================
-- LANDLORDS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Landlord` (`id`, `name`, `email`, `phone_no`, `mobile_no`, `emirates_id`, `emirates_id_expiry`, `residential`, `nationality`, `passport_no`, `passport_expiry`, `address`, `company_id`, `created_at`) VALUES
(1, 'Sheikh Mohammed Al Maktoum', 'sheikh.mohammed@email.com', '+97141234570', '+971504444444', '784-1975-4567890-4', '2026-12-31', 'Dubai', 'Emirati', 'AE444555666', '2027-12-31', 'Dubai, UAE', 1, NOW()),
(2, 'Fatima Al Zaabi', 'fatima.zaabi@email.com', '+97141234571', '+971505555555', '784-1982-5678901-5', '2026-12-31', 'Abu Dhabi', 'Emirati', 'AE777888999', '2027-12-31', 'Abu Dhabi, UAE', 1, NOW());

-- Update units to be owned by landlords - COMPANY 1
UPDATE `unit` SET `owned_by` = 1 WHERE `id` IN (1, 2, 3);
UPDATE `unit` SET `owned_by` = 2 WHERE `id` IN (4, 5);

-- ============================================================================
-- TENANTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Tenant` (`id`, `name`, `email`, `phone_no`, `mobile_no`, `emirates_id`, `emirates_id_expiry`, `residential`, `nationality`, `passport_no`, `passport_expiry`, `address`, `company_id`, `created_at`) VALUES
(101, 'Michael Brown', 'michael.brown@email.com', '+97142234567', '+971511111111', '784-1987-1234567-1', '2026-12-31', 'Al Reem Island', 'Canadian', 'CA123456789', '2027-09-30', 'Al Reem Island, Villa A1', 2, NOW()),
(102, 'Sophie Martin', 'sophie.martin@email.com', '+97142234568', '+971512222222', '784-1992-2345678-2', '2026-12-31', 'Yas Island', 'French', 'FR987654321', '2027-10-15', 'Yas Island, Apartment 301', 2, NOW()),
(103, 'Hassan Al Nuaimi', 'hassan.nuaimi@email.com', '+97142234569', '+971513333333', '784-1990-3456789-3', '2026-12-31', 'Saadiyat Island', 'Emirati', 'AE222333444', '2027-12-31', 'Saadiyat Island, Villa B2', 2, NOW());

-- ============================================================================
-- LANDLORDS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Landlord` (`id`, `name`, `email`, `phone_no`, `mobile_no`, `emirates_id`, `emirates_id_expiry`, `residential`, `nationality`, `passport_no`, `passport_expiry`, `address`, `company_id`, `created_at`) VALUES
(101, 'Sheikh Hamdan Al Nahyan', 'sheikh.hamdan@email.com', '+97142234570', '+971514444444', '784-1978-4567890-4', '2026-12-31', 'Abu Dhabi', 'Emirati', 'AE555666777', '2027-12-31', 'Abu Dhabi, UAE', 2, NOW()),
(102, 'Mariam Al Dhaheri', 'mariam.dhaheri@email.com', '+97142234571', '+971515555555', '784-1985-5678901-5', '2026-12-31', 'Sharjah', 'Emirati', 'AE888999000', '2027-12-31', 'Sharjah, UAE', 2, NOW());

-- Update units to be owned by landlords - COMPANY 2
UPDATE `unit` SET `owned_by` = 101 WHERE `id` IN (101, 102);
UPDATE `unit` SET `owned_by` = 102 WHERE `id` IN (103, 104, 105);

-- ============================================================================
-- BROKERS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Broker` (`id`, `name`, `email`, `phone`, `license_number`, `license_expiry`, `commission_rate`, `company_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Dubai Properties Realty', 'info@dubaiproperties.ae', '+97142234567', 'RERA-2024-001', '2025-12-31', 2.5, 1, true, NOW(), NOW()),
(2, 'Elite Real Estate Services', 'contact@elitere.ae', '+97142234568', 'RERA-2024-002', '2025-12-31', 3.0, 1, true, NOW(), NOW()),
(3, 'Premium Property Consultants', 'sales@premiumprop.ae', '+97142234569', 'RERA-2024-003', '2025-12-31', 2.0, 1, true, NOW(), NOW());

-- ============================================================================
-- BROKERS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Broker` (`id`, `name`, `email`, `phone`, `license_number`, `license_expiry`, `commission_rate`, `company_id`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 'Abu Dhabi Premium Realty', 'info@adpremium.ae', '+97143234567', 'RERA-2024-101', '2025-12-31', 2.8, 2, true, NOW(), NOW()),
(102, 'Sharjah Elite Properties', 'contact@sharjahelite.ae', '+97143234568', 'RERA-2024-102', '2025-12-31', 3.2, 2, true, NOW(), NOW()),
(103, 'Northern Emirates Consultants', 'sales@northernemirates.ae', '+97143234569', 'RERA-2024-103', '2025-12-31', 2.5, 2, true, NOW(), NOW());

-- ============================================================================
-- MASTER DATA - LEAD MANAGEMENT - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `ActivitySource` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Website', 1, NOW()),
(2, 'Phone Call', 1, NOW()),
(3, 'Walk-in', 1, NOW()),
(4, 'Referral', 1, NOW()),
(5, 'Social Media', 1, NOW()),
(6, 'Email', 1, NOW());

INSERT IGNORE INTO `LeadStatus` (`id`, `name`, `category`, `is_qualified`, `company_id`, `created_at`) VALUES
(1, 'New', 'unqualified', false, 1, NOW()),
(2, 'Contacted', 'unqualified', false, 1, NOW()),
(3, 'Qualified', 'qualified', true, 1, NOW()),
(4, 'Viewing Scheduled', 'qualified', true, 1, NOW()),
(5, 'Offer Made', 'qualified', true, 1, NOW()),
(6, 'Converted', 'qualified', true, 1, NOW()),
(7, 'Lost', 'unqualified', false, 1, NOW());

INSERT IGNORE INTO `FollowupType` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Phone Call', 1, NOW()),
(2, 'Email', 1, NOW()),
(3, 'WhatsApp', 1, NOW()),
(4, 'Meeting', 1, NOW()),
(5, 'Property Viewing', 1, NOW());

-- ============================================================================
-- MASTER DATA - LEAD MANAGEMENT - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `ActivitySource` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Website', 2, NOW()),
(102, 'Phone Call', 2, NOW()),
(103, 'Walk-in', 2, NOW()),
(104, 'Referral', 2, NOW()),
(105, 'Social Media', 2, NOW()),
(106, 'Email', 2, NOW());

INSERT IGNORE INTO `LeadStatus` (`id`, `name`, `category`, `is_qualified`, `company_id`, `created_at`) VALUES
(101, 'New', 'unqualified', false, 2, NOW()),
(102, 'Contacted', 'unqualified', false, 2, NOW()),
(103, 'Qualified', 'qualified', true, 2, NOW()),
(104, 'Viewing Scheduled', 'qualified', true, 2, NOW()),
(105, 'Offer Made', 'qualified', true, 2, NOW()),
(106, 'Converted', 'qualified', true, 2, NOW()),
(107, 'Lost', 'unqualified', false, 2, NOW());

INSERT IGNORE INTO `FollowupType` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Phone Call', 2, NOW()),
(102, 'Email', 2, NOW()),
(103, 'WhatsApp', 2, NOW()),
(104, 'Meeting', 2, NOW()),
(105, 'Property Viewing', 2, NOW());

-- ============================================================================
-- MASTER DATA - TICKET/MAINTENANCE - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `MaintenanceType` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Plumbing', 1, NOW()),
(2, 'Electrical', 1, NOW()),
(3, 'HVAC', 1, NOW()),
(4, 'Cleaning', 1, NOW()),
(5, 'Pest Control', 1, NOW()),
(6, 'Painting', 1, NOW()),
(7, 'Carpentry', 1, NOW()),
(8, 'General Maintenance', 1, NOW());

INSERT IGNORE INTO `MaintenanceStatus` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Open', 1, NOW()),
(2, 'In Progress', 1, NOW()),
(3, 'Pending Parts', 1, NOW()),
(4, 'Completed', 1, NOW()),
(5, 'Cancelled', 1, NOW());

-- ============================================================================
-- MASTER DATA - REQUESTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `RequestType` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Maintenance Request', 1, NOW()),
(2, 'Parking Request', 1, NOW()),
(3, 'Access Card Request', 1, NOW()),
(4, 'NOC Request', 1, NOW()),
(5, 'Renewal Request', 1, NOW());

INSERT IGNORE INTO `RequestStatus` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Pending', 1, NOW()),
(2, 'Approved', 1, NOW()),
(3, 'Rejected', 1, NOW()),
(4, 'Completed', 1, NOW());

-- ============================================================================
-- MASTER DATA - COMPLAINTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `ComplaintStatus` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Open', 1, NOW()),
(2, 'Under Review', 1, NOW()),
(3, 'Resolved', 1, NOW()),
(4, 'Closed', 1, NOW());

-- ============================================================================
-- MASTER DATA - KYC & PAYMENTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KycDocType` (`id`, `name`, `is_mandatory`, `company_id`, `created_at`) VALUES
(1, 'Emirates ID', 'true', 1, NOW()),
(2, 'Passport', 'true', 1, NOW()),
(3, 'Visa Copy', 'true', 1, NOW()),
(4, 'Salary Certificate', 'false', 1, NOW()),
(5, 'Bank Statement', 'false', 1, NOW());

INSERT IGNORE INTO `PaymentUnder` (`id`, `name`, `company_id`, `created_at`) VALUES
(1, 'Rent', 1, NOW()),
(2, 'Security Deposit', 1, NOW()),
(3, 'Service Charges', 1, NOW()),
(4, 'Maintenance', 1, NOW()),
(5, 'Penalty', 1, NOW());

-- ============================================================================
-- MASTER DATA - TICKET/MAINTENANCE - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `MaintenanceType` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Plumbing', 2, NOW()),
(102, 'Electrical', 2, NOW()),
(103, 'HVAC', 2, NOW()),
(104, 'Cleaning', 2, NOW()),
(105, 'Pest Control', 2, NOW()),
(106, 'Painting', 2, NOW()),
(107, 'Carpentry', 2, NOW()),
(108, 'General Maintenance', 2, NOW());

INSERT IGNORE INTO `MaintenanceStatus` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Open', 2, NOW()),
(102, 'In Progress', 2, NOW()),
(103, 'Pending Parts', 2, NOW()),
(104, 'Completed', 2, NOW()),
(105, 'Cancelled', 2, NOW());

-- ============================================================================
-- MASTER DATA - REQUESTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `RequestType` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Maintenance Request', 2, NOW()),
(102, 'Parking Request', 2, NOW()),
(103, 'Access Card Request', 2, NOW()),
(104, 'NOC Request', 2, NOW()),
(105, 'Renewal Request', 2, NOW());

INSERT IGNORE INTO `RequestStatus` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Pending', 2, NOW()),
(102, 'Approved', 2, NOW()),
(103, 'Rejected', 2, NOW()),
(104, 'Completed', 2, NOW());

-- ============================================================================
-- MASTER DATA - COMPLAINTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `ComplaintStatus` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Open', 2, NOW()),
(102, 'Under Review', 2, NOW()),
(103, 'Resolved', 2, NOW()),
(104, 'Closed', 2, NOW());

-- ============================================================================
-- MASTER DATA - KYC & PAYMENTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KycDocType` (`id`, `name`, `is_mandatory`, `company_id`, `created_at`) VALUES
(101, 'Emirates ID', 'true', 2, NOW()),
(102, 'Passport', 'true', 2, NOW()),
(103, 'Visa Copy', 'true', 2, NOW()),
(104, 'Salary Certificate', 'false', 2, NOW()),
(105, 'Bank Statement', 'false', 2, NOW());

INSERT IGNORE INTO `PaymentUnder` (`id`, `name`, `company_id`, `created_at`) VALUES
(101, 'Rent', 2, NOW()),
(102, 'Security Deposit', 2, NOW()),
(103, 'Service Charges', 2, NOW()),
(104, 'Maintenance', 2, NOW()),
(105, 'Penalty', 2, NOW());

-- ============================================================================
-- SAMPLE LEADS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Lead` (`id`, `uuid`, `name`, `email`, `mobile_no`, `whatsapp_no`, `property_type`, `interest_type`, `min_price`, `max_price`, `description`, `status_id`, `activity_source_id`, `assigned_to`, `company_id`, `created_by`, `created_at`) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', 'David Wilson', 'david.wilson@email.com', '+971501234500', '+971501234500', 'Apartment', 'Rent', 40000.00, 60000.00, 'Looking for 2 bedroom apartment in Dubai Marina', 3, 1, 3, 1, 2, NOW()),
(2, '550e8400-e29b-41d4-a716-446655440002', 'Emma Brown', 'emma.brown@email.com', '+971501234501', '+971501234501', 'Apartment', 'Buy', 1500000.00, 2500000.00, 'Interested in purchasing 3 bedroom apartment', 2, 2, 3, 1, 2, NOW());

-- ============================================================================
-- SAMPLE LEADS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Lead` (`id`, `uuid`, `name`, `email`, `mobile_no`, `whatsapp_no`, `property_type`, `interest_type`, `min_price`, `max_price`, `description`, `status_id`, `activity_source_id`, `assigned_to`, `company_id`, `created_by`, `created_at`) VALUES
(101, '550e8400-e29b-41d4-a716-446655440101', 'James Taylor', 'james.taylor@email.com', '+971511234500', '+971511234500', 'Villa', 'Rent', 100000.00, 150000.00, 'Looking for 4 bedroom villa in Al Reem Island', 103, 101, 103, 2, 102, NOW()),
(102, '550e8400-e29b-41d4-a716-446655440102', 'Isabella Garcia', 'isabella.garcia@email.com', '+971511234501', '+971511234501', 'Apartment', 'Buy', 2000000.00, 3500000.00, 'Interested in purchasing 3 bedroom apartment in Yas Island', 102, 102, 103, 2, 102, NOW());

-- ============================================================================
-- SAMPLE RENTAL CONTRACT - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `RentalContract` (`id`, `contract_no`, `contract_date`, `from_date`, `to_date`, `amount`, `security_amount`, `service_amount`, `payment_terms`, `grace_period`, `tentative_move_in`, `payment_method`, `vat_amount`, `management_fee`, `ejari_registered`, `ejari_number`, `ejari_registration_date`, `ejari_expiry_date`, `agent_commission`, `broker_commission`, `commission_paid`, `tenant_id`, `salesman_id`, `broker_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'RENT-2024-001', '2024-01-15', '2024-02-01', '2025-01-31', 85000.00, 85000.00, 5000.00, 'Monthly', '5 days', '2024-02-01', 'Cheque', 4250.00, 2000.00, true, 'EJ-2024-003', '2024-01-20', '2025-01-31', 2125.00, 0.00, true, 1, 3, NULL, 1, 2, NOW(), NOW());

INSERT IGNORE INTO `RentalContractunit` (`id`, `contract_id`, `unit_id`) VALUES
(1, 1, 3);

-- Update unit status to occupied - COMPANY 1
UPDATE `unit` SET `status` = 'occupied' WHERE `id` = 3;

-- ============================================================================
-- SAMPLE RENTAL CONTRACT - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `RentalContract` (`id`, `contract_no`, `contract_date`, `from_date`, `to_date`, `amount`, `security_amount`, `service_amount`, `payment_terms`, `grace_period`, `tentative_move_in`, `payment_method`, `vat_amount`, `management_fee`, `ejari_registered`, `ejari_number`, `ejari_registration_date`, `ejari_expiry_date`, `agent_commission`, `broker_commission`, `commission_paid`, `tenant_id`, `salesman_id`, `broker_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 'RENT-2024-101', '2024-01-20', '2024-03-01', '2025-02-28', 75000.00, 75000.00, 4500.00, 'Monthly', '5 days', '2024-03-01', 'Cheque', 3750.00, 1800.00, true, 'EJ-2024-103', '2024-01-25', '2025-02-28', 1875.00, 0.00, true, 102, 103, NULL, 2, 102, NOW(), NOW());

INSERT IGNORE INTO `RentalContractunit` (`id`, `contract_id`, `unit_id`) VALUES
(101, 101, 103);

-- Update unit status to occupied - COMPANY 2
UPDATE `unit` SET `status` = 'occupied' WHERE `id` = 103;

-- ============================================================================
-- SAMPLE TICKETS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Ticket` (`id`, `ticket_no`, `type_id`, `status_id`, `description`, `tenant_id`, `unit_id`, `assigned_to`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'TKT-2024-001', 1, 1, 'Leaking faucet in kitchen', 1, 3, 2, 1, 1, NOW(), NOW()),
(2, 'TKT-2024-002', 3, 2, 'AC not cooling properly', 1, 3, 2, 1, 1, NOW(), NOW());

-- ============================================================================
-- SAMPLE TICKETS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Ticket` (`id`, `ticket_no`, `type_id`, `status_id`, `description`, `tenant_id`, `unit_id`, `assigned_to`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 'TKT-2024-101', 101, 101, 'Water heater not working', 102, 103, 102, 2, 101, NOW(), NOW()),
(102, 'TKT-2024-102', 102, 102, 'Electrical outlet needs repair', 102, 103, 102, 2, 101, NOW(), NOW());

-- ============================================================================
-- SAMPLE ANNOUNCEMENTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Announcement` (`id`, `title`, `message`, `type`, `target_scope`, `is_active`, `start_date`, `end_date`, `company_id`, `created_by`, `created_at`) VALUES
(1, 'Welcome to Dubai Real Estate Management', 'Welcome to our property management system. Please ensure all documents are up to date.', 'info', 'all', true, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 1, NOW()),
(2, 'Maintenance Schedule', 'Scheduled maintenance will be conducted on February 15th, 2024. Please be prepared.', 'warning', 'all', true, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 1, NOW());

-- ============================================================================
-- SAMPLE ANNOUNCEMENTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Announcement` (`id`, `title`, `message`, `type`, `target_scope`, `is_active`, `start_date`, `end_date`, `company_id`, `created_by`, `created_at`) VALUES
(101, 'Welcome to Premium Properties LLC', 'Welcome to our premium property management system. We are committed to providing excellent service.', 'info', 'all', true, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 2, 101, NOW()),
(102, 'Community Event', 'Join us for the community gathering on March 1st, 2024 at the clubhouse.', 'info', 'all', true, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 2, 101, NOW());

-- ============================================================================
-- COMPANY SETTINGS
-- ============================================================================

INSERT IGNORE INTO `CompanySettings` (`id`, `company_id`, `logo_path`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_password`, `smtp_from_email`, `smtp_from_name`, `updated_at`) VALUES
(1, 1, '/uploads/logo.png', 'smtp.gmail.com', 587, 'noreply@realestate.com', 'password123', 'noreply@realestate.com', 'Dubai Real Estate Management', NOW()),
(2, 2, '/uploads/logo-premium.png', 'smtp.gmail.com', 587, 'noreply@premiumproperties.com', 'password123', 'noreply@premiumproperties.com', 'Premium Properties LLC', NOW());

-- ============================================================================
-- SESSIONS & OAUTH - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Session` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_type`, `device_name`, `is_active`, `expires_at`, `last_activity`, `created_at`) VALUES
(1, 1, 'session_token_001', '192.168.1.100', 'Mozilla/5.0', 'desktop', 'Chrome Browser', true, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()),
(2, 2, 'session_token_002', '192.168.1.101', 'Mozilla/5.0', 'mobile', 'Safari Mobile', true, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW());

INSERT IGNORE INTO `OAuthToken` (`id`, `user_id`, `access_token`, `refresh_token`, `expires_at`, `created_at`) VALUES
(1, 1, 'oauth_access_token_001', 'oauth_refresh_token_001', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW()),
(2, 2, 'oauth_access_token_002', 'oauth_refresh_token_002', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW());

INSERT IGNORE INTO `ProviderAccount` (`id`, `user_id`, `provider`, `provider_account_id`, `provider_email`, `provider_name`, `access_token`, `refresh_token`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'google', 'google_account_001', 'admin@realestate.com', 'Super Admin', 'google_access_token_001', 'google_refresh_token_001', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
(2, 2, 'microsoft', 'microsoft_account_001', 'ahmed.manager@realestate.com', 'Ahmed Al Maktoum', 'microsoft_access_token_001', 'microsoft_refresh_token_001', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW());

-- ============================================================================
-- SESSIONS & OAUTH - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Session` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_type`, `device_name`, `is_active`, `expires_at`, `last_activity`, `created_at`) VALUES
(101, 101, 'session_token_101', '192.168.1.200', 'Mozilla/5.0', 'desktop', 'Firefox Browser', true, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()),
(102, 102, 'session_token_102', '192.168.1.201', 'Mozilla/5.0', 'tablet', 'Safari Tablet', true, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW());

INSERT IGNORE INTO `OAuthToken` (`id`, `user_id`, `access_token`, `refresh_token`, `expires_at`, `created_at`) VALUES
(101, 101, 'oauth_access_token_101', 'oauth_refresh_token_101', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW()),
(102, 102, 'oauth_access_token_102', 'oauth_refresh_token_102', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW());

INSERT IGNORE INTO `ProviderAccount` (`id`, `user_id`, `provider`, `provider_account_id`, `provider_email`, `provider_name`, `access_token`, `refresh_token`, `expires_at`, `created_at`, `updated_at`) VALUES
(101, 101, 'google', 'google_account_101', 'admin@premiumproperties.com', 'Premium Admin', 'google_access_token_101', 'google_refresh_token_101', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
(102, 102, 'microsoft', 'microsoft_account_101', 'khalid.manager@premiumproperties.com', 'Khalid Al Suwaidi', 'microsoft_access_token_101', 'microsoft_refresh_token_101', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW());

-- ============================================================================
-- KYC DOCUMENTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KycDocument` (`id`, `tenant_id`, `landlord_id`, `doc_type_id`, `path`, `created_at`) VALUES
(1, 1, NULL, 1, '/uploads/kyc/tenant1_emirates_id.pdf', NOW()),
(2, 1, NULL, 2, '/uploads/kyc/tenant1_passport.pdf', NOW()),
(3, 2, NULL, 1, '/uploads/kyc/tenant2_emirates_id.pdf', NOW()),
(4, NULL, 1, 1, '/uploads/kyc/landlord1_emirates_id.pdf', NOW()),
(5, NULL, 1, 2, '/uploads/kyc/landlord1_passport.pdf', NOW());

-- ============================================================================
-- KYC DOCUMENTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KycDocument` (`id`, `tenant_id`, `landlord_id`, `doc_type_id`, `path`, `created_at`) VALUES
(101, 101, NULL, 101, '/uploads/kyc/tenant101_emirates_id.pdf', NOW()),
(102, 101, NULL, 102, '/uploads/kyc/tenant101_passport.pdf', NOW()),
(103, 102, NULL, 101, '/uploads/kyc/tenant102_emirates_id.pdf', NOW()),
(104, NULL, 101, 101, '/uploads/kyc/landlord101_emirates_id.pdf', NOW()),
(105, NULL, 101, 102, '/uploads/kyc/landlord101_passport.pdf', NOW());

-- ============================================================================
-- UNIT IMAGES & DOCUMENTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `UnitImage` (`id`, `unit_id`, `image_url`, `image_type`, `caption`, `display_order`, `is_primary`, `created_at`) VALUES
(1, 1, '/uploads/units/unit1_image1.jpg', 'interior', 'Living room view', 1, true, NOW()),
(2, 1, '/uploads/units/unit1_image2.jpg', 'interior', 'Bedroom view', 2, false, NOW()),
(3, 1, '/uploads/units/unit1_image3.jpg', 'exterior', 'Building facade', 3, false, NOW()),
(4, 2, '/uploads/units/unit2_image1.jpg', 'interior', 'Modern kitchen', 1, true, NOW()),
(5, 2, '/uploads/units/unit2_image2.jpg', 'interior', 'Master bedroom', 2, false, NOW()),
(6, 3, '/uploads/units/unit3_image1.jpg', 'interior', 'Luxury living space', 1, true, NOW());

INSERT IGNORE INTO `UnitDocument` (`id`, `unit_id`, `doc_type`, `document_url`, `document_name`, `expiry_date`, `created_at`) VALUES
(1, 1, 'ejari', '/uploads/documents/unit1_ejari.pdf', 'Ejari Certificate', '2025-12-31', NOW()),
(2, 1, 'dewa', '/uploads/documents/unit1_dewa.pdf', 'DEWA Bill', NULL, NOW()),
(3, 2, 'ejari', '/uploads/documents/unit2_ejari.pdf', 'Ejari Certificate', '2025-12-31', NOW()),
(4, 3, 'ejari', '/uploads/documents/unit3_ejari.pdf', 'Ejari Certificate', '2025-12-31', NOW());

-- ============================================================================
-- UNIT IMAGES & DOCUMENTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `UnitImage` (`id`, `unit_id`, `image_url`, `image_type`, `caption`, `display_order`, `is_primary`, `created_at`) VALUES
(101, 101, '/uploads/units/unit101_image1.jpg', 'exterior', 'Villa exterior', 1, true, NOW()),
(102, 101, '/uploads/units/unit101_image2.jpg', 'interior', 'Living room', 2, false, NOW()),
(103, 101, '/uploads/units/unit101_image3.jpg', 'interior', 'Pool area', 3, false, NOW()),
(104, 102, '/uploads/units/unit102_image1.jpg', 'interior', 'Apartment view', 1, true, NOW()),
(105, 103, '/uploads/units/unit103_image1.jpg', 'interior', 'Spacious living', 1, true, NOW());

INSERT IGNORE INTO `UnitDocument` (`id`, `unit_id`, `doc_type`, `document_url`, `document_name`, `expiry_date`, `created_at`) VALUES
(101, 101, 'ejari', '/uploads/documents/unit101_ejari.pdf', 'Ejari Certificate', '2025-12-31', NOW()),
(102, 101, 'adwea', '/uploads/documents/unit101_adwea.pdf', 'ADWEA Bill', NULL, NOW()),
(103, 102, 'ejari', '/uploads/documents/unit102_ejari.pdf', 'Ejari Certificate', '2025-12-31', NOW()),
(104, 103, 'ejari', '/uploads/documents/unit103_ejari.pdf', 'Ejari Certificate', '2025-12-31', NOW());

-- ============================================================================
-- SALES CONTRACTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `SalesContract` (`id`, `contract_no`, `contract_date`, `amount`, `service_amount`, `payment_terms`, `status`, `agent_commission`, `broker_commission`, `commission_paid`, `seller_id`, `buyer_id`, `salesman_id`, `broker_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'SALE-2024-001', '2024-01-10', 1800000.00, 50000.00, 'Installment', 'completed', 45000.00, 36000.00, true, 1, 2, 3, 1, 1, 2, NOW(), NOW());

INSERT IGNORE INTO `SalesContractunit` (`id`, `contract_id`, `unit_id`) VALUES
(1, 1, 2);

-- ============================================================================
-- SALES CONTRACTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `SalesContract` (`id`, `contract_no`, `contract_date`, `amount`, `service_amount`, `payment_terms`, `status`, `agent_commission`, `broker_commission`, `commission_paid`, `seller_id`, `buyer_id`, `salesman_id`, `broker_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 'SALE-2024-101', '2024-01-12', 2200000.00, 60000.00, 'Installment', 'completed', 55000.00, 44000.00, true, 101, 102, 103, 101, 2, 102, NOW(), NOW());

INSERT IGNORE INTO `SalesContractunit` (`id`, `contract_id`, `unit_id`) VALUES
(101, 101, 102);

-- ============================================================================
-- CONTRACT PARKING - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `ContractParking` (`id`, `contract_id`, `contract_type`, `parking_id`, `vehicle_id`) VALUES
(1, 1, 'rental', 1, 1),
(2, 1, 'rental', 2, NULL);

-- ============================================================================
-- CONTRACT PARKING - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `ContractParking` (`id`, `contract_id`, `contract_type`, `parking_id`, `vehicle_id`) VALUES
(101, 101, 'rental', 101, 101),
(102, 101, 'sales', 102, NULL);

-- ============================================================================
-- HANDOVER - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Handover` (`id`, `contract_id`, `contract_type`, `no_of_keys_given`, `no_of_cards_given`, `additional_details`, `date`, `created_at`) VALUES
(1, 1, 'rental', 2, 1, 'All keys and access card provided', '2024-02-01', NOW());

INSERT IGNORE INTO `HandoverDocument` (`id`, `handover_id`, `doc_type_id`, `path`, `created_at`) VALUES
(1, 1, 1, '/uploads/handover/handover1_emirates_id.pdf', NOW()),
(2, 1, 2, '/uploads/handover/handover1_passport.pdf', NOW());

-- ============================================================================
-- HANDOVER - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Handover` (`id`, `contract_id`, `contract_type`, `no_of_keys_given`, `no_of_cards_given`, `additional_details`, `date`, `created_at`) VALUES
(101, 101, 'rental', 3, 2, 'All keys and access cards provided', '2024-03-01', NOW());

INSERT IGNORE INTO `HandoverDocument` (`id`, `handover_id`, `doc_type_id`, `path`, `created_at`) VALUES
(101, 101, 101, '/uploads/handover/handover101_emirates_id.pdf', NOW()),
(102, 101, 102, '/uploads/handover/handover101_passport.pdf', NOW());

-- ============================================================================
-- INVOICES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Invoice` (`id`, `invoice_no`, `contract_id`, `contract_type`, `amount`, `due_date`, `status`, `created_at`) VALUES
(1, 'INV-2024-001', 1, 'rental', 85000.00, '2024-02-01', 'paid', NOW()),
(2, 'INV-2024-002', 1, 'rental', 85000.00, '2024-03-01', 'pending', NOW());

-- ============================================================================
-- INVOICES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Invoice` (`id`, `invoice_no`, `contract_id`, `contract_type`, `amount`, `due_date`, `status`, `created_at`) VALUES
(101, 'INV-2024-101', 101, 'rental', 75000.00, '2024-03-01', 'paid', NOW()),
(102, 'INV-2024-102', 101, 'rental', 75000.00, '2024-04-01', 'pending', NOW());

-- ============================================================================
-- RECEIPTS & PAYMENTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Receipt` (`id`, `receipt_no`, `date`, `contract_id`, `contract_type`, `invoice_id`, `company_id`, `created_by`, `created_at`) VALUES
(1, 'RCP-2024-001', '2024-02-01', 1, 'rental', 1, 1, 2, NOW()),
(2, 'RCP-2024-002', '2024-01-10', 1, 'sales', NULL, 1, 2, NOW());

INSERT IGNORE INTO `Payment` (`id`, `receipt_id`, `payment_type`, `amount_incl`, `status`, `instrument_no`, `description`, `returned_on`, `vat_amount`, `payment_under_id`, `created_at`) VALUES
(1, 1, 'Cheque', 85000.00, 'cleared', 'CHQ-001', 'Monthly rent payment', NULL, 4250.00, 1, NOW()),
(2, 1, 'Cash', 5000.00, 'received', NULL, 'Service charges', NULL, 250.00, 3, NOW()),
(3, 2, 'Bank Transfer', 1800000.00, 'cleared', 'TRF-001', 'Property purchase payment', NULL, 90000.00, NULL, NOW());

INSERT IGNORE INTO `Cheque` (`id`, `payment_id`, `date`, `is_deposited`, `is_received`, `deposited_on`, `cleared_on`, `bank_name`, `created_at`) VALUES
(1, 1, '2024-02-01', true, true, '2024-02-02', '2024-02-05', 'Emirates NBD', NOW());

-- ============================================================================
-- RECEIPTS & PAYMENTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Receipt` (`id`, `receipt_no`, `date`, `contract_id`, `contract_type`, `invoice_id`, `company_id`, `created_by`, `created_at`) VALUES
(101, 'RCP-2024-101', '2024-03-01', 101, 'rental', 101, 2, 102, NOW()),
(102, 'RCP-2024-102', '2024-01-12', 101, 'sales', NULL, 2, 102, NOW());

INSERT IGNORE INTO `Payment` (`id`, `receipt_id`, `payment_type`, `amount_incl`, `status`, `instrument_no`, `description`, `returned_on`, `vat_amount`, `payment_under_id`, `created_at`) VALUES
(101, 101, 'Cheque', 75000.00, 'cleared', 'CHQ-101', 'Monthly rent payment', NULL, 3750.00, 101, NOW()),
(102, 101, 'Cash', 4500.00, 'received', NULL, 'Service charges', NULL, 225.00, 103, NOW()),
(103, 102, 'Bank Transfer', 2200000.00, 'cleared', 'TRF-101', 'Property purchase payment', NULL, 110000.00, NULL, NOW());

INSERT IGNORE INTO `Cheque` (`id`, `payment_id`, `date`, `is_deposited`, `is_received`, `deposited_on`, `cleared_on`, `bank_name`, `created_at`) VALUES
(101, 101, '2024-03-01', true, true, '2024-03-02', '2024-03-05', 'First Abu Dhabi Bank', NOW());

-- ============================================================================
-- LEAD FOLLOWUPS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `LeadFollowup` (`id`, `uuid`, `lead_id`, `status_id`, `type_id`, `date`, `remarks`, `next_followup_date`, `company_id`, `created_by`, `created_at`) VALUES
(1, '550e8400-e29b-41d4-a716-446655440003', 1, 3, 1, NOW(), 'Initial contact made, interested in viewing properties', DATE_ADD(NOW(), INTERVAL 3 DAY), 1, 3, NOW()),
(2, '550e8400-e29b-41d4-a716-446655440004', 1, 4, 5, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Property viewing scheduled for next week', DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 3, NOW()),
(3, '550e8400-e29b-41d4-a716-446655440005', 2, 2, 2, NOW(), 'Sent property details via email', DATE_ADD(NOW(), INTERVAL 2 DAY), 1, 3, NOW());

-- ============================================================================
-- LEAD FOLLOWUPS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `LeadFollowup` (`id`, `uuid`, `lead_id`, `status_id`, `type_id`, `date`, `remarks`, `next_followup_date`, `company_id`, `created_by`, `created_at`) VALUES
(101, '550e8400-e29b-41d4-a716-446655440103', 101, 103, 101, NOW(), 'Initial contact made, very interested', DATE_ADD(NOW(), INTERVAL 2 DAY), 2, 103, NOW()),
(102, '550e8400-e29b-41d4-a716-446655440104', 101, 104, 105, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Villa viewing scheduled', DATE_ADD(NOW(), INTERVAL 5 DAY), 2, 103, NOW()),
(103, '550e8400-e29b-41d4-a716-446655440105', 102, 102, 102, NOW(), 'Property catalog sent', DATE_ADD(NOW(), INTERVAL 3 DAY), 2, 103, NOW());

-- ============================================================================
-- LEAD PREFERENCES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `LeadPreferredArea` (`id`, `lead_id`, `area_id`) VALUES
(1, 1, 2),
(2, 1, 4),
(3, 2, 1);

INSERT IGNORE INTO `LeadPreferredunitType` (`id`, `lead_id`, `unit_type_id`) VALUES
(1, 1, 3),
(2, 2, 4);

INSERT IGNORE INTO `LeadPreferredAmenity` (`id`, `lead_id`, `amenity_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 1),
(5, 2, 4);

-- ============================================================================
-- LEAD PREFERENCES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `LeadPreferredArea` (`id`, `lead_id`, `area_id`) VALUES
(101, 101, 101),
(102, 101, 103),
(103, 102, 102);

INSERT IGNORE INTO `LeadPreferredunitType` (`id`, `lead_id`, `unit_type_id`) VALUES
(101, 101, 105),
(102, 102, 104);

INSERT IGNORE INTO `LeadPreferredAmenity` (`id`, `lead_id`, `amenity_id`) VALUES
(101, 101, 101),
(102, 101, 102),
(103, 101, 103),
(104, 102, 101),
(105, 102, 104);

-- ============================================================================
-- REQUESTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Request` (`id`, `request_no`, `type_id`, `status_id`, `description`, `tenant_id`, `landlord_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'REQ-2024-001', 2, 1, 'Request for additional parking space', 1, NULL, 1, 1, NOW(), NOW()),
(2, 'REQ-2024-002', 3, 2, 'Access card request for new tenant', 1, NULL, 1, 1, NOW(), NOW()),
(3, 'REQ-2024-003', 4, 1, 'NOC request for renovation', NULL, 1, 1, 2, NOW(), NOW());

-- ============================================================================
-- REQUESTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Request` (`id`, `request_no`, `type_id`, `status_id`, `description`, `tenant_id`, `landlord_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 'REQ-2024-101', 102, 101, 'Request for parking space', 101, NULL, 2, 101, NOW(), NOW()),
(102, 'REQ-2024-102', 103, 102, 'Access card request', 102, NULL, 2, 101, NOW(), NOW()),
(103, 'REQ-2024-103', 104, 101, 'NOC request for modifications', NULL, 101, 2, 102, NOW(), NOW());

-- ============================================================================
-- TICKET COMMENTS & FOLLOWUPS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `TicketComment` (`id`, `ticket_id`, `comment`, `created_by`, `created_at`) VALUES
(1, 1, 'Technician assigned, will visit tomorrow', 2, NOW()),
(2, 1, 'Issue resolved, faucet replaced', 2, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(3, 2, 'HVAC technician scheduled for inspection', 2, NOW());

INSERT IGNORE INTO `TicketFollowup` (`id`, `ticket_id`, `remarks`, `status_id`, `created_by`, `created_at`) VALUES
(1, 1, 'Initial assessment completed', 2, 2, NOW()),
(2, 1, 'Repair work completed successfully', 4, 2, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(3, 2, 'AC unit inspected, needs parts replacement', 3, 2, NOW());

-- ============================================================================
-- TICKET COMMENTS & FOLLOWUPS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `TicketComment` (`id`, `ticket_id`, `comment`, `created_by`, `created_at`) VALUES
(101, 101, 'Plumber assigned, will fix today', 102, NOW()),
(102, 101, 'Water heater repaired successfully', 102, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(103, 102, 'Electrician scheduled for repair', 102, NOW());

INSERT IGNORE INTO `TicketFollowup` (`id`, `ticket_id`, `remarks`, `status_id`, `created_by`, `created_at`) VALUES
(101, 101, 'Initial inspection done', 102, 102, NOW()),
(102, 101, 'Repair completed', 104, 102, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(103, 102, 'Electrical work in progress', 102, 102, NOW());

-- ============================================================================
-- COMPLAINTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Complaint` (`id`, `complaint_no`, `type`, `title`, `description`, `status_id`, `tenant_id`, `landlord_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'CMP-2024-001', 'noise', 'Excessive noise from neighbors', 'Loud music playing late at night', 1, 1, NULL, 1, 1, NOW(), NOW()),
(2, 'CMP-2024-002', 'maintenance', 'Building maintenance issue', 'Elevator not working properly', 2, NULL, NULL, 1, 2, NOW(), NOW());

INSERT IGNORE INTO `ComplaintFollowup` (`id`, `complaint_id`, `remarks`, `status_id`, `created_by`, `created_at`) VALUES
(1, 1, 'Warning issued to neighbors', 2, 1, NOW()),
(2, 2, 'Elevator maintenance scheduled', 2, 2, NOW());

-- ============================================================================
-- COMPLAINTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Complaint` (`id`, `complaint_no`, `type`, `title`, `description`, `status_id`, `tenant_id`, `landlord_id`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 'CMP-2024-101', 'noise', 'Noise complaint', 'Construction noise during quiet hours', 1, 101, NULL, 2, 101, NOW(), NOW()),
(102, 'CMP-2024-102', 'security', 'Security concern', 'Security gate not functioning', 2, NULL, NULL, 2, 102, NOW(), NOW());

INSERT IGNORE INTO `ComplaintFollowup` (`id`, `complaint_id`, `remarks`, `status_id`, `created_by`, `created_at`) VALUES
(101, 101, 'Construction hours adjusted', 2, 101, NOW()),
(102, 102, 'Security gate repaired', 3, 102, NOW());

-- ============================================================================
-- RENTAL APPROVALS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `RentalApproval` (`id`, `request_no`, `unit_id`, `tenant_id`, `status`, `remarks`, `company_id`, `created_by`, `approved_by`, `created_at`, `updated_at`) VALUES
(1, 'APP-2024-001', 1, 1, 'approved', 'Tenant approved for Unit 101', 1, 2, 1, NOW(), NOW()),
(2, 'APP-2024-002', 4, 2, 'pending', 'Application under review', 1, 2, NULL, NOW(), NOW());

-- ============================================================================
-- RENTAL APPROVALS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `RentalApproval` (`id`, `request_no`, `unit_id`, `tenant_id`, `status`, `remarks`, `company_id`, `created_by`, `approved_by`, `created_at`, `updated_at`) VALUES
(101, 'APP-2024-101', 101, 101, 'approved', 'Tenant approved for Villa A1', 2, 102, 101, NOW(), NOW()),
(102, 'APP-2024-102', 102, 102, 'pending', 'Application pending review', 2, 102, NULL, NOW(), NOW());

-- ============================================================================
-- PROPERTY VIEWINGS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `PropertyViewing` (`id`, `unit_id`, `lead_id`, `tenant_id`, `viewer_name`, `viewer_email`, `viewer_phone`, `viewing_date`, `viewing_time`, `status`, `notes`, `feedback`, `rating`, `company_id`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'David Wilson', 'david.wilson@email.com', '+971501234500', DATE_ADD(NOW(), INTERVAL 7 DAY), '10:00', 'scheduled', 'First viewing scheduled', NULL, NULL, 1, 3, 3, NOW(), NOW()),
(2, 2, NULL, 1, 'John Smith', 'john.smith@email.com', '+971501111111', DATE_ADD(NOW(), INTERVAL 3 DAY), '14:00', 'scheduled', 'Tenant viewing for renewal', NULL, NULL, 1, 2, 2, NOW(), NOW());

-- ============================================================================
-- PROPERTY VIEWINGS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `PropertyViewing` (`id`, `unit_id`, `lead_id`, `tenant_id`, `viewer_name`, `viewer_email`, `viewer_phone`, `viewing_date`, `viewing_time`, `status`, `notes`, `feedback`, `rating`, `company_id`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 101, 101, NULL, 'James Taylor', 'james.taylor@email.com', '+971511234500', DATE_ADD(NOW(), INTERVAL 5 DAY), '11:00', 'scheduled', 'Villa viewing scheduled', NULL, NULL, 2, 103, 103, NOW(), NOW()),
(102, 102, NULL, 101, 'Michael Brown', 'michael.brown@email.com', '+971511111111', DATE_ADD(NOW(), INTERVAL 2 DAY), '15:00', 'scheduled', 'Tenant viewing', NULL, NULL, 2, 102, 102, NOW(), NOW());

-- ============================================================================
-- UNIT FAVORITES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `UnitFavorite` (`id`, `unit_id`, `user_id`, `lead_id`, `email`, `notes`, `created_at`) VALUES
(1, 1, NULL, 1, 'david.wilson@email.com', 'Interested in this property', NOW()),
(2, 2, 3, NULL, NULL, 'Agent favorite', NOW()),
(3, 3, NULL, NULL, 'sarah.j@email.com', 'Potential buyer', NOW());

-- ============================================================================
-- UNIT FAVORITES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `UnitFavorite` (`id`, `unit_id`, `user_id`, `lead_id`, `email`, `notes`, `created_at`) VALUES
(101, 101, NULL, 101, 'james.taylor@email.com', 'Very interested', NOW()),
(102, 102, 103, NULL, NULL, 'Agent recommendation', NOW()),
(103, 103, NULL, NULL, 'isabella.garcia@email.com', 'Potential rental', NOW());

-- ============================================================================
-- PROPERTY INSPECTIONS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `PropertyInspection` (`id`, `unit_id`, `contract_id`, `contract_type`, `inspection_type`, `inspection_date`, `inspector_name`, `inspector_notes`, `condition_rating`, `photos`, `defects_found`, `recommendations`, `company_id`, `created_by`, `created_at`) VALUES
(1, 3, 1, 'rental', 'move-in', '2024-02-01', 'Ahmed Al Maktoum', 'Property in good condition', 5, '/uploads/inspections/inspection1_photos.jpg', 'Minor scratches on wall', 'Touch up paint needed', 1, 2, NOW()),
(2, 1, NULL, NULL, 'routine', DATE_ADD(NOW(), INTERVAL 30 DAY), 'Ahmed Al Maktoum', 'Scheduled routine inspection', NULL, NULL, NULL, NULL, 1, 2, NOW());

-- ============================================================================
-- PROPERTY INSPECTIONS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `PropertyInspection` (`id`, `unit_id`, `contract_id`, `contract_type`, `inspection_type`, `inspection_date`, `inspector_name`, `inspector_notes`, `condition_rating`, `photos`, `defects_found`, `recommendations`, `company_id`, `created_by`, `created_at`) VALUES
(101, 103, 101, 'rental', 'move-in', '2024-03-01', 'Khalid Al Suwaidi', 'Property excellent condition', 5, '/uploads/inspections/inspection101_photos.jpg', 'None', 'No issues found', 2, 102, NOW()),
(102, 101, NULL, NULL, 'routine', DATE_ADD(NOW(), INTERVAL 30 DAY), 'Khalid Al Suwaidi', 'Scheduled inspection', NULL, NULL, NULL, NULL, 2, 102, NOW());

-- ============================================================================
-- PROPERTY VALUATIONS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `PropertyValuation` (`id`, `unit_id`, `valuation_type`, `estimated_rent`, `estimated_sale`, `valuation_date`, `valuer_name`, `valuer_notes`, `market_analysis`, `comparable_units`, `company_id`, `created_by`, `created_at`) VALUES
(1, 1, 'market', 45000.00, 1200000.00, NOW(), 'Ahmed Al Maktoum', 'Current market value assessment', 'Market is stable with good demand', 'Unit 201, Unit 102', 1, 2, NOW()),
(2, 2, 'rental', 65000.00, NULL, NOW(), 'Ahmed Al Maktoum', 'Rental valuation only', 'High rental demand in area', 'Unit 301, Unit 202', 1, 2, NOW());

-- ============================================================================
-- PROPERTY VALUATIONS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `PropertyValuation` (`id`, `unit_id`, `valuation_type`, `estimated_rent`, `estimated_sale`, `valuation_date`, `valuer_name`, `valuer_notes`, `market_analysis`, `comparable_units`, `company_id`, `created_by`, `created_at`) VALUES
(101, 101, 'market', 120000.00, 3500000.00, NOW(), 'Khalid Al Suwaidi', 'Premium villa valuation', 'Luxury market is strong', 'Villa B2', 2, 102, NOW()),
(102, 102, 'rental', 55000.00, NULL, NOW(), 'Khalid Al Suwaidi', 'Rental assessment', 'Good rental yield', 'Unit 301, Unit 101', 2, 102, NOW());

-- ============================================================================
-- PROPERTY INSURANCE - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `PropertyInsurance` (`id`, `unit_id`, `insurance_type`, `insurance_provider`, `policy_number`, `coverage_amount`, `premium_amount`, `start_date`, `end_date`, `renewal_date`, `is_active`, `documents`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'property', 'Emirates Insurance', 'POL-2024-001', 1200000.00, 12000.00, '2024-01-01', '2025-12-31', '2025-12-01', true, '/uploads/insurance/unit1_policy.pdf', 1, 2, NOW(), NOW()),
(2, 2, 'property', 'ADNIC', 'POL-2024-002', 1800000.00, 18000.00, '2024-01-01', '2025-12-31', '2025-12-01', true, '/uploads/insurance/unit2_policy.pdf', 1, 2, NOW(), NOW());

-- ============================================================================
-- PROPERTY INSURANCE - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `PropertyInsurance` (`id`, `unit_id`, `insurance_type`, `insurance_provider`, `policy_number`, `coverage_amount`, `premium_amount`, `start_date`, `end_date`, `renewal_date`, `is_active`, `documents`, `company_id`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 101, 'property', 'Abu Dhabi National Insurance', 'POL-2024-101', 3500000.00, 35000.00, '2024-01-01', '2025-12-31', '2025-12-01', true, '/uploads/insurance/unit101_policy.pdf', 2, 102, NOW(), NOW()),
(102, 102, 'property', 'Oman Insurance', 'POL-2024-102', 1600000.00, 16000.00, '2024-01-01', '2025-12-31', '2025-12-01', true, '/uploads/insurance/unit102_policy.pdf', 2, 102, NOW(), NOW());

-- ============================================================================
-- PROPERTY MAINTENANCE HISTORY - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `PropertyMaintenanceHistory` (`id`, `unit_id`, `maintenance_type`, `description`, `cost`, `vendor_name`, `maintenance_date`, `next_maintenance_date`, `documents`, `company_id`, `created_by`, `created_at`) VALUES
(1, 1, 'routine', 'AC servicing and cleaning', 500.00, 'Cool Air Services', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), '/uploads/maintenance/maintenance1_receipt.pdf', 1, 2, NOW()),
(2, 2, 'repair', 'Kitchen faucet replacement', 200.00, 'Quick Fix Plumbing', DATE_SUB(NOW(), INTERVAL 15 DAY), NULL, '/uploads/maintenance/maintenance2_receipt.pdf', 1, 2, NOW()),
(3, 3, 'routine', 'Deep cleaning and sanitization', 800.00, 'Clean Pro Services', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), '/uploads/maintenance/maintenance3_receipt.pdf', 1, 2, NOW());

-- ============================================================================
-- PROPERTY MAINTENANCE HISTORY - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `PropertyMaintenanceHistory` (`id`, `unit_id`, `maintenance_type`, `description`, `cost`, `vendor_name`, `maintenance_date`, `next_maintenance_date`, `documents`, `company_id`, `created_by`, `created_at`) VALUES
(101, 101, 'routine', 'Pool cleaning and maintenance', 1200.00, 'Aqua Pool Services', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), '/uploads/maintenance/maintenance101_receipt.pdf', 2, 102, NOW()),
(102, 102, 'repair', 'Electrical outlet repair', 150.00, 'Spark Electric', DATE_SUB(NOW(), INTERVAL 10 DAY), NULL, '/uploads/maintenance/maintenance102_receipt.pdf', 2, 102, NOW()),
(103, 103, 'routine', 'HVAC system maintenance', 600.00, 'Climate Control', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), '/uploads/maintenance/maintenance103_receipt.pdf', 2, 102, NOW());

-- ============================================================================
-- PROPERTY NOTIFICATIONS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `PropertyNotification` (`id`, `unit_id`, `user_id`, `notification_type`, `title`, `message`, `is_read`, `action_url`, `company_id`, `created_at`) VALUES
(1, 1, 1, 'maintenance', 'Maintenance Scheduled', 'AC servicing scheduled for next week', false, '/units/1', 1, NOW()),
(2, 3, 1, 'rent', 'Rent Due Reminder', 'Rent payment due in 5 days', false, '/contracts/1', 1, NOW()),
(3, NULL, 2, 'system', 'New Lead Assigned', 'New lead assigned to you', false, '/leads/1', 1, NOW());

-- ============================================================================
-- PROPERTY NOTIFICATIONS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `PropertyNotification` (`id`, `unit_id`, `user_id`, `notification_type`, `title`, `message`, `is_read`, `action_url`, `company_id`, `created_at`) VALUES
(101, 101, 101, 'maintenance', 'Maintenance Scheduled', 'Pool maintenance scheduled', false, '/units/101', 2, NOW()),
(102, 103, 101, 'rent', 'Rent Due Reminder', 'Rent payment due soon', false, '/contracts/101', 2, NOW()),
(103, NULL, 102, 'system', 'New Lead Assigned', 'New lead assigned to you', false, '/leads/101', 2, NOW());

-- ============================================================================
-- PROPERTY ANALYTICS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `PropertyAnalytics` (`id`, `unit_id`, `date`, `views_count`, `favorites_count`, `inquiries_count`, `viewings_count`, `offers_count`, `company_id`, `created_at`) VALUES
(1, 1, CURDATE(), 45, 12, 8, 3, 1, 1, NOW()),
(2, 2, CURDATE(), 38, 9, 6, 2, 0, 1, NOW()),
(3, 3, CURDATE(), 52, 15, 10, 4, 2, 1, NOW()),
(4, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 32, 8, 5, 2, 0, 1, NOW()),
(5, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 28, 6, 4, 1, 0, 1, NOW());

-- ============================================================================
-- PROPERTY ANALYTICS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `PropertyAnalytics` (`id`, `unit_id`, `date`, `views_count`, `favorites_count`, `inquiries_count`, `viewings_count`, `offers_count`, `company_id`, `created_at`) VALUES
(101, 101, CURDATE(), 62, 18, 12, 5, 2, 2, NOW()),
(102, 102, CURDATE(), 48, 11, 7, 3, 1, 2, NOW()),
(103, 103, CURDATE(), 55, 14, 9, 4, 1, 2, NOW()),
(104, 101, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 45, 12, 8, 3, 1, 2, NOW()),
(105, 102, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 35, 9, 6, 2, 0, 2, NOW());

-- ============================================================================
-- LEAD ROUTING RULES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `LeadRoutingRule` (`id`, `company_id`, `rule_name`, `priority`, `is_active`, `conditions`, `assignment_type`, `assigned_user_id`, `assigned_role_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Dubai Marina Leads', 1, true, '{"area": "Dubai Marina", "property_type": "Apartment"}', 'user', 3, NULL, NOW(), NOW()),
(2, 1, 'High Value Leads', 2, true, '{"min_price": {"$gte": 2000000}}', 'role', NULL, 3, NOW(), NOW()),
(3, 1, 'Website Leads', 3, true, '{"activity_source": "Website"}', 'user', 4, NULL, NOW(), NOW());

-- ============================================================================
-- LEAD ROUTING RULES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `LeadRoutingRule` (`id`, `company_id`, `rule_name`, `priority`, `is_active`, `conditions`, `assignment_type`, `assigned_user_id`, `assigned_role_id`, `created_at`, `updated_at`) VALUES
(101, 2, 'Villa Leads', 1, true, '{"property_type": "Villa"}', 'user', 103, NULL, NOW(), NOW()),
(102, 2, 'Premium Leads', 2, true, '{"min_price": {"$gte": 3000000}}', 'role', NULL, 103, NOW(), NOW()),
(103, 2, 'Phone Call Leads', 3, true, '{"activity_source": "Phone Call"}', 'user', 104, NULL, NOW(), NOW());

-- ============================================================================
-- LEAD PIPELINES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `LeadPipeline` (`id`, `company_id`, `name`, `stages`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Standard Sales Pipeline', '["New", "Contacted", "Qualified", "Viewing Scheduled", "Offer Made", "Converted"]', true, true, NOW(), NOW()),
(2, 1, 'Rental Pipeline', '["New", "Contacted", "Qualified", "Viewing Scheduled", "Approved", "Converted"]', false, true, NOW(), NOW());

-- ============================================================================
-- LEAD PIPELINES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `LeadPipeline` (`id`, `company_id`, `name`, `stages`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 2, 'Premium Sales Pipeline', '["New", "Contacted", "Qualified", "Viewing Scheduled", "Offer Made", "Converted"]', true, true, NOW(), NOW()),
(102, 2, 'Luxury Rental Pipeline', '["New", "Contacted", "Qualified", "Viewing Scheduled", "Approved", "Converted"]', false, true, NOW(), NOW());

-- ============================================================================
-- AUTOMATION RULES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `AutomationRule` (`id`, `company_id`, `name`, `trigger_type`, `trigger_conditions`, `action_type`, `template_id`, `schedule_delay`, `schedule_unit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Welcome Email for New Leads', 'lead_created', '{"status": "New"}', 'send_email', 1, 0, 'minutes', true, NOW(), NOW()),
(2, 1, 'Follow-up Reminder', 'lead_updated', '{"status": "Contacted"}', 'send_email', 2, 3, 'days', true, NOW(), NOW()),
(3, 1, 'Contract Expiry Reminder', 'contract_expiring', '{"days_before": 30}', 'send_email', 3, 30, 'days', true, NOW(), NOW());

-- ============================================================================
-- AUTOMATION RULES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `AutomationRule` (`id`, `company_id`, `name`, `trigger_type`, `trigger_conditions`, `action_type`, `template_id`, `schedule_delay`, `schedule_unit`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 2, 'Welcome Email for New Leads', 'lead_created', '{"status": "New"}', 'send_email', 101, 0, 'minutes', true, NOW(), NOW()),
(102, 2, 'Follow-up Reminder', 'lead_updated', '{"status": "Contacted"}', 'send_email', 102, 2, 'days', true, NOW(), NOW()),
(103, 2, 'Contract Expiry Reminder', 'contract_expiring', '{"days_before": 30}', 'send_email', 103, 30, 'days', true, NOW(), NOW());

-- ============================================================================
-- MESSAGE TEMPLATES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `MessageTemplate` (`id`, `company_id`, `type`, `name`, `subject`, `body`, `variables`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'email', 'Welcome Email', 'Welcome to Dubai Real Estate Management', 'Dear {{name}},\n\nThank you for your interest in our properties. We will contact you soon.\n\nBest regards,\nDubai Real Estate Management', '{"name": "string"}', true, NOW(), NOW()),
(2, 1, 'email', 'Follow-up Reminder', 'Property Inquiry Follow-up', 'Dear {{name}},\n\nWe wanted to follow up on your property inquiry. Please let us know if you have any questions.\n\nBest regards,\nDubai Real Estate Management', '{"name": "string"}', true, NOW(), NOW()),
(3, 1, 'email', 'Contract Expiry', 'Contract Expiry Reminder', 'Dear {{tenant_name}},\n\nYour rental contract will expire on {{expiry_date}}. Please contact us to discuss renewal.\n\nBest regards,\nDubai Real Estate Management', '{"tenant_name": "string", "expiry_date": "date"}', true, NOW(), NOW()),
(4, 1, 'sms', 'Viewing Reminder', 'Property Viewing Reminder', 'Reminder: Your property viewing is scheduled for {{viewing_date}} at {{viewing_time}}.', '{"viewing_date": "date", "viewing_time": "string"}', true, NOW(), NOW());

-- ============================================================================
-- MESSAGE TEMPLATES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `MessageTemplate` (`id`, `company_id`, `type`, `name`, `subject`, `body`, `variables`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 2, 'email', 'Welcome Email', 'Welcome to Premium Properties LLC', 'Dear {{name}},\n\nThank you for your interest in our premium properties. We will contact you shortly.\n\nBest regards,\nPremium Properties LLC', '{"name": "string"}', true, NOW(), NOW()),
(102, 2, 'email', 'Follow-up Reminder', 'Property Inquiry Follow-up', 'Dear {{name}},\n\nFollowing up on your property inquiry. We are here to assist you.\n\nBest regards,\nPremium Properties LLC', '{"name": "string"}', true, NOW(), NOW()),
(103, 2, 'email', 'Contract Expiry', 'Contract Expiry Reminder', 'Dear {{tenant_name}},\n\nYour rental contract expires on {{expiry_date}}. Please contact us for renewal options.\n\nBest regards,\nPremium Properties LLC', '{"tenant_name": "string", "expiry_date": "date"}', true, NOW(), NOW()),
(104, 2, 'sms', 'Viewing Reminder', 'Property Viewing Reminder', 'Reminder: Your viewing is on {{viewing_date}} at {{viewing_time}}.', '{"viewing_date": "date", "viewing_time": "string"}', true, NOW(), NOW());

-- ============================================================================
-- MICROSITES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Microsite` (`id`, `unit_id`, `company_id`, `slug`, `template_id`, `seo_title`, `seo_description`, `seo_keywords`, `custom_css`, `custom_js`, `is_published`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'burj-khalifa-unit-101', NULL, 'Luxury 1 Bedroom Apartment in Burj Khalifa', 'Spacious 1 bedroom apartment with city view in Burj Khalifa', 'burj khalifa, apartment, dubai, luxury', NULL, NULL, true, NOW(), NOW(), NOW()),
(2, 3, 1, 'burj-khalifa-unit-301', NULL, 'Premium 3 Bedroom Apartment in Burj Khalifa', 'Luxury 3 bedroom apartment with panoramic views', 'burj khalifa, apartment, dubai, premium', NULL, NULL, true, NOW(), NOW(), NOW());

-- ============================================================================
-- MICROSITES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Microsite` (`id`, `unit_id`, `company_id`, `slug`, `template_id`, `seo_title`, `seo_description`, `seo_keywords`, `custom_css`, `custom_js`, `is_published`, `published_at`, `created_at`, `updated_at`) VALUES
(101, 101, 2, 'al-reem-villa-a1', NULL, 'Luxury 4 Bedroom Villa in Al Reem Island', 'Luxury 4 bedroom villa with private pool', 'al reem island, villa, abu dhabi, luxury', NULL, NULL, true, NOW(), NOW(), NOW()),
(102, 104, 2, 'saadiyat-villa-b2', NULL, 'Premium 5 Bedroom Beachfront Villa', 'Premium 5 bedroom beachfront villa in Saadiyat Island', 'saadiyat island, villa, beachfront, premium', NULL, NULL, true, NOW(), NOW(), NOW());

-- ============================================================================
-- MICROSITE TEMPLATES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `MicrositeTemplate` (`id`, `company_id`, `name`, `description`, `template_html`, `template_css`, `template_js`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Modern Property Template', 'Modern and clean template for property listings', '<div class="property-template"><h1>{{unit_name}}</h1><p>{{description}}</p></div>', '.property-template { font-family: Arial; }', 'console.log("Property loaded");', true, true, NOW(), NOW()),
(2, 1, 'Luxury Property Template', 'Premium template for luxury properties', '<div class="luxury-template"><h1>{{unit_name}}</h1><p>{{description}}</p></div>', '.luxury-template { font-family: Georgia; }', 'console.log("Luxury property loaded");', false, true, NOW(), NOW());

-- ============================================================================
-- MICROSITE TEMPLATES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `MicrositeTemplate` (`id`, `company_id`, `name`, `description`, `template_html`, `template_css`, `template_js`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 2, 'Premium Property Template', 'Premium template for high-end properties', '<div class="premium-template"><h1>{{unit_name}}</h1><p>{{description}}</p></div>', '.premium-template { font-family: Helvetica; }', 'console.log("Premium property loaded");', true, true, NOW(), NOW()),
(102, 2, 'Villa Showcase Template', 'Special template for villa listings', '<div class="villa-template"><h1>{{unit_name}}</h1><p>{{description}}</p></div>', '.villa-template { font-family: Times; }', 'console.log("Villa loaded");', false, true, NOW(), NOW());

-- ============================================================================
-- ATTENDANCE - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Attendance` (`id`, `user_id`, `company_id`, `date`, `check_in_time`, `check_out_time`, `check_in_latitude`, `check_in_longitude`, `check_out_latitude`, `check_out_longitude`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 9 HOUR), DATE_ADD(CURDATE(), INTERVAL 18 HOUR), 25.1972, 55.2744, 25.1972, 55.2744, 'present', 'On time', NOW(), NOW()),
(2, 3, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 9 HOUR), NULL, 25.1972, 55.2744, NULL, NULL, 'present', 'Checked in', NOW(), NOW()),
(3, 2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 DAY), INTERVAL 9 HOUR), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 DAY), INTERVAL 18 HOUR), 25.1972, 55.2744, 25.1972, 55.2744, 'present', NULL, NOW(), NOW());

-- ============================================================================
-- ATTENDANCE - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Attendance` (`id`, `user_id`, `company_id`, `date`, `check_in_time`, `check_out_time`, `check_in_latitude`, `check_in_longitude`, `check_out_latitude`, `check_out_longitude`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(101, 102, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 9 HOUR), DATE_ADD(CURDATE(), INTERVAL 18 HOUR), 24.5200, 54.4200, 24.5200, 54.4200, 'present', 'On time', NOW(), NOW()),
(102, 103, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 9 HOUR), NULL, 24.5300, 54.6000, NULL, NULL, 'present', 'Checked in', NOW(), NOW()),
(103, 102, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 DAY), INTERVAL 9 HOUR), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 DAY), INTERVAL 18 HOUR), 24.5200, 54.4200, 24.5200, 54.4200, 'present', NULL, NOW(), NOW());

-- ============================================================================
-- USER ACTIVITIES - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `UserActivity` (`id`, `user_id`, `company_id`, `date`, `activity_type`, `description`, `duration_minutes`, `metadata`, `created_at`) VALUES
(1, 2, 1, CURDATE(), 'property_view', 'Viewed property listings', 30, '{"properties_viewed": 5}', NOW()),
(2, 3, 1, CURDATE(), 'lead_contact', 'Contacted 3 leads', 45, '{"leads_contacted": 3}', NOW()),
(3, 2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'contract_creation', 'Created rental contract', 60, '{"contract_id": 1}', NOW()),
(4, 3, 1, CURDATE(), 'property_showing', 'Conducted property viewing', 90, '{"viewing_id": 1}', NOW());

-- ============================================================================
-- USER ACTIVITIES - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `UserActivity` (`id`, `user_id`, `company_id`, `date`, `activity_type`, `description`, `duration_minutes`, `metadata`, `created_at`) VALUES
(101, 102, 2, CURDATE(), 'property_view', 'Viewed property listings', 25, '{"properties_viewed": 4}', NOW()),
(102, 103, 2, CURDATE(), 'lead_contact', 'Contacted 2 leads', 35, '{"leads_contacted": 2}', NOW()),
(103, 102, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'contract_creation', 'Created rental contract', 55, '{"contract_id": 101}', NOW()),
(104, 103, 2, CURDATE(), 'property_showing', 'Conducted villa viewing', 120, '{"viewing_id": 101}', NOW());

-- ============================================================================
-- KANBAN BOARDS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KanbanBoard` (`id`, `company_id`, `name`, `description`, `board_type`, `is_template`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Lead Management Board', 'Board for managing leads through pipeline', 'leads', false, true, 2, NOW(), NOW()),
(2, 1, 'Property Management Board', 'Board for property-related tasks', 'properties', false, true, 2, NOW(), NOW());

-- ============================================================================
-- KANBAN BOARDS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KanbanBoard` (`id`, `company_id`, `name`, `description`, `board_type`, `is_template`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 2, 'Lead Management Board', 'Board for managing leads', 'leads', false, true, 102, NOW(), NOW()),
(102, 2, 'Property Management Board', 'Board for property tasks', 'properties', false, true, 102, NOW(), NOW());

-- ============================================================================
-- KANBAN COLUMNS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KanbanColumn` (`id`, `board_id`, `name`, `position`, `color`, `is_done`, `wip_limit`, `created_at`, `updated_at`) VALUES
(1, 1, 'New Leads', 0, '#3b82f6', false, NULL, NOW(), NOW()),
(2, 1, 'Contacted', 1, '#10b981', false, NULL, NOW(), NOW()),
(3, 1, 'Qualified', 2, '#f59e0b', false, NULL, NOW(), NOW()),
(4, 1, 'Converted', 3, '#8b5cf6', true, NULL, NOW(), NOW()),
(5, 2, 'Open', 0, '#ef4444', false, NULL, NOW(), NOW()),
(6, 2, 'In Progress', 1, '#f59e0b', false, 5, NOW(), NOW()),
(7, 2, 'Completed', 2, '#10b981', true, NULL, NOW(), NOW());

-- ============================================================================
-- KANBAN COLUMNS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KanbanColumn` (`id`, `board_id`, `name`, `position`, `color`, `is_done`, `wip_limit`, `created_at`, `updated_at`) VALUES
(101, 101, 'New Leads', 0, '#3b82f6', false, NULL, NOW(), NOW()),
(102, 101, 'Contacted', 1, '#10b981', false, NULL, NOW(), NOW()),
(103, 101, 'Qualified', 2, '#f59e0b', false, NULL, NOW(), NOW()),
(104, 101, 'Converted', 3, '#8b5cf6', true, NULL, NOW(), NOW()),
(105, 102, 'Open', 0, '#ef4444', false, NULL, NOW(), NOW()),
(106, 102, 'In Progress', 1, '#f59e0b', false, 5, NOW(), NOW()),
(107, 102, 'Completed', 2, '#10b981', true, NULL, NOW(), NOW());

-- ============================================================================
-- KANBAN CARDS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KanbanCard` (`id`, `board_id`, `column_id`, `title`, `description`, `card_type`, `entity_id`, `entity_type`, `assigned_to`, `priority`, `due_date`, `position`, `is_archived`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'New Lead: David Wilson', 'Looking for 2 bedroom apartment', 'lead', 1, 'Lead', 3, 'high', DATE_ADD(NOW(), INTERVAL 3 DAY), 0, false, 2, NOW(), NOW()),
(2, 1, 2, 'Lead: Emma Brown', 'Interested in purchasing', 'lead', 2, 'Lead', 3, 'medium', DATE_ADD(NOW(), INTERVAL 5 DAY), 0, false, 2, NOW(), NOW()),
(3, 2, 5, 'Property Maintenance: Unit 1', 'AC servicing required', 'property', 1, 'Unit', 2, 'medium', DATE_ADD(NOW(), INTERVAL 7 DAY), 0, false, 2, NOW(), NOW());

-- ============================================================================
-- KANBAN CARDS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KanbanCard` (`id`, `board_id`, `column_id`, `title`, `description`, `card_type`, `entity_id`, `entity_type`, `assigned_to`, `priority`, `due_date`, `position`, `is_archived`, `created_by`, `created_at`, `updated_at`) VALUES
(101, 101, 101, 'New Lead: James Taylor', 'Looking for 4 bedroom villa', 'lead', 101, 'Lead', 103, 'high', DATE_ADD(NOW(), INTERVAL 2 DAY), 0, false, 102, NOW(), NOW()),
(102, 101, 102, 'Lead: Isabella Garcia', 'Interested in apartment', 'lead', 102, 'Lead', 103, 'medium', DATE_ADD(NOW(), INTERVAL 4 DAY), 0, false, 102, NOW(), NOW()),
(103, 102, 105, 'Property Maintenance: Villa A1', 'Pool maintenance needed', 'property', 101, 'Unit', 102, 'medium', DATE_ADD(NOW(), INTERVAL 6 DAY), 0, false, 102, NOW(), NOW());

-- ============================================================================
-- KANBAN CARD COMMENTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KanbanCardComment` (`id`, `card_id`, `user_id`, `comment`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'Initial contact made, very interested', NOW(), NOW()),
(2, 1, 2, 'Schedule property viewing', DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 1 HOUR)),
(3, 3, 2, 'Technician assigned', NOW(), NOW());

-- ============================================================================
-- KANBAN CARD COMMENTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KanbanCardComment` (`id`, `card_id`, `user_id`, `comment`, `created_at`, `updated_at`) VALUES
(101, 101, 103, 'Initial contact established', NOW(), NOW()),
(102, 101, 102, 'Schedule villa viewing', DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 1 HOUR)),
(103, 103, 102, 'Pool service scheduled', NOW(), NOW());

-- ============================================================================
-- KANBAN CARD ATTACHMENTS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KanbanCardAttachment` (`id`, `card_id`, `file_name`, `file_url`, `file_type`, `file_size`, `uploaded_by`, `created_at`) VALUES
(1, 1, 'lead_details.pdf', '/uploads/kanban/lead1_details.pdf', 'application/pdf', 245760, 3, NOW()),
(2, 3, 'maintenance_report.pdf', '/uploads/kanban/maintenance_report.pdf', 'application/pdf', 512000, 2, NOW());

-- ============================================================================
-- KANBAN CARD ATTACHMENTS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KanbanCardAttachment` (`id`, `card_id`, `file_name`, `file_url`, `file_type`, `file_size`, `uploaded_by`, `created_at`) VALUES
(101, 101, 'lead_details.pdf', '/uploads/kanban/lead101_details.pdf', 'application/pdf', 245760, 103, NOW()),
(102, 103, 'maintenance_report.pdf', '/uploads/kanban/maintenance_report101.pdf', 'application/pdf', 512000, 102, NOW());

-- ============================================================================
-- KANBAN LABELS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KanbanLabel` (`id`, `board_id`, `company_id`, `name`, `color`, `created_at`) VALUES
(1, 1, 1, 'High Priority', '#ef4444', NOW()),
(2, 1, 1, 'Follow-up', '#f59e0b', NOW()),
(3, 1, 1, 'Qualified', '#10b981', NOW()),
(4, 2, 1, 'Urgent', '#ef4444', NOW()),
(5, 2, 1, 'Routine', '#3b82f6', NOW());

-- ============================================================================
-- KANBAN LABELS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KanbanLabel` (`id`, `board_id`, `company_id`, `name`, `color`, `created_at`) VALUES
(101, 101, 2, 'High Priority', '#ef4444', NOW()),
(102, 101, 2, 'Follow-up', '#f59e0b', NOW()),
(103, 101, 2, 'Qualified', '#10b981', NOW()),
(104, 102, 2, 'Urgent', '#ef4444', NOW()),
(105, 102, 2, 'Routine', '#3b82f6', NOW());

-- ============================================================================
-- KANBAN CARD LABELS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `KanbanCardLabel` (`id`, `card_id`, `label_id`, `created_at`) VALUES
(1, 1, 1, NOW()),
(2, 1, 2, NOW()),
(3, 2, 3, NOW()),
(4, 3, 4, NOW());

-- ============================================================================
-- KANBAN CARD LABELS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `KanbanCardLabel` (`id`, `card_id`, `label_id`, `created_at`) VALUES
(101, 101, 101, NOW()),
(102, 101, 102, NOW()),
(103, 102, 103, NOW()),
(104, 103, 104, NOW());

-- ============================================================================
-- AD CAMPAIGNS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `AdCampaign` (`id`, `company_id`, `campaign_name`, `source`, `start_date`, `end_date`, `budget`, `spent`, `leads_count`, `conversions`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Dubai Marina Properties', 'Google Ads', '2024-01-01', '2024-12-31', 50000.00, 12500.00, 45, 8, true, NOW(), NOW()),
(2, 1, 'Luxury Apartments Campaign', 'Facebook Ads', '2024-01-15', '2024-06-30', 30000.00, 8500.00, 32, 5, true, NOW(), NOW());

-- ============================================================================
-- AD CAMPAIGNS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `AdCampaign` (`id`, `company_id`, `campaign_name`, `source`, `start_date`, `end_date`, `budget`, `spent`, `leads_count`, `conversions`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 2, 'Premium Villas Campaign', 'Google Ads', '2024-01-01', '2024-12-31', 75000.00, 18000.00, 38, 6, true, NOW(), NOW()),
(102, 2, 'Luxury Properties', 'Instagram Ads', '2024-02-01', '2024-08-31', 40000.00, 9500.00, 28, 4, true, NOW(), NOW());

-- ============================================================================
-- INTEGRATIONS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Integration` (`id`, `company_id`, `integration_type`, `api_key`, `api_secret`, `access_token`, `refresh_token`, `config`, `is_active`, `last_sync_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'google_calendar', 'google_api_key_001', 'google_api_secret_001', 'google_access_token_001', 'google_refresh_token_001', '{"calendar_id": "primary"}', true, NOW(), NOW(), NOW()),
(2, 1, 'whatsapp_business', 'whatsapp_api_key_001', 'whatsapp_api_secret_001', 'whatsapp_access_token_001', NULL, '{"phone_number": "+971501234567"}', true, DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW(), NOW());

-- ============================================================================
-- INTEGRATIONS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Integration` (`id`, `company_id`, `integration_type`, `api_key`, `api_secret`, `access_token`, `refresh_token`, `config`, `is_active`, `last_sync_at`, `created_at`, `updated_at`) VALUES
(101, 2, 'google_calendar', 'google_api_key_101', 'google_api_secret_101', 'google_access_token_101', 'google_refresh_token_101', '{"calendar_id": "primary"}', true, NOW(), NOW(), NOW()),
(102, 2, 'whatsapp_business', 'whatsapp_api_key_101', 'whatsapp_api_secret_101', 'whatsapp_access_token_101', NULL, '{"phone_number": "+971502234567"}', true, DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW(), NOW());

-- ============================================================================
-- WEBHOOKS - COMPANY 1
-- ============================================================================

INSERT IGNORE INTO `Webhook` (`id`, `company_id`, `integration_id`, `event_type`, `url`, `secret`, `is_active`, `last_triggered_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'lead_created', 'https://webhook.example.com/leads', 'webhook_secret_001', true, DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW(), NOW()),
(2, 1, 1, 'contract_created', 'https://webhook.example.com/contracts', 'webhook_secret_002', true, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()),
(3, 1, 2, 'lead_status_changed', 'https://webhook.example.com/lead-status', 'webhook_secret_003', true, NULL, NOW(), NOW());

-- ============================================================================
-- WEBHOOKS - COMPANY 2
-- ============================================================================

INSERT IGNORE INTO `Webhook` (`id`, `company_id`, `integration_id`, `event_type`, `url`, `secret`, `is_active`, `last_triggered_at`, `created_at`, `updated_at`) VALUES
(101, 2, 101, 'lead_created', 'https://webhook.example.com/leads-premium', 'webhook_secret_101', true, DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW(), NOW()),
(102, 2, 101, 'contract_created', 'https://webhook.example.com/contracts-premium', 'webhook_secret_102', true, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()),
(103, 2, 102, 'lead_status_changed', 'https://webhook.example.com/lead-status-premium', 'webhook_secret_103', true, NULL, NOW(), NOW());

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Sample Data Insertion Complete!
-- ============================================================================
-- 
-- Summary of inserted data:
--
-- COMPANY 1 (Dubai Real Estate Management):
-- - 4 Users (1 Admin, 1 Manager, 2 Agents)
-- - 5 Roles with permissions
-- - 2 Sessions, 2 OAuth Tokens, 2 Provider Accounts
-- - 1 Country, 2 States, 6 Areas (Dubai locations)
-- - 2 Emirates, 4 Neighbourhoods, 4 Clusters, 4 Buildings, 2 Building_LVL1, 2 Building_LVL2 (Location hierarchy)
-- - 4 Buildings (linked to Locations), 10 Floors
-- - 5 Units with amenities (Dubai properties)
-- - 6 Unit Images, 4 Unit Documents
-- - 3 Tenants, 2 Landlords
-- - 5 KYC Documents
-- - 3 Brokers
-- - 1 Rental Contract, 1 Sales Contract
-- - 2 Contract Parking, 1 Handover, 2 Handover Documents
-- - 2 Invoices, 2 Receipts, 3 Payments, 1 Cheque
-- - Master data for Leads, Tickets, Requests, Complaints
-- - 2 Sample Leads, 3 Lead Followups
-- - 3 Lead Preferred Areas, 2 Lead Preferred Unit Types, 5 Lead Preferred Amenities
-- - 3 Requests
-- - 2 Sample Tickets, 3 Ticket Comments, 3 Ticket Followups
-- - 2 Complaints, 2 Complaint Followups
-- - 2 Rental Approvals
-- - 2 Property Viewings, 3 Unit Favorites
-- - 2 Property Inspections, 2 Property Valuations
-- - 2 Property Insurance policies
-- - 3 Property Maintenance History records
-- - 3 Property Notifications
-- - 5 Property Analytics records
-- - 3 Lead Routing Rules, 2 Lead Pipelines
-- - 3 Automation Rules, 4 Message Templates
-- - 2 Microsites, 2 Microsite Templates
-- - 3 Attendance records, 4 User Activities
-- - 2 Kanban Boards, 7 Kanban Columns, 3 Kanban Cards
-- - 3 Kanban Card Comments, 2 Kanban Card Attachments
-- - 5 Kanban Labels, 4 Kanban Card Labels
-- - 2 Ad Campaigns
-- - 2 Integrations, 3 Webhooks
-- - 2 Sample Announcements
--
-- COMPANY 2 (Premium Properties LLC):
-- - 4 Users (1 Admin, 1 Manager, 2 Agents)
-- - 5 Roles with permissions
-- - 2 Sessions, 2 OAuth Tokens, 2 Provider Accounts
-- - 1 Country, 2 States, 5 Areas (Abu Dhabi & Sharjah locations)
-- - 2 Emirates, 4 Neighbourhoods, 4 Clusters, 4 Buildings, 2 Building_LVL1, 2 Building_LVL2 (Location hierarchy)
-- - 4 Buildings (linked to Locations), 10 Floors
-- - 5 Units with amenities (Abu Dhabi & Sharjah properties)
-- - 5 Unit Images, 4 Unit Documents
-- - 3 Tenants, 2 Landlords
-- - 5 KYC Documents
-- - 3 Brokers
-- - 1 Rental Contract, 1 Sales Contract
-- - 2 Contract Parking, 1 Handover, 2 Handover Documents
-- - 2 Invoices, 2 Receipts, 3 Payments, 1 Cheque
-- - Master data for Leads, Tickets, Requests, Complaints
-- - 2 Sample Leads, 3 Lead Followups
-- - 3 Lead Preferred Areas, 2 Lead Preferred Unit Types, 5 Lead Preferred Amenities
-- - 3 Requests
-- - 2 Sample Tickets, 3 Ticket Comments, 3 Ticket Followups
-- - 2 Complaints, 2 Complaint Followups
-- - 2 Rental Approvals
-- - 2 Property Viewings, 3 Unit Favorites
-- - 2 Property Inspections, 2 Property Valuations
-- - 2 Property Insurance policies
-- - 3 Property Maintenance History records
-- - 3 Property Notifications
-- - 5 Property Analytics records
-- - 3 Lead Routing Rules, 2 Lead Pipelines
-- - 3 Automation Rules, 4 Message Templates
-- - 2 Microsites, 2 Microsite Templates
-- - 3 Attendance records, 4 User Activities
-- - 2 Kanban Boards, 7 Kanban Columns, 3 Kanban Cards
-- - 3 Kanban Card Comments, 2 Kanban Card Attachments
-- - 5 Kanban Labels, 4 Kanban Card Labels
-- - 2 Ad Campaigns
-- - 2 Integrations, 3 Webhooks
-- - 2 Sample Announcements
--
-- Default Login Credentials:
--   Company 1:
--     Email: admin@realestate.com
--     Password: admin123
--
--   Company 2:
--     Email: admin@premiumproperties.com
--     Password: admin123
--
-- DATA ISOLATION TESTING:
-- - Login with Company 1 user → See only Company 1 data
-- - Login with Company 2 user → See only Company 2 data
-- - Cross-company access is completely blocked
--
-- ============================================================================

