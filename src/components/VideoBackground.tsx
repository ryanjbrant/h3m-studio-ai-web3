import React from 'react';

interface VideoBackgroundProps {
  className?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute w-full h-full object-cover"
        style={{ filter: 'brightness(0.5)' }}
        preload="auto"
      >
        <source 
          src="https://h3mstudio-web.s3.us-west-1.amazonaws.com/video/motion-header.webm" 
          type="video/webm"
        />
        <source 
          src="https://h3mstudio-web.s3.us-west-1.amazonaws.com/video/motion-header.mp4" 
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
    </div>
  );
};