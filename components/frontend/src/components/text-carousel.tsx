// Description: 
//    Displays a looping carousel of text items. 
//    Different animation presets can be used by changing the springConfig prop.
// Usage: 
//    <TextCarousel textItems={['item1', 'item2', 'item3']} frequency={3000}/>

'use client'

import React, { useState, useEffect } from "react";
import TextTransition, { presets } from 'react-text-transition';

export default function TextCarousel({ textItems, style, frequency }:{ textItems: string[], style?: string, frequency?: number }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const intervalId = setInterval(() => setIndex(index => index + 1), frequency || 3000);
      return () => clearTimeout(intervalId);
    }, []);

  return (
    <TextTransition className={style} springConfig={presets.gentle}>
      {textItems[index % textItems.length]}
    </TextTransition>
  );
};
