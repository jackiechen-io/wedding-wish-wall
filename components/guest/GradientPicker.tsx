'use client';

import type { Gradient } from '@/lib/text/gradients';
import { GRADIENTS, getCssGradient } from '@/lib/text/gradients';

export default function GradientPicker({
  selected,
  onChange,
}: {
  selected: Gradient;
  onChange: (g: Gradient) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {GRADIENTS.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(g)}
          className={`h-12 w-12 flex-shrink-0 rounded-2xl border-2 transition active:scale-95 ${
            selected.id === g.id ? 'border-neutral-900 shadow-md' : 'border-neutral-200'
          }`}
          style={{ background: getCssGradient(g) }}
          aria-label={g.name}
        />
      ))}
    </div>
  );
}
