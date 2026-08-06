export const queryKeys = {
  backendHealth: ["backend-health"] as const,

  latestScalpingSignal: [
    "latest-scalping-signal",
  ] as const,

  recentScalpingSignals: (
    limit: number,
  ) =>
    [
      "recent-scalping-signals",
      limit,
    ] as const,

  marketData: (
    symbol: string,
    timeframe: string,
  ) =>
    [
      "market-data",
      symbol,
      timeframe,
    ] as const,

  account: ["account-status"] as const,

  positions: ["open-positions"] as const,

  closedTradeHistory: (
    days: number,
    limit: number,
  ) =>
    [
      "closed-trade-history",
      days,
      limit,
    ] as const,

  riskStatus: ["risk-status"] as const,

  systemStatus: ["system-status"] as const,
} as const;