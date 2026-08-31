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
    const particleCount = 85;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(168, 85, 247, ', // Neon purple
      'rgba(59, 130, 246, ',  // Electric blue
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(236, 72, 153, '   // Pink
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.8,
        y: (Math.random() - 0.5) * height * 1.8,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2.5 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      const fov = 420;
      const cx = width / 2;
      const cy = height / 2;

      // Draw faint futuristic circular concentric grid in background
      ctx.save();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.025)';
      ctx.lineWidth = 1;
      for (let r = 180; r < Math.max(width, height); r += 220) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.sin(time + r) * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Draw 3D Particles with perspective projection & constellations
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;

        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;
        const pSize = p.size * scale;
        const alpha = Math.max(0.08, (1 - p.z / 1000) * 0.6);

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.fillStyle = p.color + alpha + ')';
          ctx.shadowColor = p.color + '0.8)';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();

          // Subtle constellation lines
          for (let j = i + 1; j < particleCount; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 130) {
              const lineAlpha = (1 - dist / 130) * 0.05 * alpha;
              ctx.strokeStyle = 'rgba(147, 51, 234, ' + lineAlpha + ')';
              ctx.shadowBlur = 0;
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
