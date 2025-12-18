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
-- - 1 Country, 2 States, 6 Areas (Dubai locations)
-- - 4 Buildings, 10 Floors
-- - 5 Units with amenities (Dubai properties)
-- - 3 Tenants, 2 Landlords
-- - 3 Brokers
-- - Master data for Leads, Tickets, Requests, Complaints
-- - 2 Sample Leads
-- - 1 Sample Rental Contract
-- - 2 Sample Tickets
-- - 2 Sample Announcements
--
-- COMPANY 2 (Premium Properties LLC):
-- - 4 Users (1 Admin, 1 Manager, 2 Agents)
-- - 5 Roles with permissions
-- - 1 Country, 2 States, 5 Areas (Abu Dhabi & Sharjah locations)
-- - 4 Buildings, 10 Floors
-- - 5 Units with amenities (Abu Dhabi & Sharjah properties)
-- - 3 Tenants, 2 Landlords
-- - 3 Brokers
-- - Master data for Leads, Tickets, Requests, Complaints
-- - 2 Sample Leads
-- - 1 Sample Rental Contract
-- - 2 Sample Tickets
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

