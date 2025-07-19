import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, X, Download, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPreviewProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

export default function VideoPreview({ file, onRemove, className = "" }: VideoPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(() => URL.createObjectURL(file));
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    width: number;
    height: number;
  } | null>(null);

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoInfo({
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoResolutionBadge = () => {
    if (!videoInfo) return null;
    
    const { width, height } = videoInfo;
    if (width >= 1920 && height >= 1080) return "1080p+";
    if (width >= 1280 && height >= 720) return "720p";
    if (width >= 854 && height >= 480) return "480p";
    return "SD";
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0 relative">
        <div className="relative group">
          <video
            src={previewUrl}
            className="w-full h-48 object-cover"
            onLoadedMetadata={handleVideoLoad}
            muted
            preload="metadata"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>

          {/* Remove Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-80 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Video Info Badges */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {videoInfo && (
              <>
                <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                  {formatDuration(videoInfo.duration)}
                </Badge>
                <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                  {getVideoResolutionBadge()}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* File Details */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{formatFileSize(file.size)}</span>
                {videoInfo && (
                  <>
                    <span>•</span>
                    <span>{videoInfo.width}×{videoInfo.height}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    Compress for Web
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Optimize Quality
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Convert Format
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 w-8 p-0"
              >
                <a href={previewUrl} download={file.name}>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}