import { motion, useReducedMotion } from 'framer-motion'

export function HeroBannerVisual() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="relative w-full max-w-xl"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient brand glow */}
      <div
        className="pointer-events-none absolute -left-8 -top-6 h-32 w-32 rounded-full bg-brand/15 blur-3xl motion-safe:animate-[hero-pulse_6s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-4 -right-6 h-40 w-40 rounded-full bg-brand/10 blur-3xl motion-safe:animate-[hero-pulse_8s_ease-in-out_infinite_1s]"
        aria-hidden
      />

      <div className="group relative overflow-hidden rounded-xl border border-border bg-surface-alt shadow-md transition-shadow duration-500 hover:shadow-xl">
        {/* Soft vignette + bottom gradient */}
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/10 via-transparent to-white/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-100 motion-reduce:opacity-0"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
          }}
          aria-hidden
        />

        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src="/hero-equipment.jpg"
            alt="Medical monitors, ultrasound, ECG, defibrillator, and hospital equipment"
            className={`h-full w-full object-cover ${reduceMotion ? '' : 'motion-safe:animate-[hero-ken-burns_22s_ease-in-out_infinite]'}`}
            width={800}
            height={600}
            fetchPriority="high"
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          />
        </div>

        {/* Frame accent */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 z-20 h-1 w-full bg-gradient-to-r from-transparent via-brand/80 to-transparent opacity-80"
          aria-hidden
        />
      </div>
    </motion.div>
  )
}
