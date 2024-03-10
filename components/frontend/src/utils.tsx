import React from "react";

// This function is used to split the text into parts divided by <br/> and filter out empty strings if any
// This is needed because there is no support for new lines in yaml translation files
// Usage: {breakLines(t('some.translation.key'))}
export function breakLines(text: string | undefined) {

    if (!text) {
      return null; 
    }

    // Split the text into parts divided by <br/> and filter out empty strings if any
    const parts = text.split('\\n');

    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
}
