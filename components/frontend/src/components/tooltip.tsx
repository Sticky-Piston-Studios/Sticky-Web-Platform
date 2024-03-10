'use client'

import React, { useState } from 'react';


export default function Tooltip({ children, text }: { children: React.ReactNode, text: string}) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Inline styles
  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
    } as React.CSSProperties,

    tooltip: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'black',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      marginTop: '8px',
      whiteSpace: 'nowrap',
      zIndex: 100,
      opacity: 0.75,
      fontSize: '15px',
      display: isTooltipVisible ? 'block' : 'none',
    } as React.CSSProperties,
  };

  return (
    <div 
      className="hidden md:block"
      style={styles.container} 
      onMouseEnter={() => setIsTooltipVisible(true)} 
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {children}
      {isTooltipVisible && (
        <div style={styles.tooltip}>{text}</div>
      )}
    </div>
  );
};
