"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-white text-black overflow-hidden">
      {/* Background Accent */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full px-6 flex justify-between items-center gap-12">
        {/* Content Block (aligned to extreme left) */}
        <div className="text-left pl-12 flex-shrink-0">
          {/* Heading */}
          <motion.h1
            className="text-3xl md:text-5xl font-serif font-bold leading-snug tracking-tight"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="whitespace-nowrap">Craft Exceptional Prompts</span> <br />
            <span className="whitespace-nowrap">& Experience Building</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="mt-6 text-lg md:text-xl text-gray-700"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build prompts developers love and AI models understand. <br />
            Generate, refine, and deploy — all in one seamless workflow.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-wrap gap-4 justify-start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition">
              Start Building
            </button>

            <Link
              href="/signup"
              className="px-8 py-4 bg-transparent border border-black text-black font-medium rounded-full hover:bg-black hover:text-white transition"
            >
              Sign Up
            </Link>
          </motion.div>
        </div>

        {/* Card Placeholder on the Right */}
        <motion.div
          className="flex-shrink-0 hidden lg:block mr-40"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="w-[450px] shadow-2xl border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Start</CardTitle>
              <CardDescription>
                See PromptCraft in action with a live preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Active Workspace</span>
                  </div>
                  <code className="text-xs text-gray-600 block">
                    /prompts/marketing.json
                  </code>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">Latest Prompt:</p>
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <p className="text-xs text-gray-600 font-mono">
                      &#123; &quot;version&quot;: &quot;1.0.0&quot;,<br />
                      &nbsp;&nbsp;&quot;role&quot;: &quot;copywriter&quot; &#125;
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Templates</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deployed</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
