"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Building, ChevronRight, CheckCircle2, Shield, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [propertyType, setPropertyType] = useState("")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.append("city", location)
    if (propertyType) params.append("type", propertyType)
    
    if (priceRange) {
      if (priceRange === "1M - 5M") {
        params.append("minPrice", "1000000")
        params.append("maxPrice", "5000000")
      } else if (priceRange === "5M - 10M") {
        params.append("minPrice", "5000000")
        params.append("maxPrice", "10000000")
      } else if (priceRange === "10M+") {
        params.append("minPrice", "10000000")
      }
    }

    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/urbaniq-home-image.jpg"
            alt="Luxury modern home"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center mt-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            Elevating Urban <br className="hidden md:block" /> Real Estate Portfolio Management
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            Experience enterprise-grade property intelligence and marketplace connectivity in one seamless environment.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl max-w-4xl mx-auto shadow-2xl flex flex-col md:flex-row gap-3 items-end md:items-center">
            <div className="w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block text-left ml-2">Location (City)</label>
              <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r pb-2 md:pb-0 md:pr-4">
                <MapPin className="h-4 w-4 text-primary ml-2" />
                <Input 
                  type="text" 
                  placeholder="Dubai, London, New York..." 
                  className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm font-medium h-8"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block text-left ml-2">Price Range</label>
              <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r pb-2 md:pb-0 md:pr-4">
                <span className="text-primary font-bold ml-2 text-sm">$</span>
                <select 
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm font-medium text-foreground outline-none h-8"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Any Price</option>
                  <option value="1M - 5M">1M - 5M</option>
                  <option value="5M - 10M">5M - 10M</option>
                  <option value="10M+">10M+</option>
                </select>
              </div>
            </div>
            <div className="w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block text-left ml-2">Property Type</label>
              <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r pb-2 md:pb-0 md:pr-4">
                <Building className="h-4 w-4 text-primary ml-2" />
                <select 
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm font-medium text-foreground outline-none h-8"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">Any Type</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>
            <Button size="default" onClick={handleSearch} className="w-full md:w-auto shrink-0 h-12 px-8 rounded-lg text-sm bg-primary hover:bg-primary/90 text-white">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background border-b">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="py-2">
              <h3 className="text-3xl font-bold text-primary mb-1">12.4k+</h3>
              <p className="font-semibold text-sm mb-1">Total Properties</p>
              <p className="text-muted-foreground text-xs font-medium max-w-[200px] mx-auto">Verified luxury and commercial assets across 47 global markets</p>
            </div>
            <div className="py-2">
              <h3 className="text-3xl font-bold text-primary mb-1">98k</h3>
              <p className="font-semibold text-sm mb-1">Monthly Users</p>
              <p className="text-muted-foreground text-xs font-medium max-w-[200px] mx-auto">Active professional investors and high-net-worth individuals</p>
            </div>
            <div className="py-2">
              <h3 className="text-3xl font-bold text-primary mb-1">$4.2B</h3>
              <p className="font-semibold text-sm mb-1">Successful Deals</p>
              <p className="text-muted-foreground text-xs font-medium max-w-[200px] mx-auto">Cumulative transaction volume processed with in-house intelligence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Portfolios Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight inline-block relative">
              Specialized Portfolios
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/40 rounded-full"></div>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <Gem className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3">Luxury</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Exclusive residential estates and penthouses in global prime locations.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <Building className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3">Commercial</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">High-yield office spaces, retail complexes, and industrial warehouses.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3">Residential</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Modern apartment complexes and family homes with long-term appreciation.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Promotional Ad Banner */}
      <section className="py-8 bg-muted/20">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="relative rounded-2xl overflow-hidden shadow-lg h-[250px] md:h-[300px] flex items-center group">
            <Image 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Exclusive Off-Plan Properties" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
            
            <div className="relative z-10 p-8 md:p-12 max-w-xl">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4 hover:bg-yellow-500/30">
                Featured Promotion
              </Badge>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                Invest in Dubai's <span className="text-yellow-400">Golden Visa</span>
              </h3>
              <p className="text-gray-300 mb-6 text-sm md:text-base">
                Purchase off-plan properties starting at $550k and secure your long-term residency. Limited time offers available through our partner network.
              </p>
              <Button className="bg-white text-black hover:bg-gray-100 font-bold px-6 h-10">
                Claim Offer <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Effortless Prop-Tech Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6 font-serif">
                Effortless<br/>Prop-Tech.
              </h2>
              <p className="text-muted-foreground mb-10 leading-relaxed max-w-md">
                We've removed the complexity from real estate investment. Our proprietary algorithm vets thousands of deals daily, presenting only the top 1% to our users.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Curation</h4>
                    <p className="text-sm text-muted-foreground">Browse AI-filtered listings that match your risk profile and yield expectations.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Verification</h4>
                    <p className="text-sm text-muted-foreground">Access full legal and financial due diligence reports for every single property.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Acquisition</h4>
                    <p className="text-sm text-muted-foreground">Complete your transaction digitally with smart-contract secured transfers.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80" 
                  alt="Modern office skyline" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</p>
                    <p className="font-bold text-sm">Algorithm Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ecosystem Section */}
      <section className="py-24 bg-muted/10">
        <div className="container mx-auto px-4 max-w-screen-xl text-center">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Seamless Connectivity</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 mb-16">The Urbaniq Ecosystem</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Buyer Card */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-4">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">For Buyers</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-4 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">1</span>
                    <span className="leading-tight mt-0.5">Browse exclusive, off-market listings verified by our data team.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">2</span>
                    <span className="leading-tight mt-0.5">Utilize AI-driven valuation tools to ensure fair market pricing.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">3</span>
                    <span className="leading-tight mt-0.5">Complete secure transactions with our integrated legal portal.</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5">Find Your Asset</Button>
              </CardFooter>
            </Card>
            
            {/* Owner Card */}
            <Card className="bg-white border shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Building className="h-32 w-32" />
              </div>
              <CardHeader className="pb-4 relative z-10">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">For Owners</CardTitle>
              </CardHeader>
              <CardContent className="pb-6 relative z-10">
                <ul className="space-y-4 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">1</span>
                    <span className="leading-tight mt-0.5">List your property on a global marketplace for high-net-worth investors.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">2</span>
                    <span className="leading-tight mt-0.5">Monitor performance metrics and lead quality in real-time.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">3</span>
                    <span className="leading-tight mt-0.5">Automate property management and rent collection workflows.</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="relative z-10">
                 <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">List Property</Button>
              </CardFooter>
            </Card>
            
            {/* Agent Card */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-4">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">For Agents</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-4 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">1</span>
                    <span className="leading-tight mt-0.5">Access a unified portal for client management and portfolio tracking.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">2</span>
                    <span className="leading-tight mt-0.5">Earn premium commissions with our transparent payout structure.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">3</span>
                    <span className="leading-tight mt-0.5">Leverage predictive analytics to drive smarter investment advice.</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5">Join As Agent</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Global Lifestyle Gallery */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Curated Aesthetics</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">The Urbaniq Lifestyle</h2>
            </div>
            <Button variant="link" className="text-primary hidden md:flex items-center">
              View Lookbook <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:h-[500px]">
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-md group">
              <Image 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                alt="Luxury living room" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-white font-bold text-lg">Curated Interiors</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-md group md:h-auto h-48">
              <Image 
                src="https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                alt="Modern kitchen" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-md group md:h-auto h-48">
              <Image 
                src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" 
                alt="Luxury bedroom" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="col-span-2 relative rounded-2xl overflow-hidden shadow-md group md:h-auto h-48">
              <Image 
                src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                alt="Minimalist bathroom" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-white font-bold text-lg">Bespoke Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="relative rounded-3xl overflow-hidden bg-black text-white p-12 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-2xl">
            <div className="absolute inset-0 z-0 opacity-40">
              <Image 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="City skyline at night" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
            </div>
            
            <div className="relative z-10 max-w-2xl mb-8 md:mb-0">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                Ready to elevate your portfolio?
              </h2>
              <p className="text-gray-300 text-lg">
                Join 15,000+ elite investors and property managers today. Start your 14-day free trial of Urbaniq Enterprise.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold h-12 px-8">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 font-semibold h-12 px-8">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Industry Leaders */}
      <section className="py-24 bg-white border-t">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Testimonials</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 mb-10">Trusted by Industry Leaders</h2>
              
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 relative border-2 border-primary/20">
                    <Image src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" alt="Marcus Thorne" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-muted-foreground italic mb-4">
                      "Urbaniq transformed how we manage our European portfolio. The data accuracy and platform speed are unmatched in the current market."
                    </p>
                    <p className="font-bold text-sm">Marcus Thorne</p>
                    <p className="text-xs text-muted-foreground">Director at Thorne Capital</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 relative border-2 border-primary/20">
                    <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" alt="Elena Rodriguez" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-muted-foreground italic mb-4">
                      "The verification process for listings is incredibly rigorous. It's the only marketplace I trust for high-value transactions."
                    </p>
                    <p className="font-bold text-sm">Elena Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Global Real Estate Advisor</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-4xl font-bold text-primary mb-2">12k+</div>
                <div className="text-sm font-medium text-muted-foreground">Premium Assets</div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-4xl font-bold text-primary mb-2">$8B+</div>
                <div className="text-sm font-medium text-muted-foreground">Transactions</div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-4xl font-bold text-primary mb-2">45</div>
                <div className="text-sm font-medium text-muted-foreground">Global Markets</div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm font-medium text-muted-foreground">Client Retention</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-primary py-16 text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to scale your urban portfolio?</h2>
          <p className="mb-8 opacity-90 text-sm">Join thousands of investors and agents who have modernized their real estate workflow with Urbaniq.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8">Get Started</Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold px-8">Request Demo</Button>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-background py-8 border-t">
        <div className="container mx-auto px-4 max-w-screen-xl flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-foreground">Urbaniq</span> © 2026 Urbaniq Real Estate Technologies Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground">Cookie Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
