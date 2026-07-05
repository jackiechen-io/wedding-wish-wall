export default function AdminTokenInput({ token, setToken, onLoad }: { token: string; setToken: (v: string) => void; onLoad: () => void }) {
  return (
    <div className="mt-5 flex gap-2">
      <input
        className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none"
        placeholder="Admin token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={onLoad} className="rounded-2xl bg-neutral-900 px-5 py-3 text-white">載入</button>
    </div>
  );
}
