"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type MotionSectionProps = PropsWithChildren<{
  delay?: number;
  className?: string;
}>;

export function MotionSection({ children, delay = 0, className }: MotionSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.section>
  );
}


