import React, { useRef, useEffect } from 'react';

export const SpatialBackground3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Particles array
    const particleCount = 55;
    const particles: Array<{
      x: number;
      y: number;
      z: number; // 3D depth from 0 to 1000
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const colors = ['rgba(29, 78, 216, ', 'rgba(234, 88, 12, ', 'rgba(21, 128, 61, '];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      // Draw subtle 3D spatial grid lines
      ctx.strokeStyle = 'rgba(29, 78, 216, 0.04)';
      ctx.lineWidth = 1;
      const horizonY = cy + Math.sin(time * 0.5) * 15;

      for (let x = -width; x < width * 2; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(cx + (x - cx) * 0.2, horizonY);
        ctx.stroke();
      }

      // Draw 3D Particles with perspective projection
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;

        // Perspective 3D calculation
        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;
        const pSize = p.size * scale;
        const alpha = Math.max(0.1, (1 - p.z / 1000) * 0.45);

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.fillStyle = p.color + alpha + ')';
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();

          // Connect nearby 3D points with floating spatial line links
          for (let j = i + 1; j < particleCount; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {
              const lineAlpha = (1 - dist / 180) * 0.08 * alpha;
              ctx.strokeStyle = 'rgba(29, 78, 216, ' + lineAlpha + ')';
              ctx.beginPath();
              ctx.moveTo(px, py);
              const scale2 = fov / (fov + p2.z);
              ctx.lineTo(cx + p2.x * scale2, cy + p2.y * scale2);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
