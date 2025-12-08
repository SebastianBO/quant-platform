export function Stats() {
  const stats = [
    { value: "18M+", label: "Searchable documents" },
    { value: "14K+", label: "Public companies covered" },
    { value: "100M+", label: "End users globally" },
  ]

  return (
    <section className="py-16 px-6 border-t border-b border-border/50">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-8">Global coverage</p>
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-2xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
