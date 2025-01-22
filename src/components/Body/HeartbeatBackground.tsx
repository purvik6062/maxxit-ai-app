import React from 'react';
import '../../app/css/heartbeat.css';

const HeartbeatBackground = () => {
  return (
    <div className="heartbeat-container">
      <div className="heartbeat-gradient" />
        <video
        className="absolute left-0 w-full h-full object-cover -z-10"
        src="/videos/heartbeat_vid.mp4"
        autoPlay
        loop
        muted
      />
    </div>
  );
};

export default HeartbeatBackground;