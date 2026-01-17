import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function CTASection() {
  return (
    <section id="contact" className="py-24 px-6 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-8 md:p-12 text-center">
          <div className="flex justify-center -space-x-2 mb-6">
            {["S", "A", "K"].map((letter, index) => (
              <Avatar key={index} className="w-10 h-10 border-2 border-background">
                <AvatarFallback className="bg-white/[0.05] text-white text-sm">{letter}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Need help? We&apos;re here for you.</h2>
          <p className="text-[#868f97] mb-8">Our team is ready to help you get started with Lician.</p>
          <Button className="bg-[#4ebe96] text-black hover:bg-[#4ebe96]/90 transition-colors duration-100">Get in touch</Button>
        </div>
      </div>
    </section>
  )
}
