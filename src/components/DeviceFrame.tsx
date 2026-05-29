import React, { useRef, useEffect } from "react";
import { AnimationStyle, DeviceType, VideoSettings } from "../types";

interface DeviceFrameProps {
  imageUrl: string | null;
  scrollPercent: number;
  focusMode: AnimationStyle;
  settings: VideoSettings;
  siteName: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  imageUrl,
  scrollPercent,
  focusMode,
  settings,
  siteName
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize CSS Scroll matching active segment scroll percentage
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTo({
        top: (scrollPercent / 100) * maxScroll,
        behavior: "smooth"
      });
    }
  }, [scrollPercent]);

  // Determine Camera transform styling matching focus state
  const getCameraStyle = () => {
    switch (focusMode) {
      case "zoom-in":
        return "scale-110 duration-1000 ease-out";
      case "pan-left":
        return "translate-x-4 scale-105 duration-1000 ease-out";
      case "pan-right":
        return "-translate-x-4 scale-105 duration-1000 ease-out";
      case "tilt-3d":
        return "rotate-y-6 rotate-x-6 scale-105 duration-[1500m] ease-out perspective-1000";
      default:
        return "scale-100 duration-1000 ease-out";
    }
  };

  const isMobile = settings.deviceType === "mobile";
  const isLaptop = settings.deviceType === "laptop";

  if (isLaptop) {
    return (
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto my-4">
        {/* Screen Part */}
        <div className="relative w-full aspect-[16/10] bg-zinc-950 rounded-2xl p-3 border-4 border-zinc-800 shadow-2xl transition-all duration-700">
          {/* Webcam */}
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900"></div>
          </div>

          {/* Internal Display clipping */}
          <div className="w-full h-full rounded-lg overflow-hidden bg-zinc-900 relative">
            <div 
              ref={scrollContainerRef}
              className={`w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar transition-all ${getCameraStyle()}`}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Website Showcase" 
                  className="w-full h-auto object-cover select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-8 text-center text-zinc-400">
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-zinc-800 rounded w-3/4 mx-auto"></div>
                    <div className="h-64 bg-zinc-800 rounded w-full"></div>
                    <div className="h-6 bg-zinc-800 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Glass shine Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]"></div>
          </div>
        </div>

        {/* Laptop Stand hinge */}
        <div className="w-[10%] h-3 bg-zinc-800"></div>

        {/* Keyboard Base */}
        <div className="relative w-[114%] h-4 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-t-xl shadow-xl flex justify-center">
          {/* Front Notch */}
          <div className="absolute top-0 w-16 h-2 bg-zinc-950 rounded-b-md"></div>
          {/* Bevel accent */}
          <div className="w-full h-[2px] bg-zinc-600/30"></div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col items-center w-full max-w-sm mx-auto my-4">
        {/* Mobile Bezel casing */}
        <div className="relative w-full aspect-[9/19] bg-zinc-950 rounded-[48px] p-3 border-[6px] border-zinc-800 shadow-2xl transition-all duration-700 ring-2 ring-zinc-700/20">
          {/* Speaker ear piece */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-950 rounded-full flex items-center justify-center z-20">
            <div className="w-10 h-[3px] bg-zinc-700 rounded-full"></div>
          </div>

          {/* Internal Viewport display */}
          <div className="w-full h-full rounded-[40px] overflow-hidden bg-zinc-900 relative">
            <div 
              ref={scrollContainerRef}
              className={`w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar transition-all ${getCameraStyle()}`}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Mobile Showcase" 
                  className="w-full h-auto object-cover select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-8 text-center text-zinc-400 mt-16">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-zinc-800 rounded w-1/2 mx-auto"></div>
                    <div className="h-48 bg-zinc-800 rounded w-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Notch pill Overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-10 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-emerald-500/80"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
            </div>

            {/* Screen Reflect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Desktop display
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto my-4">
      {/* Browser Window frame */}
      <div className="relative w-full aspect-[16/9] bg-zinc-950 rounded-xl p-2 border border-zinc-800 shadow-2xl flex flex-col">
        {/* Browser Top header bar */}
        <div className="h-8 flex items-center px-3 bg-zinc-900/60 rounded-t-lg border-b border-zinc-800 gap-2 shrink-0">
          <div className="flex gap-1.5 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          {/* Address url */}
          <div className="flex-1 max-w-md mx-auto bg-zinc-950/80 rounded px-3 py-0.5 text-xs text-zinc-400 truncate font-mono select-none text-center">
            {siteName ? `https://demo.${siteName.toLowerCase().replace(/\s+/g, "")}.com` : "https://my-spectacular-domain.ai"}
          </div>
        </div>

        {/* Page Content area */}
        <div className="flex-1 w-full rounded-b-lg overflow-hidden bg-zinc-900 relative">
          <div 
            ref={scrollContainerRef}
            className={`w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar transition-all ${getCameraStyle()}`}
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Desktop browser" 
                className="w-full h-auto object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-8 text-center text-zinc-400 mt-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-zinc-800 rounded w-1/3 mx-auto"></div>
                  <div className="h-56 bg-zinc-800 rounded w-full"></div>
                </div>
              </div>
            )}
          </div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.04]"></div>
        </div>
      </div>
      {/* Monitor Base stem/plates */}
      <div className="w-16 h-8 bg-zinc-800 border-x border-zinc-700/50"></div>
      <div className="w-48 h-2.5 bg-zinc-900 rounded-full shadow border-t border-zinc-700/50"></div>
    </div>
  );
};
