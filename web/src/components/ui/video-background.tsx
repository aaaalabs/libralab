import { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  sources: string[];
  overlayOpacity?: number;
  gradient?: boolean;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ 
  sources, 
  overlayOpacity = 0.4,
  gradient = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75; // Slower playback for more dramatic effect
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      >
        {sources.map((src, index) => (
          <source key={index} src={src} type="video/mp4" />
        ))}
      </video>
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
