interface SettingsHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
}

export function SettingsHeader({ subtitle, title, description }: SettingsHeaderProps) {
  return (
    <header className="pt-16 px-12 pb-12">
      <div className="max-w-5xl">
        {subtitle && (
          <span className="font-label text-secondary text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
            {subtitle}
          </span>
        )}
        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-on-surface-variant font-body max-w-2xl text-lg">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
