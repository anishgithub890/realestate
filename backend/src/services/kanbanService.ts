import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class KanbanService {
  /**
   * Get all boards
   */
  async getBoards(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.board_type) {
      where.board_type = filters.board_type;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    if (filters.is_template !== undefined) {
      where.is_template = filters.is_template === 'true' || filters.is_template === true;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const [boards, total] = await Promise.all([
      prisma.kanbanBoard.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              cards: true,
              columns: true,
            },
          },
        },
      }),
      prisma.kanbanBoard.count({ where }),
    ]);

    return {
      items: boards,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get board by ID with full details
   */
  async getBoardById(id: number, companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        columns: {
          orderBy: {
            position: 'asc',
          },
          include: {
            cards: {
              where: {
                is_archived: false,
              },
              orderBy: {
                position: 'asc',
              },
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                creator: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                card_labels: {
                  include: {
                    label: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    attachments: true,
                  },
                },
              },
            },
          },
        },
        labels: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    return board;
  }

  /**
   * Create board
   */
  async createBoard(data: any, companyId: number, createdBy: number) {
    const validBoardTypes = ['leads', 'properties', 'deals', 'contracts', 'maintenance', 'custom'];
    
    if (!validBoardTypes.includes(data.board_type)) {
      throw new ValidationError(`Invalid board type. Valid types: ${validBoardTypes.join(', ')}`);
    }

    // Create board
    const board = await prisma.kanbanBoard.create({
      data: {
        company_id: companyId,
        name: data.name,
        description: data.description || null,
        board_type: data.board_type,
        is_template: data.is_template || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_by: createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create default columns based on board type
    const defaultColumns = this.getDefaultColumns(data.board_type);
    
    await Promise.all(
      defaultColumns.map((col, index) =>
        prisma.kanbanColumn.create({
          data: {
            board_id: board.id,
            name: col.name,
            position: index,
            color: col.color || null,
            is_done: col.is_done || false,
            wip_limit: col.wip_limit || null,
          },
        })
      )
    );

    return this.getBoardById(board.id, companyId);
  }

  /**
   * Get default columns for board type
   */
  private getDefaultColumns(boardType: string): Array<{ name: string; color?: string; is_done?: boolean; wip_limit?: number }> {
    const columnMap: { [key: string]: Array<{ name: string; color?: string; is_done?: boolean; wip_limit?: number }> } = {
      leads: [
        { name: 'New Leads', color: '#3B82F6' },
        { name: 'Contacted', color: '#8B5CF6' },
        { name: 'Qualified', color: '#10B981' },
        { name: 'Viewing Scheduled', color: '#F59E0B' },
        { name: 'Offer Made', color: '#EF4444' },
        { name: 'Converted', color: '#059669', is_done: true },
        { name: 'Lost', color: '#6B7280', is_done: true },
      ],
      properties: [
        { name: 'Draft', color: '#6B7280' },
        { name: 'Under Review', color: '#3B82F6' },
        { name: 'Listed', color: '#10B981' },
        { name: 'Under Offer', color: '#F59E0B' },
        { name: 'Sold/Rented', color: '#059669', is_done: true },
        { name: 'Withdrawn', color: '#EF4444', is_done: true },
      ],
      deals: [
        { name: 'Initial Discussion', color: '#3B82F6' },
        { name: 'Negotiation', color: '#8B5CF6' },
        { name: 'Agreement in Principle', color: '#10B981' },
        { name: 'Contracts Sent', color: '#F59E0B' },
        { name: 'Contracts Signed', color: '#059669', is_done: true },
        { name: 'Deal Closed', color: '#059669', is_done: true },
        { name: 'Deal Cancelled', color: '#EF4444', is_done: true },
      ],
      contracts: [
        { name: 'Draft', color: '#6B7280' },
        { name: 'Under Review', color: '#3B82F6' },
        { name: 'Pending Signatures', color: '#F59E0B' },
        { name: 'Active', color: '#10B981', is_done: true },
        { name: 'Expired', color: '#6B7280', is_done: true },
        { name: 'Terminated', color: '#EF4444', is_done: true },
      ],
      maintenance: [
        { name: 'Requested', color: '#3B82F6' },
        { name: 'Assigned', color: '#8B5CF6' },
        { name: 'In Progress', color: '#F59E0B' },
        { name: 'Completed', color: '#10B981', is_done: true },
        { name: 'Cancelled', color: '#EF4444', is_done: true },
      ],
      custom: [
        { name: 'To Do', color: '#6B7280' },
        { name: 'In Progress', color: '#3B82F6' },
        { name: 'Done', color: '#10B981', is_done: true },
      ],
    };

    return columnMap[boardType] || columnMap.custom;
  }

  /**
   * Update board
   */
  async updateBoard(id: number, data: any, companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.is_template !== undefined) updateData.is_template = data.is_template;

    const updatedBoard = await prisma.kanbanBoard.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedBoard;
  }

  /**
   * Delete board
   */
  async deleteBoard(id: number, companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    await prisma.kanbanBoard.delete({
      where: { id },
    });

    return { message: 'Board deleted successfully' };
  }

  /**
   * Create column
   */
  async createColumn(boardId: number, data: any, companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id: boardId,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    // Get max position
    const maxColumn = await prisma.kanbanColumn.findFirst({
      where: { board_id: boardId },
      orderBy: { position: 'desc' },
    });

    const position = maxColumn ? maxColumn.position + 1 : 0;

    const column = await prisma.kanbanColumn.create({
      data: {
        board_id: boardId,
        name: data.name,
        position: data.position !== undefined ? data.position : position,
        color: data.color || null,
        is_done: data.is_done || false,
        wip_limit: data.wip_limit || null,
      },
    });

    return column;
  }

  /**
   * Update column
   */
  async updateColumn(columnId: number, data: any, companyId: number) {
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: columnId,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!column) {
      throw new NotFoundError('Kanban Column');
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.is_done !== undefined) updateData.is_done = data.is_done;
    if (data.wip_limit !== undefined) updateData.wip_limit = data.wip_limit;

    const updatedColumn = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: updateData,
    });

    return updatedColumn;
  }

  /**
   * Delete column
   */
  async deleteColumn(columnId: number, companyId: number) {
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: columnId,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!column) {
      throw new NotFoundError('Kanban Column');
    }

    await prisma.kanbanColumn.delete({
      where: { id: columnId },
    });

    return { message: 'Column deleted successfully' };
  }

  /**
   * Reorder columns
   */
  async reorderColumns(boardId: number, columnIds: number[], companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id: boardId,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    // Update positions
    await Promise.all(
      columnIds.map((columnId, index) =>
        prisma.kanbanColumn.update({
          where: { id: columnId },
          data: { position: index },
        })
      )
    );

    return { message: 'Columns reordered successfully' };
  }

  /**
   * Create card
   */
  async createCard(boardId: number, data: any, companyId: number, createdBy: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id: boardId,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    // Validate column
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: data.column_id,
        board_id: boardId,
      },
    });

    if (!column) {
      throw new NotFoundError('Kanban Column');
    }

    // Validate assigned user if provided
    if (data.assigned_to) {
      const user = await prisma.user.findFirst({
        where: {
          id: data.assigned_to,
          company_id: companyId,
        },
      });

      if (!user) {
        throw new NotFoundError('Assigned User');
      }
    }

    // Get max position in column
    const maxCard = await prisma.kanbanCard.findFirst({
      where: { column_id: data.column_id },
      orderBy: { position: 'desc' },
    });

    const position = maxCard ? maxCard.position + 1 : 0;

    // Validate entity if provided
    if (data.entity_id && data.entity_type) {
      await this.validateEntity(data.entity_id, data.entity_type, companyId);
    }

    const card = await prisma.kanbanCard.create({
      data: {
        board_id: boardId,
        column_id: data.column_id,
        title: data.title,
        description: data.description || null,
        card_type: data.card_type || 'custom',
        entity_id: data.entity_id || null,
        entity_type: data.entity_type || null,
        assigned_to: data.assigned_to || null,
        priority: data.priority || 'medium',
        due_date: data.due_date ? new Date(data.due_date) : null,
        position: data.position !== undefined ? data.position : position,
        created_by: createdBy,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        card_labels: {
          include: {
            label: true,
          },
        },
      },
    });

    // Add labels if provided
    if (data.label_ids && data.label_ids.length > 0) {
      await this.addLabelsToCard(card.id, data.label_ids, companyId);
    }

    return this.getCardById(card.id, companyId);
  }

  /**
   * Validate entity exists
   */
  private async validateEntity(entityId: number, entityType: string, companyId: number) {
    switch (entityType) {
      case 'lead':
        const lead = await prisma.lead.findFirst({
          where: { id: entityId, company_id: companyId },
        });
        if (!lead) throw new NotFoundError('Lead');
        break;

      case 'property':
      case 'unit':
        const unit = await prisma.unit.findFirst({
          where: { id: entityId, company_id: companyId },
        });
        if (!unit) throw new NotFoundError('Property/Unit');
        break;

      case 'contract':
        const contract = await prisma.rentalContract.findFirst({
          where: { id: entityId, company_id: companyId },
        });
        if (!contract) {
          const salesContract = await prisma.salesContract.findFirst({
            where: { id: entityId, company_id: companyId },
          });
          if (!salesContract) throw new NotFoundError('Contract');
        }
        break;

      default:
        throw new ValidationError(`Invalid entity type: ${entityType}`);
    }
  }

  /**
   * Get card by ID
   */
  async getCardById(id: number, companyId: number) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        board: {
          company_id: companyId,
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            board_type: true,
          },
        },
        card_labels: {
          include: {
            label: true,
          },
        },
        comments: {
          orderBy: {
            created_at: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        attachments: {
          orderBy: {
            created_at: 'desc',
          },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Kanban Card');
    }

    return card;
  }

  /**
   * Update card
   */
  async updateCard(id: number, data: any, companyId: number) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Kanban Card');
    }

    // Validate column if changing
    if (data.column_id && data.column_id !== card.column_id) {
      const column = await prisma.kanbanColumn.findFirst({
        where: {
          id: data.column_id,
          board_id: card.board_id,
        },
      });

      if (!column) {
        throw new NotFoundError('Kanban Column');
      }
    }

    // Validate assigned user if provided
    if (data.assigned_to !== undefined) {
      if (data.assigned_to) {
        const user = await prisma.user.findFirst({
          where: {
            id: data.assigned_to,
            company_id: companyId,
          },
        });

        if (!user) {
          throw new NotFoundError('Assigned User');
        }
      }
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.column_id !== undefined) updateData.column_id = data.column_id;
    if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.due_date !== undefined) updateData.due_date = data.due_date ? new Date(data.due_date) : null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.is_archived !== undefined) updateData.is_archived = data.is_archived;

    await prisma.kanbanCard.update({
      where: { id },
      data: updateData,
    });

    return await this.getCardById(id, companyId);
  }

  /**
   * Move card (drag and drop)
   */
  async moveCard(cardId: number, targetColumnId: number, targetPosition: number, companyId: number) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Kanban Card');
    }

    // Validate target column
    const targetColumn = await prisma.kanbanColumn.findFirst({
      where: {
        id: targetColumnId,
        board_id: card.board_id,
      },
    });

    if (!targetColumn) {
      throw new NotFoundError('Target Column');
    }

    // Check WIP limit
    if (targetColumn.wip_limit) {
      const cardCount = await prisma.kanbanCard.count({
        where: {
          column_id: targetColumnId,
          is_archived: false,
        },
      });

      if (cardCount >= targetColumn.wip_limit) {
        throw new ValidationError(`Column WIP limit (${targetColumn.wip_limit}) reached`);
      }
    }

    // Get cards in target column that need position update
    const targetCards = await prisma.kanbanCard.findMany({
      where: {
        column_id: targetColumnId,
        position: { gte: targetPosition },
        id: { not: cardId },
      },
    });

    // Update positions of other cards in target column
    for (const targetCard of targetCards) {
      await prisma.kanbanCard.update({
        where: { id: targetCard.id },
        data: { position: targetCard.position + 1 },
      });
    }

    // Get cards in source column that need position update
    const sourceCards = await prisma.kanbanCard.findMany({
      where: {
        column_id: card.column_id,
        position: { gt: card.position },
      },
    });

    // Update positions of cards in source column
    for (const sourceCard of sourceCards) {
      await prisma.kanbanCard.update({
        where: { id: sourceCard.id },
        data: { position: sourceCard.position - 1 },
      });
    }

    // Move card
    await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        column_id: targetColumnId,
        position: targetPosition,
      },
    });

    return this.getCardById(cardId, companyId);
  }

  /**
   * Delete card
   */
  async deleteCard(id: number, companyId: number) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Kanban Card');
    }

    await prisma.kanbanCard.delete({
      where: { id },
    });

    return { message: 'Card deleted successfully' };
  }

  /**
   * Add comment to card
   */
  async addComment(cardId: number, comment: string, userId: number, companyId: number) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Kanban Card');
    }

    const cardComment = await prisma.kanbanCardComment.create({
      data: {
        card_id: cardId,
        user_id: userId,
        comment: comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return cardComment;
  }

  /**
   * Add attachment to card
   */
  async addAttachment(cardId: number, fileData: any, uploadedBy: number, companyId: number) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Kanban Card');
    }

    const attachment = await prisma.kanbanCardAttachment.create({
      data: {
        card_id: cardId,
        file_name: fileData.file_name,
        file_url: fileData.file_url,
        file_type: fileData.file_type || null,
        file_size: fileData.file_size || null,
        uploaded_by: uploadedBy,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return attachment;
  }

  /**
   * Create label
   */
  async createLabel(boardId: number, data: any, companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id: boardId,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    const label = await prisma.kanbanLabel.create({
      data: {
        board_id: boardId,
        company_id: companyId,
        name: data.name,
        color: data.color || '#3B82F6',
      },
    });

    return label;
  }

  /**
   * Add labels to card
   */
  async addLabelsToCard(cardId: number, labelIds: number[], companyId: number) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        board: {
          company_id: companyId,
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Kanban Card');
    }

    // Validate labels belong to same board
    const labels = await prisma.kanbanLabel.findMany({
      where: {
        id: { in: labelIds },
        board_id: card.board_id,
      },
    });

    if (labels.length !== labelIds.length) {
      throw new ValidationError('One or more labels not found or belong to different board');
    }

    // Remove existing labels
    await prisma.kanbanCardLabel.deleteMany({
      where: { card_id: cardId },
    });

    // Add new labels
    if (labelIds.length > 0) {
      await prisma.kanbanCardLabel.createMany({
        data: labelIds.map((labelId) => ({
          card_id: cardId,
          label_id: labelId,
        })),
      });
    }

    return { message: 'Labels updated successfully' };
  }

  /**
   * Get cards with filters
   */
  async getCards(boardId: number, filters: any, companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id: boardId,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    const where: any = {
      board_id: boardId,
      is_archived: filters.archived === 'true' || filters.archived === true,
    };

    if (filters.column_id) {
      where.column_id = parseInt(filters.column_id);
    }

    if (filters.assigned_to) {
      where.assigned_to = parseInt(filters.assigned_to);
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.card_type) {
      where.card_type = filters.card_type;
    }

    if (filters.entity_type) {
      where.entity_type = filters.entity_type;
    }

    if (filters.due_date_from) {
      where.due_date = { gte: new Date(filters.due_date_from) };
    }

    if (filters.due_date_to) {
      where.due_date = {
        ...where.due_date,
        lte: new Date(filters.due_date_to),
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const cards = await prisma.kanbanCard.findMany({
      where,
      orderBy: [
        { column: { position: 'asc' } },
        { position: 'asc' },
      ],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
        card_labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    return cards;
  }

  /**
   * Get board statistics
   */
  async getBoardStats(boardId: number, companyId: number) {
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id: boardId,
        company_id: companyId,
      },
    });

    if (!board) {
      throw new NotFoundError('Kanban Board');
    }

    const [
      totalCards,
      cardsByColumn,
      cardsByPriority,
      overdueCards,
      cardsByAssignee,
    ] = await Promise.all([
      prisma.kanbanCard.count({
        where: {
          board_id: boardId,
          is_archived: false,
        },
      }),
      prisma.kanbanCard.groupBy({
        by: ['column_id'],
        where: {
          board_id: boardId,
          is_archived: false,
        },
        _count: true,
      }),
      prisma.kanbanCard.groupBy({
        by: ['priority'],
        where: {
          board_id: boardId,
          is_archived: false,
        },
        _count: true,
      }),
      prisma.kanbanCard.count({
        where: {
          board_id: boardId,
          is_archived: false,
          due_date: {
            lt: new Date(),
          },
        },
      }),
      prisma.kanbanCard.groupBy({
        by: ['assigned_to'],
        where: {
          board_id: boardId,
          is_archived: false,
          assigned_to: { not: null },
        },
        _count: true,
      }),
    ]);

    // Get column names
    const columnIds = cardsByColumn.map((c) => c.column_id);
    const columns = await prisma.kanbanColumn.findMany({
      where: {
        id: { in: columnIds },
      },
    });

    // Get assignee names
    const assigneeIds = cardsByAssignee.map((c) => c.assigned_to).filter(Boolean) as number[];
    const assignees = assigneeIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: { in: assigneeIds },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : [];

    return {
      total_cards: totalCards,
      overdue_cards: overdueCards,
      by_column: cardsByColumn.map((c: any) => ({
        column_id: c.column_id,
        column_name: columns.find((col: any) => col.id === c.column_id)?.name || 'Unknown',
        count: c._count,
      })),
      by_priority: cardsByPriority.map((p: any) => ({
        priority: p.priority,
        count: p._count,
      })),
      by_assignee: cardsByAssignee.map((a: any) => ({
        assignee_id: a.assigned_to,
        assignee: a.assigned_to
          ? assignees.find((u) => u.id === a.assigned_to) || null
          : null,
        count: a._count,
      })),
    };
  }

  /**
   * Duplicate board (create from template)
   */
  async duplicateBoard(templateId: number, data: any, companyId: number, createdBy: number) {
    const template = await prisma.kanbanBoard.findFirst({
      where: {
        id: templateId,
        company_id: companyId,
        is_template: true,
      },
      include: {
        columns: {
          orderBy: {
            position: 'asc',
          },
        },
        labels: true,
      },
    });

    if (!template) {
      throw new NotFoundError('Board Template');
    }

    // Create new board
    const board = await prisma.kanbanBoard.create({
      data: {
        company_id: companyId,
        name: data.name || `${template.name} (Copy)`,
        description: data.description || template.description,
        board_type: template.board_type,
        is_template: false,
        is_active: true,
        created_by: createdBy,
      },
    });

    // Copy columns
    const columnMap: { [key: number]: number } = {};
    for (const column of template.columns) {
      const newColumn = await prisma.kanbanColumn.create({
        data: {
          board_id: board.id,
          name: column.name,
          position: column.position,
          color: column.color,
          is_done: column.is_done,
          wip_limit: column.wip_limit,
        },
      });
      columnMap[column.id] = newColumn.id;
    }

    // Copy labels
    for (const label of template.labels) {
      await prisma.kanbanLabel.create({
        data: {
          board_id: board.id,
          company_id: companyId,
          name: label.name,
          color: label.color,
        },
      });
    }

    return this.getBoardById(board.id, companyId);
  }
}

