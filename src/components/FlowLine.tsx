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
      targetAmplitude.current = flowState * 30;
      targetFrequency.current = 0.1 + flowState * 0.2;

      // Smoothly interpolate current values
      currentAmplitude.current += (targetAmplitude.current - currentAmplitude.current) * 0.1;
      currentFrequency.current += (targetFrequency.current - currentFrequency.current) * 0.1;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${120 + flowState * 40}, 70%, 50%)`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const centerY = canvas.height / 2;
      const points = 100;
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
      timeRef.current += 0.02; // Controls animation speed

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