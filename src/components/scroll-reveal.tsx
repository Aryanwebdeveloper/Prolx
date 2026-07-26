"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
  amount?: number;
}

function getInitial(direction: Direction) {
  switch (direction) {
    case "up":    return { opacity: 0, y: 32 };
    case "down":  return { opacity: 0, y: -32 };
    case "left":  return { opacity: 0, x: 40 };
    case "right": return { opacity: 0, x: -40 };
    case "scale": return { opacity: 0, scale: 0.88 };
    case "none":  return { opacity: 0 };
    default:      return { opacity: 0, y: 32 };
  }
}

function getAnimate(direction: Direction) {
  switch (direction) {
    case "up":
    case "down":  return { opacity: 1, y: 0 };
    case "left":
    case "right": return { opacity: 1, x: 0 };
    case "scale": return { opacity: 1, scale: 1 };
    case "none":  return { opacity: 1 };
    default:      return { opacity: 1, y: 0 };
  }
}

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.55,
  direction = "up",
  className,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial={getInitial(direction)}
      animate={inView ? getAnimate(direction) : getInitial(direction)}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — wraps children that each use ScrollReveal or motion elements */
export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Use inside StaggerContainer for individual items */
export function StaggerItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: getInitial(direction),
        visible: {
          ...getAnimate(direction),
          transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
