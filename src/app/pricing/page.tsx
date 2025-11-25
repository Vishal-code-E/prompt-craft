"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  accent?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individual developers and experimentation",
    features: [
      "10 prompts per day",
      "JSON editor",
      "AI validation suggestions",
      "Basic templates"
    ],
    buttonText: "Get Started"
  },
  {
    name: "Pro",
    price: "$3/month",
    description: "Ideal for teams and collaborative workflows",
    features: [
      "Unlimited prompts",
      "Custom prompt libraries",
      "API integration",
      "TOON - Your Custom Built"
    ],
    buttonText: "Select Plan",
    popular: true,
    accent: "#00FF88"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs",
    features: [
      "On-prem setup",
      "Role-based access",
      "SLA & priority support",
      "Dedicated onboarding",
      "Custom integrations",
      "Advanced security"
    ],
    buttonText: "Contact Sales"
  }
];

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund."
  },
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes 10 prompts, our JSON editor, AI validation suggestions, and access to our community. Perfect for getting started!"
  },
  {
    question: "Can I integrate PromptCraft into my stack?",
    answer: "Absolutely! Our Pro and Enterprise plans include full API access, webhooks, and SDKs for popular languages like Python, Node.js, and Go."
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [showComparison, setShowComparison] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => {
    router.push('/signup');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-gray-500 mb-4">{"// Prompt as Code"}</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your Plan.{" "}
              <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                Build Smarter Prompts.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Scale from solo experiments to full-stack AI workflows — all powered by structured JSON prompts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Compare Plans
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={cn(
                  "relative bg-white border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300",
                  tier.popular && "border-2 border-[#00FF88] shadow-xl"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#00FF88] text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.price !== "Free" && tier.price !== "Custom" && (
                      <span className="text-gray-500">/month</span>
                    )}
                  </div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="w-5 h-5 text-[#00FF88] mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (tier.buttonText === "Get Started" || tier.buttonText === "Select Plan") {
                      handleGetStarted();
                    }
                  }}
                  className={cn(
                    "w-full py-3 px-6 rounded-lg font-semibold transition-colors",
                    tier.popular
                      ? "bg-[#00FF88] text-black hover:bg-[#00DD77]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {tier.buttonText}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      {showComparison && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="py-16 px-6 bg-gray-50"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-6 font-semibold">Features</th>
                      <th className="text-center p-6 font-semibold">Starter</th>
                      <th className="text-center p-6 font-semibold bg-[#00FF88]/10">
                        Pro
                        <div className="text-xs text-[#00FF88] font-normal">Most Popular</div>
                      </th>
                      <th className="text-center p-6 font-semibold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Number of prompts", starter: "10/day", pro: "Unlimited", enterprise: "Unlimited" },
                      { feature: "JSON Editor", starter: "✓", pro: "✓", enterprise: "✓" },
                      { feature: "AI Validation", starter: "✓", pro: "✓", enterprise: "✓" },
                      { feature: "Custom Prompt Libraries", starter: "✗", pro: "✓", enterprise: "✓" },
                      { feature: "TOON - Your Custom Built", starter: "✗", pro: "✓", enterprise: "✓" },
                      { feature: "API Integration", starter: "✗", pro: "✓", enterprise: "✓" },
                      { feature: "Team Collaboration", starter: "✗", pro: "✗", enterprise: "✓" },
                      { feature: "Version Control", starter: "✗", pro: "✗", enterprise: "✓" },
                      { feature: "On-prem Setup", starter: "✗", pro: "✗", enterprise: "✓" },
                      { feature: "Priority Support", starter: "✗", pro: "✗", enterprise: "✓" },
                    ].map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-6 font-medium">{row.feature}</td>
                        <td className="text-center p-6">{row.starter}</td>
                        <td className="text-center p-6 bg-[#00FF88]/5">{row.pro}</td>
                        <td className="text-center p-6">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left font-semibold flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  {faq.question}
                  <svg
                    className={cn(
                      "w-5 h-5 transition-transform",
                      openFaq === index ? "transform rotate-180" : ""
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300FF88' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to build prompts like code?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of developers using PromptCraft Labs to create better AI workflows.
            </p>
            <button className="px-12 py-4 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors text-lg">
              Start Free Today
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}