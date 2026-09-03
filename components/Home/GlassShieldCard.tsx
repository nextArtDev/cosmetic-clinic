'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'

export interface GlassShieldProps {
  imageUrl: string
  imageAlt?: string
  title: string
  subtitle: string
  statusText?: string
  stats?: { label: string; value: string }[]
}

const GlassShieldCard: React.FC<GlassShieldProps> = ({
  imageUrl,
  imageAlt = 'Background Image',
  title,
  subtitle,
  statusText = 'SYSTEM ACTIVE',
  stats = [
    { label: 'ID:', value: '99797-FD7' },
    { label: 'STATUS:', value: 'STABLE' },
    { label: 'SECTOR:', value: 'MED-BAY' },
  ],
}) => {
  const [widths] = useState(() => stats.map(() => Math.random() * 60 + 40))

  return (
    <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-black">
      {/* --- BACKGROUND IMAGE (Prop) --- */}
      <motion.img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10" />

      {/* --- CONSTANT GLASS SHIELD / HUD INTERFACE --- */}
      <div className="absolute inset-4 z-20 pointer-events-none">
        {/* Glass Panel Base */}
        <motion.div
          className="absolute inset-0 border border-cyan-400/30 bg-cyan-100/5 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Decorative Corner Brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-md" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-md" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-md" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-md" />

        {/* Top Status Bar */}
        <motion.div
          className="absolute top-3 left-3 right-3 flex justify-between items-center text-cyan-400 text-[10px] font-mono tracking-widest"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <span className="flex items-center gap-1.5">
            <motion.span
              className="w-1.5 h-1.5 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {statusText}
          </span>
          <span>v2.0.1</span>
        </motion.div>

        {/* Animated Scanning Line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_2px_rgba(34,211,238,0.5)]"
          initial={{ top: '10%', opacity: 0 }}
          animate={{ top: ['10%', '90%', '10%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* --- TEXT CONTENT (Props) --- */}
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          {/* Top Text */}
          <motion.div
            className="mt-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <h3 className="text-white text-lg font-semibold tracking-wide drop-shadow-md">
              {title}
            </h3>
            <p className="text-cyan-300 text-xs font-mono uppercase tracking-[0.2em] drop-shadow-md">
              {subtitle}
            </p>
          </motion.div>

          {/* Bottom Tech Stats Grid */}
          <motion.div
            className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className="text-cyan-400 font-semibold">
                  {stat.value}
                </span>
                {/* Mini progress bar visual */}
                <div className="mt-1 h-0.5 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${widths[index]}%` }}
                    transition={{ delay: 1.5 + index * 0.2, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default GlassShieldCard
