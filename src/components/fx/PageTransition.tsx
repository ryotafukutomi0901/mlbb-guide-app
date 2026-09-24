"use client";

import { motion } from "framer-motion";

/**
 * ページ遷移時の軽いフェードイン。
 * 人工的なローディング遅延は入れない(体感速度とINPを損なうため)。
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
