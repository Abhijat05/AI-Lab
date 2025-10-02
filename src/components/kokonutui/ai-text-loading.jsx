"use client";
/**
 * @author: @kokonutui
 * @description: AI Text Loading
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function AITextLoading({
    texts = [
        "Thinking...",
        "Processing...",
        "Analyzing...",
        "Computing...",
        "Almost done...",
        "Crafting response..."
    ],
    className,
    interval = 1500
}) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [dots, setDots] = useState("");

    useEffect(() => {
        const textTimer = setInterval(() => {
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, interval);

        // Add animated dots
        const dotsTimer = setInterval(() => {
            setDots(prev => prev.length >= 3 ? "" : prev + ".");
        }, 400);

        return () => {
            clearInterval(textTimer);
            clearInterval(dotsTimer);
        };
    }, [interval, texts.length]);

    return (
        <div className="flex items-center justify-center py-4">
            <motion.div
                className="relative px-4 py-2 w-full glass-card rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentTextIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            backgroundPosition: ["200% center", "-200% center"],
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            opacity: { duration: 0.2 },
                            y: { duration: 0.2 },
                            backgroundPosition: {
                                duration: 2,
                                ease: "linear",
                                repeat: Infinity,
                            },
                        }}
                        className={cn(
                            "flex items-center justify-center bg-gradient-to-r from-primary via-muted-foreground to-primary bg-[length:200%_100%] bg-clip-text text-transparent whitespace-nowrap min-w-max",
                            className
                        )}>
                        <span className="mr-1">{texts[currentTextIndex].split(".")[0]}</span>
                        <span className="inline-block w-6 text-left">{dots}</span>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
