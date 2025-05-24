import React, { useEffect, useState } from 'react';

interface DynamicGridBackgroundProps {
  className?: string;
  gridSize?: number;
  borderColor?: string;
  backgroundColor?: string;
  animationInterval?: number;
}

const BackgroundComponent: React.FC<DynamicGridBackgroundProps> = ({
  className = '',
  gridSize = 60,
  borderColor = 'rgba(225, 234, 249, 0.05)',
  backgroundColor = '#070815',
  animationInterval = 8000,
}) => {
  const [grid, setGrid] = useState({
    cols: 0,
    rows: 0,
  });
  const [activeCells, setActiveCells] = useState<number[]>([]);

  useEffect(() => {
    const calculateGrid = () => {
      const cols = Math.ceil(window.innerWidth / gridSize);
      const rows = Math.ceil(document.documentElement.scrollHeight / gridSize);
      setGrid({ cols, rows });
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);

    const observer = new ResizeObserver(calculateGrid);
    observer.observe(document.body);

    const animate = () => {
      const totalCells: any = grid.cols * grid.rows;
      const newActiveCells: any = [];
      const numActive = Math.floor(totalCells * 0.05); // 5% of cells active
      for (let i = 0; i < numActive; i++) {
        newActiveCells.push(Math.floor(Math.random() * totalCells));
      }
      setActiveCells(newActiveCells);
    };

    animate();
    const interval = setInterval(animate, animationInterval);

    return () => {
      window.removeEventListener('resize', calculateGrid);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [gridSize, animationInterval, grid.cols, grid.rows]);

  return (
    <div
      className={`absolute inset-0 z-0 min-h-full ${className}`}
      style={{ backgroundColor }}
    >
      {/* Enhanced gradient overlay with central glow */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `
          radial-gradient(circle at 50% 0%, rgba(153, 190, 247, 0.3) 0%, rgba(153, 190, 247, 0) 40%),
          linear-gradient(to top, rgba(153, 190, 247, 0.2) 0%, transparent 70%)
        `,
        }}
      />
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, ${gridSize}px)`,
          gridTemplateRows: `repeat(${grid.rows}, ${gridSize}px)`,
        }}
      >
        {Array.from({ length: grid.cols * grid.rows }).map((_, i) => (
          <div
            key={i}
            className={`w-[${gridSize}px] h-[${gridSize}px] border transition-colors duration-500 ease-in-out box-border ${activeCells.includes(i) ? 'bg-[#243D613D]' : 'bg-transparent'
              }`}
            style={{ border: `1px solid ${borderColor}` }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundComponent;