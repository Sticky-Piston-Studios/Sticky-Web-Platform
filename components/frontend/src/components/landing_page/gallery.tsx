
'use client'

import React, { useState, useEffect } from "react";

import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';

export default function Gallery({ children: slides, autoSlide = false, autoSlideInterval = 3000 }:{ children: React.ReactNode[], autoSlide: boolean, autoSlideInterval: number }) {
    const [currentItem, setCurrentItem] = useState(0);
    const [autoSlideEnabled, setAutoSlideEnabled] = useState(autoSlide); 

    function nextItem(auto: boolean = false) {
      setCurrentItem((currentItem) => (currentItem === slides.length - 1 ? (auto ? 0 : currentItem) : currentItem + 1));
    };

		function previousItem() {
      setCurrentItem((currentItem) => (currentItem === 0 ? currentItem : currentItem - 1));
    };

    // Timer for auto slide
    useEffect(() => {
			if (!autoSlideEnabled) {
				return
			}

			const slideTimer = setTimeout(() => { if (autoSlideEnabled) { nextItem(true); } }, autoSlideInterval)
			return () => clearTimeout(slideTimer)
    }, [currentItem])

    return (
			<div className='overflow-hidden relative'>
				<div className='flex transition-transform ease-out duration-500' style={{ transform: `translateX(-${currentItem * 36.3}%)` }}>
					{slides}
				</div>
				<div className="absolute inset-0 flex items-center justify-between p-4">
					<button onClick={() => { previousItem(); setAutoSlideEnabled(false); }}>
						<ChevronLeftIcon className="interaction-brighness-dark opacity-[0.4] hover:opacity-[1] size-[80px]"/>
					</button>
					<button onClick={() => { nextItem(); setAutoSlideEnabled(false); }}>
						<ChevronRightIcon className="interaction-brighness-dark opacity-[0.4] hover:opacity-[1] size-[80px]"/>
					</button>
				</div>
				<div className='absolute bottom-4 right-0 left-0'>
					<div className='flex items-center justify-center gap-2'>
						{slides.map((s, i) => (
							<div key={i} className={`transition-all size-[10px] bg-white rounded-full ${currentItem === i ? "p-[0.5]" : "opacity-[0.4]"}`} />
						))}
					</div>
				</div>
			</div>
    );
}