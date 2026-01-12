import { apiClient, validateResponse } from '../config';
import {
  BonusRulesSchema,
  BonusWalletSchema,
  BonusOperationDtoSchema,
} from '../schemas';
import type {
  BonusRules,
  BonusWallet,
  AdminAdjustBonusDto,
  BonusOperationDto,
} from '../types';

/**
 * API-клиент бонусной системы.
 */
export const bonusClient = {
  /**
   * Получение правил бонусной системы (только чтение).
   * GET /bonus/rules
   */
  async getBonusRules(): Promise<BonusRules> {
    const response = await apiClient.get('/bonus/rules');
    return validateResponse(response.data, BonusRulesSchema);
  },

  /**
   * Получение бонусного кошелька текущего клиента.
   * GET /clients/me/bonus
   */
  async getMyClientBonus(): Promise<BonusWallet> {
    const response = await apiClient.get('/clients/me/bonus');
    return validateResponse(response.data, BonusWalletSchema);
  },

  /**
   * Корректировка бонусов клиента (только ADMIN). Может быть положительной или отрицательной.
   * POST /bonus/adjust
   */
  async adjustBonus(dto: AdminAdjustBonusDto): Promise<BonusOperationDto> {
    const response = await apiClient.post('/bonus/adjust', dto);
    return validateResponse(response.data, BonusOperationDtoSchema);
  },
};
