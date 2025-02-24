'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  sources: string[];
  poster?: string;
  overlayOpacity?: number;
  gradient?: boolean;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ 
  sources, 
  poster = '/images/Intro_sm.png',
  overlayOpacity = 0.4,
  gradient = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, []);

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Poster Image (shown until video loads) */}
      {!isVideoLoaded && (
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url(${poster})`,
            opacity: 1
          }} 
        />
      )}
      
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        onLoadedData={handleVideoLoaded}
        className="absolute inset-0 w-full h-full object-cover"
      >
        {sources.map((src, index) => (
          <source key={index} src={src} type="video/mp4" />
        ))}
      </video>

      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Optional gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      )}
    </div>
  );
};
