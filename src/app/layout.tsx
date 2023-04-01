import './globals.css'

export const metadata = {
  title: 'Reddit Up-to-date',
  description: 'Stay up to date with your subreddit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="manifest.json" />
        <link rel="apple-touch-icon" href="images/apple-touch-icon-iphone-60x60.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="images/apple-touch-icon-ipad-76x76.png" />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="images/apple-touch-icon-iphone-retina-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="images/apple-touch-icon-ipad-retina-152x152.png"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
