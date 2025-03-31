import { useState, useEffect, useRef } from 'react';

interface TypingMetrics {
  lastKeyPress: number;
  keyPressCount: number;
  pauseCount: number;
}

export const useFlowState = () => {
  const [flowState, setFlowState] = useState(0);
  const metrics = useRef<TypingMetrics>({
    lastKeyPress: Date.now(),
    keyPressCount: 0,
    pauseCount: 0,
  });

  useEffect(() => {
    const updateFlowState = () => {
      const now = Date.now();
      const timeSinceLastPress = now - metrics.current.lastKeyPress;

      // If there's been a pause longer than 2 seconds, increase pause count
      if (timeSinceLastPress > 2000) {
        metrics.current.pauseCount++;
      }

      // Calculate flow state based on typing patterns
      const flowScore = Math.max(
        0,
        Math.min(
          1,
          (metrics.current.keyPressCount * 0.1) / (metrics.current.pauseCount + 1)
        )
      );

      setFlowState(flowScore);
    };

    const interval = setInterval(updateFlowState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = () => {
    const now = Date.now();
    const timeSinceLastPress = now - metrics.current.lastKeyPress;

    // Reset pause count if typing is continuous
    if (timeSinceLastPress < 2000) {
      metrics.current.pauseCount = Math.max(0, metrics.current.pauseCount - 0.5);
    }

    metrics.current.lastKeyPress = now;
    metrics.current.keyPressCount++;
  };

  return {
    flowState,
    handleKeyPress,
  };
}; 