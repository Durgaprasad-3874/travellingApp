export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center rounded-[14px] border border-dashed border-line bg-white px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-action-soft text-action">
          <Icon size={26} />
        </span>
      )}
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      {children && <p className="mt-2 max-w-[44ch] text-[15px]">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
