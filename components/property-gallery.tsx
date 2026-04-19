"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PropertyGalleryImage } from "@/lib/properties";
import { cn } from "@/lib/utils";

type PropertyGalleryProps = {
  images: PropertyGalleryImage[];
  fallbackTitle: string;
  badge: string;
  status: string;
};

export function PropertyGallery({ images, fallbackTitle, badge, status }: PropertyGalleryProps) {
  const galleryImages = useMemo(
    () =>
      images.length > 0
        ? images
        : [
            {
              id: "placeholder",
              url: "/property-placeholder.jpg",
              alt: fallbackTitle,
              caption: null,
              isCover: true,
            },
          ],
    [fallbackTitle, images],
  );
  const [activeImageId, setActiveImageId] = useState(galleryImages[0]?.id ?? "placeholder");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(
    galleryImages.findIndex((image) => image.id === activeImageId),
    0,
  );
  const activeImage = galleryImages.find((image) => image.id === activeImageId) ?? galleryImages[0];
  const canCycle = galleryImages.length > 1;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!canCycle || isModalOpen) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveImageId((currentId) => {
        const currentIndex = galleryImages.findIndex((image) => image.id === currentId);
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % galleryImages.length;
        return galleryImages[nextIndex].id;
      });
    }, 4000);

    return () => window.clearInterval(timer);
  }, [canCycle, galleryImages, isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft" && canCycle) {
        goToImage("previous");
      } else if (e.key === "ArrowRight" && canCycle) {
        goToImage("next");
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, canCycle, activeIndex, galleryImages.length]);

  function selectImage(imageId: string) {
    setActiveImageId(imageId);
  }

  function goToImage(direction: "next" | "previous") {
    if (!canCycle) {
      return;
    }

    const nextIndex =
      direction === "next"
        ? (activeIndex + 1) % galleryImages.length
        : (activeIndex - 1 + galleryImages.length) % galleryImages.length;

    setActiveImageId(galleryImages[nextIndex].id);
    resetZoom();
  }

  function openModal() {
    resetZoom();
    setIsModalOpen(true);
  }

  function closeModal() {
    resetZoom();
    setIsModalOpen(false);
  }

  function resetZoom() {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }

  function handleZoomIn() {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  }

  function handleZoomOut() {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isDragging && zoomLevel > 1) {
      setHasDragged(true);
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleImageClick() {
    if (hasDragged) {
      setHasDragged(false);
      return;
    }

    if (zoomLevel === 1) {
      handleZoomIn();
    } else {
      resetZoom();
    }
  }

  function getTouchDistance(touches: React.TouchList) {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      });
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      const currentDistance = getTouchDistance(e.touches);
      const delta = currentDistance - lastTouchDistance;

      setZoomLevel((prev) => {
        const newZoom = Math.max(1, Math.min(4, prev + delta * 0.01));
        if (newZoom === 1) {
          setPanPosition({ x: 0, y: 0 });
        }
        return newZoom;
      });

      setLastTouchDistance(currentDistance);
    } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }

  function handleTouchEnd() {
    setLastTouchDistance(null);
    setIsDragging(false);
  }

  return (
    <div className="grid gap-4">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-deep shadow-2xl shadow-primary/5">
        <button
          aria-label="Abrir galeria"
          className="group block w-full cursor-pointer"
          onClick={openModal}
          type="button"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            {galleryImages.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.alt}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
                  image.id === activeImage.id ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </div>
        </button>
        <div className="absolute inset-0 border-[1px] border-white/10 rounded-[2.5rem] pointer-events-none" />

        <div className="absolute bottom-8 left-8 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white">
            {badge}
          </span>
          <span className="rounded-full bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur-md">
            {status}
          </span>
        </div>
      </div>

      {galleryImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {galleryImages.map((image, index) => {
            const isActive = image.id === activeImage.id;

            return (
              <button
                key={image.id}
                aria-label={`Ver imagen ${index + 1}`}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-2xl border bg-white transition",
                  isActive ? "border-primary shadow-lg shadow-primary/10" : "border-outline/10 opacity-75 hover:opacity-100",
                )}
                onClick={() => selectImage(image.id)}
                type="button"
              >
                <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                {image.isCover ? (
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-primary">
                    Portada
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {isModalOpen && isMounted ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            aria-label="Cerrar galeria"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
            type="button"
          />

          <section
            aria-label="Galeria de imagenes"
            aria-modal="true"
            className="relative z-10 grid h-[min(88vh,820px)] w-[min(96vw,1180px)] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] shadow-2xl"
            role="dialog"
          >
            <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/20 px-5 py-4">
              <div className="min-w-0">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">Galeria</p>
                <p className="m-0 truncate text-sm font-semibold text-white">
                  {activeIndex + 1} de {galleryImages.length} {zoomLevel > 1 ? `• ${Math.round(zoomLevel * 100)}%` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  aria-label="Alejar zoom"
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  type="button"
                >
                  −
                </button>
                <button
                  aria-label="Acercar zoom"
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 4}
                  type="button"
                >
                  +
                </button>
                {zoomLevel > 1 && (
                  <button
                    aria-label="Restablecer zoom"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    onClick={resetZoom}
                    type="button"
                  >
                    Ajustar
                  </button>
                )}
                <button
                  aria-label="Cerrar galeria"
                  className="rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
                  onClick={closeModal}
                  type="button"
                >
                  Cerrar
                </button>
              </div>
            </header>

            <div className="relative min-h-0 bg-black">
              {canCycle ? (
                <>
                  <button
                    aria-label="Imagen anterior"
                    className="absolute left-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 text-xl text-white transition hover:bg-white/20"
                    onClick={() => goToImage("previous")}
                    type="button"
                  >
                    {"<"}
                  </button>
                  <button
                    aria-label="Imagen siguiente"
                    className="absolute right-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 text-xl text-white transition hover:bg-white/20"
                    onClick={() => goToImage("next")}
                    type="button"
                  >
                    {">"}
                  </button>
                </>
              ) : null}

              <div
                className="flex h-full min-h-0 items-center justify-center p-4 overflow-hidden select-none"
                onWheel={handleWheel}
                ref={imageContainerRef}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center transition-transform duration-200",
                    zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
                  )}
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={handleImageClick}
                >
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt}
                    className="max-h-[62vh] max-w-[90vw] object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {galleryImages.length > 1 ? (
              <div className="flex gap-3 overflow-x-auto border-t border-white/10 bg-black/25 p-4">
                {galleryImages.map((image, index) => {
                  const isActive = image.id === activeImage.id;

                  return (
                    <button
                      key={`modal-${image.id}`}
                      aria-label={`Ver imagen ${index + 1}`}
                      className={cn(
                        "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition",
                        isActive ? "border-white opacity-100" : "border-white/10 opacity-60 hover:opacity-100",
                      )}
                      onClick={() => {
                        selectImage(image.id);
                        resetZoom();
                      }}
                      type="button"
                    >
                      <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
