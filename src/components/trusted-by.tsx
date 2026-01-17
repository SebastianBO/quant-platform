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
    <section className="py-16 px-6 border-t border-white/[0.08]/50">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-[#868f97] mb-12">
          Trusted by leading companies and financial institutions
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company) => (
            <div
              key={company}
              className="text-[#868f97]/60 hover:text-[#868f97] transition-colors duration-100 text-sm md:text-base font-medium"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
