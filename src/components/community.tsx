import { Twitter, Linkedin, Mail } from "lucide-react"

export function Community() {
  const stats = [
    { value: "100K+", label: "Twitter followers", icon: Twitter },
    { value: "150K+", label: "Newsletter subscribers", icon: Mail },
    { value: "30K+", label: "LinkedIn followers", icon: Linkedin },
  ]

  return (
    <section className="py-24 px-6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the Lician community</h2>
        <p className="text-lg text-[#868f97] mb-12">
          Hundreds of thousands of business enthusiasts and finance professionals worldwide interact with our content
          daily.
        </p>

        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <stat.icon className="w-6 h-6 text-white mb-4" />
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs md:text-sm text-[#868f97]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
