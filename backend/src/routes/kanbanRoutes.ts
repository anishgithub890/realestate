import { Router } from 'express';
import { KanbanController } from '../controllers/kanbanController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId, validateKanbanBoardCreate, validateKanbanBoardUpdate, validateKanbanColumnCreate, validateKanbanCardCreate, validateKanbanCardUpdate } from '../utils/validation';

const router = Router();
const kanbanController = new KanbanController();

// All routes require authentication
router.use(authenticate);

// Boards
router.get(
  '/boards',
  validatePagination,
  validate,
  kanbanController.getBoards.bind(kanbanController)
);

router.get(
  '/boards/:id',
  validateId,
  validate,
  kanbanController.getBoardById.bind(kanbanController)
);

router.post(
  '/boards',
  validateKanbanBoardCreate,
  validate,
  kanbanController.createBoard.bind(kanbanController)
);

router.put(
  '/boards/:id',
  validateId,
  validateKanbanBoardUpdate,
  validate,
  kanbanController.updateBoard.bind(kanbanController)
);

router.delete(
  '/boards/:id',
  validateId,
  validate,
  kanbanController.deleteBoard.bind(kanbanController)
);

router.post(
  '/boards/templates/:templateId/duplicate',
  validateId,
  validate,
  kanbanController.duplicateBoard.bind(kanbanController)
);

// Board Statistics
router.get(
  '/boards/:boardId/stats',
  validateId,
  validate,
  kanbanController.getBoardStats.bind(kanbanController)
);

// Columns
router.post(
  '/boards/:boardId/columns',
  validateId,
  validateKanbanColumnCreate,
  validate,
  kanbanController.createColumn.bind(kanbanController)
);

router.put(
  '/columns/:id',
  validateId,
  validateKanbanColumnCreate,
  validate,
  kanbanController.updateColumn.bind(kanbanController)
);

router.delete(
  '/columns/:id',
  validateId,
  validate,
  kanbanController.deleteColumn.bind(kanbanController)
);

router.post(
  '/boards/:boardId/columns/reorder',
  validateId,
  validate,
  kanbanController.reorderColumns.bind(kanbanController)
);

// Cards
router.get(
  '/boards/:boardId/cards',
  validateId,
  validate,
  kanbanController.getCards.bind(kanbanController)
);

router.get(
  '/cards/:id',
  validateId,
  validate,
  kanbanController.getCardById.bind(kanbanController)
);

router.post(
  '/boards/:boardId/cards',
  validateId,
  validateKanbanCardCreate,
  validate,
  kanbanController.createCard.bind(kanbanController)
);

router.put(
  '/cards/:id',
  validateId,
  validateKanbanCardUpdate,
  validate,
  kanbanController.updateCard.bind(kanbanController)
);

router.post(
  '/cards/:cardId/move',
  validateId,
  validate,
  kanbanController.moveCard.bind(kanbanController)
);

router.delete(
  '/cards/:id',
  validateId,
  validate,
  kanbanController.deleteCard.bind(kanbanController)
);

// Card Comments
router.post(
  '/cards/:cardId/comments',
  validateId,
  validate,
  kanbanController.addComment.bind(kanbanController)
);

// Card Attachments
router.post(
  '/cards/:cardId/attachments',
  validateId,
  validate,
  kanbanController.addAttachment.bind(kanbanController)
);

// Labels
router.post(
  '/boards/:boardId/labels',
  validateId,
  validate,
  kanbanController.createLabel.bind(kanbanController)
);

router.post(
  '/cards/:cardId/labels',
  validateId,
  validate,
  kanbanController.addLabelsToCard.bind(kanbanController)
);

export default router;

