export function range(start: number, end: number, step: number): number[] {
  const result: number[] = [];
  const epsilon = 1e-10; // to handle floating-point imprecision

  for (let current = start; current <= end + epsilon; current += step) {
    result.push(Number(current.toFixed(10)));
  }

  return result;
}

export function formatNumber(value: number | null): string {
  if (value === null || isNaN(value)) {
    return "";
  }
  const rounded = Math.round(value);
  // Math.round(-0.4) is -0, which toLocaleString renders as "-0".
  return (rounded === 0 ? 0 : rounded).toLocaleString("en-US");
}
