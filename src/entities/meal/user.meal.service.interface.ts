import { MealModel } from '@prisma/client';
import { TMeal } from './user.meal.repository.interface';

export interface IMealService {
  create: (userId: number, meal: TMeal) => Promise<MealModel>;
  getMealsList: (filters: TMealsListFilters) => Promise<TResultMealsList>;
}

export type TMealsListFilters = {
  userId: number;

  page: number;
  limit: number;
};

export type TResultMealsList = {
  meals: MealModel[];
  count: number;
};
