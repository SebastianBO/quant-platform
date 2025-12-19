import Link from "next/link"
import { Twitter, Linkedin, Github, Youtube } from "lucide-react"

export function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "API", "Mobile App", "Integrations"],
    Markets: [
      { label: "Most Active", href: "/markets/most-active" },
      { label: "Top Gainers", href: "/markets/top-gainers" },
      { label: "Top Losers", href: "/markets/top-losers" },
      { label: "52-Week Highs", href: "/markets/52-week-high" },
      { label: "52-Week Lows", href: "/markets/52-week-low" },
    ],
    Company: ["About", "Blog", "Careers", "Press", "Contact"],
    Resources: ["Documentation", "Help Center", "Community", "Newsletter", "Status"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
  }

  return (
    <footer className="bg-secondary/30 border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Lician</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">Make better investment decisions faster.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-3">
                {Array.isArray(links) && typeof links[0] === 'object' ? (
                  // Markets with href
                  (links as Array<{label: string, href: string}>).map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  // Other categories
                  (links as string[]).map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Lician. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
