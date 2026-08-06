export type ApiStatus =
  | "success"
  | "online"
  | "offline"
  | "empty"
  | "error"
  | "blocked"
  | "ignored";

export interface ApiResponse<TData> {
  status: ApiStatus | string;
  data?: TData;
  message?: string;
}

export interface ApiErrorPayload {
  detail?: string;
  message?: string;
  status?: string;
}

export interface BackendRootResponse {
  status: string;
  service: string;
}

export type OmiSignalDirection =
  | "BUY"
  | "SELL"
  | "WAIT"
  | string;

export type OmiTradeQuality =
  | "NO TRADE"
  | "WEAK"
  | "GOOD"
  | "STRONG"
  | "ELITE"
  | string;

export type OmiSignalStatus =
  | "ACTIVE"
  | "BLOCKED"
  | "IGNORED"
  | "FAILED"
  | "PENDING"
  | string;

export interface ScalpingSignal {
  id: string;

  signal: OmiSignalDirection;

  symbol: string | null;

  price: number | null;

  ema20: number | null;

  ema50: number | null;

  rsi: number | null;

  momentum: number | null;

  confirmation_score: number | null;

  confirmed: boolean | null;

  trade_quality: OmiTradeQuality;

  status: OmiSignalStatus;

  created_at: string;

  omi_decision: string | null;

  auto_execute: boolean | null;

  entry: number | null;

  sl: number | null;

  tp: number | null;

  mt5_ticket: number | null;

  pnl: number | null;

  closed_at: string | null;

  close_price: number | null;

  lot: number | null;

  bridge_status: string | null;

  bridge_message: string | null;

  executed_at: string | null;

  deal: number | null;

  buy_score: number | null;

  sell_score: number | null;

  confidence: number | null;
}

export interface LatestScalpingSignalResponse {
  status: "success" | "empty" | string;
  message?: string;
  data: ScalpingSignal | null;
}

export interface MarketCandle {
  time: string;

  Open: number;
  High: number;
  Low: number;
  Close: number;

  Volume: number;

  BuyTicks: number;
  SellTicks: number;
  FlatTicks: number;

  TickDelta: number;
  TickVelocity: number;
  TickAcceleration: number;
  TickVelocityMax: number;

  BuyPressure: number;
  SellPressure: number;
  PressureDelta: number;

  Range: number;
  VolatilityExpansion: number;
  MicroTrend: number;

  Bid: number;
  Ask: number;

  Spread: number;
  SpreadMax: number;
  SpreadMin: number;
}

export interface MarketDataResponse {
  status: "success" | "error" | string;
  rows?: number;
  data?: MarketCandle[];
  message?: string;
}

export interface Mt5Position {
  ticket: number;

  time?: number;
  time_msc?: number;

  time_update?: number;
  time_update_msc?: number;

  type: number;

  magic?: number;
  identifier?: number;

  reason?: number;

  volume: number;

  price_open: number;
  sl: number;
  tp: number;
  price_current: number;

  swap?: number;
  profit: number;

  symbol: string;

  comment?: string;

  external_id?: string;

  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined;
}

export interface PositionMonitorResponse {
  open_trades: number;
  positions: Mt5Position[];
}

export interface ClosedTrade {
  deal_ticket: number;
  order_ticket: number;
  position_id: number;

  symbol: string;
  direction: "BUY" | "SELL" | "UNKNOWN";

  volume: number;
  close_price: number;

  profit: number;
  commission: number;
  swap: number;
  fee: number;
  net_result: number;

  closed_at: string | null;

  comment: string;
  reason: number;
}

export interface ClosedTradeSummary {
  total_profit: number;
  winning_trades: number;
  losing_trades: number;
  break_even_trades: number;
  win_rate: number;
}

export interface ClosedTradeHistoryResponse {
  status: "success" | "error" | string;
  period_days: number;
  count: number;
  summary: ClosedTradeSummary;
  data: ClosedTrade[];
  message?: string;
}

export interface RecentScalpingSignalsResponse {
  status: "success" | "error" | string;
  count: number;
  data: ScalpingSignal[];
  message?: string;
}

export interface RiskStatusResponse {
  status: string;

  auto_trade: boolean;

  today_trade_count: number;
  max_trades_per_day: number;

  today_profit: number;
  max_daily_loss: number;

  consecutive_losses: number;
  max_consecutive_losses: number;

  cooldown_seconds: number;
  execution_cooldown: boolean;

  last_trade_time: string | null;

  active_group: boolean;

  group_status: string | null;
  group_direction: string | null;
  group_quality: string | null;

  group_entries: number;
  group_opened_entries: number;
  group_remaining_entries: number;

  signal_ttl_seconds: number;
  default_cooldown: number;

  last_signal: string | null;
  last_signal_candle: string | null;
  last_processed_candle: string | null;

  current_day: string;

  cooldown_map: Record<
    string,
    number
  >;
}

export interface AccountStatusResponse {
  status: "online" | "offline" | "error" | string;

  message?: string;
  mt5_error?: string;

  login: number;

  name: string;
  server: string;
  company: string;
  currency: string;

  leverage: number;

  trade_allowed: boolean;
  trade_expert: boolean;

  balance: number;
  equity: number;
  credit: number;

  margin: number;
  free_margin: number;
  margin_level: number;

  floating_profit: number;

  equity_change: number;
  equity_change_percent: number;

  used_margin_percent: number;
}

export interface MarketCandle {
  time: string;

  Open: number;
  High: number;
  Low: number;
  Close: number;

  Volume: number;

  BuyTicks: number;
  SellTicks: number;
  FlatTicks: number;

  TickDelta: number;
  TickVelocity: number;
  TickAcceleration: number;
  TickVelocityMax: number;

  BuyPressure: number;
  SellPressure: number;
  PressureDelta: number;

  Range: number;
  VolatilityExpansion: number;
  MicroTrend: number;

  Bid: number;
  Ask: number;

  Spread: number;
  SpreadMax: number;
  SpreadMin: number;
}

export interface MarketDataResponse {
  status: "success" | "error" | string;

  rows?: number;

  data?: MarketCandle[];

  message?: string;
}

export type AuthRole =
  | "USER"
  | "DEVELOPER"
  | "ADMIN";


export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: AuthRole;
  designation: string | null;
  active: boolean;
}


export interface LoginRequest {
  username: string;
  password: string;
}


export interface LoginResponse {
  status: string;

  access_token: string;
  refresh_token: string;

  token_type: string;

  access_token_expires_minutes: number;

  user: AuthenticatedUser;
}


export interface RefreshResponse {
  status: string;

  access_token: string;
  refresh_token: string;

  token_type: string;

  access_token_expires_minutes: number;
}


export interface MeResponse {
  status: string;

  user: AuthenticatedUser;
}


export interface LogoutResponse {
  status: string;
  message: string;
}