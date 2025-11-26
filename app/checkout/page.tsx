"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ShoppingCart, Lock } from "lucide-react"

const cartItems = [
  { id: 1, title: "Premium React Template", price: 29.99 },
  { id: 2, title: "UI Design System", price: 49.99 },
  { id: 3, title: "Logo Design Pack", price: 24.99 },
]

export default function CheckoutPage() {
  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "confirmation">("cart")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === "cart") {
      setStep("shipping")
    } else if (step === "shipping") {
      setStep("payment")
    } else if (step === "payment") {
      setStep("confirmation")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/browse" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex gap-4 mb-12">
          {["cart", "shipping", "payment", "confirmation"].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                ["cart", "shipping", "payment", "confirmation"].indexOf(s) <=
                ["cart", "shipping", "payment", "confirmation"].indexOf(step)
                  ? "bg-primary"
                  : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "confirmation" ? (
              <Card className="p-8 text-center border border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your purchase has been processed successfully. Check your email for confirmation and download links.
                </p>
                <div className="bg-muted p-4 rounded-lg text-left mb-6">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-bold text-foreground">CHK-2025-001234</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === "cart" && (
                  <Card className="p-6 border border-border space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Order Review</h2>
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded" />
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <Button variant="ghost" size="sm" className="text-destructive -ml-4">
                              Remove
                            </Button>
                          </div>
                        </div>
                        <p className="font-bold text-primary">${item.price}</p>
                      </div>
                    ))}
                    <Button type="submit" className="w-full mt-6">
                      Continue to Shipping
                    </Button>
                  </Card>
                )}

                {step === "shipping" && (
                  <Card className="p-6 border border-border space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Shipping Information</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="bg-background"
                      />
                      <Input
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background"
                    />
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setStep("cart")}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Continue to Payment
                      </Button>
                    </div>
                  </Card>
                )}

                {step === "payment" && (
                  <Card className="p-6 border border-border space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Payment Information
                    </h2>
                    <Input
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="bg-background"
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        className="bg-background"
                      />
                      <Input
                        placeholder="CVC"
                        value={formData.cardCvc}
                        onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setStep("shipping")}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Complete Purchase
                      </Button>
                    </div>
                  </Card>
                )}
              </form>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-6 border border-border sticky top-24">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </h3>
              <div className="space-y-3 pb-4 border-b border-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.title}</span>
                    <span className="text-foreground font-medium">${item.price}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-primary text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
