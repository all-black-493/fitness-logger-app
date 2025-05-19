import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GymBro - Fitness Logger",
  description: "Track your workouts, compete with friends, and improve your form",
  icons: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGZmNWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1kdW1iYmVsbC1pY29uIGx1Y2lkZS1kdW1iYmVsbCI+PHBhdGggZD0iTTE3LjU5NiAxMi43NjhhMiAyIDAgMSAwIDIuODI5LTIuODI5bC0xLjc2OC0xLjc2N2EyIDIgMCAwIDAgMi44MjgtMi44MjlsLTIuODI4LTIuODI4YTIgMiAwIDAgMC0yLjgyOSAyLjgyOGwtMS43NjctMS43NjhhMiAyIDAgMSAwLTIuODI5IDIuODI5eiIvPjxwYXRoIGQ9Im0yLjUgMjEuNSAxLjQtMS40Ii8+PHBhdGggZD0ibTIwLjEgMy45IDEuNC0xLjQiLz48cGF0aCBkPSJNNS4zNDMgMjEuNDg1YTIgMiAwIDEgMCAyLjgyOS0yLjgyOGwxLjc2NyAxLjc2OGEyIDIgMCAxIDAgMi44MjktMi44MjlsLTYuMzY0LTYuMzY0YTIgMiAwIDEgMC0yLjgyOSAyLjgyOWwxLjc2OCAxLjc2N2EyIDIgMCAwIDAtMi44MjggMi44Mjl6Ii8+PHBhdGggZD0ibTkuNiAxNC40IDQuOC00LjgiLz48L3N2Zz4=",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}