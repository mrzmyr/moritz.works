"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Video = ({
  src,
  ...props
}: { src: string } & React.VideoHTMLAttributes<HTMLVideoElement>) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const ref = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (ref.current) {
      setIsPlaying((prev) => !prev);
      if (ref.current.paused) {
        ref.current.play();
      } else {
        ref.current.pause();
      }
    }
  };

  useEffect(() => {
    if (ref.current) {
      setIsPlaying(!ref.current.paused);
    }
  }, []);

  return (
    <div
      className="relative w-full h-full group cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        className="w-full h-full object-cover"
        {...props}
      />
      <button
        type="button"
        className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 h-15 w-15 bg-black/80 rounded-full flex items-center justify-center cursor-pointer group-hover:opacity-100 ease-out opacity-0 transition-opacity duration-300"
      >
        {isPlaying ? (
          <PauseIcon className="w-6 h-6 text-white fill-white" />
        ) : (
          <PlayIcon className="w-6 h-6 text-white fill-white" />
        )}
      </button>
    </div>
  );
};
