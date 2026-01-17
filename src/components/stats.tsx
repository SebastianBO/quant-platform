export function Stats() {
  const stats = [
    { value: "18M+", label: "Searchable documents" },
    { value: "14K+", label: "Public companies covered" },
    { value: "100M+", label: "End users globally" },
  ]

  return (
    <section className="py-16 px-6 border-t border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-[#868f97] mb-8">Global coverage</p>
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05]"
            >
              <p className="text-2xl md:text-4xl font-bold text-white mb-2 tabular-nums">{stat.value}</p>
              <p className="text-xs md:text-sm text-[#868f97]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
