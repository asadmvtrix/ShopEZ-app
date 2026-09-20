export default function SectionHeader({ title, subtitle, action, id }) {
  return (
    <div className="mb-4 flex flex-row items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
