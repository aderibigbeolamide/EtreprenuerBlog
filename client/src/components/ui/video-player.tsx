import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  videoUrl: string;
  publicId?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  publicId,
  title,
  className = "",
  autoPlay = false,
  controls = true,
  muted = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number } | null>(null);

  // Extract public ID from Cloudinary URL if not provided
  const extractedPublicId = publicId || (() => {
    try {
      const match = videoUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.(mp4|webm|mov|avi)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    const updateResolution = () => {
      setVideoResolution({
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadedmetadata', updateResolution);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadedmetadata', updateResolution);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value) / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getQualityUrls = () => {
    if (!extractedPublicId) return [{ quality: 'Original', url: videoUrl }];
    
    const baseUrl = videoUrl.split('/upload/')[0] + '/upload/';
    const fileExtension = videoUrl.split('.').pop() || 'mp4';
    
    return [
      { quality: 'Auto', url: videoUrl },
      { quality: '1080p', url: `${baseUrl}q_auto:best,w_1920,h_1080,br_5m/${extractedPublicId}.${fileExtension}` },
      { quality: '720p', url: `${baseUrl}q_auto:best,w_1280,h_720,br_3m/${extractedPublicId}.${fileExtension}` },
      { quality: '480p', url: `${baseUrl}q_auto:best,w_854,h_480,br_1500k/${extractedPublicId}.${fileExtension}` },
      { quality: '360p', url: `${baseUrl}q_auto:best,w_640,h_360,br_800k/${extractedPublicId}.${fileExtension}` },
      { quality: '240p', url: `${baseUrl}q_auto:good,w_426,h_240,br_400k/${extractedPublicId}.${fileExtension}` },
      { quality: '144p', url: `${baseUrl}q_auto:good,w_256,h_144,br_200k/${extractedPublicId}.${fileExtension}` }
    ];
  };

  const changeQuality = (quality: string, url: string) => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;

    video.src = url;
    video.load();

    video.addEventListener('loadeddata', () => {
      video.currentTime = currentTime;
      if (wasPlaying) {
        video.play();
      }
    }, { once: true });

    setSelectedQuality(quality);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0 relative group">
        {title && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {title}
            </Badge>
          </div>
        )}

        {/* Quality Indicator */}
        {videoResolution && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-black/70 text-white text-xs">
              {videoResolution.height}p
            </Badge>
          </div>
        )}

        <div 
          className="relative"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="w-full h-auto min-h-[300px] max-h-[70vh] object-contain bg-black rounded-lg"
            autoPlay={autoPlay}
            muted={isMuted}
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
            Your browser does not support the video tag.
          </video>

          {controls && (
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Progress Bar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Quality Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 px-3 py-2 text-xs"
                      >
                        {selectedQuality}
                        <Settings className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      {getQualityUrls().map((quality) => (
                        <DropdownMenuItem
                          key={quality.quality}
                          onClick={() => changeQuality(quality.quality, quality.url)}
                          className={`text-sm ${selectedQuality === quality.quality ? 'bg-primary/10 font-medium' : ''}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{quality.quality}</span>
                            {selectedQuality === quality.quality && (
                              <span className="text-primary">✓</span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Download Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <a href={videoUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>

                  {/* Fullscreen Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}