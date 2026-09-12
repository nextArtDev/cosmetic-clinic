"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function VideoModal({
  open,
  onClose,
  src,
  poster,
  caption,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  poster: string;
  caption?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open && videoRef.current) videoRef.current.pause();
    if (open && videoRef.current) videoRef.current.play().catch(() => undefined);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="if-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="ویدیوی معرفی تمرین"
        >
          <motion.div
            className="if-modal"
            initial={{ scale: 0.86, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="if-modal-close" onClick={onClose} aria-label="بستن ویدیو">
              <X size={18} />
            </button>
            <video ref={videoRef} src={src} poster={poster} controls playsInline preload="metadata" />
            {caption && <p className="if-modal-cap">{caption}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
