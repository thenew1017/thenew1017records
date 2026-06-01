const items = ["New Era", "1017 Records", "Worldwide", "Trap Anthem", "On Repeat", "Out Now", "★"];

export function Marquee() {
  return (
    <section id="music" className="relative overflow-hidden border-y border-border bg-secondary/30 py-8">
      <div className="flex w-max marquee-track gap-12 whitespace-nowrap font-display text-5xl uppercase md:text-7xl">
        {[...items, ...items, ...items, ...items].map((t, i) => (
          <span key={i} className={i % 2 === 0 ? "text-foreground" : "text-stroke"}>
            {t} <span className="text-accent">●</span>
          </span>
        ))}
      </div>
    </section>
  );
}