import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';

const CursorDot = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
`;

const CursorOutline = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border: 2px solid #667eea;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  mix-blend-mode: difference;
`;

const Cursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = {
      x: 0,
      y: 0,
    };

    const mouse = {
      x: 0,
      y: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseEnter = () => {
      gsap.to(cursorOutlineRef.current, {
        scale: 1.5,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursorOutlineRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    const animate = () => {
      // Smooth cursor dot movement
      cursor.x = gsap.utils.interpolate(cursor.x, mouse.x, 0.1);
      cursor.y = gsap.utils.interpolate(cursor.y, mouse.y, 0.1);

      if (cursorDotRef.current) {
        gsap.set(cursorDotRef.current, {
          x: cursor.x - 4,
          y: cursor.y - 4,
        });
      }

      if (cursorOutlineRef.current) {
        gsap.set(cursorOutlineRef.current, {
          x: mouse.x - 20,
          y: mouse.y - 20,
        });
      }

      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // Hide cursor on mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    return null;
  }

  return (
    <>
      <CursorDot ref={cursorDotRef} />
      <CursorOutline ref={cursorOutlineRef} />
    </>
  );
};

export default Cursor; 