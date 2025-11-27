import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Users, TrendingUp, Shield } from "lucide-react"
import Header from "@/components/Header"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">

      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight">
              Where Creators and Buyers Connect
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Discover exceptional digital content, support creators, and build your collection. A marketplace designed
              for quality and connection.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12">
              <Link href="/register">Start Exploring</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 bg-transparent">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">Why ContentHive</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: "Instant Access", desc: "Browse and purchase digital content instantly" },
            { icon: Users, title: "Creator Focused", desc: "Support independent creators directly" },
            { icon: TrendingUp, title: "Monetize", desc: "Earn from your digital creations" },
            { icon: Shield, title: "Secure", desc: "Safe transactions and content protection" },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-lg border border-border bg-card hover:border-primary transition-colors">
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-background/50 border-t border-border">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Jane Doe", role: "Creator", testimonial: "ContentHive helped me monetize my work instantly!" },
            { name: "John Smith", role: "Buyer", testimonial: "I discovered amazing digital content and supported my favorite creators." },
            { name: "Alice Johnson", role: "Creator", testimonial: "A smooth platform that makes selling content effortless." },
          ].map((user, i) => (
            <div key={i} className="p-6 border border-border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <p className="text-sm text-muted-foreground mb-4">&quot;{user.testimonial}&quot;</p>
              <h4 className="font-semibold text-foreground">{user.name}</h4>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Sign Up", desc: "Create your account as a buyer or creator." },
            { step: "2", title: "Discover", desc: "Browse and explore digital content from creators." },
            { step: "3", title: "Engage & Earn", desc: "Buy, sell, and monetize content seamlessly." },
          ].map((item, i) => (
            <div key={i} className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                {item.step}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary text-primary-foreground rounded-xl p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to get started?</h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            Join thousands of creators and buyers in the ContentHive community today.
          </p>
          <Button asChild variant="secondary" size="lg" className="h-12">
            <Link href="/register">
              Create Your Account
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">H</span>
              </div>
              <span className="font-semibold text-foreground">ContentHive</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
