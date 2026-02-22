import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.js";

export const BorderBeam = ({
    className,
    size = 50,
    delay = 0,
    duration = 6,
    colorFrom = "#ffaa40",
    colorTo = "#9c40ff",
    transition,
    style,
    reverse = false,
    initialOffset = 0,
    borderWidth = 1.5,
}) => {
    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]",
                className
            )}
            style={{
                borderWidth: `${borderWidth}px`,
                ...style,
            }}
        >
            <motion.div
                className="absolute aspect-square bg-gradient-to-l opacity-100"
                style={{
                    width: size,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: `linear-gradient(${reverse ? "90deg" : "270deg"
                        }, ${colorFrom} 0%, ${colorTo} 100%, transparent 100%)`,
                }}
                initial={{ offsetDistance: `${initialOffset}%` }}
                animate={{ offsetDistance: `${initialOffset + 100}%` }}
                transition={{
                    ease: "linear",
                    duration,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay,
                    ...transition,
                }}
                onUpdate={(latest) => {
                    // We map offsetDistance to motion path using pure CSS offset-path around the border.
                    // Framer motion transforms this automatically if we set the element to follow a path.
                }}
            />
            {/* We can use a simpler approach: a conic gradient spinning behind a mask */}
            <motion.div
                className="absolute inset-[-100%] rounded-[inherit]"
                style={{
                    background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 80deg, ${colorFrom} 120deg, ${colorTo} 160deg, transparent 200deg)`,
                }}
                animate={{
                    rotate: reverse ? [360, 0] : [0, 360],
                }}
                transition={{
                    ease: "linear",
                    duration,
                    repeat: Infinity,
                    delay,
                }}
            />
        </div>
    );
};
