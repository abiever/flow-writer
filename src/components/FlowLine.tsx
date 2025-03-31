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

      // Update target values based on flow state
      targetAmplitude.current = flowState * 15;
      targetFrequency.current = 0.05 + flowState * 0.1;
      const targetHue = flowState * 180; // 0 is red, 180 is blue
      const targetGlowIntensity = flowState * 20;

      // Smoother interpolation for more fluid movement
      currentAmplitude.current += (targetAmplitude.current - currentAmplitude.current) * 0.05;
      currentFrequency.current += (targetFrequency.current - currentFrequency.current) * 0.05;
      currentHue.current += (targetHue - currentHue.current) * 0.02; // Slower color transition
      currentGlowIntensity.current += (targetGlowIntensity - currentGlowIntensity.current) * 0.02;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw glow effect with interpolated values
      ctx.shadowColor = `hsla(${currentHue.current}, 100%, 50%, ${0.3 + flowState * 0.4})`;
      ctx.shadowBlur = currentGlowIntensity.current;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw main line with interpolated color
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${currentHue.current}, 100%, 50%)`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const centerY = canvas.height / 2;
      const points = 200;
      const step = canvas.width / (points - 1);

      for (let i = 0; i < points; i++) {
        const x = i * step;
        const y = centerY + 
          Math.sin(x * currentFrequency.current + timeRef.current) * currentAmplitude.current;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

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