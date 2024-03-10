// Description: 
//    Container with title and subtitle, two text columns
//    On mobile both texts are one under another with a gap between them

import React from "react";
import Image from 'next/image'
import { breakLines } from "@/utils";

export default function ContentSection3({
  title, 
  subtitle, 
  text1, 
  text2, 
  showBottomLine
}:{
  title?: string, 
  subtitle?: string, 
  text1?: string, 
  text2?: string, 
  showBottomLine?: boolean
}) {
  return (
    <div className={`flex flex-col`}>
      <div>
        {title ? <h2 className={`mb-[8px]`}>{title}</h2> : null}
        {subtitle ? <h3 className={`mb-[8px]`}>{subtitle}</h3> : null}
        {(title || subtitle) ? <div className='size-[32px]'/> : null}
      </div>
      <div className='flex flex-col lg:flex-row'>
        <p className='flex-1'>{breakLines(text1)}</p>
        {text2 ? <div className='block size-[32px] lg:size-[136px]'/> : null}
        {text2 ? <p className='flex-1'>{breakLines(text2)}</p> : null}
      </div>
      {showBottomLine == true ? <div className="horizontal-line"/> : null}
    </div>
  );
}