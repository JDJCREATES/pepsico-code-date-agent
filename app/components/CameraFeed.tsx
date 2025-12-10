"use client";

import { useState } from "react";
import Image from "next/image";

interface CameraFeedProps {
  currentImage?: string | null;
}

 const CameraFeed = ({ currentImage }: CameraFeedProps) => {

  return (
    <div className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded flex items-center justify-center">
        {currentImage ? (
          <Image
            src={currentImage}
            alt="Code date analysis"
            width={640}
            height={480}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <p className="text-zinc-500">No image selected - Click Start to begin analysis</p>
        )}
      </div>
    </div>
  );
}

export default CameraFeed;