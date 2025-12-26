
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: number;
  className?: string;
  onEnd?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, className = "", onEnd }) => {
  const [timeLeft, setTimeLeft] = useState<number>(targetDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = targetDate - Date.now();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        if (onEnd) onEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onEnd]);

  if (timeLeft <= 0) {
    return <span className={`text-red-500 font-bold uppercase ${className}`}>Expired</span>;
  }

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)));
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  // Urgent styling if less than 10 minutes left
  const isUrgent = timeLeft < 600000;

  return (
    <span className={`${isUrgent ? 'text-red-500 animate-pulse' : ''} font-mono ${className}`}>
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

export default CountdownTimer;
