import { useRef, ReactNode, MouseEvent } from 'react';

interface Interactive3DCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export const Interactive3DCard = ({
  children,
  className = '',
  intensity = 15,
}: Interactive3DCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !innerRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -intensity;
    const rotY = ((x - centerX) / centerX) * intensity;

    innerRef.current.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1)`;
    innerRef.current.style.transition = 'transform 0.08s ease-out';

    if (glareRef.current) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${px.toFixed(1)}% ${py.toFixed(1)}%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 65%)`;
      glareRef.current.style.opacity = '1';
    }
  };

  const handleMouseEnter = () => {
    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (innerRef.current) {
      innerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      innerRef.current.style.transition = 'transform 0.5s ease';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      <div
        ref={innerRef}
        className="relative w-full h-full rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300"
      >
        {children}

        {/* Dynamic Specular 3D Glare effect */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
        />
      </div>
    </div>
  );
};
