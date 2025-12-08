export function TrustedBy() {
  const companies = [
    "Goldman Sachs",
    "JP Morgan",
    "BlackRock",
    "Fidelity",
    "Vanguard",
    "Morgan Stanley",
    "Citadel",
    "Two Sigma",
  ]

  return (
    <section className="py-16 px-6 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-12">
          Trusted by leading companies and financial institutions
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company) => (
            <div
              key={company}
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors text-sm md:text-base font-medium"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
