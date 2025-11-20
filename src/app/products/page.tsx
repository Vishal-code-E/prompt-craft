"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface Product {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  features: string[];
  comingSoon?: boolean;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "tools" | "integrations">("all");

  const products: Product[] = [
    {
      name: "Prompt Editor",
      tagline: "Code your prompts with precision",
      description: "A powerful JSON-based editor designed for developers. Write, test, and version control your prompts like you would with code.",
      icon: "⚡",
      features: [
        "Syntax highlighting for JSON prompts",
        "Real-time validation & linting",
        "Auto-completion and snippets",
        "Version control integration",
        "Multi-cursor editing"
      ]
    },
    {
      name: "Prompt Library",
      tagline: "Reusable templates at your fingertips",
      description: "Access a curated collection of production-ready prompt templates. Fork, customize, and deploy in seconds.",
      icon: "📚",
      features: [
        "500+ pre-built templates",
        "Community-contributed prompts",
        "Private & public libraries",
        "Tag-based organization",
        "Smart search & filtering"
      ]
    },
    {
      name: "Team Collaboration",
      tagline: "Build prompts together",
      description: "Work with your team in real-time. Share prompts, review changes, and maintain consistency across projects.",
      icon: "🤝",
      features: [
        "Real-time collaborative editing",
        "Comment & review system",
        "Role-based permissions",
        "Activity tracking",
        "Team workspaces"
      ]
    },
    {
      name: "API Integration",
      tagline: "Deploy prompts programmatically",
      description: "RESTful API to integrate PromptCraft into your applications. Deploy, version, and manage prompts via code.",
      icon: "🔗",
      features: [
        "RESTful & GraphQL APIs",
        "SDKs for Python, Node.js, Go",
        "Webhook support",
        "Rate limiting & caching",
        "Detailed analytics"
      ]
    },
    {
      name: "Testing Suite",
      tagline: "Test prompts before production",
      description: "Run automated tests on your prompts. Ensure consistency, quality, and performance across different models.",
      icon: "🧪",
      features: [
        "A/B testing for prompts",
        "Automated regression tests",
        "Performance benchmarking",
        "Model comparison",
        "CI/CD integration"
      ]
    },
    {
      name: "Analytics Dashboard",
      tagline: "Track prompt performance",
      description: "Monitor how your prompts perform in production. Get insights on usage, costs, and optimization opportunities.",
      icon: "📊",
      features: [
        "Real-time usage metrics",
        "Cost tracking & optimization",
        "Performance insights",
        "Custom reports",
        "Export capabilities"
      ]
    },
    {
      name: "Model Router",
      tagline: "Multi-model prompt execution",
      description: "Route your prompts to different AI models based on cost, performance, or availability. Support for GPT, Claude, Gemini, and more.",
      icon: "🎯",
      comingSoon: true,
      features: [
        "Multi-provider support",
        "Automatic fallbacks",
        "Cost optimization",
        "Load balancing",
        "Custom routing rules"
      ]
    },
    {
      name: "Prompt Registry",
      tagline: "Central repository for all prompts",
      description: "A secure, versioned registry for storing and distributing prompts across your organization. Like npm, but for prompts.",
      icon: "📦",
      comingSoon: true,
      features: [
        "Semantic versioning",
        "Public & private packages",
        "Dependency management",
        "Access control",
        "Automated publishing"
      ]
    }
  ];

  const coreFeatures: Feature[] = [
    {
      title: "Version Control",
      description: "Track every change to your prompts with Git-style versioning. Roll back, compare, and branch with ease.",
      icon: "🔄"
    },
    {
      title: "Security First",
      description: "Enterprise-grade security with SOC 2 compliance, encryption at rest and in transit, and granular access controls.",
      icon: "🔒"
    },
    {
      title: "Scale Effortlessly",
      description: "From startup to enterprise, our infrastructure scales with your needs. Handle millions of requests without breaking a sweat.",
      icon: "📈"
    },
    {
      title: "Open Standards",
      description: "Built on open standards and formats. Export your data anytime. No vendor lock-in.",
      icon: "🌐"
    }
  ];

  const filteredProducts = products.filter(product => {
    if (activeTab === "all") return true;
    if (activeTab === "tools") return ["Prompt Editor", "Prompt Library", "Testing Suite", "Analytics Dashboard"].includes(product.name);
    if (activeTab === "integrations") return ["API Integration", "Model Router", "Prompt Registry"].includes(product.name);
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20 px-6 mt-20">
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <motion.div
            className="absolute top-1/4 left-1/6 text-6xl font-mono text-gray-900"
            animate={{ 
              rotate: [0, 5, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {"{}"}
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm font-mono text-[#00FF88] mb-4">{"// Prompt Engineering Tools"}</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Build AI Systems{" "}
              <span className="bg-gradient-to-r from-[#00FF88] via-green-500 to-[#00FF88] bg-clip-text text-transparent">
                Like Code
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Professional tools for creating, managing, and deploying AI prompts at scale. 
              Treat your prompts as infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                View Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Filter */}
      <section className="py-8 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-4">
            {[
              { id: "all" as const, label: "All Products" },
              { id: "tools" as const, label: "Core Tools" },
              { id: "integrations" as const, label: "Integrations" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#00FF88] text-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {product.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
                
                <div className="text-5xl mb-4">{product.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-sm text-[#00FF88] font-semibold mb-4">{product.tagline}</p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {product.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-[#00FF88] mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {product.features.length > 3 && (
                    <p className="text-xs text-gray-500 ml-7">+ {product.features.length - 3} more features</p>
                  )}
                </div>
                
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Learn More
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Built for Production</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade features that scale with your AI operations
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-4">Works With Your Stack</h2>
            <p className="text-xl text-gray-600 mb-12">
              Seamlessly integrate with the tools and models you already use
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
              {["OpenAI", "Anthropic", "Google AI", "AWS", "Azure", "Vercel"].map((partner) => (
                <div key={partner} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-gray-700">{partner}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300FF88' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px"
            }}
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to modernize your AI workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers building production-ready AI systems with PromptCraft Labs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
              >
                Start Building Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300"
              >
                Talk to Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}