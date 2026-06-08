'use client';

import React, { useEffect, useRef } from 'react';

export default function CanvasGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Particles representing "historical events" or nodes in the universe
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulse: number;
    }

    const particles: Particle[] = [];
    const numParticles = 40;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * 0.05 + 0.01,
      });
    }

    // Get color from active CSS theme variables
    const getThemeColors = () => {
      if (typeof window === 'undefined') return { primary: '99, 102, 241', accent: '236, 72, 153' };
      const style = getComputedStyle(document.documentElement);
      const primary = style.getPropertyValue('--color-primary').trim() || '99 102 241';
      const accent = style.getPropertyValue('--color-accent').trim() || '236 72 153';
      return { primary, accent };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const colors = getThemeColors();
      const primaryColor = `rgba(${colors.primary.replace(/\s+/g, ',')}, `;
      const accentColor = `rgba(${colors.accent.replace(/\s+/g, ',')}, `;

      // Draw drifting Grid Lines
      ctx.strokeStyle = `${primaryColor}0.035)`;
      ctx.lineWidth = 1;

      const gridSize = 60;
      const xOffset = (Date.now() * 0.005) % gridSize;
      const yOffset = (Date.now() * 0.005) % gridSize;

      for (let x = xOffset; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = yOffset; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw particulate dust
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.alpha += p.pulse;
        if (p.alpha > 0.8 || p.alpha < 0.15) {
          p.pulse *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${accentColor}${p.alpha})`;
        ctx.fill();

        // Draw links between close particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            const linkAlpha = (1 - dist / 150) * 0.08 * Math.min(p.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${primaryColor}${linkAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
