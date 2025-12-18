import { body, query, param, ValidationChain } from 'express-validator';

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isString().withMessage('SortBy must be a string'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be asc or desc'),
];

export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
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

