export function fmt$(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function fmtCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
