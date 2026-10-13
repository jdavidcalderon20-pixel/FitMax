import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { 
  isProTier, 
  redeemCoupon, 
  claimAdminRole, 
  getUserSubscription,
  DEFAULT_PAYMENT_CONFIG 
} from './subscription';

const mockStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

describe('FitMax Subscription & Tier System', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    (globalThis as any).localStorage = localStorageMock;
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    (globalThis as any).localStorage = originalLocalStorage;
  });

  it('correctly identifies pro and beta tiers as PRO', () => {
    expect(isProTier('pro')).toBe(true);
    expect(isProTier('beta_lifetime')).toBe(true);
    expect(isProTier('free')).toBe(false);
    expect(isProTier(undefined)).toBe(false);
    expect(isProTier(null)).toBe(false);
  });

  it('redeems local launch coupons successfully', async () => {
    const result = await redeemCoupon('COMBOCALI');
    expect(result.success).toBe(true);
    expect(result.tier).toBe('beta_lifetime');
    expect(localStorageMock.getItem('fitmax_subscription_tier')).toBe('beta_lifetime');

    const proResult = await redeemCoupon('pro2026');
    expect(proResult.success).toBe(true);
    expect(proResult.tier).toBe('pro');
    expect(localStorageMock.getItem('fitmax_subscription_tier')).toBe('pro');
  });

  it('rejects invalid coupon codes gracefully', async () => {
    const emptyResult = await redeemCoupon('');
    expect(emptyResult.success).toBe(false);

    const invalidResult = await redeemCoupon('FAKECODE999');
    expect(invalidResult.success).toBe(false);
  });

  it('allows owner to claim admin role with master secret', async () => {
    const badSecret = await claimAdminRole('WRONG_KEY');
    expect(badSecret.success).toBe(false);

    const goodSecret = await claimAdminRole('FITMAX_ADMIN_2026');
    expect(goodSecret.success).toBe(true);
    expect(localStorageMock.getItem('fitmax_user_role')).toBe('admin');
    expect(localStorageMock.getItem('fitmax_subscription_tier')).toBe('beta_lifetime');
  });

  it('reads user subscription from storage in guest/local mode', async () => {
    localStorageMock.setItem('fitmax_subscription_tier', 'beta_lifetime');
    localStorageMock.setItem('fitmax_user_role', 'admin');

    const sub = await getUserSubscription(null);
    expect(sub.tier).toBe('beta_lifetime');
    expect(sub.role).toBe('admin');
    expect(sub.isPro).toBe(true);
  });

  it('provides default payment configuration for Colombia and Latin America', () => {
    expect(DEFAULT_PAYMENT_CONFIG.monthly_cop).toBe(14900);
    expect(DEFAULT_PAYMENT_CONFIG.annual_cop).toBe(99000);
    expect(DEFAULT_PAYMENT_CONFIG.nequi_phone).toBeDefined();
  });
});
