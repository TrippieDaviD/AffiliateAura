
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Link2, Users, BarChart2, DollarSign, Building } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function About() {
  return (
    <div className="bg-[#F5F5F7]">
      {/* Hero section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Welcome to <span className="text-black">affiliateaura.co</span>
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Generate, track, and optimize your affiliate marketing efforts with our powerful platform
            </p>
            <div className="mt-8 flex justify-center">
              <Link to={createPageUrl("CreateLink")}>
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-black hover:bg-gray-800 transition-colors">
                  Create Your First Link
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose affiliateaura.co
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our affiliate platform provides everything you need to generate, share, and profit from your influence.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="bg-gray-100 rounded-lg p-3 inline-block">
                    <Link2 className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Easy Link Generation</h3>
                  <p className="mt-2 text-gray-500">
                    Generate trackable affiliate links for any website or product in seconds, no technical knowledge required.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="bg-gray-100 rounded-lg p-3 inline-block">
                    <BarChart2 className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Analytics</h3>
                  <p className="mt-2 text-gray-500">
                    Track clicks, conversions, and earnings with our intuitive dashboard to optimize your marketing efforts.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="bg-gray-100 rounded-lg p-3 inline-block">
                    <Users className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Partnership Management</h3>
                  <p className="mt-2 text-gray-500">
                    Easily reach out to potential partners and manage your relationships all in one place.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Trusted by Marketers Everywhere
            </h2>
          </div>
          
          <div className="mt-12 space-y-6 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {[
              {
                quote: "affiliateaura.co has transformed how I manage my affiliate marketing. The interface is intuitive and the analytics are invaluable.",
                author: "Sarah Johnson",
                role: "Content Creator"
              },
              {
                quote: "I've tried several affiliate platforms, but this one stands out for its simplicity and effectiveness. My conversion rates have increased by 35%.",
                author: "Alex Chen",
                role: "E-commerce Consultant"
              },
              {
                quote: "The partnership outreach tools have helped me connect with brands I never would have approached before. Game changer!",
                author: "Marcus Williams",
                role: "Lifestyle Blogger"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="text-gray-600 italic mb-4">"{testimonial.quote}"</div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <div className="py-16 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Start earning in just three simple steps
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Create Your Links",
                  description: "Generate trackable affiliate links for any product or service",
                  icon: Link2
                },
                {
                  step: "2",
                  title: "Share With Your Audience",
                  description: "Promote your links on your website, social media, or email list",
                  icon: Users
                },
                {
                  step: "3",
                  title: "Earn Commissions",
                  description: "Get paid when people make purchases through your links",
                  icon: DollarSign
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="relative flex flex-col items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white font-bold text-xl">
                      {step.step}
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-base text-gray-500 text-center">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add this section before the CTA section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Join Our Partnership Network
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Whether you're a marketer or a business, we have partnership opportunities for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 text-center border-none shadow-sm">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Affiliate Marketers</h3>
              <p className="text-gray-500 mb-6">
                Join our affiliate program to promote products and earn commissions on every successful referral.
              </p>
              <Link to={createPageUrl("Partnerships")}>
                <Button className="bg-black text-white hover:bg-gray-800">
                  Become an Affiliate
                </Button>
              </Link>
            </Card>
            
            <Card className="p-6 text-center border-none shadow-sm">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Businesses</h3>
              <p className="text-gray-500 mb-6">
                List your products or services to gain exposure through our network of affiliate marketers.
              </p>
              <Link to={createPageUrl("BusinessPartnership")}>
                <Button className="bg-black text-white hover:bg-gray-800">
                  Register Your Business
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-gray-300">Create your first affiliate link today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to={createPageUrl("CreateLink")}>
                <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-black bg-white hover:bg-gray-100">
                  Get Started
                  <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer brand section */}
      <div className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">affiliateaura.co</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            The future of affiliate marketing is here. Join thousands of successful marketers who trust affiliateaura.co
          </p>
        </div>
      </div>
    </div>
  );
}
