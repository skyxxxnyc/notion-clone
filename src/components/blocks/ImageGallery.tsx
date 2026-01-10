"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageItem {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  layout?: "grid" | "masonry" | "carousel";
  columns?: 2 | 3 | 4;
  onRemoveImage?: (id: string) => void;
  editable?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  layout = "grid",
  columns = 3,
  onRemoveImage,
  editable = false,
  className,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image:", err);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {/* Grid Layout */}
        {layout === "grid" && (
          <div
            className={cn(
              "grid gap-2",
              columns === 2 && "grid-cols-2",
              columns === 3 && "grid-cols-3",
              columns === 4 && "grid-cols-4"
            )}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
              >
                <img
                  src={image.url}
                  alt={image.alt || image.caption || `Image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => openLightbox(index)}
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="iconSm"
                    onClick={() => openLightbox(index)}
                    className="bg-white/90 hover:bg-white text-neutral-900"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {editable && onRemoveImage && (
                    <Button
                      variant="secondary"
                      size="iconSm"
                      onClick={() => onRemoveImage(image.id)}
                      className="bg-white/90 hover:bg-white text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Caption */}
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {layout === "carousel" && (
          <div className="relative">
            <div className="overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div key={image.id} className="min-w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                    <img
                      src={image.url}
                      alt={image.alt || image.caption || `Image ${index + 1}`}
                      className="max-h-96 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-900"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-900"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Indicator Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || images[currentIndex].caption || "Image"}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {/* Caption */}
            {images[currentIndex].caption && (
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white text-sm bg-black/60 inline-block px-4 py-2 rounded">
                  {images[currentIndex].caption}
                </p>
              </div>
            )}

            {/* Close Button */}
            <Button
              variant="secondary"
              size="icon"
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-neutral-900"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Download Button */}
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                downloadImage(
                  images[currentIndex].url,
                  `image-${currentIndex + 1}`
                )
              }
              className="absolute top-4 right-16 bg-white/90 hover:bg-white text-neutral-900"
            >
              <Download className="h-5 w-5" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-900"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-900"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Counter */}
                <div className="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
