-- ============================================================================
-- Real Estate Management System - MySQL Database Schema
-- ============================================================================
-- 
-- This SQL script creates the complete database schema for the Real Estate
-- Management System. It includes all tables, indexes, and foreign key constraints.
--
-- SAFE MODE: This script is designed to be safe for existing databases.
-- - Tables are created only if they don't exist (CREATE TABLE IF NOT EXISTS)
-- - Foreign key constraints are added only if they don't exist
-- - New columns are added only if they don't exist
-- - Existing data is preserved
-- - Can be run multiple times without errors
-- - No errors if tables/constraints/columns already exist
--
-- Usage:
--   1. Create the database: CREATE DATABASE realestate;
--   2. Use the database: USE realestate;
--   3. Run this script: source mysql-schema.sql;
--
-- Or import directly:
--   mysql -u root -p realestate < mysql-schema.sql
--
-- For existing databases:
--   This script will safely add new columns (like is_active) without
--   affecting existing data. All existing records will be preserved.
--
-- Generated from Prisma Schema
-- ============================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `realestate` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `realestate`;

-- Disable foreign key checks temporarily for faster import
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- START OF SCHEMA DEFINITION
-- ============================================================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `is_admin` VARCHAR(191) NOT NULL DEFAULT 'false',
    `is_active` VARCHAR(191) NOT NULL DEFAULT 'true',
    `role_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    `two_factor_secret` VARCHAR(191) NULL,
    `two_factor_backup_codes` VARCHAR(191) NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `email_verification_token` VARCHAR(191) NULL,
    `email_verification_expires` DATETIME(3) NULL,
    `password_reset_token` VARCHAR(191) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `last_login_ip` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_company_id_idx`(`company_id`),
    INDEX `User_role_id_idx`(`role_id`),
    INDEX `User_email_verified_idx`(`email_verified`),
    INDEX `User_two_factor_enabled_idx`(`two_factor_enabled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `hosting_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Hosting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Role_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Permission_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `OAuthToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `access_token` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OAuthToken_access_token_key`(`access_token`),
    UNIQUE INDEX `OAuthToken_refresh_token_key`(`refresh_token`),
    INDEX `OAuthToken_user_id_idx`(`user_id`),
    INDEX `OAuthToken_access_token_idx`(`access_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `session_token` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `device_type` VARCHAR(191) NULL,
    `device_name` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `expires_at` DATETIME(3) NOT NULL,
    `last_activity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_session_token_key`(`session_token`),
    INDEX `Session_user_id_idx`(`user_id`),
    INDEX `Session_session_token_idx`(`session_token`),
    INDEX `Session_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ProviderAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_account_id` VARCHAR(191) NOT NULL,
    `provider_email` VARCHAR(191) NULL,
    `provider_name` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `refresh_token` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ProviderAccount_user_id_idx`(`user_id`),
    INDEX `ProviderAccount_provider_idx`(`provider`),
    UNIQUE INDEX `ProviderAccount_provider_provider_account_id_key`(`provider`, `provider_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Tenant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_no` VARCHAR(191) NOT NULL,
    `mobile_no` VARCHAR(191) NOT NULL,
    `emirates_id` VARCHAR(191) NOT NULL,
    `emirates_id_expiry` DATETIME(3) NULL,
    `residential` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `passport_no` VARCHAR(191) NOT NULL,
    `passport_expiry` DATETIME(3) NOT NULL,
    `fax` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `is_active` VARCHAR(191) NOT NULL DEFAULT 'true',
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Tenant_email_idx`(`email`),
    INDEX `Tenant_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Landlord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_no` VARCHAR(191) NOT NULL,
    `mobile_no` VARCHAR(191) NOT NULL,
    `emirates_id` VARCHAR(191) NOT NULL,
    `emirates_id_expiry` DATETIME(3) NULL,
    `residential` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `passport_no` VARCHAR(191) NOT NULL,
    `passport_expiry` DATETIME(3) NOT NULL,
    `fax` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `is_active` VARCHAR(191) NOT NULL DEFAULT 'true',
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Landlord_email_idx`(`email`),
    INDEX `Landlord_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KycDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NULL,
    `landlord_id` INTEGER NULL,
    `doc_type_id` INTEGER NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `KycDocument_tenant_id_idx`(`tenant_id`),
    INDEX `KycDocument_landlord_id_idx`(`landlord_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KycDocType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `is_mandatory` VARCHAR(191) NOT NULL DEFAULT 'false',
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `KycDocType_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Country_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `State` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `authorative_name` VARCHAR(191) NULL,
    `country_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `State_country_id_idx`(`country_id`),
    INDEX `State_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Area` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `state_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Area_state_id_idx`(`state_id`),
    INDEX `Area_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Building` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `completion_date` DATETIME(3) NULL,
    `is_exempt` VARCHAR(191) NOT NULL DEFAULT 'false',
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `area_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Building_area_id_idx`(`area_id`),
    INDEX `Building_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Floor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `building_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Floor_building_id_idx`(`building_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `gross_area_in_sqft` DOUBLE NOT NULL,
    `ownership` VARCHAR(191) NOT NULL,
    `basic_rent` DOUBLE NULL,
    `basic_sale_value` DOUBLE NULL,
    `is_exempt` VARCHAR(191) NOT NULL DEFAULT 'false',
    `premise_no` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'available',
    `property_type` VARCHAR(191) NOT NULL,
    `no_of_bathrooms` INTEGER NOT NULL,
    `no_of_bedrooms` INTEGER NULL,
    `no_of_parkings` INTEGER NULL,
    `ejari_number` VARCHAR(191) NULL,
    `ejari_expiry` DATETIME(3) NULL,
    `dewa_account` VARCHAR(191) NULL,
    `municipality_fees` DOUBLE NULL,
    `furnished_type` VARCHAR(191) NULL,
    `view_type` VARCHAR(191) NULL,
    `floor_number` INTEGER NULL,
    `total_floors` INTEGER NULL,
    `year_built` INTEGER NULL,
    `listing_type` VARCHAR(191) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `virtual_tour_url` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `building_id` INTEGER NOT NULL,
    `floor_id` INTEGER NOT NULL,
    `unit_type_id` INTEGER NOT NULL,
    `owned_by` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `unit_building_id_idx`(`building_id`),
    INDEX `unit_floor_id_idx`(`floor_id`),
    INDEX `unit_unit_type_id_idx`(`unit_type_id`),
    INDEX `unit_company_id_idx`(`company_id`),
    INDEX `unit_status_idx`(`status`),
    INDEX `unit_ejari_number_idx`(`ejari_number`),
    INDEX `unit_is_featured_idx`(`is_featured`),
    INDEX `unit_listing_type_idx`(`listing_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `UnitImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `image_type` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UnitImage_unit_id_idx`(`unit_id`),
    INDEX `UnitImage_is_primary_idx`(`is_primary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `UnitDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `doc_type` VARCHAR(191) NOT NULL,
    `document_url` VARCHAR(191) NOT NULL,
    `document_name` VARCHAR(191) NULL,
    `expiry_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UnitDocument_unit_id_idx`(`unit_id`),
    INDEX `UnitDocument_doc_type_idx`(`doc_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `unitType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `unitType_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Amenity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Amenity_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `unitAmenity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `amenity_id` INTEGER NOT NULL,

    UNIQUE INDEX `unitAmenity_unit_id_amenity_id_key`(`unit_id`, `amenity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Parking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `building_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Parking_building_id_idx`(`building_id`),
    INDEX `Parking_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Vehicle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicle_no` VARCHAR(191) NOT NULL,
    `vehicle_type` VARCHAR(191) NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Vehicle_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `RentalContract` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_no` VARCHAR(191) NOT NULL,
    `contract_date` DATETIME(3) NOT NULL,
    `from_date` DATETIME(3) NOT NULL,
    `to_date` DATETIME(3) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `security_amount` DOUBLE NOT NULL,
    `service_amount` DOUBLE NOT NULL,
    `payment_terms` VARCHAR(191) NOT NULL,
    `grace_period` VARCHAR(191) NULL,
    `tentative_move_in` DATETIME(3) NOT NULL,
    `vat_details` VARCHAR(191) NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `preclose_date` DATETIME(3) NULL,
    `preclose_reason` VARCHAR(191) NULL,
    `vat_amount` DOUBLE NULL,
    `management_fee` DOUBLE NULL,
    `previous_contract_id` INTEGER NULL,
    `ejari_registered` BOOLEAN NOT NULL DEFAULT false,
    `ejari_number` VARCHAR(191) NULL,
    `ejari_registration_date` DATETIME(3) NULL,
    `ejari_expiry_date` DATETIME(3) NULL,
    `agent_commission` DOUBLE NULL,
    `broker_commission` DOUBLE NULL,
    `commission_paid` BOOLEAN NOT NULL DEFAULT false,
    `tenant_id` INTEGER NOT NULL,
    `salesman_id` INTEGER NOT NULL,
    `broker_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RentalContract_contract_no_key`(`contract_no`),
    INDEX `RentalContract_contract_no_idx`(`contract_no`),
    INDEX `RentalContract_tenant_id_idx`(`tenant_id`),
    INDEX `RentalContract_company_id_idx`(`company_id`),
    INDEX `RentalContract_ejari_number_idx`(`ejari_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `SalesContract` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_no` VARCHAR(191) NOT NULL,
    `contract_date` DATETIME(3) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `service_amount` DOUBLE NOT NULL,
    `payment_terms` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NULL,
    `agent_commission` DOUBLE NULL,
    `broker_commission` DOUBLE NULL,
    `commission_paid` BOOLEAN NOT NULL DEFAULT false,
    `seller_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `salesman_id` INTEGER NOT NULL,
    `broker_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SalesContract_contract_no_key`(`contract_no`),
    INDEX `SalesContract_contract_no_idx`(`contract_no`),
    INDEX `SalesContract_seller_id_idx`(`seller_id`),
    INDEX `SalesContract_buyer_id_idx`(`buyer_id`),
    INDEX `SalesContract_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `RentalContractunit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,

    UNIQUE INDEX `RentalContractunit_contract_id_unit_id_key`(`contract_id`, `unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `SalesContractunit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,

    UNIQUE INDEX `SalesContractunit_contract_id_unit_id_key`(`contract_id`, `unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ContractParking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_id` INTEGER NOT NULL,
    `contract_type` VARCHAR(191) NOT NULL,
    `parking_id` INTEGER NOT NULL,
    `vehicle_id` INTEGER NULL,

    INDEX `ContractParking_contract_id_idx`(`contract_id`),
    INDEX `ContractParking_parking_id_idx`(`parking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Handover` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_id` INTEGER NOT NULL,
    `contract_type` VARCHAR(191) NOT NULL,
    `no_of_keys_given` INTEGER NULL,
    `no_of_cards_given` INTEGER NULL,
    `additional_details` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Handover_contract_id_key`(`contract_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `HandoverDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `handover_id` INTEGER NOT NULL,
    `doc_type_id` INTEGER NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HandoverDocument_handover_id_idx`(`handover_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Receipt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receipt_no` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `contract_id` INTEGER NOT NULL,
    `contract_type` VARCHAR(191) NOT NULL,
    `invoice_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Receipt_receipt_no_key`(`receipt_no`),
    INDEX `Receipt_receipt_no_idx`(`receipt_no`),
    INDEX `Receipt_contract_id_idx`(`contract_id`),
    INDEX `Receipt_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receipt_id` INTEGER NOT NULL,
    `payment_type` VARCHAR(191) NOT NULL,
    `amount_incl` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `instrument_no` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `returned_on` DATETIME(3) NULL,
    `vat_amount` DOUBLE NULL,
    `payment_under_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Payment_receipt_id_idx`(`receipt_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Cheque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_id` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `is_deposited` BOOLEAN NOT NULL DEFAULT false,
    `is_received` BOOLEAN NOT NULL DEFAULT false,
    `deposited_on` DATETIME(3) NULL,
    `cleared_on` DATETIME(3) NULL,
    `bank_name` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cheque_payment_id_key`(`payment_id`),
    INDEX `Cheque_payment_id_idx`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PaymentUnder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentUnder_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_no` VARCHAR(191) NOT NULL,
    `contract_id` INTEGER NOT NULL,
    `contract_type` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invoice_invoice_no_key`(`invoice_no`),
    INDEX `Invoice_invoice_no_idx`(`invoice_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Lead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile_no` VARCHAR(191) NOT NULL,
    `whatsapp_no` VARCHAR(191) NULL,
    `property_type` VARCHAR(191) NOT NULL,
    `interest_type` VARCHAR(191) NOT NULL,
    `min_price` DOUBLE NOT NULL,
    `max_price` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `status_id` INTEGER NULL,
    `activity_source_id` INTEGER NOT NULL,
    `assigned_to` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `utm_source` VARCHAR(191) NULL,
    `utm_medium` VARCHAR(191) NULL,
    `utm_campaign` VARCHAR(191) NULL,
    `utm_term` VARCHAR(191) NULL,
    `utm_content` VARCHAR(191) NULL,
    `referrer_url` VARCHAR(191) NULL,
    `landing_page` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Lead_uuid_key`(`uuid`),
    INDEX `Lead_uuid_idx`(`uuid`),
    INDEX `Lead_email_idx`(`email`),
    INDEX `Lead_company_id_idx`(`company_id`),
    INDEX `Lead_status_id_idx`(`status_id`),
    INDEX `Lead_utm_source_idx`(`utm_source`),
    INDEX `Lead_utm_campaign_idx`(`utm_campaign`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `LeadStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `is_qualified` BOOLEAN NOT NULL DEFAULT false,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LeadStatus_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ActivitySource` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivitySource_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `LeadFollowup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `lead_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `type_id` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `next_followup_date` DATETIME(3) NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LeadFollowup_uuid_key`(`uuid`),
    INDEX `LeadFollowup_lead_id_idx`(`lead_id`),
    INDEX `LeadFollowup_uuid_idx`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `FollowupType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FollowupType_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `LeadPreferredArea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lead_id` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,

    UNIQUE INDEX `LeadPreferredArea_lead_id_area_id_key`(`lead_id`, `area_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `LeadPreferredunitType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lead_id` INTEGER NOT NULL,
    `unit_type_id` INTEGER NOT NULL,

    UNIQUE INDEX `LeadPreferredunitType_lead_id_unit_type_id_key`(`lead_id`, `unit_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `LeadPreferredAmenity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lead_id` INTEGER NOT NULL,
    `amenity_id` INTEGER NOT NULL,

    UNIQUE INDEX `LeadPreferredAmenity_lead_id_amenity_id_key`(`lead_id`, `amenity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_no` VARCHAR(191) NOT NULL,
    `type_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `tenant_id` INTEGER NULL,
    `landlord_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Request_request_no_key`(`request_no`),
    INDEX `Request_request_no_idx`(`request_no`),
    INDEX `Request_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `RequestType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RequestType_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `RequestStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RequestStatus_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_no` VARCHAR(191) NOT NULL,
    `type_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `tenant_id` INTEGER NULL,
    `landlord_id` INTEGER NULL,
    `unit_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `assigned_to` INTEGER NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ticket_ticket_no_key`(`ticket_no`),
    INDEX `Ticket_ticket_no_idx`(`ticket_no`),
    INDEX `Ticket_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `MaintenanceType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MaintenanceType_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `MaintenanceStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MaintenanceStatus_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `TicketComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_id` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TicketComment_ticket_id_idx`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `TicketFollowup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_id` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `status_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TicketFollowup_ticket_id_idx`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Complaint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `complaint_no` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status_id` INTEGER NOT NULL,
    `tenant_id` INTEGER NULL,
    `landlord_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Complaint_complaint_no_key`(`complaint_no`),
    INDEX `Complaint_complaint_no_idx`(`complaint_no`),
    INDEX `Complaint_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ComplaintStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ComplaintStatus_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ComplaintFollowup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `complaint_id` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `status_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ComplaintFollowup_complaint_id_idx`(`complaint_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Announcement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `target_scope` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Announcement_company_id_idx`(`company_id`),
    INDEX `Announcement_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `RentalApproval` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_no` VARCHAR(191) NOT NULL,
    `unit_id` INTEGER NOT NULL,
    `tenant_id` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `remarks` VARCHAR(191) NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `approved_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RentalApproval_request_no_key`(`request_no`),
    INDEX `RentalApproval_request_no_idx`(`request_no`),
    INDEX `RentalApproval_company_id_idx`(`company_id`),
    INDEX `RentalApproval_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `CompanySettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `logo_path` VARCHAR(191) NULL,
    `smtp_host` VARCHAR(191) NULL,
    `smtp_port` INTEGER NULL,
    `smtp_user` VARCHAR(191) NULL,
    `smtp_password` VARCHAR(191) NULL,
    `smtp_from_email` VARCHAR(191) NULL,
    `smtp_from_name` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CompanySettings_company_id_key`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Broker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `license_number` VARCHAR(191) NULL,
    `license_expiry` DATETIME(3) NULL,
    `commission_rate` DOUBLE NULL,
    `company_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Broker_email_key`(`email`),
    INDEX `Broker_company_id_idx`(`company_id`),
    INDEX `Broker_license_number_idx`(`license_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PropertyViewing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `lead_id` INTEGER NULL,
    `tenant_id` INTEGER NULL,
    `viewer_name` VARCHAR(191) NOT NULL,
    `viewer_email` VARCHAR(191) NOT NULL,
    `viewer_phone` VARCHAR(191) NOT NULL,
    `viewing_date` DATETIME(3) NOT NULL,
    `viewing_time` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled',
    `notes` TEXT NULL,
    `feedback` TEXT NULL,
    `rating` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `assigned_to` INTEGER NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `PropertyViewing_unit_id_idx`(`unit_id`),
    INDEX `PropertyViewing_viewing_date_idx`(`viewing_date`),
    INDEX `PropertyViewing_company_id_idx`(`company_id`),
    INDEX `PropertyViewing_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `UnitFavorite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `lead_id` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UnitFavorite_unit_id_idx`(`unit_id`),
    INDEX `UnitFavorite_user_id_idx`(`user_id`),
    UNIQUE INDEX `UnitFavorite_unit_id_user_id_key`(`unit_id`, `user_id`),
    UNIQUE INDEX `UnitFavorite_unit_id_lead_id_key`(`unit_id`, `lead_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PropertyInspection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `contract_id` INTEGER NULL,
    `contract_type` VARCHAR(191) NULL,
    `inspection_type` VARCHAR(191) NOT NULL,
    `inspection_date` DATETIME(3) NOT NULL,
    `inspector_name` VARCHAR(191) NOT NULL,
    `inspector_notes` TEXT NULL,
    `condition_rating` INTEGER NULL,
    `photos` VARCHAR(191) NULL,
    `defects_found` TEXT NULL,
    `recommendations` TEXT NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PropertyInspection_unit_id_idx`(`unit_id`),
    INDEX `PropertyInspection_inspection_date_idx`(`inspection_date`),
    INDEX `PropertyInspection_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PropertyValuation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `valuation_type` VARCHAR(191) NOT NULL,
    `estimated_rent` DOUBLE NULL,
    `estimated_sale` DOUBLE NULL,
    `valuation_date` DATETIME(3) NOT NULL,
    `valuer_name` VARCHAR(191) NOT NULL,
    `valuer_notes` TEXT NULL,
    `market_analysis` TEXT NULL,
    `comparable_units` VARCHAR(191) NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PropertyValuation_unit_id_idx`(`unit_id`),
    INDEX `PropertyValuation_valuation_date_idx`(`valuation_date`),
    INDEX `PropertyValuation_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PropertyInsurance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `insurance_type` VARCHAR(191) NOT NULL,
    `insurance_provider` VARCHAR(191) NOT NULL,
    `policy_number` VARCHAR(191) NOT NULL,
    `coverage_amount` DOUBLE NOT NULL,
    `premium_amount` DOUBLE NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `renewal_date` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `documents` VARCHAR(191) NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `PropertyInsurance_unit_id_idx`(`unit_id`),
    INDEX `PropertyInsurance_policy_number_idx`(`policy_number`),
    INDEX `PropertyInsurance_company_id_idx`(`company_id`),
    INDEX `PropertyInsurance_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PropertyMaintenanceHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `maintenance_type` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `cost` DOUBLE NULL,
    `vendor_name` VARCHAR(191) NULL,
    `maintenance_date` DATETIME(3) NOT NULL,
    `next_maintenance_date` DATETIME(3) NULL,
    `documents` VARCHAR(191) NULL,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PropertyMaintenanceHistory_unit_id_idx`(`unit_id`),
    INDEX `PropertyMaintenanceHistory_maintenance_date_idx`(`maintenance_date`),
    INDEX `PropertyMaintenanceHistory_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PropertyNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `notification_type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `action_url` VARCHAR(191) NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PropertyNotification_user_id_idx`(`user_id`),
    INDEX `PropertyNotification_is_read_idx`(`is_read`),
    INDEX `PropertyNotification_company_id_idx`(`company_id`),
    INDEX `PropertyNotification_notification_type_idx`(`notification_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PropertyAnalytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `views_count` INTEGER NOT NULL DEFAULT 0,
    `favorites_count` INTEGER NOT NULL DEFAULT 0,
    `inquiries_count` INTEGER NOT NULL DEFAULT 0,
    `viewings_count` INTEGER NOT NULL DEFAULT 0,
    `offers_count` INTEGER NOT NULL DEFAULT 0,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PropertyAnalytics_unit_id_idx`(`unit_id`),
    INDEX `PropertyAnalytics_date_idx`(`date`),
    INDEX `PropertyAnalytics_company_id_idx`(`company_id`),
    UNIQUE INDEX `PropertyAnalytics_unit_id_date_key`(`unit_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `LeadRoutingRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `rule_name` VARCHAR(191) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `conditions` JSON NOT NULL,
    `assignment_type` VARCHAR(191) NOT NULL,
    `assigned_user_id` INTEGER NULL,
    `assigned_role_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `LeadRoutingRule_company_id_idx`(`company_id`),
    INDEX `LeadRoutingRule_is_active_idx`(`is_active`),
    INDEX `LeadRoutingRule_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `LeadPipeline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `stages` JSON NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `LeadPipeline_company_id_idx`(`company_id`),
    INDEX `LeadPipeline_is_active_idx`(`is_active`),
    INDEX `LeadPipeline_is_default_idx`(`is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `AutomationRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `trigger_type` VARCHAR(191) NOT NULL,
    `trigger_conditions` JSON NOT NULL,
    `action_type` VARCHAR(191) NOT NULL,
    `template_id` INTEGER NULL,
    `schedule_delay` INTEGER NULL,
    `schedule_unit` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AutomationRule_company_id_idx`(`company_id`),
    INDEX `AutomationRule_is_active_idx`(`is_active`),
    INDEX `AutomationRule_trigger_type_idx`(`trigger_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `MessageTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `variables` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `MessageTemplate_company_id_idx`(`company_id`),
    INDEX `MessageTemplate_type_idx`(`type`),
    INDEX `MessageTemplate_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Microsite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `template_id` INTEGER NULL,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `seo_keywords` VARCHAR(191) NULL,
    `custom_css` TEXT NULL,
    `custom_js` TEXT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Microsite_slug_key`(`slug`),
    UNIQUE INDEX `Microsite_unit_id_company_id_key`(`unit_id`, `company_id`),
    INDEX `Microsite_company_id_idx`(`company_id`),
    INDEX `Microsite_unit_id_idx`(`unit_id`),
    INDEX `Microsite_slug_idx`(`slug`),
    INDEX `Microsite_is_published_idx`(`is_published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `MicrositeTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `template_html` TEXT NOT NULL,
    `template_css` TEXT NULL,
    `template_js` TEXT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `MicrositeTemplate_company_id_idx`(`company_id`),
    INDEX `MicrositeTemplate_is_active_idx`(`is_active`),
    INDEX `MicrositeTemplate_is_default_idx`(`is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `check_in_time` DATETIME(3) NULL,
    `check_out_time` DATETIME(3) NULL,
    `check_in_latitude` DOUBLE NULL,
    `check_in_longitude` DOUBLE NULL,
    `check_out_latitude` DOUBLE NULL,
    `check_out_longitude` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'present',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Attendance_user_id_date_key`(`user_id`, `date`),
    INDEX `Attendance_company_id_idx`(`company_id`),
    INDEX `Attendance_user_id_idx`(`user_id`),
    INDEX `Attendance_date_idx`(`date`),
    INDEX `Attendance_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `UserActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `activity_type` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `duration_minutes` INTEGER NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserActivity_company_id_idx`(`company_id`),
    INDEX `UserActivity_user_id_idx`(`user_id`),
    INDEX `UserActivity_date_idx`(`date`),
    INDEX `UserActivity_activity_type_idx`(`activity_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KanbanBoard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `board_type` VARCHAR(191) NOT NULL,
    `is_template` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `KanbanBoard_company_id_idx`(`company_id`),
    INDEX `KanbanBoard_board_type_idx`(`board_type`),
    INDEX `KanbanBoard_is_active_idx`(`is_active`),
    INDEX `KanbanBoard_is_template_idx`(`is_template`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KanbanColumn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `board_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `color` VARCHAR(191) NULL,
    `is_done` BOOLEAN NOT NULL DEFAULT false,
    `wip_limit` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KanbanColumn_board_id_position_key`(`board_id`, `position`),
    INDEX `KanbanColumn_board_id_idx`(`board_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KanbanCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `board_id` INTEGER NOT NULL,
    `column_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `card_type` VARCHAR(191) NOT NULL,
    `entity_id` INTEGER NULL,
    `entity_type` VARCHAR(191) NULL,
    `assigned_to` INTEGER NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `due_date` DATETIME(3) NULL,
    `position` INTEGER NOT NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `KanbanCard_board_id_idx`(`board_id`),
    INDEX `KanbanCard_column_id_idx`(`column_id`),
    INDEX `KanbanCard_card_type_idx`(`card_type`),
    INDEX `KanbanCard_entity_id_entity_type_idx`(`entity_id`, `entity_type`),
    INDEX `KanbanCard_assigned_to_idx`(`assigned_to`),
    INDEX `KanbanCard_priority_idx`(`priority`),
    INDEX `KanbanCard_due_date_idx`(`due_date`),
    INDEX `KanbanCard_is_archived_idx`(`is_archived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KanbanCardComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `card_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `KanbanCardComment_card_id_idx`(`card_id`),
    INDEX `KanbanCardComment_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KanbanCardAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `card_id` INTEGER NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_type` VARCHAR(191) NULL,
    `file_size` INTEGER NULL,
    `uploaded_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `KanbanCardAttachment_card_id_idx`(`card_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KanbanLabel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `board_id` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `KanbanLabel_board_id_idx`(`board_id`),
    INDEX `KanbanLabel_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `KanbanCardLabel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `card_id` INTEGER NOT NULL,
    `label_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `KanbanCardLabel_card_id_label_id_key`(`card_id`, `label_id`),
    INDEX `KanbanCardLabel_card_id_idx`(`card_id`),
    INDEX `KanbanCardLabel_label_id_idx`(`label_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `AdCampaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `campaign_name` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `budget` DOUBLE NULL,
    `spent` DOUBLE NOT NULL DEFAULT 0,
    `leads_count` INTEGER NOT NULL DEFAULT 0,
    `conversions` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AdCampaign_company_id_idx`(`company_id`),
    INDEX `AdCampaign_source_idx`(`source`),
    INDEX `AdCampaign_is_active_idx`(`is_active`),
    INDEX `AdCampaign_start_date_idx`(`start_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Integration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `integration_type` VARCHAR(191) NOT NULL,
    `api_key` TEXT NULL,
    `api_secret` TEXT NULL,
    `access_token` TEXT NULL,
    `refresh_token` TEXT NULL,
    `config` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_sync_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Integration_company_id_integration_type_key`(`company_id`, `integration_type`),
    INDEX `Integration_company_id_idx`(`company_id`),
    INDEX `Integration_integration_type_idx`(`integration_type`),
    INDEX `Integration_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Webhook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `integration_id` INTEGER NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `secret` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_triggered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Webhook_company_id_idx`(`company_id`),
    INDEX `Webhook_integration_id_idx`(`integration_id`),
    INDEX `Webhook_event_type_idx`(`event_type`),
    INDEX `Webhook_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `_PermissionToRole` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermissionToRole_AB_unique`(`A`, `B`),
    INDEX `_PermissionToRole_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================================
-- SAFE MODE: HELPER PROCEDURE FOR FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- This procedure safely adds a foreign key constraint only if it doesn't exist
-- Must be defined before foreign key constraints are added
-- ============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS `AddForeignKeyIfNotExists`$$

CREATE PROCEDURE `AddForeignKeyIfNotExists`(
    IN p_table_name VARCHAR(64),
    IN p_constraint_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_referenced_table VARCHAR(64),
    IN p_referenced_column VARCHAR(64),
    IN p_on_delete_action VARCHAR(20),
    IN p_on_update_action VARCHAR(20)
)
BEGIN
    DECLARE constraint_exists INT DEFAULT 0;
    DECLARE db_name VARCHAR(64);
    
    SET db_name = DATABASE();
    
    -- Check if constraint already exists
    SELECT COUNT(*) INTO constraint_exists
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = db_name
      AND TABLE_NAME = p_table_name
      AND CONSTRAINT_NAME = p_constraint_name
      AND CONSTRAINT_TYPE = 'FOREIGN KEY';
    
    -- Add constraint only if it doesn't exist
    IF constraint_exists = 0 THEN
        SET @sql = CONCAT(
            'ALTER TABLE `', p_table_name, '` ',
            'ADD CONSTRAINT `', p_constraint_name, '` ',
            'FOREIGN KEY (`', p_column_name, '`) ',
            'REFERENCES `', p_referenced_table, '`(`', p_referenced_column, '`) ',
            'ON DELETE ', p_on_delete_action, ' ',
            'ON UPDATE ', p_on_update_action
        );
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- AddForeignKey
CALL AddForeignKeyIfNotExists('User', 'User_role_id_fkey', 'role_id', 'Role', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('User', 'User_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Company', 'Company_hosting_id_fkey', 'hosting_id', 'Hosting', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Role', 'Role_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Permission', 'Permission_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('OAuthToken', 'OAuthToken_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Session', 'Session_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ProviderAccount', 'ProviderAccount_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Tenant', 'Tenant_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Landlord', 'Landlord_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KycDocument', 'KycDocument_tenant_id_fkey', 'tenant_id', 'Tenant', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KycDocument', 'KycDocument_landlord_id_fkey', 'landlord_id', 'Landlord', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KycDocument', 'KycDocument_doc_type_id_fkey', 'doc_type_id', 'KycDocType', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KycDocType', 'KycDocType_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Country', 'Country_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('State', 'State_country_id_fkey', 'country_id', 'Country', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('State', 'State_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Area', 'Area_state_id_fkey', 'state_id', 'State', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Area', 'Area_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Building', 'Building_area_id_fkey', 'area_id', 'Area', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Building', 'Building_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Floor', 'Floor_building_id_fkey', 'building_id', 'Building', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unit', 'unit_building_id_fkey', 'building_id', 'Building', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unit', 'unit_floor_id_fkey', 'floor_id', 'Floor', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unit', 'unit_unit_type_id_fkey', 'unit_type_id', 'unitType', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unit', 'unit_owned_by_fkey', 'owned_by', 'Landlord', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unit', 'unit_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('UnitImage', 'UnitImage_unit_id_fkey', 'unit_id', 'unit', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('UnitDocument', 'UnitDocument_unit_id_fkey', 'unit_id', 'unit', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unitType', 'unitType_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Amenity', 'Amenity_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unitAmenity', 'unitAmenity_unit_id_fkey', 'unit_id', 'unit', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('unitAmenity', 'unitAmenity_amenity_id_fkey', 'amenity_id', 'Amenity', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Parking', 'Parking_building_id_fkey', 'building_id', 'Building', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Parking', 'Parking_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Vehicle', 'Vehicle_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContract', 'RentalContract_tenant_id_fkey', 'tenant_id', 'Tenant', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContract', 'RentalContract_salesman_id_fkey', 'salesman_id', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContract', 'RentalContract_broker_id_fkey', 'broker_id', 'Broker', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContract', 'RentalContract_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContract', 'RentalContract_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContract', 'RentalContract_previous_contract_id_fkey', 'previous_contract_id', 'RentalContract', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContract', 'SalesContract_seller_id_fkey', 'seller_id', 'Landlord', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContract', 'SalesContract_buyer_id_fkey', 'buyer_id', 'Landlord', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContract', 'SalesContract_salesman_id_fkey', 'salesman_id', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContract', 'SalesContract_broker_id_fkey', 'broker_id', 'Broker', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContract', 'SalesContract_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContract', 'SalesContract_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContractunit', 'RentalContractunit_contract_id_fkey', 'contract_id', 'RentalContract', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalContractunit', 'RentalContractunit_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContractunit', 'SalesContractunit_contract_id_fkey', 'contract_id', 'SalesContract', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('SalesContractunit', 'SalesContractunit_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ContractParking', 'ContractParking_rental_contract_id_fkey', 'contract_id', 'RentalContract', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ContractParking', 'ContractParking_sales_contract_id_fkey', 'contract_id', 'SalesContract', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ContractParking', 'ContractParking_parking_id_fkey', 'parking_id', 'Parking', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ContractParking', 'ContractParking_vehicle_id_fkey', 'vehicle_id', 'Vehicle', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Handover', 'Handover_rental_contract_id_fkey', 'contract_id', 'RentalContract', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Handover', 'Handover_sales_contract_id_fkey', 'contract_id', 'SalesContract', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('HandoverDocument', 'HandoverDocument_handover_id_fkey', 'handover_id', 'Handover', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('HandoverDocument', 'HandoverDocument_doc_type_id_fkey', 'doc_type_id', 'KycDocType', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Receipt', 'Receipt_rental_contract_id_fkey', 'contract_id', 'RentalContract', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Receipt', 'Receipt_sales_contract_id_fkey', 'contract_id', 'SalesContract', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Receipt', 'Receipt_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Receipt', 'Receipt_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Receipt', 'Receipt_invoice_id_fkey', 'invoice_id', 'Invoice', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Payment', 'Payment_receipt_id_fkey', 'receipt_id', 'Receipt', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Payment', 'Payment_payment_under_id_fkey', 'payment_under_id', 'PaymentUnder', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Cheque', 'Cheque_payment_id_fkey', 'payment_id', 'Payment', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PaymentUnder', 'PaymentUnder_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Lead', 'Lead_status_id_fkey', 'status_id', 'LeadStatus', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Lead', 'Lead_activity_source_id_fkey', 'activity_source_id', 'ActivitySource', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Lead', 'Lead_assigned_to_fkey', 'assigned_to', 'User', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Lead', 'Lead_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Lead', 'Lead_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadStatus', 'LeadStatus_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ActivitySource', 'ActivitySource_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadFollowup', 'LeadFollowup_lead_id_fkey', 'lead_id', 'Lead', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadFollowup', 'LeadFollowup_status_id_fkey', 'status_id', 'LeadStatus', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadFollowup', 'LeadFollowup_type_id_fkey', 'type_id', 'FollowupType', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadFollowup', 'LeadFollowup_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadFollowup', 'LeadFollowup_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('FollowupType', 'FollowupType_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadPreferredArea', 'LeadPreferredArea_lead_id_fkey', 'lead_id', 'Lead', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadPreferredArea', 'LeadPreferredArea_area_id_fkey', 'area_id', 'Area', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadPreferredunitType', 'LeadPreferredunitType_lead_id_fkey', 'lead_id', 'Lead', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadPreferredunitType', 'LeadPreferredunitType_unit_type_id_fkey', 'unit_type_id', 'unitType', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadPreferredAmenity', 'LeadPreferredAmenity_lead_id_fkey', 'lead_id', 'Lead', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadPreferredAmenity', 'LeadPreferredAmenity_amenity_id_fkey', 'amenity_id', 'Amenity', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Request', 'Request_type_id_fkey', 'type_id', 'RequestType', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Request', 'Request_status_id_fkey', 'status_id', 'RequestStatus', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Request', 'Request_tenant_id_fkey', 'tenant_id', 'Tenant', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Request', 'Request_landlord_id_fkey', 'landlord_id', 'Landlord', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Request', 'Request_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Request', 'Request_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RequestType', 'RequestType_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RequestStatus', 'RequestStatus_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_type_id_fkey', 'type_id', 'MaintenanceType', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_status_id_fkey', 'status_id', 'MaintenanceStatus', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_tenant_id_fkey', 'tenant_id', 'Tenant', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_landlord_id_fkey', 'landlord_id', 'Landlord', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_unit_id_fkey', 'unit_id', 'unit', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_assigned_to_fkey', 'assigned_to', 'User', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Ticket', 'Ticket_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('MaintenanceType', 'MaintenanceType_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('MaintenanceStatus', 'MaintenanceStatus_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('TicketComment', 'TicketComment_ticket_id_fkey', 'ticket_id', 'Ticket', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('TicketComment', 'TicketComment_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('TicketFollowup', 'TicketFollowup_ticket_id_fkey', 'ticket_id', 'Ticket', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('TicketFollowup', 'TicketFollowup_status_id_fkey', 'status_id', 'MaintenanceStatus', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('TicketFollowup', 'TicketFollowup_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Complaint', 'Complaint_status_id_fkey', 'status_id', 'ComplaintStatus', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Complaint', 'Complaint_tenant_id_fkey', 'tenant_id', 'Tenant', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Complaint', 'Complaint_landlord_id_fkey', 'landlord_id', 'Landlord', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Complaint', 'Complaint_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Complaint', 'Complaint_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ComplaintStatus', 'ComplaintStatus_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ComplaintFollowup', 'ComplaintFollowup_complaint_id_fkey', 'complaint_id', 'Complaint', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ComplaintFollowup', 'ComplaintFollowup_status_id_fkey', 'status_id', 'ComplaintStatus', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('ComplaintFollowup', 'ComplaintFollowup_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Announcement', 'Announcement_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Announcement', 'Announcement_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalApproval', 'RentalApproval_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalApproval', 'RentalApproval_tenant_id_fkey', 'tenant_id', 'Tenant', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalApproval', 'RentalApproval_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalApproval', 'RentalApproval_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('RentalApproval', 'RentalApproval_approved_by_fkey', 'approved_by', 'User', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('CompanySettings', 'CompanySettings_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Broker', 'Broker_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyViewing', 'PropertyViewing_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyViewing', 'PropertyViewing_lead_id_fkey', 'lead_id', 'Lead', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyViewing', 'PropertyViewing_tenant_id_fkey', 'tenant_id', 'Tenant', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyViewing', 'PropertyViewing_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyViewing', 'PropertyViewing_assigned_to_fkey', 'assigned_to', 'User', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyViewing', 'PropertyViewing_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('UnitFavorite', 'UnitFavorite_unit_id_fkey', 'unit_id', 'unit', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('UnitFavorite', 'UnitFavorite_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('UnitFavorite', 'UnitFavorite_lead_id_fkey', 'lead_id', 'Lead', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyInspection', 'PropertyInspection_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyInspection', 'PropertyInspection_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyInspection', 'PropertyInspection_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyValuation', 'PropertyValuation_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyValuation', 'PropertyValuation_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyValuation', 'PropertyValuation_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyInsurance', 'PropertyInsurance_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyInsurance', 'PropertyInsurance_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyInsurance', 'PropertyInsurance_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyMaintenanceHistory', 'PropertyMaintenanceHistory_unit_id_fkey', 'unit_id', 'unit', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyMaintenanceHistory', 'PropertyMaintenanceHistory_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyMaintenanceHistory', 'PropertyMaintenanceHistory_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyNotification', 'PropertyNotification_unit_id_fkey', 'unit_id', 'unit', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyNotification', 'PropertyNotification_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyNotification', 'PropertyNotification_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyAnalytics', 'PropertyAnalytics_unit_id_fkey', 'unit_id', 'unit', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('PropertyAnalytics', 'PropertyAnalytics_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('_PermissionToRole', '_PermissionToRole_A_fkey', 'A', 'Permission', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('_PermissionToRole', '_PermissionToRole_B_fkey', 'B', 'Role', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadRoutingRule', 'LeadRoutingRule_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadRoutingRule', 'LeadRoutingRule_assigned_user_id_fkey', 'assigned_user_id', 'User', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadRoutingRule', 'LeadRoutingRule_assigned_role_id_fkey', 'assigned_role_id', 'Role', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('LeadPipeline', 'LeadPipeline_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('AutomationRule', 'AutomationRule_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('AutomationRule', 'AutomationRule_template_id_fkey', 'template_id', 'MessageTemplate', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('MessageTemplate', 'MessageTemplate_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Microsite', 'Microsite_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Microsite', 'Microsite_unit_id_fkey', 'unit_id', 'unit', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Microsite', 'Microsite_template_id_fkey', 'template_id', 'MicrositeTemplate', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('MicrositeTemplate', 'MicrositeTemplate_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Attendance', 'Attendance_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Attendance', 'Attendance_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('UserActivity', 'UserActivity_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('UserActivity', 'UserActivity_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanBoard', 'KanbanBoard_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanBoard', 'KanbanBoard_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanColumn', 'KanbanColumn_board_id_fkey', 'board_id', 'KanbanBoard', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCard', 'KanbanCard_board_id_fkey', 'board_id', 'KanbanBoard', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCard', 'KanbanCard_column_id_fkey', 'column_id', 'KanbanColumn', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCard', 'KanbanCard_assigned_to_fkey', 'assigned_to', 'User', 'id', 'SET NULL', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCard', 'KanbanCard_created_by_fkey', 'created_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCardComment', 'KanbanCardComment_card_id_fkey', 'card_id', 'KanbanCard', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCardComment', 'KanbanCardComment_user_id_fkey', 'user_id', 'User', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCardAttachment', 'KanbanCardAttachment_card_id_fkey', 'card_id', 'KanbanCard', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCardAttachment', 'KanbanCardAttachment_uploaded_by_fkey', 'uploaded_by', 'User', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanLabel', 'KanbanLabel_board_id_fkey', 'board_id', 'KanbanBoard', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanLabel', 'KanbanLabel_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCardLabel', 'KanbanCardLabel_card_id_fkey', 'card_id', 'KanbanCard', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('KanbanCardLabel', 'KanbanCardLabel_label_id_fkey', 'label_id', 'KanbanLabel', 'id', 'CASCADE', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('AdCampaign', 'AdCampaign_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Integration', 'Integration_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Webhook', 'Webhook_company_id_fkey', 'company_id', 'Company', 'id', 'RESTRICT', 'CASCADE');

-- AddForeignKey
CALL AddForeignKeyIfNotExists('Webhook', 'Webhook_integration_id_fkey', 'integration_id', 'Integration', 'id', 'SET NULL', 'CASCADE');


-- ============================================================================
-- END OF SCHEMA DEFINITION
-- ============================================================================

-- ============================================================================
-- SAFE MODE: MIGRATION STATEMENTS FOR EXISTING DATABASES
-- ============================================================================
-- These ALTER TABLE statements safely add new columns to existing tables
-- without losing data. They will only execute if the columns don't exist.
-- Foreign key constraints are handled by the AddForeignKeyIfNotExists procedure
-- above, which checks for existence before adding.
-- ============================================================================

-- Add is_active column to Tenant table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'Tenant';
SET @columnname = 'is_active';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NOT NULL DEFAULT ''true'' AFTER `address`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add is_active column to Landlord table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'Landlord';
SET @columnname = 'is_active';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NOT NULL DEFAULT ''true'' AFTER `address`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add UTM tracking columns to Lead table if they don't exist
SET @dbname = DATABASE();
SET @tablename = 'Lead';

-- Add utm_source column
SET @columnname = 'utm_source';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NULL AFTER `created_by`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add utm_medium column
SET @columnname = 'utm_medium';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NULL AFTER `utm_source`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add utm_campaign column
SET @columnname = 'utm_campaign';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NULL AFTER `utm_medium`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add utm_term column
SET @columnname = 'utm_term';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NULL AFTER `utm_campaign`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add utm_content column
SET @columnname = 'utm_content';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NULL AFTER `utm_term`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add referrer_url column
SET @columnname = 'referrer_url';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NULL AFTER `utm_content`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add landing_page column
SET @columnname = 'landing_page';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(191) NULL AFTER `referrer_url`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add indexes for UTM fields if they don't exist
SET @dbname = DATABASE();
SET @tablename = 'Lead';

-- Add index for utm_source if it doesn't exist
SET @indexname = 'Lead_utm_source_idx';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX `', @indexname, '` ON `', @tablename, '`(`utm_source`)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for utm_campaign if it doesn't exist
SET @indexname = 'Lead_utm_campaign_idx';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX `', @indexname, '` ON `', @tablename, '`(`utm_campaign`)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Schema creation complete!
-- ============================================================================
-- 
-- Next steps:
--   1. Verify tables: SHOW TABLES;
--   2. Check table structure: DESCRIBE table_name;
--   3. Run Prisma migrations: npm run prisma:migrate
--   4. Seed database (optional): npm run prisma:seed
--
-- ============================================================================
