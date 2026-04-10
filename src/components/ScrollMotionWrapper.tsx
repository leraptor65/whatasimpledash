"use client";

import { motion, useSpring, useTransform, MotionValue } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollMotionWrapperProps {
  children: ReactNode;
  velocity: MotionValue<number>;
  intensity?: number;
  index?: number;
}

export const ScrollMotionWrapper = ({ 
  children, 
  velocity, 
  intensity = 100,
  index = 0 
}: ScrollMotionWrapperProps) => {
  // Create a smoothed version of the velocity
  const springConfig = { 
    damping: 30 + (intensity / 10), 
    stiffness: 150 + (intensity / 2),
    mass: 1 + (index * 0.05) // Reduced mass increment for smoother grain
  };
  
  const velocitySpring = useSpring(velocity, springConfig);

  // Elastic Effect: Pulls elements apart vertically
  const translateY = useTransform(
    velocitySpring, 
    [-10, 10], 
    [-20 * (intensity / 100) * (1 + index * 0.1), 20 * (intensity / 100) * (1 + index * 0.1)]
  );

  return (
    <motion.div
      style={{
        y: translateY,
        translateZ: 0,
        width: '100%', // Lock horizontal width to prevent drift
        backfaceVisibility: 'hidden', // Prevent GPU flickering
        transformStyle: 'preserve-3d', // Ensure stable stacking
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
};
