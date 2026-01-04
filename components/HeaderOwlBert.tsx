import React, { useState, useEffect, useRef } from 'react';

interface HeaderOwlBertProps {
  selectedOption?: 'work' | 'school' | 'social' | null;
}

const HeaderOwlBert: React.FC<HeaderOwlBertProps> = ({ selectedOption }) => {
  const [eyeDirection, setEyeDirection] = useState<'left' | 'right' | 'center'>('center');
  const [isBlinking, setIsBlinking] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle looking at selected options
  useEffect(() => {
    if (selectedOption) {
      // Determine direction based on option
      let direction: 'left' | 'right' | 'center' = 'center';

      if (selectedOption === 'work') {
        direction = 'left';
      } else if (selectedOption === 'school') {
        direction = 'center';
      } else if (selectedOption === 'social') {
        direction = 'right';
      }

      setEyeDirection(direction);

      // Return to center after 2 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setEyeDirection('center');
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedOption]);

  // Blinking animation - blink every 3-5 seconds
  useEffect(() => {
    const startBlinking = () => {
      const randomDelay = 3000 + Math.random() * 2000; // 3-5 seconds

      blinkIntervalRef.current = setTimeout(() => {
        setIsBlinking(true);

        // Blink duration of 150ms
        setTimeout(() => {
          setIsBlinking(false);
          startBlinking(); // Schedule next blink
        }, 150);
      }, randomDelay);
    };

    startBlinking();

    return () => {
      if (blinkIntervalRef.current) {
        clearTimeout(blinkIntervalRef.current);
      }
    };
  }, []);

  // Calculate eye position offset based on direction
  const getEyeOffset = () => {
    switch (eyeDirection) {
      case 'left':
        return { x: -3, y: 0 };
      case 'right':
        return { x: 3, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getEyeOffset();

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <div className="relative w-full h-full transition-transform duration-300 ease-in-out">
        {/* OwlBert Logo */}
        <img
          src="/OwlBert_Logo.svg"
          alt="OwlBert"
          className="w-full h-full object-contain"
          style={{
            filter: isBlinking ? 'brightness(0.7)' : 'brightness(1)'
          }}
        />

        {/* Animated eyes overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: 'transform 0.3s ease-in-out',
            opacity: isBlinking ? 0.3 : 1
          }}
        >
          {/* Left eye */}
          <div
            className="absolute bg-black rounded-full"
            style={{
              width: '6%',
              height: '8%',
              left: '38%',
              top: '35%',
              opacity: isBlinking ? 0 : 1,
              transition: 'opacity 0.15s ease-in-out'
            }}
          />

          {/* Right eye */}
          <div
            className="absolute bg-black rounded-full"
            style={{
              width: '6%',
              height: '8%',
              left: '56%',
              top: '35%',
              opacity: isBlinking ? 0 : 1,
              transition: 'opacity 0.15s ease-in-out'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderOwlBert;
