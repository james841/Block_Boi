'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Zap } from 'lucide-react';
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

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const minSwipeDistance = 50; // Minimum distance in px to trigger swipe

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

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setShowContent(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % slides.length);
        setTimeout(() => setShowContent(true), 100);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Fade content on slide change
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

  // Touch handlers
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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[50vh] md:h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="relative w-full h-[50vh] md:h-screen bg-gradient-to-r from-red-900 to-black flex items-center justify-center">
        <p className="text-white text-xl">No slides available</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="mt-18 relative w-full h-[50vh] md:h-screen overflow-hidden bg-black select-none"
      // Touch events for swipe
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const isNext = index === (currentIndex + 1) % slides.length;

          if (!isActive && !isNext) return null;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={isActive}
                quality={85}
                className="object-cover object-top"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNMQJFOWX2//2Q=="
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-end px-6 md:px-16 lg:px-24">
        <div
          className={`max-w-3xl text-right transition-all duration-700 ease-out ${
            showContent
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-10'
          }`}
        >
          {currentSlide.subtitle && (
            <div className="flex items-center justify-end gap-3 mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
              <p className="text-amber-300 text-sm md:text-lg font-bold uppercase tracking-widest">
                {currentSlide.subtitle}
              </p>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-amber-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
              {currentSlide.title}
            </span>
          </h1>

          {currentSlide.Button && (
            <a
              href="/Cloths"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-teal-500 to-blue-600 hover:from-amber-600 hover:via-teal-600 hover:to-blue-700 text-white px-8 py-5 rounded-full font-bold text-lg shadow-2xl hover:scale-110 transition-all duration-300"
            >
              <Play className="w-6 h-6" />
              {currentSlide.Button}
            </a>
          )}
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={prevSlide}
        className="hidden md:block absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-4 rounded-full transition-all hover:scale-110 z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:block absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-4 rounded-full transition-all hover:scale-110 z-10"
        aria-label="Next"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Dots - Hidden on mobile */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 gap-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? 'w-14 h-3 bg-gradient-to-r from-amber-500 to-blue-500'
                : 'w-3 h-3 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>

      {/* Counter - Hidden on mobile */}
      <div className="hidden md:block absolute top-8 right-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
        <span className="text-white font-bold">
          {currentIndex + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
}