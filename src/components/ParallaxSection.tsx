import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className = '',
  speed = 0.5,
  direction = 'up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' ? [100 * speed, -100 * speed] : [-100 * speed, 100 * speed]
  );

  const smoothY = useSpring(y, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      ref={ref}
      style={{ y: smoothY }}
      className={`parallax-slow ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  amplitude?: number;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
  amplitude = 20,
  className = ''
}) => {
  return (
    <motion.div
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      className={`float ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -8 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`glass-effect rounded-2xl p-6 ${hover ? 'interactive-card' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface HolographicTextProps {
  children: React.ReactNode;
  className?: string;
}

export const HolographicText: React.FC<HolographicTextProps> = ({
  children,
  className = ''
}) => {
  return (
    <span className={`holographic bg-clip-text text-transparent font-bold inline-block ${className}`}>
      {children}
    </span>
  );
};

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'btn-premium relative overflow-hidden font-semibold rounded-2xl transition-all duration-300';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-6 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white glow-green',
    secondary: 'bg-gradient-to-r from-red-500 to-red-600 text-white glow-red'
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.05,
        y: -2,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default ParallaxSection; 