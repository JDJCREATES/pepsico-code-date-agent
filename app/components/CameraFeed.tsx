"use client";

import { useState } from "react";
import Image from "next/image";

interface CameraFeedProps {
  currentImage?: string | null;
  bagCounter?: number;
}

 const CameraFeed = ({ currentImage, bagCounter = 0 }: CameraFeedProps) => {

  return (
    <div className="w-full rounded-b-sm border-2 border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Camera Feed - Line 3
        </h3>
        <div className="bg-yellow-300 text-white px-3 py-1 rounded text-sm font-mono">
          Bags: {bagCounter.toString().padStart(4, '0')}
        </div>
      </div>
      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded flex items-center justify-center relative overflow-hidden">
        {currentImage ? (
          <>
            <Image
              src={currentImage}
              alt="Code date analysis"
              width={640}
              height={480}
              className="w-full h-full object-cover rounded"
            />
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
              ⬤ LIVE
            </div>
          </>
        ) : (
          <p className="text-zinc-500">No image selected - Click Start to begin analysis</p>
        )}
      </div>
    </div>
  );
}

export default CameraFeed;