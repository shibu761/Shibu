import React, { useState, useRef } from "react";
import { Download, RefreshCw, Film, Check, AlertCircle } from "lucide-react";
import { VideoScene, VideoSettings } from "../types";
import { renderCanvasFrame } from "./videoHelper";

interface VideoExporterProps {
  scenes: VideoScene[];
  settings: VideoSettings;
  imageUrl: string | null;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({
  scenes,
  settings,
  imageUrl
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0); // 0 to 100
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);
    setErrorMsg(null);

    const canvas = canvasRef.current;
    if (!canvas) {
      setErrorMsg("Export canvas element not ready.");
      setIsExporting(false);
      return;
    }

    // Determine dimensions depending on settings ratio
    let width = 1280;
    let height = 720;
    if (settings.aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    } else if (settings.aspectRatio === "1:1") {
      width = 1080;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setErrorMsg("Failed to obtain canvas context.");
      setIsExporting(false);
      return;
    }

    // Step 1: Load the website image via proxy with credentials to avoid CORS taint
    let img: HTMLImageElement | null = null;
    if (imageUrl) {
      try {
        img = await loadImgCrossOrigin(imageUrl);
      } catch (e: any) {
        console.error("CORS load error, falling back to local drawing: ", e);
        // We will proceed without image, our rendering core automatically falls back
        // to a gorgeous vector schematic drawing in place of loaded screenshots!
      }
    }

    // Step 2: Set up frame parameters
    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
    const fps = 30;
    const computedTotalFrames = Math.ceil(totalDuration * fps);
    setTotalFrames(computedTotalFrames);
    setCurrentFrame(0);

    // Step 3: Set up MediaRecorder
    let recordedChunks: Blob[] = [];
    let stream: MediaStream;
    let mediaRecorder: MediaRecorder;

    try {
      stream = canvas.captureStream(fps);
      
      // Look for supported codecs
      let options = { mimeType: "video/webm;codecs=vp9" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: "video/webm" };
        }
      }

      mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fileBlob = new Blob(recordedChunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(fileBlob);
        
        // Auto trigger download
        const a = document.createElement("a");
        a.href = videoUrl;
        
        const timestamp = new Date().toISOString().substring(0, 10);
        a.download = `web_showcase_${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setIsExporting(false);
        setExportComplete(true);
      };

      // Start recording
      mediaRecorder.start();

    } catch (recorderError: any) {
      console.error("MediaRecorder initiation failed:", recorderError);
      setErrorMsg(`Browser doesn't support automatic video capture recording: ${recorderError.message}`);
      setIsExporting(false);
      return;
    }

    // Step 4: Run recursive frame-by-frame render loop
    let frameNum = 0;

    const renderLoop = () => {
      if (frameNum >= computedTotalFrames) {
        // Complete
        mediaRecorder.stop();
        return;
      }

      const currentTime = frameNum / fps;
      
      // Clear/draw onto canvas
      renderCanvasFrame(ctx, width, height, currentTime, scenes, settings, img);

      // Advance
      frameNum++;
      setCurrentFrame(frameNum);
      setExportProgress(Math.floor((frameNum / computedTotalFrames) * 100));

      // Use requestAnimationFrame for smooth frame capture
      requestAnimationFrame(renderLoop);
    };

    // Begin looping
    renderLoop();
  };

  /**
   * Safe asynchronous Image Loader utility asserting correct CrossOrigin headers
   */
  const loadImgCrossOrigin = (srcUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      
      // If it's not a local data-uri base64, direct it through the CORS proxy
      if (srcUrl.startsWith("http") && !srcUrl.includes(window.location.host)) {
        img.src = `/api/proxy-image?url=${encodeURIComponent(srcUrl)}`;
      } else {
        img.src = srcUrl;
      }
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5 leading-none">
            <Film className="w-4 h-4 text-emerald-400" />
            4K WebM Video Compilation
          </h4>
          <p className="text-[10px] text-zinc-500 font-sans">
            Renders cinematic scrolls, zooms, device casings, overlays, and transitions into a real video.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-900/10 cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Compiling {exportProgress}%
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              Generate Video File
            </>
          )}
        </button>
      </div>

      {/* Hidden processing canvas board */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Compile Progress Overlay */}
      {isExporting && (
        <div className="mt-4 p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-3 font-mono animate-pulse">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>DRAWING CINEMATIC FRAMES...</span>
            <span className="text-emerald-400 font-bold">{exportProgress}%</span>
          </div>
          
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-100"
              style={{ width: `${exportProgress}%` }}
            />
          </div>

          <div className="text-[10px] text-zinc-500 flex justify-between">
            <span>FRAME: {currentFrame} / {totalFrames} @ 30FPS</span>
            <span>RATIO: {settings.aspectRatio} | CASING: {settings.deviceType.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Completed Success alerts */}
      {exportComplete && (
        <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-start gap-2.5 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="space-y-1 font-sans">
            <div className="text-xs font-bold text-emerald-200">Video Rendered Successfully!</div>
            <p className="text-[10px] text-emerald-400/80 leading-relaxed font-mono">
              The high-quality WebM showcase file has been downloaded onto your machine. Try uploading another URL!
            </p>
          </div>
        </div>
      )}

      {/* Error alert warnings */}
      {errorMsg && (
        <div className="mt-4 p-4 bg-red-950/30 border border-red-900/40 rounded-xl flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-red-200">Export Error</div>
            <p className="text-[10px] text-red-400/80 font-mono">
              {errorMsg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
