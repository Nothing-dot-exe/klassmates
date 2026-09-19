'use client';

import React, { useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Send, Image as ImageIcon, Move, RotateCcw, GripHorizontal } from 'lucide-react';
import { useDraggable } from '@/hooks/useDraggable';
import { useCameraStream } from './useCameraStream';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { position, isDragging, onStartDragMouse, onStartDragTouch } = useDraggable(isOpen);
  const {
    videoRef,
    canvasRef,
    capturedImage,
    setCapturedImage,
    cameraError,
    isInitializing,
    startCamera,
    stopCamera,
    takeSnapshot,
  } = useCameraStream();

  useEffect(() => {
    if (isOpen) {
      if (!capturedImage) {
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage, startCamera, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!rawUrl) return;

        // Resize and compress uploaded images to max 1024px dimension at 0.75 quality
        const img = new Image();
        img.onload = () => {
          const maxDim = 1024;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setCapturedImage(compressed);
          } else {
            setCapturedImage(rawUrl);
          }
          stopCamera();
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  const isMoved = position.x !== 0 || position.y !== 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div
        onClick={handleClose}
        className={`fixed inset-0 pointer-events-auto transition-colors duration-200 ${
          isMoved ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-black/70 backdrop-blur-sm'
        }`}
      />

      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isDragging ? 'none' : 'transform 0.08s ease-out, box-shadow 0.2s ease',
        }}
        className={`relative bg-white border rounded-3xl w-full max-w-lg overflow-hidden flex flex-col pointer-events-auto select-none ${
          isDragging
            ? 'border-zinc-950 ring-2 ring-zinc-950/20 shadow-2xl cursor-grabbing'
            : 'border-zinc-200 shadow-2xl shadow-zinc-900/20'
        }`}
      >
        {/* Draggable Header */}
        <div
          onMouseDown={onStartDragMouse}
          onTouchStart={onStartDragTouch}
          className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/80 cursor-grab active:cursor-grabbing group transition-colors"
          title="Drag this header to move the window anywhere"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-200/70 text-zinc-900">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-950">Classroom Snap</h3>
                <span className="flex items-center gap-1 text-[10px] text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full font-medium">
                  <Move className="w-2.5 h-2.5 text-zinc-700" />
                  Drag to move
                </span>
              </div>
              <p className="text-xs text-zinc-500">Take a photo of notes, whiteboard, or study setup</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-200 transition cursor-pointer"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="p-6 space-y-4">
          <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-300 flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured snapshot" className="w-full h-full object-cover" />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
                />
                {isInitializing && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/80 text-zinc-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-white" />
                    <span>Connecting camera...</span>
                  </div>
                )}
                {cameraError && (
                  <div className="p-6 text-center space-y-3">
                    <div className="p-3 rounded-full bg-zinc-800 text-zinc-400 inline-block">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">{cameraError}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload Photo from Device
                    </button>
                  </div>
                )}
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Choose Image</span>
            </button>

            <div className="flex items-center gap-2">
              {capturedImage ? (
                <>
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retake
                  </button>
                  <button
                    onClick={handleSend}
                    className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send to Class
                  </button>
                </>
              ) : (
                <button
                  onClick={takeSnapshot}
                  disabled={Boolean(cameraError) || isInitializing}
                  className="px-6 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Snap Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Draggable bottom grip bar */}
        <div
          onMouseDown={onStartDragMouse}
          onTouchStart={onStartDragTouch}
          className="h-3 bg-zinc-100 border-t border-zinc-200 flex items-center justify-center cursor-grab active:cursor-grabbing"
          title="Drag window"
        >
          <GripHorizontal className="w-6 h-2.5 text-zinc-400 hover:text-zinc-600 transition" />
        </div>
      </div>
    </div>
  );
};
