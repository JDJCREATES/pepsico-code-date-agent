"use client";

import { useState } from "react";
import Image from "next/image";

 const CameraFeed = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
  return (
    <div className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded flex items-center justify-center">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt="Code date analysis"
            width={640}
            height={480}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <p className="text-zinc-500">No image selected</p>
        )}
      </div>
    </div>
  );
}

export default CameraFeed;