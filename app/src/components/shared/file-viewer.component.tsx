import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { type Media } from '@rest/models';
import {
  AlertCircle,
  Download,
  ExternalLink,
  Eye,
  File,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface FileViewerProps {
  file: Media;
  trigger?: React.ReactNode;
  showPreview?: boolean;
  className?: string;
}

export function FileViewer({ file, trigger, showPreview = true, className = '' }: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [pdfLoadTimeout, setPdfLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pdfBlocked, setPdfBlocked] = useState(false);

  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const isSmallScreen = isMobile || isTablet;

  // Check for tablet size
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };

    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  const isImage = file.mime_type.startsWith('image/');
  const isPdf = file.mime_type === 'application/pdf';
  const isDocument = file.mime_type.includes('document') || file.mime_type.includes('text/');
  const isVideo = file.mime_type.startsWith('video/');
  const isAudio = file.mime_type.startsWith('audio/');

  // Check if file is large (over 10MB)
  const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB
  const isVeryLargeFile = file.size > LARGE_FILE_THRESHOLD;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4" />;
    if (isPdf) return <FileText className="h-4 w-4" />;
    if (isDocument) return <FileText className="h-4 w-4" />;
    if (isVideo) return <File className="h-4 w-4" />;
    if (isAudio) return <File className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = () => {
    if (isImage) return 'bg-green-100 text-green-800 border-green-200';
    if (isPdf) return 'bg-red-100 text-red-800 border-red-200';
    if (isDocument) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (isVideo) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (isAudio) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDownload = useCallback(() => {
    setIsLoading(true);
    const link = document.createElement('a');
    link.href = file.original_url || file.url;
    link.download = file.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsLoading(false), 1000);
  }, [file.original_url, file.url, file.file_name]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Calculate optimal dialog dimensions based on content and screen size
  const getDialogDimensions = useCallback(() => {
    if (isFullscreen) {
      return {
        width: '98vw',
        height: '98vh',
        maxWidth: 'none',
        maxHeight: 'none',
      };
    }

    if (isMobile) {
      return {
        width: '98vw',
        height: '95vh',
        maxWidth: 'none',
        maxHeight: 'none',
      };
    }

    if (isTablet) {
      return {
        width: '95vw',
        height: '92vh',
        maxWidth: '1400px',
        maxHeight: '92vh',
      };
    }

    // Desktop - increased heights for better content visibility
    const baseHeight = isImage ? '90vh' : isPdf ? '92vh' : '85vh';
    const baseWidth = isImage ? '95vw' : isPdf ? '98vw' : '90vw';

    return {
      width: baseWidth,
      height: baseHeight,
      maxWidth: isImage ? '1600px' : isPdf ? '1800px' : '1400px',
      maxHeight: baseHeight,
    };
  }, [isFullscreen, isMobile, isTablet, isImage, isPdf]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setHasError(false);
      setIsFullscreen(false);
      setImageLoaded(false);
      setImageError(false);
      setIsLargeFile(isVeryLargeFile);
      setPdfBlocked(false);

      // Clear any existing timeout
      if (pdfLoadTimeout) {
        clearTimeout(pdfLoadTimeout);
        setPdfLoadTimeout(null);
      }
    } else {
      // Clean up timeout when dialog closes
      if (pdfLoadTimeout) {
        clearTimeout(pdfLoadTimeout);
        setPdfLoadTimeout(null);
      }
    }
  }, [isOpen, isVeryLargeFile, pdfLoadTimeout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case '+':
        case '=':
          if (isImage) handleZoomIn();
          break;
        case '-':
          if (isImage) handleZoomOut();
          break;
        case 'r':
        case 'R':
          if (isImage) handleRotate();
          break;
        case '0':
          if (isImage) resetView();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'd':
        case 'D':
          handleDownload();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isImage, handleDownload, toggleFullscreen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pdfLoadTimeout) {
        clearTimeout(pdfLoadTimeout);
      }
    };
  }, [pdfLoadTimeout]);

  const defaultTrigger = (
    <Card
      className={`cursor-pointer hover:shadow-2xl hover:scale-[1.03] transition-all duration-500 border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-md group hover:border-primary/30 hover:shadow-primary/10 ${className}`}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-400/25 via-blue-500/25 to-purple-600/25 group-hover:from-cyan-400/35 group-hover:via-blue-500/35 group-hover:to-purple-600/35 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-110">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                {file.file_name}
              </p>
              <Badge
                variant="outline"
                className={`text-xs font-medium ${getFileTypeColor()} shadow-md group-hover:shadow-lg transition-all duration-300`}
              >
                {file.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
              </Badge>
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5" />
                <span className="font-medium">{formatFileSize(file.size)}</span>
              </div>
              {showPreview && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-medium">Preview</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {showPreview && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-primary/15 hover:scale-110 transition-all duration-300 rounded-lg"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-primary/15 hover:scale-110 transition-all duration-300 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const dialogDimensions = getDialogDimensions();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent
        className="overflow-y-auto transition-all duration-500 ease-in-out bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-border/50 shadow-2xl"
        style={{
          width: dialogDimensions.width,
          height: dialogDimensions.height,
          maxWidth: dialogDimensions.maxWidth,
          maxHeight: dialogDimensions.maxHeight,
        }}
        aria-describedby="file-viewer-description"
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 -mx-6 px-6 py-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-400/25 via-blue-500/25 to-purple-600/25 shadow-md">
              {getFileIcon()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-lg font-bold text-foreground">{file.file_name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {formatFileSize(file.size)} • {file.mime_type}
              </span>
            </div>
          </DialogTitle>
          <div id="file-viewer-description" className="sr-only">
            File viewer for {file.file_name} ({formatFileSize(file.size)}, {file.mime_type})
          </div>
          <div className={`flex items-center gap-2 ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
            {!isMobile && (
              <Button
                variant="outline"
                size={isSmallScreen ? 'sm' : 'sm'}
                onClick={toggleFullscreen}
                className="hover:bg-primary/15 hover:scale-105 transition-all duration-300 border-border/60 shadow-sm hover:shadow-md"
              >
                {isFullscreen ? (
                  <Minimize2 className={`h-4 w-4 ${isSmallScreen ? '' : 'mr-2'}`} />
                ) : (
                  <Maximize2 className={`h-4 w-4 ${isSmallScreen ? '' : 'mr-2'}`} />
                )}
                {!isSmallScreen && (isFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
              </Button>
            )}
            <Button
              variant="outline"
              size={isSmallScreen ? 'sm' : 'sm'}
              onClick={handleDownload}
              disabled={isLoading}
              className="hover:bg-primary/15 hover:scale-105 transition-all duration-300 border-border/60 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <Loader2 className={`h-4 w-4 ${isSmallScreen ? '' : 'mr-2'} animate-spin`} />
              ) : (
                <Download className={`h-4 w-4 ${isSmallScreen ? '' : 'mr-2'}`} />
              )}
              {!isSmallScreen && 'Download'}
            </Button>
            <Button
              variant="outline"
              size={isSmallScreen ? 'sm' : 'sm'}
              onClick={() => window.open(file.original_url || file.url, '_blank')}
              className="hover:bg-primary/15 hover:scale-105 transition-all duration-300 border-border/60 shadow-sm hover:shadow-md"
            >
              <ExternalLink className={`h-4 w-4 ${isSmallScreen ? '' : 'mr-2'}`} />
              {!isSmallScreen && 'Open'}
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-hidden flex flex-col min-h-[800px]">
          {/* Large File Warning */}
          {isLargeFile && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Large file detected ({formatFileSize(file.size)})
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Loading may take longer. Consider downloading for better performance.
              </p>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4 p-6">
              <div className="p-6 rounded-full bg-red-100 shadow-lg">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-red-600">Failed to load file</p>
                <p className="text-sm text-muted-foreground">
                  There was an error loading the file preview
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  onClick={() => setHasError(false)}
                  className="hover:scale-105 transition-transform"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="hover:scale-105 transition-transform"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : isImage ? (
            <div className="flex flex-col h-full space-y-3">
              {/* Image Controls */}
              <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 rounded-xl shadow-lg border border-border/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="hover:bg-primary/15 hover:scale-105 transition-all duration-300 border-border/60 shadow-sm hover:shadow-md"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold min-w-[70px] text-center px-3 py-2 bg-gradient-to-r from-background to-background/80 rounded-lg border border-border/50 shadow-sm">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="hover:bg-primary/15 hover:scale-105 transition-all duration-300 border-border/60 shadow-sm hover:shadow-md"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8 bg-border/60" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="hover:bg-primary/15 hover:scale-105 transition-all duration-300 border-border/60 shadow-sm hover:shadow-md"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetView}
                  className="hover:bg-primary/15 hover:scale-105 transition-all duration-300 border-border/60 shadow-sm hover:shadow-md font-medium"
                >
                  Reset
                </Button>
              </div>

              {/* Image Display */}
              <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 rounded-xl overflow-hidden shadow-2xl border border-border/20 min-h-0 relative">
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 p-6 bg-background/80 rounded-xl shadow-lg border border-border/30">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        {isLargeFile ? 'Loading large image...' : 'Loading image...'}
                      </p>
                    </div>
                  </div>
                )}
                {imageError ? (
                  <div className="flex flex-col items-center gap-4 p-8 bg-background/80 rounded-xl shadow-lg border border-border/30">
                    <div className="p-4 rounded-full bg-red-100 shadow-lg">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-semibold text-red-600">Failed to load image</p>
                      {isLargeFile && (
                        <p className="text-xs text-muted-foreground">
                          Large images may fail to load in the browser
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageError(false);
                        setImageLoaded(false);
                      }}
                      className="hover:bg-primary/15 hover:scale-105 transition-all duration-300"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <img
                    src={file.original_url}
                    alt={file.file_name}
                    className={`max-w-full max-h-full object-contain transition-all duration-300 ease-in-out ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      maxWidth: isLargeFile ? '100%' : 'none',
                      maxHeight: isLargeFile ? '100%' : 'none',
                    }}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(false);
                      setHasError(true);
                    }}
                    onLoad={() => {
                      setImageLoaded(true);
                      setImageError(false);
                      setHasError(false);
                    }}
                    loading={isLargeFile ? 'lazy' : 'eager'}
                  />
                )}
              </div>
            </div>
          ) : isPdf ? (
            <div className="w-full flex-1 flex flex-col">
              {isLargeFile && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                  <p className="text-xs text-blue-700">
                    Large PDF detected. If loading fails, try downloading or opening in a new tab.
                  </p>
                </div>
              )}
              <div className="flex-1 w-full rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 border border-border/20 relative">
                {!imageLoaded && !hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-4 p-6 bg-background/80 rounded-xl shadow-lg border border-border/30">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        {isLargeFile ? 'Loading large PDF...' : 'Loading PDF...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* PDF iframe with better browser compatibility */}
                <iframe
                  src={`${file.original_url || file.url}#toolbar=1&navpanes=1&scrollbar=1&zoom=80`}
                  className="w-full h-full border-0"
                  title={file.file_name}
                  onError={() => {
                    setHasError(true);
                    setPdfBlocked(true);
                    if (pdfLoadTimeout) {
                      clearTimeout(pdfLoadTimeout);
                      setPdfLoadTimeout(null);
                    }
                  }}
                  onLoad={() => {
                    setHasError(false);
                    setPdfBlocked(false);
                    setImageLoaded(true);
                    if (pdfLoadTimeout) {
                      clearTimeout(pdfLoadTimeout);
                      setPdfLoadTimeout(null);
                    }
                  }}
                  onLoadStart={() => {
                    // Set a timeout to detect if browser blocks the iframe
                    const timeout = setTimeout(() => {
                      if (!imageLoaded) {
                        setHasError(true);
                        setPdfBlocked(true);
                      }
                    }, 3000); // Reduced to 3 second timeout for faster detection
                    setPdfLoadTimeout(timeout);
                  }}
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Fallback for blocked iframes (like in Brave) */}
                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 p-6">
                    <div className="text-center space-y-4 max-w-md">
                      <div className="p-4 rounded-full bg-amber-100">
                        <AlertCircle className="h-12 w-12 text-amber-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-amber-600">
                          {pdfBlocked ? 'PDF Preview Blocked' : 'PDF Preview Failed'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {pdfBlocked
                            ? 'Your browser is blocking the PDF preview for security reasons. This is common with browsers like Brave, Firefox, or when using strict privacy settings.'
                            : 'Unable to load the PDF preview. This could be due to network issues, file corruption, or browser compatibility problems.'}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button
                            onClick={() => window.open(file.original_url || file.url, '_blank')}
                            className="hover:scale-105 transition-transform flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in New Tab
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleDownload}
                            disabled={isLoading}
                            className="hover:scale-105 transition-transform flex-1"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            Download
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setHasError(false);
                            setPdfBlocked(false);
                            setImageLoaded(false);
                            // Force reload by changing the iframe src slightly
                            const iframe = document.querySelector(
                              'iframe[title="' + file.file_name + '"]'
                            ) as HTMLIFrameElement;
                            if (iframe) {
                              const baseUrl = file.original_url || file.url;
                              const currentSrc = `${baseUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=80`;
                              iframe.src = '';
                              setTimeout(() => {
                                iframe.src = currentSrc;
                              }, 100);
                            }
                          }}
                          className="hover:scale-105 transition-transform text-xs"
                        >
                          Try Again
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border">
                        <p className="font-medium mb-1">Alternative solutions:</p>
                        <ul className="text-left space-y-1">
                          <li>• Disable browser shields for this site</li>
                          <li>• Use a different browser</li>
                          <li>• Download and open with a PDF reader</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isVideo ? (
            <div className="flex-1 flex flex-col min-h-0">
              {isLargeFile && (
                <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-center">
                  <p className="text-xs text-purple-700">
                    Large video detected. Loading may take time. Consider downloading for better
                    performance.
                  </p>
                </div>
              )}
              <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 rounded-xl overflow-hidden shadow-2xl border border-border/20 relative">
                {!imageLoaded && !hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isLargeFile ? 'Loading large video...' : 'Loading video...'}
                      </p>
                    </div>
                  </div>
                )}
                <video
                  src={file.original_url || file.url}
                  controls
                  preload={isLargeFile ? 'metadata' : 'auto'}
                  className="max-w-full max-h-full"
                  onError={() => setHasError(true)}
                  onLoadStart={() => setHasError(false)}
                  onLoadedData={() => {
                    setImageLoaded(true);
                    setHasError(false);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : isAudio ? (
            <div className="flex-1 flex flex-col min-h-0">
              {isLargeFile && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-center">
                  <p className="text-xs text-orange-700">
                    Large audio file detected. Loading may take time.
                  </p>
                </div>
              )}
              <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 rounded-xl overflow-hidden shadow-2xl border border-border/20 p-8 relative">
                {!imageLoaded && !hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isLargeFile ? 'Loading large audio...' : 'Loading audio...'}
                      </p>
                    </div>
                  </div>
                )}
                <audio
                  src={file.original_url || file.url}
                  controls
                  preload={isLargeFile ? 'metadata' : 'auto'}
                  className="w-full max-w-md"
                  onError={() => setHasError(true)}
                  onLoadStart={() => setHasError(false)}
                  onLoadedData={() => {
                    setImageLoaded(true);
                    setHasError(false);
                  }}
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8">
              <div className="p-8 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 shadow-lg">
                {getFileIcon()}
              </div>
              <div className="text-center space-y-3">
                <p className="text-xl font-semibold">{file.file_name}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    {formatFileSize(file.size)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {file.mime_type}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(file.original_url || file.url, '_blank')}
                  className="hover:scale-105 transition-transform"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* File Info Footer */}
        <div className="space-y-6 pt-6 border-t border-border/50 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 -mx-6 px-6 pb-6">
          <div className={`grid gap-4 text-sm ${isSmallScreen ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-background/80 to-background/60 shadow-sm border border-border/30">
              <div className="p-2 rounded-lg bg-primary/10">
                <HardDrive className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">File Size</span>
                <span className="font-bold text-foreground">{formatFileSize(file.size)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-background/80 to-background/60 shadow-sm border border-border/30">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">File Type</span>
                <span className="font-bold text-foreground">{file.mime_type}</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          {!isMobile && (
            <div className="text-xs text-muted-foreground bg-gradient-to-r from-background/80 to-background/60 rounded-xl p-4 border border-border/30 shadow-sm">
              <div className="font-bold mb-3 text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Keyboard Shortcuts
              </div>
              <div className={`grid gap-3 ${isSmallScreen ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 text-xs bg-gradient-to-r from-muted to-muted/80 rounded-lg border border-border/50 font-mono font-bold">
                    ESC
                  </kbd>
                  <span className="font-medium">Close</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 text-xs bg-gradient-to-r from-muted to-muted/80 rounded-lg border border-border/50 font-mono font-bold">
                    F
                  </kbd>
                  <span className="font-medium">Fullscreen</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 text-xs bg-gradient-to-r from-muted to-muted/80 rounded-lg border border-border/50 font-mono font-bold">
                    D
                  </kbd>
                  <span className="font-medium">Download</span>
                </div>
                {isImage && (
                  <>
                    <div className="flex items-center gap-3">
                      <kbd className="px-2 py-1 text-xs bg-gradient-to-r from-muted to-muted/80 rounded-lg border border-border/50 font-mono font-bold">
                        +/-
                      </kbd>
                      <span className="font-medium">Zoom</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <kbd className="px-2 py-1 text-xs bg-gradient-to-r from-muted to-muted/80 rounded-lg border border-border/50 font-mono font-bold">
                        R
                      </kbd>
                      <span className="font-medium">Rotate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <kbd className="px-2 py-1 text-xs bg-gradient-to-r from-muted to-muted/80 rounded-lg border border-border/50 font-mono font-bold">
                        0
                      </kbd>
                      <span className="font-medium">Reset</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
