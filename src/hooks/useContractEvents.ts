import { useState, useEffect } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";

export interface UseContractEventsOptions {
  /** Soroban contract address (C...) */
  contractId: string;
  /** Optional array of topic filters for event matching */
  topics?: string[][];
  /** Event type filter. Default is "contract" */
  type?: "system" | "contract" | "diagnostic";
  /** Max number of events per poll. Default: 100 */
  limit?: number;
  /** Starting ledger to query events from */
  startLedger?: number;
  /** Interval in milliseconds to continuously stream/poll events. Default: 0 (disabled) */
  refetchInterval?: number;
}

export function useContractEvents(options: UseContractEventsOptions) {
  const { config } = useStellarContext();
  const [events, setEvents] = useState<rpc.Api.EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;
    let cursor: string | undefined;

    async function fetchEvents() {
      try {
        setIsLoading(true);
        const server = new rpc.Server(config.sorobanRpcUrl);
        
        const filter: rpc.Api.EventFilter = {
          type: options.type || "contract",
          contractIds: [options.contractId],
          topics: options.topics,
        };

        const response = await server.getEvents({
          startLedger: options.startLedger,
          filters: [filter],
          pagination: {
            cursor,
            limit: options.limit || 100,
          }
        });

        if (isMounted) {
          if (response.events && response.events.length > 0) {
            setEvents((prev) => {
              const newEvents = response.events!.filter((e) => !prev.find((p) => p.id === e.id));
              return [...prev, ...newEvents];
            });
            cursor = response.events[response.events.length - 1].pagingToken;
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (isMounted) setIsLoading(false);
        if (options.refetchInterval && isMounted) {
          timeoutId = setTimeout(fetchEvents, options.refetchInterval);
        }
      }
    }

    fetchEvents();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [config.sorobanRpcUrl, options.contractId, options.type, options.limit, options.startLedger, options.refetchInterval]);

  return { data: events, isLoading, error };
}