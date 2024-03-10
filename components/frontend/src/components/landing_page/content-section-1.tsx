// Description: 
//    Container with title and subtitle, text and image columns
//    On mobile text under the image
//    InvertHorizontal changes column order on desktop while InvertVertical changes row order on mobile

import React from "react";
import Image from 'next/image'
import { breakLines } from "@/utils";

export default function ContentSection1({
  title, 
  subtitle, 
  text, 
  imageSrc, 
  imageStyle, 
  imageContainerStyle, 
  invertHorizontal, 
  invertVertical, 
  showBottomLine,
  bottomElement
}:{
  title: string, 
  subtitle?: string, 
  text?: string, 
  imageSrc: string, 
  imageStyle?: string, 
  imageContainerStyle?: string, 
  invertHorizontal?: boolean, 
  invertVertical?: boolean, 
  showBottomLine?: boolean,
  bottomElement?: React.ReactNode
}) {
  return (
    <>
      <div className='block lg:hidden'>
          <h2 className={`mb-[8px]`}>{title}</h2>
          {subtitle ? <h3 className={`mb-[8px]`}>{subtitle}</h3> : null}
      </div>

      <div className='size-[32px]'/>

      <div className={`flex ${invertVertical ? "flex-col" : "flex-col-reverse"} ${invertHorizontal ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
        
        <div className='flex-1'>
          <div className='hidden lg:block'>
            <h2 className={`mb-[8px]`}>{title}</h2>
            {subtitle ? <h3 className={`mb-[8px]`}>{subtitle}</h3> : null}
            <div className='size-[32px]'/>
          </div>
          <p>{breakLines(text)}</p>
          {showBottomLine == true ? <div className="horizontal-line"/> : <div className='h-[28px]'/>}
          {bottomElement}
        </div>
    
        <div className='hidden lg:block size-[136px]'/>
        <div className='size-[32px] md:h-0'/>

        <div className='flex-1 flex z-[0]'>
          <div className={`my-[28px] mx-auto lg:my-auto p-[8px] sm:p-[48px] lg:p-[64px] relative ${imageContainerStyle}`}>
            <Image src={imageSrc} alt="" className={`w-[100%] mx-auto shadow-2 ${imageStyle}`} width={100} height={100}/>
            <div className='background-circle-glow size-[800px] md:size-[700px] '/>
          </div>
        </div>
        
      </div>
    </>
  );
}