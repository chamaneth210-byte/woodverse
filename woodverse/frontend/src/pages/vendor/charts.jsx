import { formatLkrShort } from "./format.js";
import { salesRanges } from "./seed.js";

export function SalesChart({ range }) {
  const data = salesRanges[range] || salesRanges["Last 6 Months"];
  const maxRevenue = 1200000;
  const chartWidth = 720;
  const chartHeight = 260;
  const padding = { top: 20, right: 26, bottom: 42, left: 82 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const yTicks = [1200000, 1000000, 800000, 600000, 400000, 200000, 0];
  const points = data.map((item, index) => {
    const x = padding.left + (data.length === 1 ? plotWidth / 2 : (plotWidth / (data.length - 1)) * index);
    const y = padding.top + plotHeight - (item.revenue / maxRevenue) * plotHeight;
    return { ...item, x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${padding.left},${padding.top + plotHeight} ${linePoints} ${padding.left + plotWidth},${padding.top + plotHeight}`;
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const bestMonth = data.reduce((best, item) => (item.revenue > best.revenue ? item : best), data[0]);
  const previous = data[data.length - 2]?.revenue || data[0].revenue;
  const growth = Math.round(((data[data.length - 1].revenue - previous) / previous) * 100);

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-lg border border-[#e1ddd4] bg-[#fbfaf6]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[320px] w-full" role="img" aria-label={`${range} monthly sales performance chart`}>
          <defs>
            <linearGradient id="vendor-sales-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#115745" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#115745" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = padding.top + plotHeight - (tick / maxRevenue) * plotHeight;
            return (
              <g key={tick}>
                <line x1={padding.left} x2={padding.left + plotWidth} y1={y} y2={y} stroke="#ded8ce" strokeWidth="1" />
                <text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-[#747a76] text-[11px] font-semibold">
                  {formatLkrShort(tick)}
                </text>
              </g>
            );
          })}

          <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#bfc6c1" strokeWidth="1.4" />
          <line x1={padding.left} x2={padding.left + plotWidth} y1={padding.top + plotHeight} y2={padding.top + plotHeight} stroke="#bfc6c1" strokeWidth="1.4" />
          <polygon points={areaPoints} fill="url(#vendor-sales-area)" />
          <polyline points={linePoints} fill="none" stroke="#115745" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point) => (
            <g key={point.month}>
              <line x1={point.x} x2={point.x} y1={point.y + 12} y2={padding.top + plotHeight} stroke="#d9d5cd" strokeDasharray="4 6" />
              <circle cx={point.x} cy={point.y} r="8" fill="white" stroke="#115745" strokeWidth="4" />
              <circle cx={point.x} cy={point.y} r="3" fill="#115745" />
              <text x={point.x} y={point.y - 14} textAnchor="middle" className="fill-[#115745] text-[11px] font-bold">
                {formatLkrShort(point.revenue)}
              </text>
              <text x={point.x} y={padding.top + plotHeight + 28} textAnchor="middle" className="fill-[#5f6964] text-[12px] font-bold">
                {point.month}
              </text>
            </g>
          ))}

          <text x={padding.left} y={chartHeight - 6} className="fill-[#747a76] text-[10px] font-bold uppercase">
            Revenue in LKR
          </text>
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ChartMetric label="Total Revenue" value={formatLkrShort(totalRevenue)} />
        <ChartMetric label="Customer Orders" value={String(totalOrders)} />
        <ChartMetric label="Best Month" value={`${bestMonth.month} ${formatLkrShort(bestMonth.revenue)}`} helper={`${growth >= 0 ? "+" : ""}${growth}% vs previous`} />
      </div>
    </div>
  );
}

export function ChartMetric({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-[#e1ddd4] bg-[#fbfaf6] px-4 py-3">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-lg text-[#202621]">{value}</strong>
      {helper && <span className="text-xs font-bold text-[#2f8b55]">{helper}</span>}
    </div>
  );
}

export function DonutChart() {
  return (
    <svg viewBox="0 0 180 180" className="h-52 w-52" aria-label="Production stages donut chart">
      <circle cx="90" cy="90" r="62" fill="none" stroke="#115745" strokeWidth="26" strokeDasharray="175 389" strokeDashoffset="0" />
      <circle cx="90" cy="90" r="62" fill="none" stroke="#8b5633" strokeWidth="26" strokeDasharray="109 389" strokeDashoffset="-175" />
      <circle cx="90" cy="90" r="62" fill="none" stroke="#334f35" strokeWidth="26" strokeDasharray="105 389" strokeDashoffset="-284" />
      <circle cx="90" cy="90" r="44" fill="white" />
      <text x="90" y="86" textAnchor="middle" className="fill-[#202621] text-[18px] font-bold">32</text>
      <text x="90" y="106" textAnchor="middle" className="fill-[#66716b] text-[10px] font-bold uppercase">Active Works</text>
    </svg>
  );
}
