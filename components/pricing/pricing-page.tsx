"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Crown, Zap, Shield, ArrowRight, Star, Menu, X, Rocket } from "lucide-react"
import Link from "next/link"

interface PricingPageProps {
  plans?: any[]
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            <a href="/">
              Taskoly
            </a>
          </span>
        </motion.div>

        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/pricing">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Pricing
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25">
              Join Beta
            </Button>
          </Link>
        </motion.div>
      </div>
    </header>
  )
}

const defaultPlans = [
  {
    id: 1,
    name: "Free",
    description: "Perfect for individuals and small teams getting started",
    price_monthly: 0,
    price_yearly: 0,
    features: ["Up to 3 projects", "5 team members", "Basic task management", "1GB file storage", "Email support"],
  },
  {
    id: 2,
    name: "Pro",
    description: "Best for growing teams and businesses",
    price_monthly: 12,
    price_yearly: 120,
    features: [
      "Unlimited projects",
      "25 team members",
      "Advanced task management",
      "50GB file storage",
      "Real-time collaboration",
      "Calendar integration",
      "Priority support",
      "AI assistance",
    ],
  },
  {
    id: 3,
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price_monthly: 24,
    price_yearly: 240,
    features: [
      "Unlimited everything",
      "Unlimited team members",
      "Advanced analytics",
      "500GB file storage",
      "Custom integrations",
      "SSO authentication",
      "24/7 phone support",
      "Dedicated account manager",
    ],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function PricingPage({ plans }: PricingPageProps) {
  const [isYearly, setIsYearly] = useState(false)

  const pricingPlans = plans && plans.length > 0 ? plans : defaultPlans

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Zap className="h-6 w-6" />
      case "pro":
        return <Crown className="h-6 w-6" />
      case "enterprise":
        return <Shield className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return "from-slate-500 to-slate-600"
      case "pro":
        return "from-blue-500 to-purple-600"
      case "enterprise":
        return "from-purple-600 to-pink-600"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  const getPrice = (plan: any) => {
    const price = isYearly ? plan.price_yearly : plan.price_monthly
    if (price === 0) return "Free"
    if (isYearly) return `$${(price / 12).toFixed(0)}`
    return `$${price}`
  }

  const getSavings = (plan: any) => {
    if (plan.price_yearly === 0) return null
    const monthlyCost = plan.price_monthly * 12
    const savings = ((monthlyCost - plan.price_yearly) / monthlyCost) * 100
    return Math.round(savings)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
        <div className="container mx-auto px-4 py-16">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center mb-16">
            <motion.div variants={itemVariants}>
              <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">Nepal-made SaaS</Badge>
              <h1 className="text-5xl font-bold text-white mb-6">Simple, transparent pricing</h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                Choose the perfect plan for your team. Start free and scale as you grow.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm font-medium ${!isYearly ? "text-white" : "text-slate-500"}`}>Monthly</span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={`text-sm font-medium ${isYearly ? "text-white" : "text-slate-500"}`}>Yearly</span>
              <Badge variant="secondary" className="ml-2">
                Save up to 17%
              </Badge>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {pricingPlans.map((plan, index) => {
              const isPopular = plan.name.toLowerCase() === "pro"
              const savings = getSavings(plan)

              return (
                <motion.div key={plan.id} variants={itemVariants}>
                  <Card
                    className={`relative h-full glass ${isPopular
                      ? "ring-2 ring-blue-500 shadow-2xl scale-105"
                      : "shadow-lg hover:shadow-xl transition-shadow"
                      }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center text-white`}
                      >
                        {getPlanIcon(plan.name)}
                      </div>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="text-center mb-6">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-white">{getPrice(plan)}</span>
                          {plan.price_monthly > 0 && (
                            <span className="text-slate-500 ml-2">/{isYearly ? "month" : "month"}</span>
                          )}
                        </div>
                        {isYearly && savings && (
                          <div className="text-sm text-green-600 mt-1">Save {savings}% annually</div>
                        )}
                        {isYearly && plan.price_yearly > 0 && (
                          <div className="text-xs text-slate-500 mt-1">Billed ${plan.price_yearly} yearly</div>
                        )}
                      </div>

                      <div className="space-y-3 mb-8">
                        {plan.features.map((feature: string, featureIndex: number) => (
                          <div key={featureIndex} className="flex items-center space-x-3">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-slate-400">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link href="/auth/signup" className="block">
                        <Button
                          className={`w-full ${isPopular
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            : ""
                            }`}
                          variant={isPopular ? "default" : "outline"}
                        >
                          {plan.name === "Free" ? "Get Started Free" : `Start ${plan.name} Plan`}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>

                      {plan.name === "Enterprise" && (
                        <p className="text-xs text-center text-slate-400 mt-3">Contact us for custom pricing</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-24 max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-400">Everything you need to know about Taskoly pricing</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-2">Can I change plans anytime?</h3>
                  <p className="text-slate-400 text-sm">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
                  <p className="text-slate-400 text-sm">
                    We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Is there a free trial?</h3>
                  <p className="text-slate-400 text-sm">
                    Our Free plan is available forever. Pro and Enterprise plans come with a 14-day free trial.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-2">What happens to my data if I cancel?</h3>
                  <p className="text-slate-400 text-sm">
                    Your data is safely stored for 30 days after cancellation, giving you time to export or reactivate.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Do you offer discounts for nonprofits?</h3>
                  <p className="text-slate-400 text-sm">
                    Yes! We offer 50% discounts for qualified nonprofit organizations and educational institutions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Can I get a refund?</h3>
                  <p className="text-slate-400 text-sm">
                    We offer a 30-day money-back guarantee for all paid plans, no questions asked.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-24 text-center">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">Ready to boost your team's productivity?</h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of teams already using Taskoly to streamline their workflow and achieve more together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 bg-transparent"
                    >
                      View Demo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
