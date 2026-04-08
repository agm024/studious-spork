function trimNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "1";
  if (Number.isInteger(num)) return String(num);
  return Number(num.toFixed(3)).toString();
}

export function formatProductUnit(value, unit) {
  const normalizedUnit = String(unit || "pc").toLowerCase();
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1;

  if (normalizedUnit === "l" && safeValue < 1) {
    return `${trimNumber(safeValue * 1000)} ml`;
  }
  if (normalizedUnit === "kg" && safeValue < 1) {
    return `${trimNumber(safeValue * 1000)} g`;
  }
  if (normalizedUnit === "ml" && safeValue >= 1000 && safeValue % 1000 === 0) {
    return `${trimNumber(safeValue / 1000)} L`;
  }
  if (normalizedUnit === "g" && safeValue >= 1000 && safeValue % 1000 === 0) {
    return `${trimNumber(safeValue / 1000)} kg`;
  }

  const unitLabelMap = {
    l: "L",
    ml: "ml",
    kg: "kg",
    g: "g",
    pc: "pc",
  };
  const unitLabel = unitLabelMap[normalizedUnit] || normalizedUnit;
  return `${trimNumber(safeValue)} ${unitLabel}`;
}
