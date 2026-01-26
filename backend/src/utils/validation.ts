import { body, query, param } from 'express-validator';

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isString().withMessage('SortBy must be a string'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be asc or desc'),
];

export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];

export const validateBoardId = [
  param('boardId').isInt({ min: 1 }).withMessage('Board ID must be a positive integer'),
];

export const validateCardId = [
  param('cardId').isInt({ min: 1 }).withMessage('Card ID must be a positive integer'),
];

export const validateTemplateId = [
  param('templateId').isInt({ min: 1 }).withMessage('Template ID must be a positive integer'),
];

export const validateLocationId = [
  param('id').isUUID().withMessage('Location ID must be a valid UUID'),
];

export const validateBuildingId = [
  param('buildingId').isInt({ min: 1 }).withMessage('Building ID must be a positive integer'),
];

export const validateBuildingCreate = [
  body('name').notEmpty().withMessage('Building name is required'),
  body('area_id').isInt({ min: 1 }).withMessage('Area ID is required and must be a positive integer'),
  body('completion_date').optional().isISO8601().withMessage('Completion date must be a valid date'),
  body('is_exempt').optional().isIn(['true', 'false']).withMessage('is_exempt must be true or false'),
  body('status').optional().isIn(['active', 'inactive', 'under_construction']).withMessage('Status must be active, inactive, or under_construction'),
  body('location_id').optional().isString().withMessage('Location ID must be a string'),
];

export const validateBuildingUpdate = [
  body('name').optional().notEmpty().withMessage('Building name cannot be empty'),
  body('area_id').optional().isInt({ min: 1 }).withMessage('Area ID must be a positive integer'),
  body('completion_date').optional().isISO8601().withMessage('Completion date must be a valid date'),
  body('is_exempt').optional().isIn(['true', 'false']).withMessage('is_exempt must be true or false'),
  body('status').optional().isIn(['active', 'inactive', 'under_construction']).withMessage('Status must be active, inactive, or under_construction'),
  body('location_id').optional().isString().withMessage('Location ID must be a string'),
];

export const validateFloorCreate = [
  body('name').notEmpty().withMessage('Floor name is required'),
  body('building_id').isInt({ min: 1 }).withMessage('Building ID is required and must be a positive integer'),
];

export const validateFloorUpdate = [
  body('name').optional().notEmpty().withMessage('Floor name cannot be empty'),
  body('building_id').optional().isInt({ min: 1 }).withMessage('Building ID must be a positive integer'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('company_id').optional().isInt({ min: 1 }).withMessage('Company ID must be a positive integer'),
];

export const validateUserCreate = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('company_id').optional().isInt({ min: 1 }).withMessage('Company ID must be a positive integer'),
  body('role_id').optional().isInt({ min: 1 }).withMessage('Role ID must be a positive integer'),
  body('is_admin').optional().isIn(['true', 'false']).withMessage('is_admin must be true or false'),
];

export const validateUserUpdate = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role_id').optional().isInt({ min: 1 }).withMessage('Role ID must be a positive integer'),
  body('is_active').optional().isIn(['true', 'false']).withMessage('is_active must be true or false'),
];

