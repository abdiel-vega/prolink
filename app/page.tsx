import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Shield, Clock, Star, Users, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            ProLink
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/search">
              <Button variant="ghost">Browse Services</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Connect with{' '}
            <span className="text-primary">Skilled Professionals</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book quality services with confidence. From consultations to project-based work, 
            find the expertise you need on ProLink.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="What service are you looking for?"
              className="pl-12 pr-4 h-14 text-lg"
            />
            <Button className="absolute right-2 top-2 h-10">
              Search
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Web Development', 'Design', 'Consulting', 'Marketing', 'Writing'].map((category) => (
              <Badge key={category} variant="outline" className="text-sm py-1 px-3">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How ProLink Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Find Services</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Browse through thousands of professional services or search for exactly what you need.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Book & Pay</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Schedule your service and pay securely. Your payment is protected until work is completed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Get Results</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Work with verified professionals and get high-quality results delivered on time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose ProLink?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Secure Payments</h3>
                    <p className="text-muted-foreground">Your payments are protected with escrow until work is completed to your satisfaction.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Star className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Verified Professionals</h3>
                    <p className="text-muted-foreground">All professionals are vetted and verified with real reviews from previous clients.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">24/7 Support</h3>
                    <p className="text-muted-foreground">Get help whenever you need it with our dedicated customer support team.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary-foreground rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Join Thousands of Satisfied Customers</h3>
                <p className="mb-6 opacity-90">
                  Get matched with the perfect professional for your project, backed by our satisfaction guarantee.
                </p>
                <Button variant="secondary" size="lg">
                  Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Web Development', count: '1,200+ services', icon: '💻' },
              { name: 'Graphic Design', count: '800+ services', icon: '🎨' },
              { name: 'Business Consulting', count: '600+ services', icon: '📊' },
              { name: 'Content Writing', count: '900+ services', icon: '✍️' },
              { name: 'Digital Marketing', count: '750+ services', icon: '📱' },
              { name: 'Video Editing', count: '400+ services', icon: '🎬' },
              { name: 'Photography', count: '500+ services', icon: '📸' },
              { name: 'Translation', count: '300+ services', icon: '🌍' }
            ].map((category) => (
              <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Professionals */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Offer Your Services?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of professionals earning money by offering their skills on ProLink.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up?role=professional">
                Start Selling <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ProLink</h3>
              <p className="text-muted-foreground mb-4">
                The trusted marketplace for professional services.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/search" className="hover:text-foreground">Browse Services</Link></li>
                <li><Link href="/how-it-works" className="hover:text-foreground">How it Works</Link></li>
                <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/sell" className="hover:text-foreground">Start Selling</Link></li>
                <li><Link href="/resources" className="hover:text-foreground">Resources</Link></li>
                <li><Link href="/community" className="hover:text-foreground">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ProLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}