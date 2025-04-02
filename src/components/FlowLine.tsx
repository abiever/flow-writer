import { useEffect, useRef } from 'react';

interface FlowLineProps {
  flowState: number;
}

export const FlowLine = ({ flowState }: FlowLineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const targetAmplitude = useRef(0);
  const currentAmplitude = useRef(0);
  const targetFrequency = useRef(0);
  const currentFrequency = useRef(0);
  const currentHue = useRef(0);
  const currentGlowIntensity = useRef(0);
  const currentLineWidth = useRef(1);
  const sustainedTypingRef = useRef(0);
  const lineExtensionProgress = useRef(0);
  const dotSizeProgress = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation function
    const animate = () => {
      if (!ctx || !canvas) return;

      // Simple decay rate that will return to flat red in 30 seconds (at 60fps)
      const DECAY_RATE_PER_FRAME = 1 / (30 * 60); // 0.000556 per frame
      const LINE_EXTENSION_RATE = 0.005; // 0.5% per frame - much slower extension/retraction
      const DOT_SIZE_RATE = 0.003; // 0.3% per frame - even slower dot size animation
      
      if (flowState > 0) {
        sustainedTypingRef.current = Math.min(1, sustainedTypingRef.current + 0.001);
        // First animate the dot size
        dotSizeProgress.current = Math.min(1, dotSizeProgress.current + DOT_SIZE_RATE);
        // Only start extending the line once the dot has reached minimum size
        if (dotSizeProgress.current >= 1) {
          lineExtensionProgress.current = Math.min(1, lineExtensionProgress.current + LINE_EXTENSION_RATE);
        }
      } else {
        sustainedTypingRef.current = Math.max(0, sustainedTypingRef.current - DECAY_RATE_PER_FRAME);
        // Retract the line when typing stops
        lineExtensionProgress.current = Math.max(0, lineExtensionProgress.current - LINE_EXTENSION_RATE);
        // Only start shrinking the dot once the line is fully retracted
        if (lineExtensionProgress.current <= 0) {
          dotSizeProgress.current = Math.max(0, dotSizeProgress.current - DOT_SIZE_RATE);
        }
      }

      // Use sustained typing value for visual effects
      const effectiveFlowState = flowState * sustainedTypingRef.current;

      // Update target values based on flow state
      targetAmplitude.current = effectiveFlowState * 10;
      targetFrequency.current = 0.01 + effectiveFlowState * 0.025;
      const targetHue = effectiveFlowState * 180; // 0 is red, 180 is blue
      const targetGlowIntensity = effectiveFlowState * 40;
      const targetLineWidth = 1 + effectiveFlowState * 9;

      // Faster interpolation when returning to initial state
      const interpolationFactor = flowState > 0 ? 0.05 : 0.2;
      currentAmplitude.current += (targetAmplitude.current - currentAmplitude.current) * interpolationFactor;
      currentFrequency.current += (targetFrequency.current - currentFrequency.current) * interpolationFactor;
      currentHue.current += (targetHue - currentHue.current) * interpolationFactor;
      currentGlowIntensity.current += (targetGlowIntensity - currentGlowIntensity.current) * interpolationFactor;
      currentLineWidth.current += (targetLineWidth - currentLineWidth.current) * interpolationFactor;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw glow effect with interpolated values
      ctx.shadowColor = `hsla(${currentHue.current}, 100%, 50%, ${0.2 + effectiveFlowState * 0.6})`;
      ctx.shadowBlur = currentGlowIntensity.current;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw main line with interpolated color and width
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${currentHue.current}, 100%, 50%)`;
      ctx.lineWidth = currentLineWidth.current;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const centerY = canvas.height / 2;
      const centerX = canvas.width / 2;
      const points = 200;
      const step = canvas.width / (points - 1);

      // Calculate the visible portion of the line based on extension progress
      const visiblePoints = Math.floor(points * lineExtensionProgress.current);
      const startIndex = Math.floor((points - visiblePoints) / 2);
      const endIndex = startIndex + visiblePoints;

      for (let i = startIndex; i < endIndex; i++) {
        const x = i * step;
        const y = centerY + 
          Math.sin(x * currentFrequency.current + timeRef.current) * currentAmplitude.current;
        
        if (i === startIndex) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw glowing white dot at center
      const centerYPos = centerY + 
        Math.sin(centerX * currentFrequency.current + timeRef.current) * currentAmplitude.current;
      
      // Save context state
      ctx.save();
      
      // Set up glow for the dot
      ctx.shadowColor = `rgba(255, 255, 255, ${0.3 + effectiveFlowState * 0.7})`;
      ctx.shadowBlur = 20 + effectiveFlowState * 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw the dot with size animation
      ctx.beginPath();
      ctx.fillStyle = 'white';
      const maxDotSize = 10;
      const dotSize = maxDotSize * dotSizeProgress.current + effectiveFlowState * 6;
      ctx.arc(centerX, centerYPos, dotSize, 0, Math.PI * 2);
      ctx.fill();

      // Restore context state
      ctx.restore();

      // Reset shadow for next frame
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      timeRef.current += 0.01;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [flowState]);

  return (
    <canvas
      ref={canvasRef}
      className="flow-line"
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
}; 