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
      videoRef.current.playbackRate = 0.75; // Slower playback for more dramatic effect
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
            opacity: 1,
            transition: 'opacity 0.5s ease-out'
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
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {sources.map((src, index) => (
          <source key={index} src={src} type="video/mp4" />
        ))}
      </video>

      {/* Overlay */}
      {gradient ? (
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
      ) : (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
};
