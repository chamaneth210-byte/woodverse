

export function AdminComingSoonPage({ section, onCreate }) {
  return (
    <section className="rounded-xl border border-[#c6cdc8] bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#104d3f]">{section}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#66716b]">This admin section is ready for its detailed workflow.</p>
      <button onClick={onCreate} className="mt-5 min-h-11 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">Create Setup Task</button>
    </section>
  );
}
