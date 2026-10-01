

export function formatLkrCompact(value) {
  if (value >= 1_000_000) {
    return `LKR ${(value / 1_000_000).toFixed(1)}M`;
  }
  return `LKR ${new Intl.NumberFormat("en-LK").format(Math.round(value))}`;
}

export function formatMessageTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatMaterialPrice(price, multiplier) {
  const currentValue = materialPriceNumber(price);
  const nextValue = Math.max(0, Math.round(currentValue * multiplier));
  return `LKR ${new Intl.NumberFormat("en-LK").format(nextValue)} / m3`;
}

export function materialPriceNumber(price) {
  return Number(price.replace(/[^\d]/g, ""));
}

export function materialQuantityNumber(qty) {
  return Number(qty.replace(/[^\d.]/g, ""));
}

export function materialPercentNumber(percent) {
  return Number(percent.replace(/[^\d]/g, ""));
}

export function materialTone(status) {
  return status === "Low Stock" ? "bg-[#e7a12a] text-[#202621]" : "bg-[#3f835d] text-white";
}
