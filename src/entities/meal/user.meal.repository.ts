import { MealModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { PrismaService } from 'database/prisma.service';
import { IMealRepository, TMeal } from './user.meal.repository.interface';
import {
  TMealsListFilters,
  TResultMealsList
} from './user.meal.service.interface';

import { TYPES } from 'types';

@injectable()
export class MealRepository implements IMealRepository {
  @inject(TYPES.PrismaService) private prismaService: PrismaService;
  constructor() {}

  async create(userId: number, meal: TMeal): Promise<MealModel> {
    return this.prismaService.client.mealModel.create({
      data: {
        ...meal,
        userId: userId
      }
    });
  }

  async getMealsList(filters: TMealsListFilters): Promise<TResultMealsList> {
    const { userId, limit, page } = filters;
    const pageSize = limit || 10;
    const pageNumber = page || 1;
    const skip = (pageNumber - 1) * pageSize;

    const meals = await this.prismaService.client.mealModel.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: pageSize
    });

    const count = await this.prismaService.client.mealModel.count({
      where: {
        userId
      }
    });

    return { meals, count };
  }
}
