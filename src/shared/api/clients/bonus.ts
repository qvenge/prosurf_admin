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
 * Bonus API client
 */
export const bonusClient = {
  /**
   * Get bonus rules (read-only)
   * GET /bonus/rules
   */
  async getBonusRules(): Promise<BonusRules> {
    const response = await apiClient.get('/bonus/rules');
    return validateResponse(response.data, BonusRulesSchema);
  },

  /**
   * Get current client's bonus wallet
   * GET /clients/me/bonus
   */
  async getMyClientBonus(): Promise<BonusWallet> {
    const response = await apiClient.get('/clients/me/bonus');
    return validateResponse(response.data, BonusWalletSchema);
  },

  /**
   * Adjust client's bonus (admin only) - can be positive or negative
   * POST /bonus/adjust
   */
  async adjustBonus(dto: AdminAdjustBonusDto): Promise<BonusOperationDto> {
    const response = await apiClient.post('/bonus/adjust', dto);
    return validateResponse(response.data, BonusOperationDtoSchema);
  },

  // Note: User bonus wallet is also accessed through usersClient.getUserBonus()
};
