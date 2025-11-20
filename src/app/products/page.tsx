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
      <section className="py-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-4">Works With Your Stack</h2>
            <p className="text-xl text-gray-600 mb-12">
              Seamlessly integrate with the tools and models you already use
            </p>
          </motion.div>
          
          {/* Infinite Scroll Container */}
          <div className="relative">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            {/* Scrolling Content */}
            <div className="flex overflow-hidden">
              <motion.div
                className="flex gap-8 items-center"
                animate={{
                  x: [0, -1920]
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear"
                  }
                }}
              >
                {/* First Set */}
                {[
                  { name: "OpenAI", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg> },
                  { name: "Anthropic", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="16" y="4" width="4" height="16" rx="1"/></svg> },
                  { name: "Google AI", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg> },
                  { name: "AWS", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.226.726-1.644.487-.417 1.133-.626 1.955-.626.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.031-.375-1.277-.255-.246-.686-.367-1.294-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.3 2.3 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.263 1.005-.36C6.217 4.04 6.639 4 7.102 4c1.039 0 1.787.215 2.252.646.455.43.686 1.086.686 1.963v2.427zm-3.236 1.213c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.119.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.191l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.055-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.807a1.902 1.902 0 0 1-.4-1.158c0-.335.072-.622.216-.878.143-.247.336-.455.574-.622.239-.167.518-.287.838-.36.32-.079.655-.119 1.006-.119.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.384-.375.71 0 .224.08.416.24.567.159.152.453.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926a2.089 2.089 0 0 1-.591.71 2.682 2.682 0 0 1-.926.454 3.89 3.89 0 0 1-1.189.159z"/></svg> },
                  { name: "Azure", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.379 23.343a1.62 1.62 0 0 0 1.536-2.14v.002L17.35 1.76A1.62 1.62 0 0 0 15.816.657H8.184A1.62 1.62 0 0 0 6.65 1.76L.086 21.204a1.62 1.62 0 0 0 1.536 2.139h4.741a1.62 1.62 0 0 0 1.535-1.103l.977-2.892 4.947 3.675c.28.208.618.32.966.32h7.591m-3.287-5.448v.002l-4.318-3.21-5.135 15.208 9.453-11.998z"/></svg> },
                  { name: "Vercel", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L24 24H0L12 0z"/></svg> },
                  { name: "HuggingFace", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/></svg> },
                  { name: "Replicate", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> },
                ].map((partner, idx) => (
                  <div key={`first-${idx}`} className="flex-shrink-0 bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-40 h-32 flex flex-col items-center justify-center">
                    <div className="text-gray-700 mb-2">{partner.logo}</div>
                    <p className="font-semibold text-gray-700 text-sm">{partner.name}</p>
                  </div>
                ))}
                
                {/* Duplicate Set for Seamless Loop */}
                {[
                  { name: "OpenAI", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg> },
                  { name: "Anthropic", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="16" y="4" width="4" height="16" rx="1"/></svg> },
                  { name: "Google AI", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg> },
                  { name: "AWS", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.226.726-1.644.487-.417 1.133-.626 1.955-.626.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.031-.375-1.277-.255-.246-.686-.367-1.294-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.3 2.3 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.263 1.005-.36C6.217 4.04 6.639 4 7.102 4c1.039 0 1.787.215 2.252.646.455.43.686 1.086.686 1.963v2.427zm-3.236 1.213c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.119.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.191l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.055-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.807a1.902 1.902 0 0 1-.4-1.158c0-.335.072-.622.216-.878.143-.247.336-.455.574-.622.239-.167.518-.287.838-.36.32-.079.655-.119 1.006-.119.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.384-.375.71 0 .224.08.416.24.567.159.152.453.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926a2.089 2.089 0 0 1-.591.71 2.682 2.682 0 0 1-.926.454 3.89 3.89 0 0 1-1.189.159z"/></svg> },
                  { name: "Azure", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.379 23.343a1.62 1.62 0 0 0 1.536-2.14v.002L17.35 1.76A1.62 1.62 0 0 0 15.816.657H8.184A1.62 1.62 0 0 0 6.65 1.76L.086 21.204a1.62 1.62 0 0 0 1.536 2.139h4.741a1.62 1.62 0 0 0 1.535-1.103l.977-2.892 4.947 3.675c.28.208.618.32.966.32h7.591m-3.287-5.448v.002l-4.318-3.21-5.135 15.208 9.453-11.998z"/></svg> },
                  { name: "Vercel", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L24 24H0L12 0z"/></svg> },
                  { name: "HuggingFace", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/></svg> },
                  { name: "Replicate", logo: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> },
                ].map((partner, idx) => (
                  <div key={`second-${idx}`} className="flex-shrink-0 bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-40 h-32 flex flex-col items-center justify-center">
                    <div className="text-gray-700 mb-2">{partner.logo}</div>
                    <p className="font-semibold text-gray-700 text-sm">{partner.name}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
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