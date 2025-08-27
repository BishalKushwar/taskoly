"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  CheckCircle,
  MessageSquare,
  Calendar,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Star,
  Globe,
  Rocket,
  Heart,
  Coffee,
} from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
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
              Taskoly
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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div {...fadeInUp}>
            <Badge className="mb-4 bg-gradient-to-d from-blue-300 to-purple-500 text-white-300 hover:bg-orange-500/30 border-orange-500/60">
              🚀 Building the Future of Team Collaboration
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              We're Building
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Something Amazing
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Two passionate developers from Nepal are reimagining project management. Join us on our journey to create
              the most intuitive collaboration platform that teams actually love to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-3 shadow-lg shadow-blue-500/25"
                >
                  Join Our Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                See Our Vision
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-4 text-white">Everything your team needs</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              From project planning to real-time collaboration, Taskoly has all the tools to keep your team productive
              and aligned.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: CheckCircle,
                title: "Smart Task Management",
                description:
                  "Kanban boards with drag-and-drop, automated workflows, and AI-powered task prioritization.",
              },
              {
                icon: MessageSquare,
                title: "Real-time Messaging",
                description: "Instant team communication with file sharing, threading, and project-specific channels.",
              },
              {
                icon: Calendar,
                title: "Integrated Calendar",
                description: "Schedule meetings, track deadlines, and sync with your favorite calendar apps.",
              },
              {
                icon: BarChart3,
                title: "AI Analytics",
                description: "Get insights into team productivity, project progress, and performance metrics.",
              },
              {
                icon: Users,
                title: "Team Management",
                description: "Role-based permissions, team invitations, and collaborative workspaces.",
              },
              {
                icon: Zap,
                title: "Automation",
                description: "Automate repetitive tasks, notifications, and workflow triggers.",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-4 text-white">Our Vision</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We're not just building another tool - we're crafting the future of how teams collaborate and create
              together.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <Heart className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">Built with Love</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Every feature is crafted with care by developers who understand the daily struggles of remote teams.
                    We're building the tool we wish we had when we started our journey.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                    <Globe className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">Global Dreams</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Starting from the mountains of Nepal, we're building for teams everywhere. Our dream is to connect
                    creators and innovators across every continent and time zone.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <Rocket className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">Innovation First</h3>
                  <p className="text-slate-300 leading-relaxed">
                    We're not afraid to challenge the status quo. Every line of code is an opportunity to reimagine how
                    teams can work better, faster, and more joyfully together.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Developer Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-4 text-white">The Founders</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Two friends with a shared vision, building something extraordinary from the heart of Nepal.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/25">
                    <span className="text-3xl font-bold text-white">BKM</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">Bishal Kushwar Majhi</h3>
                  <p className="text-blue-400 text-lg mb-4">Co-founder, Visionary and Developer</p>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    The dreamer behind Taskoly's vision. Arjun spent years frustrated with clunky project tools while
                    working with remote teams. His obsession with beautiful, intuitive design drives every pixel of our
                    platform. When not coding, he's exploring Nepal's mountains for inspiration.
                    The technical mastermind who makes the magic happen. Rajesh believes that great software should be
                    invisible - it just works. His passion for clean architecture and scalable systems ensures Taskoly
                    can grow from our first user to millions. Coffee enthusiast and night owl coder.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">Product Design</Badge>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">Frontend</Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      User Experience
                    </Badge>
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">Backend</Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">Database</Badge>
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">Infrastructure</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-green-500/25">
                    <span className="text-3xl font-bold text-white">SK</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">Sanjaya Karki</h3>
                  <p className="text-green-400 text-lg mb-4">Co-founder & Project Strategist</p>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    The visionary force behind Taskoly's product strategy and user experience. With his deep understanding
                    of project workflows and team coordination, Rajesh ensures our platform solves real-world challenges.
                    His expertise in project management and team organization helps shape features that make work flow
                    seamlessly. Early riser and productivity enthusiast.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">Product Strategy</Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs"> Management</Badge>
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">Project Planning</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div className="text-center mt-12" {...fadeInUp}>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-white">Our Journey</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                It started with late-night conversations over chai in Kathmandu. Two friends, both remote workers,
                constantly switching between 5+ different tools just to get work done. "There has to be a better way,"
                we said. Six months later, fueled by countless cups of coffee and a shared belief that work should be
                joyful, Taskoly was born. We're still that same two-person team, but now we're building for thousands of
                teams who share our vision.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">🇳🇵 Made in Nepal</Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Two Founders</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Bootstrapped</Badge>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Community-First</Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 px-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl mx-4">
          <div className="container mx-auto py-16">
            <motion.div className="text-center mb-8" {...fadeInUp}>
              <h2 className="text-3xl font-bold mb-4 text-white">Our Growing Community</h2>
              <p className="text-slate-300">Real numbers from our journey so far</p>
            </motion.div>
            <motion.div
              className="grid md:grid-cols-4 gap-8 text-center text-white"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { number: "500+", label: "Early Users" },
                { number: "2.5K+", label: "Tasks Created" },
                { number: "6", label: "Months Building" },
                { number: "2", label: "Passionate Founders" },
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-slate-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Testimonials */}
      {/* <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-4 text-white">Loved by teams worldwide</h2>
            <p className="text-xl text-slate-300">See what our customers are saying about Taskoly</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager at TechCorp",
                content:
                  "Taskoly transformed how our remote team collaborates. The real-time features are game-changing.",
                rating: 5,
              },
              {
                name: "Michael Rodriguez",
                role: "Founder at StartupXYZ",
                content:
                  "The AI analytics help us make data-driven decisions. Best project management tool we've used.",
                rating: 5,
              },
              {
                name: "Emily Johnson",
                role: "Team Lead at DesignStudio",
                content: "Intuitive interface, powerful features. Our productivity increased by 40% since switching.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-4 leading-relaxed">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 rounded-3xl mx-4">
          <div className="container mx-auto text-center py-16">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Join Our Story</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Be part of something special. Help us build the future of team collaboration, one feature at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-3 shadow-lg shadow-blue-500/25"
                  >
                    Join the Beta
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-3 bg-white/5 backdrop-blur-sm"
                  >
                    Support Our Mission
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 text-white py-12 px-4 mt-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Taskoly</span>
              </div>
              <p className="text-slate-400 mb-4">
                A passion project turned startup, building the collaboration platform we always dreamed of using.
              </p>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-slate-400">Built with love in Nepal 🇳🇵</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2024 Taskoly. A dream in progress, built by two friends.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Coffee className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Powered by coffee & determination</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
