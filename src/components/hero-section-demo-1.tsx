"use client"

import { motion } from "framer-motion"
import Link from "next/link"

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

      {/* Content Block (aligned left) */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-left">
        {/* Heading */}
        <motion.h1
          className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Craft <span className="block md:inline">exceptional</span>{" "}
          <span className="block md:inline">prompts & experiences.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-700 max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Build prompts developers love and AI models understand. Generate,
          refine, and deploy — all in one seamless workflow.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-wrap gap-4"
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
    </section>
  )
}

export default HeroSection
