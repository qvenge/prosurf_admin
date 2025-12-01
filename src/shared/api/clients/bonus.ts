import { apiClient, validateResponse } from '../config';
import {
  BonusRulesSchema,
  BonusWalletSchema
} from '../schemas';
import type {
  BonusRules,
  BonusWallet
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

  // Note: User bonus wallet is also accessed through usersClient.getUserBonus()
};
