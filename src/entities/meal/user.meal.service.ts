import { inject, injectable } from 'inversify';
import { IMealRepository, TMeal } from './user.meal.repository.interface';
import { IMealService, TMealsListFilters } from './user.meal.service.interface';
import { TYPES } from 'types';

@injectable()
export class MealService implements IMealService {
  constructor(
    @inject(TYPES.IMealRepository)
    private readonly mealRepository: IMealRepository
  ) {}

  create(userId: number, meal: TMeal) {
    return this.mealRepository.create(userId, meal);
  }

  getMealsList(filters: TMealsListFilters) {
    return this.mealRepository.getMealsList(filters);
  }
}
