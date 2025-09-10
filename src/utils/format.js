export function formatResult(value, isMoney = false, currency = "$") {
  if (typeof value === "number") {
    const decimals = (value.toString().split(".")[1] || "").length;
    let v;
    if (decimals >= 5) {
      v = Number(value.toFixed(4));
    } else if (decimals === 3) {
      v = Number(value.toFixed(2));
    } else {
      v = Number(value.toFixed(decimals));
    }
    return isMoney ? `${currency}${v}` : v;
  }
  return value;
}
