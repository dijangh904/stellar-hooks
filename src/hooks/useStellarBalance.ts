import { useStellarAccount, type UseStellarAccountOptions } from "./useStellarAccount";
import type { StellarBalance } from "../types";

/**
 * @example
 * ```tsx
 * const {
 *   balances,      // StellarBalance[] — all balances (XLM + tokens)
 *   xlmBalance,    // StellarBalance | null — the native XLM entry
 *   isLoading,     // boolean
 *   error,         // Error | null
 *   lastFetchedAt, // Date | null
 *   refetch,       // () => Promise<void>
 * } = useStellarBalance("G...");
 *
 * console.log(`XLM: ${xlmBalance?.balance}`);
 * const tokens = balances.filter(b => !b.isNative);
 * ```
 */
export interface UseStellarBalanceReturn {
  balances: StellarBalance[];
  xlmBalance: StellarBalance | null;
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: Date | null;
  refetch: () => Promise<void>;
}

/**
 * Convenience hook — fetches all balances for a public key and surfaces the
 * XLM (native) balance at the top level.
 *
 * @example
 * ```tsx
 * const { xlmBalance, balances } = useStellarBalance("G...");
 * console.log(`XLM: ${xlmBalance?.balance}`);
 * ```
 */
export function useStellarBalance(
  publicKey: string | null | undefined,
  options?: UseStellarAccountOptions
): UseStellarBalanceReturn {
  const { data, isLoading, error, lastFetchedAt, refetch } =
    useStellarAccount(publicKey, options);

  const balances = data?.balances ?? [];
  const xlmBalance = balances.find((b) => b.isNative) ?? null;

  return { balances, xlmBalance, isLoading, error, lastFetchedAt, refetch };
}
