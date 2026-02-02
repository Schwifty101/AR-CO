/**
 * TeamBackgroundElements Component
 *
 * Minimal decorative SVG patterns inspired by OH Architecture's editorial aesthetic.
 * Provides subtle visual interest without distracting from content.
 *
 * @example
 * ```tsx
 * <TeamBackgroundElements
 *   variant="cream"
 *   elements={['lines', 'grid']}
 *   density="minimal"
 * />
 * ```
 */

import React from 'react';
import styles from './TeamBackgroundElements.module.css';
import './animations.css';

export interface TeamBackgroundElementsProps {
  /** Color variant for the decorative elements */
  variant?: 'cream' | 'white' | 'dark';
  /** Which decorative elements to render */
  elements?: Array<'lines' | 'grid' | 'dots' | 'corners' | 'shapes'>;
  /** Density of decorative elements */
  density?: 'minimal' | 'subtle';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders minimal decorative background elements for team page sections.
 * All elements are aria-hidden and have pointer-events: none.
 */
export const TeamBackgroundElements: React.FC<TeamBackgroundElementsProps> = ({
  variant = 'white',
  elements = ['lines'],
  density = 'minimal',
  className = '',
}) => {
  const renderLines = () => (
    <svg
      className={`${styles.lines} ${density === 'minimal' ? styles.minimal : ''}`}
      viewBox="0 0 1000 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Subtle flowing curves - OH-inspired minimal approach */}
      <path
        d="M0,200 Q250,150 500,200 T1000,200"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M0,600 Q250,650 500,600 T1000,600"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );

  const renderGrid = () => <div className={styles.grid} aria-hidden="true" />;

  const renderDots = () => {
    const dotCount = density === 'minimal' ? 15 : 30;
    return (
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: dotCount }).map((_, i) => (
          <div
            key={i}
            className={styles.dot}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderCorners = () => (
    <div className={styles.corners} aria-hidden="true">
      <div className={`${styles.corner} ${styles.topLeft}`} />
      <div className={`${styles.corner} ${styles.topRight}`} />
      <div className={`${styles.corner} ${styles.bottomLeft}`} />
      <div className={`${styles.corner} ${styles.bottomRight}`} />
    </div>
  );

  const renderShapes = () => {
    const shapeCount = density === 'minimal' ? 2 : 4;
    return (
      <div className={styles.shapes} aria-hidden="true">
        {Array.from({ length: shapeCount }).map((_, i) => {
          const isCircle = i % 2 === 0;
          const size = 80 + Math.random() * 60;
          return (
            <div
              key={i}
              className={`${styles.shape} ${isCircle ? styles.circle : styles.square}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animation: `float-slow ${15 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${styles[variant]} ${className}`}>
      {elements.includes('lines') && renderLines()}
      {elements.includes('grid') && renderGrid()}
      {elements.includes('dots') && renderDots()}
      {elements.includes('corners') && renderCorners()}
      {elements.includes('shapes') && renderShapes()}
    </div>
  );
};

export default TeamBackgroundElements;
