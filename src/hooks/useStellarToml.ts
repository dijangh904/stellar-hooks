import { useCallback, useEffect, useState } from "react";
import { StellarTomlResolver } from "@stellar/stellar-sdk";

export interface StellarTomlData {
  CURRENCIES?: Array<Record<string, any>>;
  VALIDATORS?: Array<Record<string, any>>;
  DOCUMENTATION?: Record<string, any>;
  [key: string]: any;
}

/**
 * @example
 * ```tsx
 * const {
 *   data,      // StellarTomlData | null — parsed stellar.toml contents
 *   isLoading, // boolean
 *   error,     // Error | null
 *   refetch,   // () => Promise<void>
 * } = useStellarToml("stellar.org");
 *
 * // data.CURRENCIES → array of supported assets
 * // data.DOCUMENTATION → org info
 * ```
 */
export interface UseStellarTomlReturn {
  data: StellarTomlData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches and parses a domain's stellar.toml file via the SEP-1 standard.
 */
export function useStellarToml(
  domain: string | null | undefined
): UseStellarTomlReturn {
  const [data, setData] = useState<StellarTomlData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!domain) return;
    setIsLoading(true);
    setError(null);
    try {
      const toml = await StellarTomlResolver.resolve(domain);
      setData(toml as StellarTomlData);
    } catch (err) {
      // Gracefully capture and surface errors (e.g., CORS, network failure)
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    if (domain) {
      refetch();
    }
  }, [domain, refetch]);

  return { data, isLoading, error, refetch };
}