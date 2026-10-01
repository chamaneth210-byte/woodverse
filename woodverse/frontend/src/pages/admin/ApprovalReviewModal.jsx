import {
  Send,
  X,
} from "lucide-react";

export function ApprovalReviewModal({ entity, note, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/35 px-4 py-6">
      <section className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d8d4cc] px-6 py-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#104d3f]">Review Approval</h3>
            <p className="mt-1 text-sm text-[#66716b]">Send a review request before approving this {entity.type.toLowerCase()}.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eee6]" aria-label="Close review">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 px-6 py-5">
          <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
            <span className="text-xs font-extrabold uppercase text-[#66716b]">{entity.type}</span>
            <strong className="mt-1 block text-[#202621]">{entity.name}</strong>
            <p className="mt-1 text-sm font-semibold text-[#66716b]">{entity.email}</p>
            <p className="mt-2 text-xs font-extrabold uppercase text-[#9aa09c]">Requested {entity.requested}</p>
          </div>

          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Review Note
            <textarea value={note} onChange={(event) => onChange(event.target.value)} rows={5} className="rounded-lg border border-[#c6cdc8] bg-white px-3 py-2 font-semibold outline-none focus:border-[#104d3f]" />
          </label>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#d8d4cc] pt-4">
            <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <Send className="h-4 w-4" />
              Send Review
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
