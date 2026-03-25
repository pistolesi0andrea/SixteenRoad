"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/Image%20(46).jpg",
  "/Image%20(47).jpg",
  "/Image%20(48).jpg",
  "/Image%20(49).jpg",
  "/Image%20(50).jpg",
  "/Image%20(51).jpg",
];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt="Vintage Fashion Editorial"
            fill
            className="object-cover object-[center_32%] sm:object-[center_top]"
            priority={index === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(61,36,16,0.45)] to-transparent pointer-events-none" />
      <div className="absolute bottom-5 left-5 z-10 font-im-fell text-[11px] italic tracking-[0.04em] text-[rgba(242,236,224,0.85)] sm:bottom-7 sm:left-7 sm:text-[12px] lg:bottom-9 lg:left-9 lg:text-[13px] lg:tracking-[0.06em]">
        Civitanova Marche, Italy
      </div>
    </div>
  );
}
