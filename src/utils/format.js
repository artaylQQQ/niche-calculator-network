export function formatResult(value, isMoney = false, currency = "$") {
  if (typeof value === "number") {
    let v = Number(value.toFixed(3));
    return isMoney ? `${currency}${v}` : v;
  }
  return value;
}
