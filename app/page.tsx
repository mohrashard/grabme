import { Metadata } from 'next'
import HomeClient from './components/HomeClient'
import { fetchTaxonomyAction } from './lib/taxonomyActions'

export const metadata: Metadata = {
  title: "Find Verified Workers in Sri Lanka | Electricians, Plumbers, AC Repair",
  description: "Browse NIC-verified electricians, plumbers, and AC technicians in Colombo and across Sri Lanka. Hire directly via WhatsApp with zero commission. Find a baas today.",
  keywords: [
    "electrician Colombo", 
    "plumber Sri Lanka", 
    "AC repair Colombo", 
    "home services Sri Lanka", 
    "verified worker Sri Lanka", 
    "NIC verified", 
    "baas Sri Lanka",
    "home repair Sri Lanka",
    "Colombo", "Gampaha", "Kandy", "Galle", "Kurunegala"
  ],
  openGraph: {
    title: "Grab Me | Verified Home Workers in Sri Lanka",
    description: "NIC-verified electricians, plumbers & more. Chat directly on WhatsApp. No commission. No middlemen.",
    url: "https://www.grabme.page",
    images: [
      {
        url: "/grabme.png",
        width: 1200,
        height: 630,
        alt: "Grab Me Sri Lanka"
      }
    ],
  }
}

export default async function Home() {
  const taxonomy = await fetchTaxonomyAction();

  return <HomeClient taxonomy={taxonomy} />
}