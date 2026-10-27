import { IconMinus, IconPlus } from './Icons.jsx';

/** A labelled number stepper, for counts such as adults and children. */
export default function Stepper({ id, label, hint, value, min = 0, max = 10, onChange, error }) {
  const btn =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-all duration-200 hover:border-action hover:bg-action-soft hover:text-action active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-white disabled:hover:text-ink';

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p id={`${id}-label`} className="text-[15px] font-semibold text-ink">
            {label}
          </p>
          {hint && <p className="text-sm text-mute">{hint}</p>}
        </div>
        <div
          className="flex items-center gap-3"
          role="group"
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <button
            type="button"
            id={`${id}-dec`}
            className={btn}
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            aria-label={`Fewer ${label.toLowerCase()}`}
          >
            <IconMinus size={16} />
          </button>
          <span className="w-6 text-center text-base font-semibold tabular-nums text-ink" aria-live="polite">
            {value}
          </span>
          <button
            type="button"
            id={`${id}-inc`}
            className={btn}
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            aria-label={`More ${label.toLowerCase()}`}
          >
            <IconPlus size={16} />
          </button>
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
