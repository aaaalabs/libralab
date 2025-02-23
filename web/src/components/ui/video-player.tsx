'use client';

import { useRef, useState, useEffect } from 'react';
import { IconVolume, IconVolumeOff } from '@tabler/icons-react';

interface VideoPlayerProps {
  src: string;
  aspectRatio?: string;
  className?: string;
}

export function VideoPlayer({ src, aspectRatio = "2.35:1", className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  useEffect(() => {
    // Start playing when the component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const aspectRatioStyle = {
    aspectRatio,
  };

  return (
    <div className={`relative group ${className}`} style={aspectRatioStyle}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-2xl"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Audio Control */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <IconVolumeOff className="w-5 h-5" />
        ) : (
          <IconVolume className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
