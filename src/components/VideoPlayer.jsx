
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Cast } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VideoPlayer({ url, embedCode }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [devices, setDevices] = useState([]);
  const [castAvailable, setCastAvailable] = useState(false);
  const [castActive, setCastActive] = useState(false);

  useEffect(() => {
    // Check if Chromecast is available
    if (window.chrome && window.chrome.cast) {
      setCastAvailable(true);
      initializeCastApi();
    } else {
      // Fallback for demo - simulate device discovery
      setDevices([
        { id: '1', name: 'Smart TV da Sala' },
        { id: '2', name: 'Chromecast' },
        { id: '3', name: 'Roku' }
      ]);
      setCastAvailable(true);
    }
  }, []);

  // This would be replaced by real Chromecast API initialization in production
  const initializeCastApi = () => {
    // Simulating device discovery for demonstration
    setDevices([
      { id: '1', name: 'Smart TV da Sala' },
      { id: '2', name: 'Chromecast' },
      { id: '3', name: 'Roku' }
    ]);
  };

  const castToDevice = (deviceId) => {
    console.log(`Casting to device ${deviceId}`);
    // In a real implementation, this would connect to the selected device
    // and start streaming the current video content
    
    // For demo purposes, let's simulate a casting experience
    setCastActive(true);
    
    // Show a toast or notification that casting started (in a real app)
    alert(`Transmitindo para: ${devices.find(d => d.id === deviceId).name}`);
  };

  const stopCasting = () => {
    // In a real implementation, this would stop the casting session
    setCastActive(false);
  };

  useEffect(() => {
    if (!videoRef.current || embedCode) return;

    const video = videoRef.current;

    // Setup HLS if needed
    if (url && url.includes('.m3u8')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          // Autoplay quando o HLS estiver pronto
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.log("Autoplay prevented:", e));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(e => console.log("Autoplay prevented:", e));
        }
      };

      return () => {
        document.body.removeChild(script);
      };
    } else if (url) {
      video.src = url;
      video.play().catch(e => console.log("Autoplay prevented:", e));
    }

    const timeUpdate = () => setCurrentTime(video.currentTime);
    const durationChange = () => setDuration(video.duration);
    const playStateChange = () => setIsPlaying(!video.paused);

    video.addEventListener('timeupdate', timeUpdate);
    video.addEventListener('durationchange', durationChange);
    video.addEventListener('play', playStateChange);
    video.addEventListener('pause', playStateChange);

    // Autoplay setup
    video.autoplay = true;
    video.muted = true; // Necessário para autoplay em muitos navegadores
    setIsMuted(true);

    return () => {
      video.removeEventListener('timeupdate', timeUpdate);
      video.removeEventListener('durationchange', durationChange);
      video.removeEventListener('play', playStateChange);
      video.removeEventListener('pause', playStateChange);
    };
  }, [url, embedCode]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (value) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Render embed code if present
  if (embedCode) {
    return (
      <div 
        className="aspect-video bg-black rounded-lg overflow-hidden"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative aspect-video bg-black rounded-lg overflow-hidden group"
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        autoPlay
        muted // Necessário para autoplay em muitos navegadores
      />

      {castActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white">
          <Cast className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Transmitindo para outro dispositivo</h3>
          <p className="mb-6 text-gray-300">A mídia está sendo exibida em outro dispositivo</p>
          <Button
            onClick={stopCasting}
            variant="outline"
            className="text-white border-white hover:bg-white/10"
          >
            Parar transmissão
          </Button>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={handleTimeChange}
          className="mb-4"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <div className="flex items-center gap-2 min-w-[150px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {castAvailable && !castActive && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                        >
                          <Cast className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-sm font-semibold">
                          Transmitir para
                        </div>
                        {devices.map(device => (
                          <DropdownMenuItem 
                            key={device.id}
                            onClick={() => castToDevice(device.id)}
                          >
                            {device.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Transmitir para outro dispositivo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
