import { Router } from 'express';
import { KanbanController } from '../controllers/kanbanController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId, validateBoardId, validateCardId, validateTemplateId, validateKanbanBoardCreate, validateKanbanBoardUpdate, validateKanbanColumnCreate, validateKanbanCardCreate, validateKanbanCardUpdate } from '../utils/validation';

const router = Router();
const kanbanController = new KanbanController();

// All routes require authentication
router.use(authenticate);

// Boards
router.get(
  '/boards',
  validate(validatePagination),
  kanbanController.getBoards.bind(kanbanController)
);

router.get(
  '/boards/:id',
  validate(validateId),
  kanbanController.getBoardById.bind(kanbanController)
);

router.post(
  '/boards',
  validate(validateKanbanBoardCreate),
  kanbanController.createBoard.bind(kanbanController)
);

router.put(
  '/boards/:id',
  validate([...validateId, ...validateKanbanBoardUpdate]),
  kanbanController.updateBoard.bind(kanbanController)
);

router.delete(
  '/boards/:id',
  validate(validateId),
  kanbanController.deleteBoard.bind(kanbanController)
);

router.post(
  '/boards/templates/:templateId/duplicate',
  validate(validateTemplateId),
  kanbanController.duplicateBoard.bind(kanbanController)
);

// Board Statistics
router.get(
  '/boards/:boardId/stats',
  validate(validateBoardId),
  kanbanController.getBoardStats.bind(kanbanController)
);

// Columns
router.post(
  '/boards/:boardId/columns',
  validate([...validateBoardId, ...validateKanbanColumnCreate]),
  kanbanController.createColumn.bind(kanbanController)
);

router.put(
  '/columns/:id',
  validate([...validateId, ...validateKanbanColumnCreate]),
  kanbanController.updateColumn.bind(kanbanController)
);

router.delete(
  '/columns/:id',
  validate(validateId),
  kanbanController.deleteColumn.bind(kanbanController)
);

router.post(
  '/boards/:boardId/columns/reorder',
  validate(validateBoardId),
  kanbanController.reorderColumns.bind(kanbanController)
);

// Cards
router.get(
  '/boards/:boardId/cards',
  validate(validateBoardId),
  kanbanController.getCards.bind(kanbanController)
);

router.get(
  '/cards/:id',
  validate(validateId),
  kanbanController.getCardById.bind(kanbanController)
);

router.post(
  '/boards/:boardId/cards',
  validate([...validateBoardId, ...validateKanbanCardCreate]),
  kanbanController.createCard.bind(kanbanController)
);

router.put(
  '/cards/:id',
  validate([...validateId, ...validateKanbanCardUpdate]),
  kanbanController.updateCard.bind(kanbanController)
);

router.post(
  '/cards/:cardId/move',
  validate(validateCardId),
  kanbanController.moveCard.bind(kanbanController)
);

router.delete(
  '/cards/:id',
  validate(validateId),
  kanbanController.deleteCard.bind(kanbanController)
);

// Card Comments
router.post(
  '/cards/:cardId/comments',
  validate(validateCardId),
  kanbanController.addComment.bind(kanbanController)
);

// Card Attachments
router.post(
  '/cards/:cardId/attachments',
  validate(validateCardId),
  kanbanController.addAttachment.bind(kanbanController)
);

// Labels
router.post(
  '/boards/:boardId/labels',
  validate(validateBoardId),
  kanbanController.createLabel.bind(kanbanController)
);

router.post(
  '/cards/:cardId/labels',
  validate(validateCardId),
  kanbanController.addLabelsToCard.bind(kanbanController)
);

export default router;