export const validatePaymentCreate = [
  body('receipt_id').isInt({ min: 1 }).withMessage('Receipt ID is required and must be a positive integer'),
  body('payment_type').isIn(['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'other']).withMessage('Invalid payment type'),
  body('amount_incl').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('status').isIn(['pending', 'completed', 'failed', 'returned', 'cancelled']).withMessage('Invalid payment status'),
  body('instrument_no').optional().isString().withMessage('Instrument number must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('vat_amount').optional().isFloat({ min: 0 }).withMessage('VAT amount must be a positive number'),
  body('payment_under_id').optional().isInt({ min: 1 }).withMessage('Payment under ID must be a positive integer'),
  body('cheque').optional().isObject().withMessage('Cheque must be an object'),
  body('cheque.date').optional().isISO8601().withMessage('Cheque date must be a valid date'),
  body('cheque.bank_name').optional().isString().withMessage('Bank name must be a string'),
];

export const validatePaymentUpdate = [
  body('payment_type').optional().isIn(['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'other']).withMessage('Invalid payment type'),
  body('amount_incl').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('status').optional().isIn(['pending', 'completed', 'failed', 'returned', 'cancelled']).withMessage('Invalid payment status'),
  body('instrument_no').optional().isString().withMessage('Instrument number must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('vat_amount').optional().isFloat({ min: 0 }).withMessage('VAT amount must be a positive number'),
  body('payment_under_id').optional().isInt({ min: 1 }).withMessage('Payment under ID must be a positive integer'),
  body('cheque').optional().isObject().withMessage('Cheque must be an object'),
];

export const validateLeadCreate = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile_no').notEmpty().withMessage('Mobile number is required'),
  body('whatsapp_no').optional().isString().withMessage('WhatsApp number must be a string'),
  body('property_type').notEmpty().withMessage('Property type is required'),
  body('interest_type').notEmpty().withMessage('Interest type is required'),
  body('min_price').isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  body('max_price').isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('activity_source_id').isInt({ min: 1 }).withMessage('Activity source ID is required'),
  body('assigned_to').optional().isInt({ min: 1 }).withMessage('Assigned user ID must be a positive integer'),
  body('status_id').optional().isInt({ min: 1 }).withMessage('Status ID must be a positive integer'),
  body('preferred_area_ids').optional().isArray().withMessage('Preferred area IDs must be an array'),
  body('preferred_area_ids.*').optional().isInt({ min: 1 }).withMessage('Each area ID must be a positive integer'),
  body('preferred_unit_type_ids').optional().isArray().withMessage('Preferred unit type IDs must be an array'),
  body('preferred_unit_type_ids.*').optional().isInt({ min: 1 }).withMessage('Each unit type ID must be a positive integer'),
  body('preferred_amenity_ids').optional().isArray().withMessage('Preferred amenity IDs must be an array'),
  body('preferred_amenity_ids.*').optional().isInt({ min: 1 }).withMessage('Each amenity ID must be a positive integer'),
];

export const validateLeadUpdate = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('mobile_no').optional().notEmpty().withMessage('Mobile number cannot be empty'),
  body('whatsapp_no').optional().isString().withMessage('WhatsApp number must be a string'),
  body('property_type').optional().notEmpty().withMessage('Property type cannot be empty'),
  body('interest_type').optional().notEmpty().withMessage('Interest type cannot be empty'),
  body('min_price').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  body('max_price').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('activity_source_id').optional().isInt({ min: 1 }).withMessage('Activity source ID must be a positive integer'),
  body('assigned_to').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('Assigned user ID must be a positive integer'),
  body('status_id').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('Status ID must be a positive integer'),
  body('preferred_area_ids').optional().isArray().withMessage('Preferred area IDs must be an array'),
  body('preferred_unit_type_ids').optional().isArray().withMessage('Preferred unit type IDs must be an array'),
  body('preferred_amenity_ids').optional().isArray().withMessage('Preferred amenity IDs must be an array'),
];

export const validateKanbanBoardCreate = [
  body('name').notEmpty().withMessage('Board name is required'),
  body('board_type').isIn(['leads', 'properties', 'deals', 'contracts', 'maintenance', 'custom']).withMessage('Invalid board type'),
  body('description').optional({ nullable: true, checkFalsy: true }).isString().withMessage('Description must be a string'),
  body('is_template').optional().custom((value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'boolean') return true;
    if (value === 'true' || value === 'false') return true;
    throw new Error('is_template must be a boolean');
  }),
  body('is_active').optional().custom((value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'boolean') return true;
    if (value === 'true' || value === 'false') return true;
    throw new Error('is_active must be a boolean');
  }),
];

export const validateKanbanBoardUpdate = [
  body('name').optional().notEmpty().withMessage('Board name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('is_template').optional().isBoolean().withMessage('is_template must be a boolean'),
];

export const validateKanbanColumnCreate = [
  body('name').notEmpty().withMessage('Column name is required'),
  body('position').optional().isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  body('color').optional().isString().withMessage('Color must be a string'),
  body('is_done').optional().isBoolean().withMessage('is_done must be a boolean'),
  body('wip_limit').optional().isInt({ min: 1 }).withMessage('WIP limit must be a positive integer'),
];

export const validateKanbanCardCreate = [
  body('column_id').isInt({ min: 1 }).withMessage('Column ID is required'),
  body('title').notEmpty().withMessage('Card title is required'),
  body('description').optional({ nullable: true, checkFalsy: true }).isString().withMessage('Description must be a string'),
  body('card_type').optional().isString().withMessage('Card type must be a string'),
  body('entity_id').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('Entity ID must be a positive integer'),
  body('entity_type').optional({ nullable: true, checkFalsy: true }).isIn(['lead', 'property', 'unit', 'contract']).withMessage('Invalid entity type'),
  body('assigned_to').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('Assigned user ID must be a positive integer'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('due_date').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('position').optional().isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  body('label_ids').optional().isArray().withMessage('Label IDs must be an array'),
  body('label_ids.*').optional().isInt({ min: 1 }).withMessage('Each label ID must be a positive integer'),
];

export const validateKanbanCardUpdate = [
  body('title').optional().notEmpty().withMessage('Card title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('column_id').optional().isInt({ min: 1 }).withMessage('Column ID must be a positive integer'),
  body('assigned_to').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('Assigned user ID must be a positive integer'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('due_date').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('position').optional().isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  body('is_archived').optional().isBoolean().withMessage('is_archived must be a boolean'),
];

export const validateLocationCreate = [
  body('name').notEmpty().withMessage('Location name is required'),
  body('level').isIn(['EMIRATE', 'NEIGHBOURHOOD', 'CLUSTER', 'BUILDING', 'BUILDING_LVL1', 'BUILDING_LVL2']).withMessage('Invalid location level'),
  body('slug').optional().isString().withMessage('Slug must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('parent_id').optional().isString().withMessage('Parent ID must be a valid UUID'),
  body('latitude').optional().isFloat().withMessage('Latitude must be a valid number'),
  body('longitude').optional().isFloat().withMessage('Longitude must be a valid number'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
];

export const validateLocationUpdate = [
  body('name').optional().notEmpty().withMessage('Location name cannot be empty'),
  body('level').optional().isIn(['EMIRATE', 'NEIGHBOURHOOD', 'CLUSTER', 'BUILDING', 'BUILDING_LVL1', 'BUILDING_LVL2']).withMessage('Invalid location level'),
  body('slug').optional().isString().withMessage('Slug must be a string'),
  body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
  body('parent_id').optional({ nullable: true }).isString().withMessage('Parent ID must be a valid UUID'),
  body('latitude').optional({ nullable: true }).isFloat().withMessage('Latitude must be a valid number'),
  body('longitude').optional({ nullable: true }).isFloat().withMessage('Longitude must be a valid number'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
];

