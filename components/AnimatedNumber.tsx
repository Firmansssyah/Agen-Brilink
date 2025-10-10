import React, { useState, useEffect, useRef } from 'react';

// Easing function for a smoother slowdown effect (ease-out).
const easeOutQuad = (t: number): number => {
    // This is the standard and correct formula for a quadratic ease-out.
    // It ensures the output is always between 0 and 1 for an input of 0 to 1.
    return t * (1 - t);
};

interface AnimatedNumberProps {
    value: number;
    formatFn: (amount: number) => string;
    className?: string;
    duration?: number;
}

/**
 * A component that animates a number counting up or down to a new value.
 * It uses requestAnimationFrame for smooth performance.
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, formatFn, className, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(value);
    // FIX: Initialize useRef with null to provide an initial value, as useRef<T>() requires one if T cannot be undefined.
    const frameRef = useRef<number | null>(null);
    // Store the previous value to animate from it, avoiding re-animation on re-renders.
    const prevValueRef = useRef(value);

    useEffect(() => {
        const startValue = prevValueRef.current;
        const endValue = value;
        const diff = endValue - startValue;
        
        // If the value hasn't changed, do nothing.
        if (diff === 0) {
            // Ensure display is correct even if animation is skipped
            if (displayValue !== endValue) setDisplayValue(endValue);
            return;
        }

        let startTime: number | null = null;
        
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easedPercentage = easeOutQuad(percentage);

            const currentValue = startValue + (diff * easedPercentage);
            
            // Round the intermediate value to avoid floating point display issues.
            setDisplayValue(Math.round(currentValue));

            // Continue animation until duration is reached.
            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                // Ensure it ends on the exact final value.
                setDisplayValue(endValue);
                // Update the ref to the new final value for the next change.
                prevValueRef.current = endValue;
            }
        };

        // Start the animation loop.
        frameRef.current = requestAnimationFrame(animate);

        // Cleanup function to cancel animation if component unmounts or value changes mid-animation.
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            // Set the previous value to the current value at the time of cleanup.
            prevValueRef.current = value;
        };
    // FIX: Remove displayValue from dependency array to prevent re-triggering the animation on every frame.
    }, [value, duration]);

    return (
        <span className={className}>
            {formatFn(displayValue)}
        </span>
    );
};

export default AnimatedNumber;