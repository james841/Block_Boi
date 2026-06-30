'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Minus } from 'lucide-react';
import Image from 'next/image';

type Slide = {
  id: string | number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  Button?: string;
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/slider', { next: { revalidate: 60 } });
        if (!res.ok) throw new Error('Failed to load slides');
        const data = await res.json();
        const slidesData = Array.isArray(data) ? data : data.sliders || [];
        setSlides(slidesData);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setShowContent(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % slides.length);
        setTimeout(() => setShowContent(true), 100);
      }, 400);
    }, 9000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    setShowContent(false);
    const t = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    setShowContent(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % slides.length);
    }, 300);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setShowContent(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i - 1 + slides.length) % slides.length);
    }, 300);
  }, [slides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[50vh] md:h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white text-xs uppercase tracking-[0.3em] font-light">Loading Collection</p>
        </div>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="relative w-full h-[50vh] md:h-screen bg-black flex items-center justify-center border-b border-white/10">
        <p className="text-white/50 text-sm uppercase tracking-widest font-light">End of Collection</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div
      className=" mt-40 relative w-full h-[70vh] md:h-screen overflow-hidden bg-black select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          if (!isActive && index !== (currentIndex + 1) % slides.length) return null;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-[5000ms] ease-linear ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={isActive}
                className={`object-cover transition-transform duration-[5000ms] ease-linear ${
                  isActive ? 'scale-110' : 'scale-120'
                }`}
                sizes="100vw"
              />
              {/* Subtle Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
            </div>
          );
        })}
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex items-center justify-start px-8 md:px-24">
        <div
          className={`max-w-4xl transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {currentSlide.subtitle && (
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[1px] w-12 bg-white/60" />
              <p className="text-white/80 text-xs md:text-sm font-medium uppercase tracking-[0.4em]">
                {currentSlide.subtitle}
              </p>
            </div>
          )}

          <h1 className="text-5xl md:text-8xl lg:text-9xl font-extralight text-white mb-10 tracking-tighter leading-[0.9]">
            {currentSlide.title}
          </h1>

          {currentSlide.Button && (
            <a
              href="/Cloths"
              className="group relative inline-flex items-center gap-6 text-white overflow-hidden"
            >
              <span className="text-sm font-bold uppercase tracking-widest py-4 border-b border-white group-hover:pr-12 transition-all duration-500">
                {currentSlide.Button}
              </span>
              <ArrowRight className="w-5 h-5 absolute right-0 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
            </a>
          )}
        </div>
      </div>

      {/* Modern Minimal Navigation */}
      <div className="absolute bottom-12 left-8 md:left-24 right-8 md:right-24 flex items-end justify-between z-20">
        
        {/* Progress Dots */}
        <div className="flex gap-2 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`transition-all duration-500 h-[2px] ${
                i === currentIndex ? 'w-12 bg-white' : 'w-4 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter & Arrows */}
        <div className="flex flex-col items-end gap-6">
          <div className="text-white/40 font-light tracking-tighter text-4xl md:text-6xl flex items-baseline">
            <span className="text-white text-5xl md:text-7xl">0{currentIndex + 1}</span>
            <span>/0{slides.length}</span>
          </div>
          
          <div className="flex border border-white/20 divide-x divide-white/20">
            <button
              onClick={prevSlide}
              className="p-4 md:p-6 text-white hover:bg-white hover:text-black transition-colors duration-300"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-4 md:p-6 text-white hover:bg-white hover:text-black transition-colors duration-300"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative vertical line */}
      <div className="hidden md:block absolute left-12 top-0 bottom-0 w-[1px] bg-white/10" />
    </div>
  );
}