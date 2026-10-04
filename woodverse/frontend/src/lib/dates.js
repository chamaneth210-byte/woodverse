// Date label helper. It originally lived inside customer/ProfilePage.jsx and was
// called by three vendor pages that never imported it, so those pages threw
// "getFutureDateLabel is not defined" the moment their form initialised.
export function getFutureDateLabel(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
