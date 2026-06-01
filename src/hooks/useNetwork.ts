import { useState, useEffect, useCallback } from "react";
import { NETWORK_CONFIGS } from "../types";
import type { StellarNetwork, NetworkConfig, CustomNetworkConfig } from "../types";

const NETWORK_STORAGE_KEY = "stellar-hooks:network";
const CUSTOM_CONFIG_STORAGE_KEY = "stellar-hooks:custom-config";

export function useNetwork() {
  const [network, setNetwork] = useState<StellarNetwork>("testnet");
  const [customConfig, setCustomConfig] = useState<CustomNetworkConfig | null>(null);

  useEffect(() => {
    const savedNetwork = localStorage.getItem(NETWORK_STORAGE_KEY) as StellarNetwork;
    if (savedNetwork) setNetwork(savedNetwork);

    const savedCustomConfig = localStorage.getItem(CUSTOM_CONFIG_STORAGE_KEY);
    if (savedCustomConfig) {
      try {
        setCustomConfig(JSON.parse(savedCustomConfig));
      } catch {}
    }
  }, []);

  const switchNetwork = useCallback((newNetwork: StellarNetwork, newCustomConfig?: CustomNetworkConfig) => {
    setNetwork(newNetwork);
    localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);

    if (newNetwork === "custom" && newCustomConfig) {
      setCustomConfig(newCustomConfig);
      localStorage.setItem(CUSTOM_CONFIG_STORAGE_KEY, JSON.stringify(newCustomConfig));
    }
  }, []);

  let config: NetworkConfig;
  
  if (network === "custom" && customConfig) {
    config = customConfig;
  } else {
    config = NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS] || NETWORK_CONFIGS.testnet;
  }

  return {
    network,
    networkPassphrase: config.networkPassphrase,
    horizonUrl: config.horizonUrl,
    sorobanRpcUrl: config.sorobanRpcUrl,
    switchNetwork,
  };
}