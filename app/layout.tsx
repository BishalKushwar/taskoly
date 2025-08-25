import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Taskoly - Team Collaboration & Project Management",
  description: "Nepal-made SaaS for remote teams. Manage projects, collaborate in real-time, and boost productivity.",
  generator: "Taskoly",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <div className="relative z-10">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
