"use client"

import React, { useState, useEffect } from "react";
import Image from 'next/image'

export default function ImageSection({ image, caption, children }:{ image: string, caption?: string, children?: React.ReactNode}) {

  return (
    <div className="container mx-auto">
      <Image src={image} alt='' className="w-full h-auto rounded-md shadow-1" width={28} height={28}/>
      <div className="flex flex-col">
        {children}
        {caption && <p className={`text-left p-3 !pl-0 whitespace-pre-line`}>{caption}</p>}
      </div>
    </div>
  );
}