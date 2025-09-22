"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useState } from "react";

export const CopyToClipboard = ({ children }: { children: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children.toString());
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [children]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border p-[5px] bg-white flex items-center justify-center rounded-md shadow-nice"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isCopied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.05,
              ease: "easeOut",
            }}
            className="flex items-center justify-center"
          >
            <CheckIcon className="w-3.5 h-3.5" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.05,
              ease: "easeOut",
            }}
            className="flex items-center justify-center"
          >
            <CopyIcon className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
