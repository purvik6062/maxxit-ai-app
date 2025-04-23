'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [isClickingLink, setIsClickingLink] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number; timestamp: number }[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setMousePosition(newPosition);
      
      // Add to trail when clicking links
      if (isClickingLink) {
        const now = Date.now();
        // Only add a new point every 30ms to avoid too many points
        if (trail.length === 0 || now - trail[trail.length - 1].timestamp > 30) {
          setTrail(prevTrail => [...prevTrail.slice(-5), { ...newPosition, timestamp: now }]);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => {
      setIsClicking(false);
      setIsClickingLink(false);
      // Clear the trail when releasing the mouse
      setTrail([]);
    };

    const handleLinkHoverStart = () => setIsHoveringLink(true);
    const handleLinkHoverEnd = () => setIsHoveringLink(false);
    
    const handleLinkMouseDown = () => setIsClickingLink(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Add hover and click detection for links
    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleLinkHoverStart);
      link.addEventListener('mouseleave', handleLinkHoverEnd);
      link.addEventListener('mousedown', handleLinkMouseDown);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);

      links.forEach(link => {
        link.removeEventListener('mouseenter', handleLinkHoverStart);
        link.removeEventListener('mouseleave', handleLinkHoverEnd);
        link.removeEventListener('mousedown', handleLinkMouseDown);
      });
    };
  }, [isClickingLink, trail]);

  // Hide the default cursor using CSS
  useEffect(() => {
    document.body.classList.add('custom-cursor');
    
    return () => {
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  const cursorVariants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(109, 40, 217, 0.2)',
      border: theme === 'dark' ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid rgba(109, 40, 217, 0.4)',
    },
    clicking: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 24,
      width: 24,
      backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.4)' : 'rgba(109, 40, 217, 0.4)',
    },
    hovering: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: 'transparent',
      border: theme === 'dark' ? '2px solid rgba(124, 58, 237, 0.7)' : '2px solid rgba(109, 40, 217, 0.7)',
    },
    clickingLink: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 16,
      width: 16,
      scale: [0.8, 1.2, 0.8], // Pulse animation
      backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(139, 92, 246, 0.8)',
      border: theme === 'dark' ? '2px solid rgba(168, 85, 247, 1)' : '2px solid rgba(139, 92, 246, 1)',
      transition: {
        scale: {
          repeat: Infinity,
          duration: 0.5
        }
      }
    }
  };

  const dotVariants = {
    default: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      height: 8,
      width: 8,
      backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.8)' : 'rgba(109, 40, 217, 0.8)',
    },
    clicking: {
      x: mousePosition.x - 6,
      y: mousePosition.y - 6,
      height: 12,
      width: 12,
      backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 1)' : 'rgba(109, 40, 217, 1)',
    },
    hovering: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      height: 8,
      width: 8,
      opacity: 0.5,
    },
    clickingLink: {
      x: mousePosition.x - 6,
      y: mousePosition.y - 6,
      height: 12,
      width: 12,
      backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 1)' : 'rgba(139, 92, 246, 1)',
      scale: 1.5,
      opacity: 0.9,
    }
  };

  // Determine the current cursor state
  const getCursorState = () => {
    if (isClickingLink) return 'clickingLink';
    if (isHoveringLink) return 'hovering';
    if (isClicking) return 'clicking';
    return 'default';
  };

  // Only show custom cursor on desktop devices
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return null;
  }

  return (
    <>
      {/* Trail effect when clicking links */}
      {isClickingLink && trail.map((point, index) => (
        <motion.div
          key={index}
          className="custom-cursor-trail pointer-events-none fixed top-0 left-0 z-50 rounded-full"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            x: point.x - 4,
            y: point.y - 4,
            height: 8,
            width: 8,
            backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(139, 92, 246, 0.4)',
            opacity: 0.6 - (index * 0.1),
            zIndex: 50,
            borderRadius: '50%',
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        />
      ))}
      
      <motion.div
        className="custom-cursor-ring pointer-events-none fixed top-0 left-0 z-50 rounded-full mix-blend-difference"
        variants={cursorVariants}
        animate={getCursorState()}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      />
      <motion.div
        className="custom-cursor-dot pointer-events-none fixed top-0 left-0 z-50 rounded-full"
        variants={dotVariants}
        animate={getCursorState()}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      />
    </>
  );
};

export default CustomCursor; 