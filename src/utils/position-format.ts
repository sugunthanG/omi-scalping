import type {
  Mt5Position,
} from "@/types/api";


export type PositionDirection =
  | "BUY"
  | "SELL";


export function getPositionDirection(
  positionType: number,
): PositionDirection {
  return positionType === 0
    ? "BUY"
    : "SELL";
}


export function formatPositionPrice(
  value:
    | number
    | null
    | undefined,
  digits = 3,
): string {
  if (
    value === null
    || value === undefined
    || Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(
    digits,
  );
}


export function formatPositionProfit(
  profit:
    | number
    | null
    | undefined,
): string {
  if (
    profit === null
    || profit === undefined
    || Number.isNaN(profit)
  ) {
    return "—";
  }

  const prefix =
    profit > 0
      ? "+"
      : "";

  return `${prefix}${profit.toFixed(2)}`;
}


export function calculatePositionMovement(
  position: Mt5Position,
): number {
  const direction =
    getPositionDirection(
      position.type,
    );

  if (direction === "BUY") {
    return (
      position.price_current
      - position.price_open
    );
  }

  return (
    position.price_open
    - position.price_current
  );
}


export function calculatePositionProgress(
  position: Mt5Position,
): number | null {
  const direction =
    getPositionDirection(
      position.type,
    );

  let totalDistance: number;
  let movedDistance: number;

  if (direction === "BUY") {
    totalDistance =
      position.tp
      - position.price_open;

    movedDistance =
      position.price_current
      - position.price_open;
  } else {
    totalDistance =
      position.price_open
      - position.tp;

    movedDistance =
      position.price_open
      - position.price_current;
  }

  if (
    totalDistance <= 0
    || !Number.isFinite(
      totalDistance,
    )
  ) {
    return null;
  }

  const progress =
    (
      movedDistance
      / totalDistance
    ) * 100;

  return Math.max(
    0,
    Math.min(
      progress,
      100,
    ),
  );
}