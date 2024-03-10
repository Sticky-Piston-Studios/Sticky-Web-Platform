// Description: 
//    Displays a looping carousel of text items. 
//    Container with title and subtitle, and text under the image, image can have a caption
//    On mobile both texts are one under another with a gap between them

import React from "react";
import Image from 'next/image'
import { breakLines } from "@/utils";

export default function ContentSection2({
  title, 
  subtitle, 
  text, 
  imageSrc, 
  invert, 
  showBottomLine
}:{
  title?: string, 
  subtitle?: string, 
  text?: string, 
  imageSrc: string, 
  invert?: boolean, 
  showBottomLine?: boolean
}) {
  return (
    <div className={`flex flex-col `}>

      {title ? <h2 className={`mb-[32px]`}>{title}</h2> : null}

      <div className='lg:my-auto relative inline-block'>
        <Image src={imageSrc} alt="" className="w-[100%] mx-auto shadow-2 gradient-border-box rounded-[12px] md:h-[700px] object-cover" width={100} height={100}/>
        <div className='background-circle-glow size-[800px] md:size-[500px]'/>
      </div>

      {subtitle ? <h3 className={`${invert ? "mr-auto" : "ml-auto"} text-[20px] my-[14px]`}>{subtitle}</h3> : null}   

      <div className={`w-full md:w-[60%] mt-[24px] md:mt-[40px] ${invert ? "md:ml-auto" : "md:mr-auto"}`}>
        <p>{breakLines(text)}</p>
        {showBottomLine == true ? <div className="horizontal-line"/> : null}
      </div>
    </div>
  );
}