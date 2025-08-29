import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creative Writing AI Assistant - AI-Powered Writing Tool",
  description: "Transform your writing with AI-powered suggestions for grammar, spelling, style, and clarity. Free creative writing assistant with real-time editing and advanced text analysis features.",
  keywords: [
    "AI writing assistant", 
    "creative writing", 
    "grammar checker", 
    "writing tool", 
    "text editor", 
    "AI text analysis", 
    "writing suggestions", 
    "spell checker", 
    "style checker",
    "writing enhancement",
    "AI-powered editor",
    "content creation",
    "writing improvement"
  ],
  authors: [{ name: "Anubhav Chaudhary" }],
  creator: "Anubhav Chaudhary",
  publisher: "Creative Writing AI",
  category: "Technology",
  classification: "Writing Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://creative-writing-ai.vercel.app/',
    title: 'Creative Writing AI Assistant - AI-Powered Writing Tool',
    description: 'Transform your writing with AI-powered suggestions for grammar, spelling, style, and clarity. Free creative writing assistant with real-time editing and advanced text analysis features.',
    siteName: 'Creative Writing AI',
    images: [
      {
        url: 'https://creative-writing-ai.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Creative Writing AI Assistant - AI-Powered Writing Tool by Anubhav Chaudhary',
        type: 'image/jpeg',
      },
      {
        url: 'https://creative-writing-ai.vercel.app/anubhav-creative-ai.jpeg',
        width: 1200,
        height: 630,
        alt: 'Creative Writing AI Assistant - Anubhav Chaudhary',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@creative_writing_ai',
    creator: '@anubhav_dev',
    title: 'Creative Writing AI Assistant - AI-Powered Writing Tool',
    description: 'Transform your writing with AI-powered suggestions for grammar, spelling, style, and clarity. Free creative writing assistant with real-time editing.',
    images: ['https://creative-writing-ai.vercel.app/twitter-card.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    other: {
      me: ['https://creative-writing-ai.vercel.app'],
    },
  },
  alternates: {
    canonical: 'https://creative-writing-ai.vercel.app/',
    languages: {
      'en-US': 'https://creative-writing-ai.vercel.app/',
      'es-ES': 'https://creative-writing-ai.vercel.app/es',
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
      {
        rel: 'mask-icon',
        url: '/anubhav-creative-ai.jpeg',
        color: '#8b5cf6',
      },
    ],
  },
  manifest: '/manifest.json',
  other: {
    'application-name': 'Creative Writing AI',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Creative Writing AI',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#8b5cf6',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#8b5cf6',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and Touch Icons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/anubhav-creative-ai.jpeg" color="#8b5cf6" />
        
        {/* Android Chrome Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Creative Writing AI Assistant",
              "description": "Transform your writing with AI-powered suggestions for grammar, spelling, style, and clarity. Free creative writing assistant with real-time editing.",
              "url": "https://creative-writing-ai.vercel.app/",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "permissions": "Free to use",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Anubhav Chaudhary"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Creative Writing AI",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://creative-writing-ai.vercel.app/anubhav-creative-ai.jpeg"
                }
              },
              "screenshot": "https://creative-writing-ai.vercel.app/anubhav-creative-ai.jpeg",
              "softwareVersion": "1.0.0",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "ratingCount": "1"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
