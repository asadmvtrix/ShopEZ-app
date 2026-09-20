export default function SectionHeader({ title, subtitle, action, id }) {
  return (
    <div className="mb-2.5 flex flex-row items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl md:text-[1.75rem]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
