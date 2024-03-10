// Description: 
//    Simple component that fits text to its container.
// Usage:
//    <TextFit maxSize={35}>Some text</TextFit>
// Note:
//    This component is loading slowly and flashing can be seen when the page is freshly loaded.
//    Due to that fact, a timeout is added to hide it until it's properly scaled.

// @ts-nocheck
'use client'

import React, { useEffect, useState } from "react";
import { ReactFitty } from "react-fitty";

export default function TextFit({ children, maxSize, minSize }:{ children: React.ReactNode, maxSize?: number, minSize?: number }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true); 
    }, 200); 

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
    <ReactFitty maxSize={maxSize} minSize={minSize}>
      {children}
    </ReactFitty>
  </div>
  );
};
