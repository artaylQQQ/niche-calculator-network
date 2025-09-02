function formatNumber(n) {
  const rounded = n.toFixed(4);
  let [intPart, fracPart] = rounded.split('.');
  if (fracPart) {
    fracPart = fracPart.replace(/0+$/, '');
    if (fracPart.length === 0) {
      return intPart;
    }
    if (fracPart.length === 3) {
      fracPart += '0';
    }
    return `${intPart}.${fracPart}`;
  }
  return intPart;
}

export function formatResult(value, isMoney = false, currency = "$") {
  if (typeof value === "number") {
    const v = formatNumber(value);
    return isMoney ? `${currency}${v}` : v;
  }
  return value;
}
