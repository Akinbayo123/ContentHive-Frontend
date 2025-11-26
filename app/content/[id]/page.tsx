"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Share2, ShoppingCart, ChevronLeft, Star } from "lucide-react"

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [rating, setRating] = useState(0)

  // Mock data
  const content = {
    id: params.id,
    title: "Premium React Component Library",
    creator: "Dev Studio",
    creatorId: "123",
    price: 29.99,
    rating: 4.8,
    reviews: 142,
    views: 5420,
    sales: 284,
    description:
      "A comprehensive collection of production-ready React components designed to accelerate your development workflow. Includes 50+ customizable components with full TypeScript support, Tailwind CSS styling, and extensive documentation.",
    features: [
      "50+ Production-Ready Components",
      "Full TypeScript Support",
      "Tailwind CSS Integration",
      "Comprehensive Documentation",
      "Free Updates Forever",
      "Lifetime Support",
    ],
    category: "Templates",
    tags: ["React", "TypeScript", "Tailwind", "UI Kit"],
    date: "2025-01-10",
  }

  const relatedContent = [
    { id: 1, title: "Next.js Starter Template", price: 19.99, rating: 4.9 },
    { id: 2, title: "UI Design System", price: 49.99, rating: 4.8 },
    { id: 3, title: "Tailwind Components Pack", price: 24.99, rating: 4.7 },
    { id: 4, title: "React Hooks Library", price: 34.99, rating: 4.9 },
  ]

  const reviews = [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      text: "Absolutely amazing! Saved me weeks of development time.",
      date: "2025-01-08",
    },
    {
      id: 2,
      author: "Jane Smith",
      rating: 4,
      text: "Great quality components, documentation could be better.",
      date: "2025-01-05",
    },
    {
      id: 3,
      author: "Mike Johnson",
      rating: 5,
      text: "Best component library I've used. Highly recommended!",
      date: "2024-12-30",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/browse" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header Image */}
            <div className="w-full h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl mb-8 flex items-center justify-center">
              <p className="text-muted-foreground">Content Preview</p>
            </div>

            {/* Title & Creator */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">{content.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary" />
                  <Link href={`/creator/${content.creatorId}`} className="text-primary hover:underline font-medium">
                    {content.creator}
                  </Link>
                </div>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  {content.rating} ({content.reviews} reviews)
                </span>
                <span className="text-muted-foreground">{content.views} views</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-border">
              {[
                { label: "Category", value: content.category },
                { label: "Downloads", value: content.sales },
                { label: "Published", value: content.date },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Content</h2>
              <p className="text-foreground leading-relaxed mb-6">{content.description}</p>

              <h3 className="text-xl font-bold text-foreground mb-3">What's Included</h3>
              <ul className="space-y-2">
                {content.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="mb-8 flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Reviews ({reviews.length})</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{review.author}</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <p className="text-foreground">{review.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Purchase Card */}
            <Card className="p-6 border border-border sticky top-24 mb-6">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-4xl font-bold text-primary">${content.price}</p>
              </div>

              <Button className="w-full gap-2 mb-3 h-11">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 mb-3 bg-transparent"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Saved" : "Save"}
              </Button>

              <Button variant="ghost" className="w-full gap-2">
                <Share2 className="w-5 h-5" />
                Share
              </Button>
            </Card>

            {/* Related Content */}
            <Card className="p-6 border border-border">
              <h3 className="font-bold text-foreground mb-4">More from {content.creator}</h3>
              <div className="space-y-3">
                {relatedContent.map((item) => (
                  <Link
                    key={item.id}
                    href={`/content/${item.id}`}
                    className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-primary font-semibold">${item.price}</span>
                      <span className="text-xs text-muted-foreground">⭐ {item.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
