
// Description: 
//    Simple component that returns deobfuscated text from Base64-encoded string.
// Usage:
//    <DebfuscateText encodedText={"Y29udGFjdEBzdGlja3lwaXN0b25zdHVkaW9zLmNvbQ"} />

'use client'

import React, { useEffect, useState } from 'react';

export default function DebfuscateText({ encodedText }:{ encodedText: string }) {
    const [text, setText] = useState('');

    useEffect(() => {
      setText(atob(encodedText));
    }, []);
  
    return (
      <>
        {text}
      </>
    );
};

