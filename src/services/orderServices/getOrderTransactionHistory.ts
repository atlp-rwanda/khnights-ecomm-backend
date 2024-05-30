import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Transaction } from '../../entities/transaction';
import { sendErrorResponse, sendSuccessResponse } from '../../utils/response.utils';
import { OrderItem } from '../../entities/OrderItem';

export const getTransactionHistoryService = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const transactionRepository = getRepository(Transaction);
    const transactions = await transactionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    });

    if (!transactions || transactions.length === 0) {
      return sendErrorResponse(res, 404, 'No transaction history found');
    }

    const transactionHistory = transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt,
      order: transaction.order
        ? {
            id: transaction.order.id,
            totalPrice: transaction.order.totalPrice,
            orderDate: transaction.order.orderDate,
            address: transaction.order.address,
          }
        : null,
    }));

    return sendSuccessResponse(res, 200, 'Transaction history retrieved successfully', transactionHistory);
  } catch (error) {
    return sendErrorResponse(res, 500, (error as Error).message);
  }
};
