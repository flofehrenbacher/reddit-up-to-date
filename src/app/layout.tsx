import './globals.css'

export const metadata = {
  title: 'Reddit Up-to-date',
  description: 'Stay up to date with your subreddit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
