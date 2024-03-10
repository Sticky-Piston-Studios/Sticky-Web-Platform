// Description: 
//    Simple component that copies text to clipboard. Text can be base64 encoded string and deobfuscated.
// Usage:
//    <CopyText subjectOfCopy={"Email"} textToCopy={"Y29udGFjdEBzdGlja3lwaXN0b25zdHVkaW9zLmNvbQ"} deobfuscate={true}/>

'use client'

import React from 'react';

export default function CopyText({ children, successMessage, errorMessage, textToCopy, deobfuscate = false }:{ children: React.ReactNode, successMessage: string, errorMessage: string, textToCopy: string, deobfuscate?: boolean }) {
  const copyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deobfuscate ? atob(textToCopy) : textToCopy);
      alert(`${successMessage}`); // Provide feedback to the user (could be a toast notification instead)
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert(`${errorMessage}`); // Handle potential errors (e.g., clipboard permissions not granted)
    }
  };

  return (
    <div className='cursor-pointer' onClick={copyTextToClipboard}>
      {children}
    </div>
  );
};

