import { Request, Response, NextFunction } from 'express';
import { KanbanService } from '../services/kanbanService';
import { sendSuccess, sendPaginated } from '../utils/response';

const kanbanService = new KanbanService();

export class KanbanController {
  async getBoards(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await kanbanService.getBoards(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getBoardById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const board = await kanbanService.getBoardById(id, req.user.companyId);
      return sendSuccess(res, board);
    } catch (error: any) {
      return next(error);
    }
  }

  async createBoard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const board = await kanbanService.createBoard(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, board, 'Board created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateBoard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const board = await kanbanService.updateBoard(id, req.body, req.user.companyId);
      return sendSuccess(res, board, 'Board updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteBoard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await kanbanService.deleteBoard(id, req.user.companyId);
      return sendSuccess(res, result, 'Board deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async duplicateBoard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const templateId = parseInt(req.params.templateId);
      const board = await kanbanService.duplicateBoard(
        templateId,
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, board, 'Board duplicated successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async createColumn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const boardId = parseInt(req.params.boardId);
      const column = await kanbanService.createColumn(
        boardId,
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, column, 'Column created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateColumn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const column = await kanbanService.updateColumn(id, req.body, req.user.companyId);
      return sendSuccess(res, column, 'Column updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteColumn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await kanbanService.deleteColumn(id, req.user.companyId);
      return sendSuccess(res, result, 'Column deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async reorderColumns(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const boardId = parseInt(req.params.boardId);
      const { column_ids } = req.body;

      if (!Array.isArray(column_ids)) {
        return res.status(400).json({
          success: false,
          error: 'column_ids must be an array',
        });
      }

      const result = await kanbanService.reorderColumns(
        boardId,
        column_ids,
        req.user.companyId
      );
      return sendSuccess(res, result, 'Columns reordered successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async createCard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const boardId = parseInt(req.params.boardId);
      const card = await kanbanService.createCard(
        boardId,
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, card, 'Card created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async getCardById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const card = await kanbanService.getCardById(id, req.user.companyId);
      return sendSuccess(res, card);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateCard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const card = await kanbanService.updateCard(id, req.body, req.user.companyId);
      return sendSuccess(res, card, 'Card updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async moveCard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const cardId = parseInt(req.params.cardId);
      const { column_id, position } = req.body;

      if (column_id === undefined || position === undefined) {
        return res.status(400).json({
          success: false,
          error: 'column_id and position are required',
        });
      }

      const card = await kanbanService.moveCard(
        cardId,
        parseInt(column_id),
        parseInt(position),
        req.user.companyId
      );
      return sendSuccess(res, card, 'Card moved successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteCard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await kanbanService.deleteCard(id, req.user.companyId);
      return sendSuccess(res, result, 'Card deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getCards(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const boardId = parseInt(req.params.boardId);
      const cards = await kanbanService.getCards(boardId, req.query, req.user.companyId);
      return sendSuccess(res, cards);
    } catch (error: any) {
      return next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const cardId = parseInt(req.params.cardId);
      const { comment } = req.body;

      if (!comment) {
        return res.status(400).json({
          success: false,
          error: 'comment is required',
        });
      }

      const cardComment = await kanbanService.addComment(
        cardId,
        comment,
        req.user.userId,
        req.user.companyId
      );
      return sendSuccess(res, cardComment, 'Comment added successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async addAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const cardId = parseInt(req.params.cardId);
      const attachment = await kanbanService.addAttachment(
        cardId,
        req.body,
        req.user.userId,
        req.user.companyId
      );
      return sendSuccess(res, attachment, 'Attachment added successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async createLabel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const boardId = parseInt(req.params.boardId);
      const label = await kanbanService.createLabel(
        boardId,
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, label, 'Label created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async addLabelsToCard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const cardId = parseInt(req.params.cardId);
      const { label_ids } = req.body;

      if (!Array.isArray(label_ids)) {
        return res.status(400).json({
          success: false,
          error: 'label_ids must be an array',
        });
      }

      const result = await kanbanService.addLabelsToCard(
        cardId,
        label_ids,
        req.user.companyId
      );
      return sendSuccess(res, result, 'Labels updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getBoardStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const boardId = parseInt(req.params.boardId);
      const stats = await kanbanService.getBoardStats(boardId, req.user.companyId);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return next(error);
    }
  }
}
