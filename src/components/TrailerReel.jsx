import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Volume2, VolumeX, Play, Pause, MapPin } from 'lucide-react';
import { usePrefersReducedMotion } from '../hooks/useCinematic';

/**
 * TrailerReel
 * Keeps the lab features of the original cinema hero in the new design:
 * HTML5 Video API (autoplay, loop, double-click play/pause), Fullscreen API
 * with a fullscreenchange listener, and the Geolocation API.
 * The video only plays while it is on screen, to keep the page light.
 */
export default function TrailerReel() {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Find cinemas near you');
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const userPaused = useRef(false);
  const reduced = usePrefersReducedMotion();

  // Play only while visible (unless the visitor paused it, or prefers reduced motion).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.defaultMuted = true;
    video.muted = true;
    if (typeof IntersectionObserver === 'undefined' || reduced) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPaused.current) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduced]);

  // Fullscreen API: keep state in sync with the browser (Esc key etc.)
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await frameRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('Detecting your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus(`Cinema location: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('Location permission denied. Showing global cinema mode.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  return (
    <section className="reel" id="reel" aria-label="Trailer reel">
      <div className="reel-copy">
        <h2 className="display-md">Tonight&rsquo;s reel</h2>
        <p>
          A trailer on the big screen. Double-click the picture to pause or resume, or go fullscreen for the full theater effect.
        </p>
        <button type="button" className="chip-btn" onClick={getLocation}>
          <MapPin size={15} />
          <span>{locationStatus}</span>
        </button>
      </div>

      <div className="reel-frame" ref={frameRef}>
        <video
          ref={videoRef}
          className="reel-video"
          loop
          muted
          playsInline
          preload="metadata"
          autoPlay={!reduced}
          onDoubleClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="MovieMind trailer"
        >
          <source src="/trailer.mp4" type="video/mp4" />
        </video>
        <div className="reel-controls">
          <button type="button" className="reel-btn" onClick={togglePlay} aria-label={playing ? 'Pause trailer' : 'Play trailer'}>
            {playing ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button type="button" className="reel-btn" onClick={toggleSound} aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}>
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button type="button" className="reel-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </div>
      </div>
    </section>
  );
}
