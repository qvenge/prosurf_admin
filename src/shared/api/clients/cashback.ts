import { apiClient, validateResponse } from '../config';
import {
  CashbackRulesSchema,
  CashbackWalletSchema
} from '../schemas';
import type {
  CashbackRules,
  CashbackWallet
} from '../types';

/**
 * Cashback API client
 */
export const cashbackClient = {
  /**
   * Get cashback rules (read-only)
   * GET /cashback/rules
   */
  async getCashbackRules(): Promise<CashbackRules> {
    const response = await apiClient.get('/cashback/rules');
    return validateResponse(response.data, CashbackRulesSchema);
  },

  /**
   * Get current client's cashback wallet
   * GET /clients/me/cashback
   */
  async getMyClientCashback(): Promise<CashbackWallet> {
    const response = await apiClient.get('/clients/me/cashback');
    return validateResponse(response.data, CashbackWalletSchema);
  },

  // Note: User cashback wallet is also accessed through usersClient.getUserCashback()
};