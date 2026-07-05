import type { Submission } from '@/types/submission';

export default function SubmissionReviewCard({
  row,
  onApprove,
  onReject,
  onDelete
}: {
  row: Submission;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-3xl bg-white p-4 shadow-sm">
      <img src={row.image_url} className="aspect-[4/3] w-full rounded-2xl object-cover" alt={row.message} />
      <p className="mt-3 font-serif text-lg text-neutral-800">{row.message}</p>
      <p className="mt-1 text-sm text-neutral-400">— {row.nickname}</p>
      <p className="mt-2 text-xs text-neutral-400">{Math.round(row.file_size / 1024)} KB · {row.content_type}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onApprove} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Approve</button>
        <button onClick={onReject} className="rounded-full border border-neutral-200 px-4 py-2 text-sm">Reject</button>
        <button onClick={onDelete} className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-500">Delete</button>
      </div>
    </article>
  );
}
