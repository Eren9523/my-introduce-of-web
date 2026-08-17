import React, { useEffect, useRef } from 'react';

const TideBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Use parent container for dimensions and events
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = parent.clientWidth;
    let height = canvas.height = parent.clientHeight;

    let particles: Particle[] = [];
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8A2BE2', '#F43F5E', '#8B5CF6', '#F59E0B'];
    
    let mouse = { x: -1000, y: -1000, radius: 250 };
    let isMouseIn = false;
    
    const numParticles = Math.floor((width * height) / 1200);

    class Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      angle: number;
      length: number;
      speed: number;
      parallaxFactor: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.vx = 0;
        this.vy = 0;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 1.5 + 1;
        this.length = Math.random() * 8 + 3;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.5 + 0.1;
        this.parallaxFactor = Math.random() * 0.8 + 0.2;
      }

      update(time: number, scrollDelta: number) {
        const scale = 0.002;
        const noiseAngle = (
          Math.sin(this.x * scale + time * 0.0005) + 
          Math.cos(this.y * scale + time * 0.0006)
        ) * Math.PI * 2;
        
        let flowVx = Math.cos(noiseAngle) * this.speed;
        let flowVy = Math.sin(noiseAngle) * this.speed;

        let mouseVx = 0;
        let mouseVy = 0;
        
        if (isMouseIn) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            
            const force = (mouse.radius - distance) / mouse.radius;
            const repelStrength = 3;
            mouseVx = -forceDirectionX * force * repelStrength;
            mouseVy = -forceDirectionY * force * repelStrength;
            
            const swirlStrength = 1.5;
            mouseVx += forceDirectionY * force * swirlStrength;
            mouseVy += -forceDirectionX * force * swirlStrength;
          }
        }

        this.vx += (flowVx + mouseVx - this.vx) * 0.05;
        this.vy += (flowVy + mouseVy - this.vy) * 0.05;

        const dxOrigin = this.originX - this.x;
        const dyOrigin = this.originY - this.y;
        const distOrigin = Math.sqrt(dxOrigin * dxOrigin + dyOrigin * dyOrigin);
        
        if (distOrigin > 100 && !isMouseIn) {
           this.vx += (dxOrigin / distOrigin) * 0.01;
           this.vy += (dyOrigin / distOrigin) * 0.01;
        }

        this.x += this.vx;
        this.y += this.vy;

        const scrollShift = scrollDelta * this.parallaxFactor;
        this.y -= scrollShift;
        this.originY -= scrollShift;

        const velocityMagnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (velocityMagnitude > 0.1) {
          this.angle = Math.atan2(this.vy, this.vx);
        }

        const margin = 100;
        if (this.x < -margin) { this.x = width + margin; this.originX = this.x; }
        if (this.x > width + margin) { this.x = -margin; this.originX = this.x; }
        if (this.y < -margin) { this.y = height + margin; this.originY = this.y; }
        if (this.y > height + margin) { this.y = -margin; this.originY = this.y; }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        
        ctx.moveTo(-this.length / 2, 0);
        ctx.lineTo(this.length / 2, 0);
        ctx.strokeStyle = this.color;
        
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        ctx.globalAlpha = Math.min(1, speed * 0.5 + 0.3);
        
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        let x = Math.pow(Math.random(), 1.5) * width; 
        let y = Math.random() * height;
        particles.push(new Particle(x, y));
      }
    };

    init();

    let animationFrameId: number;
    let time = 0;
    let lastScrollY = window.scrollY;

    const animate = () => {
      // Clear with slight trail effect matching the slate-950 container
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(time, scrollDelta);
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = parent.clientWidth;
      height = canvas.height = parent.clientHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      isMouseIn = true;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      isMouseIn = false;
    };

    window.addEventListener('resize', handleResize);
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full rounded-[2.5rem]"
    />
  );
};

export default TideBackground;
