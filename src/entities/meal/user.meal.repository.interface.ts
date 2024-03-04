import { MealModel } from '@prisma/client';

import {
  TMealsListFilters,
  TResultMealsList
} from './user.meal.service.interface';

export interface IMealRepository {
  create: (userId: number, meal: TMeal) => Promise<MealModel>;
  getMealsList: (filters: TMealsListFilters) => Promise<TResultMealsList>;
}

export type TMeal = {
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
};
