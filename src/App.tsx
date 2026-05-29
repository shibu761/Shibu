import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Play, 
  Pause, 
  Square, 
  Check, 
  HelpCircle, 
  Tv, 
  Film, 
  Volume2, 
  Info,
  AlertCircle
} from "lucide-react";

import { AspectRatio, DeviceType, VideoScene, VideoSettings, WebsiteTemplate } from "./types";
import { TEMPLATES } from "./data/templates";
import { getTimelineFrameState } from "./components/videoHelper";
import { DeviceFrame } from "./components/DeviceFrame";
import { ControlPanel } from "./components/ControlPanel";
import { StoryboardTimeline } from "./components/StoryboardTimeline";
import { VideoExporter } from "./components/VideoExporter";

const INITIAL_SCENES: VideoScene[] = [
  {
    id: "s1",
    title: "Nova Workspace Analytics",
    caption: "Streamline complete operational pipelines in one unified platform.",
    duration: 4,
    scrollPercentage: 0,
    focusMode: "center",
    narrationText: "Welcome to Nova Analytics. Empowering digital teams with central real-time operational insights."
  },
  {
    id: "s2",
    title: "Live Dashboard Hub",
    caption: "Track daily metrics, usage charts, and system resources.",
    duration: 5,
    scrollPercentage: 30,
    focusMode: "zoom-in",
    narrationText: "Explore our real-time analytics hub. Your entire team gets instant access to mission critical stats."
  },
  {
    id: "s3",
    title: "Highly Optimized Engines",
    caption: "Extreme speed profiles with native server routing clusters.",
    duration: 4,
    scrollPercentage: 60,
    focusMode: "pan-left",
    narrationText: "Engineered specifically for speed. Loaded with custom performance profiling modules."
  },
  {
    id: "s4",
    title: "Tailored Subscription Grid",
    caption: "Flexible cost metrics scale cleanly alongside your team.",
    duration: 4,
    scrollPercentage: 85,
    focusMode: "pan-right",
    narrationText: "Choose from our simple, cost-effective subscription plans built to expand directly with your scale."
  },
  {
    id: "s5",
    title: "Get Started Instantly",
    caption: "Create your workspace today – complete setups in seconds.",
    duration: 5,
    scrollPercentage: 100,
    focusMode: "tilt-3d",
    narrationText: "Set up your workspace today. Join thousands of high-velocity creators scaling worldwide."
  }
];

export default function App() {
  // Website asset settings
  const [imageUrl, setImageUrl] = useState<string | null>(TEMPLATES[0].imageUrl);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>("saas");
  const [siteName, setSiteName] = useState("Nova Analytics");
  const [tagline, setTagline] = useState("Workspace Analytics Platform");

  // Storyboard state
  const [scenes, setScenes] = useState<VideoScene[]>(INITIAL_SCENES);
  const [activeIndex, setActiveIndex] = useState(0);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Video render config settings
  const [settings, setSettings] = useState<VideoSettings>({
    aspectRatio: "16:9",
    deviceType: "laptop",
    primaryColor: "#6366f1",
    backgroundColor: "#09090b",
    textColor: "#f4f4f5",
    theme: "dark",
    showSubtitles: true,
    enableVoiceover: true,
    musicVolume: 50
  });

  // Loading/API transaction locks
  const [isCapturing, setIsCapturing] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [apiSuccessMsg, setApiSuccessMsg] = useState<string | null>(null);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  // Status prompt arrays for scrolling loading experience
  const [loadingText, setLoadingText] = useState("");
  const loadingPrompts = [
    "Analyzing visual DOM hierarchy...",
    "Estimating optimum highlight highlights...",
    "Scanning primary action buttons & hero copy...",
    "Generating high-retention narration scripts...",
    "Calculating camera panning offsets...",
    "Structuring responsive viewport timing matrices..."
  ];

  // Total calculated length
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const timelineProgress = totalDuration > 0 ? currentTime / totalDuration : 0;

  // Active Scene details
  const activeScene = scenes[activeIndex] || scenes[0];

  // Calculate current scroll/animations details for Device component
  const frameAnimationState = getTimelineFrameState(currentTime, scenes);

  // 1. Synchronize Playback Progress Time via requestAnimationFrame
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      if (isPlaying) {
        setCurrentTime(prev => {
          const next = prev + delta;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0; // jump back to start
          }
          return next;
        });
      }
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      lastTime = performance.now();
      frameId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, totalDuration]);

  // 2. Map Active Storyboard Index coordinating with Playback progress time
  useEffect(() => {
    let accum = 0;
    let foundIndex = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (currentTime >= accum && currentTime <= accum + scenes[i].duration) {
        foundIndex = i;
        break;
      }
      accum += scenes[i].duration;
    }
    if (foundIndex !== activeIndex) {
      setActiveIndex(foundIndex);
    }
  }, [currentTime, scenes, activeIndex]);

  // 3. Multimodality: Speech Narration Synthesizers triggered by scenes slide
  useEffect(() => {
    if (!settings.enableVoiceover || !isPlaying || scenes.length === 0) {
      window.speechSynthesis?.cancel();
      return;
    }

    const currentSceneToSpeak = scenes[activeIndex];
    if (currentSceneToSpeak && currentSceneToSpeak.narrationText) {
      window.speechSynthesis?.cancel(); // cancel playing stream

      const utterance = new SpeechSynthesisUtterance(currentSceneToSpeak.narrationText);
      utterance.rate = 1.05; // slightly faster for premium marketing profile
      utterance.volume = 0.95;

      const voices = window.speechSynthesis?.getVoices();
      const standardVoice = voices?.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || 
                            voices?.find(v => v.lang.startsWith("en-"));
      if (standardVoice) {
        utterance.voice = standardVoice;
      }

      window.speechSynthesis?.speak(utterance);
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [activeIndex, isPlaying, settings.enableVoiceover, scenes]);

  // Trigger loading message spinner loops during API await
  useEffect(() => {
    let intervalId: any;
    if (isGeneratingStoryboard || isCapturing) {
      let stepIdx = 0;
      setLoadingText(loadingPrompts[0]);
      intervalId = setInterval(() => {
        stepIdx = (stepIdx + 1) % loadingPrompts.length;
        setLoadingText(loadingPrompts[stepIdx]);
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isGeneratingStoryboard, isCapturing]);

  // Handle URL Capture screenshot
  const handleUrlCapture = async (url: string) => {
    setIsCapturing(true);
    setApiErrorMsg(null);
    setApiSuccessMsg(null);

    try {
      const response = await fetch(`/api/fetch-screenshot?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Unable to capture website layout.");
      }

      const data = await response.json();
      if (data.screenshotUrl) {
        setImageUrl(data.screenshotUrl);
        setActiveTemplateId(null); // customized
        setSiteName(url.replace(/https?:\/\/(www\.)?/, "").split(".")[0].toUpperCase());
        setApiSuccessMsg("Website screenshot captured and loaded successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setApiErrorMsg(err.message || "Failed to process screenshot capture. Please try uploading an image.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Upload Custom Image
  const handleImageUpload = (base64String: string) => {
    setImageUrl(base64String);
    setActiveTemplateId(null);
    setSiteName("Custom Upload");
    setApiSuccessMsg("Your custom screenshot has been loaded successfully!");
    setApiErrorMsg(null);
  };

  // Choose Premium preset Template
  const handleSelectTemplate = (template: WebsiteTemplate) => {
    setImageUrl(template.imageUrl);
    setActiveTemplateId(template.id);
    setSiteName(template.name);
    setTagline(template.description);
    setSettings(prev => ({
      ...prev,
      primaryColor: template.accentColor
    }));

    // Generate high quality default scenes custom matching selected template values
    const generatedScenesProps: VideoScene[] = INITIAL_SCENES.map((scene, idx) => {
      let tText = scene.title;
      let cText = scene.caption;
      let narr = scene.narrationText;

      if (template.id === "fintech") {
        if (idx === 0) { tText = "Introducing PayVolt Portal"; cText = "Secured, zero-friction global billing infrastructure."; narr = "Welcome to PayVolt. Explore how we represent simple card payments and transaction timelines."; }
        else if (idx === 1) { tText = "Virtual Cards Hub"; cText = "Generate unlimited card clusters instantly."; narr = "Slide down to check out our dashboard showing active virtual cards and balance stats."; }
        else if (idx === 2) { tText = "Instant Security Layers"; cText = "Fully guarded by modern biometric encryption standards."; narr = "PayVolt operates under the highest global encryption protocols ensuring secure transfers."; }
        else if (idx === 3) { tText = "Clear Fees Grid"; cText = "Flat percentages, transparent calculations."; narr = "Review our simple packages. Pay only for exactly what your team secures."; }
        else if (idx === 4) { tText = "Initiate Transfers Now"; cText = "Create your virtual account in minutes."; narr = "Sign up today to start transacting. Empowering teams with seamless money metrics."; }
      } else if (template.id === "portfolio") {
        if (idx === 0) { tText = "Kenzo Architects"; cText = "Honest structural design engineered beyond boundaries."; narr = "Step into a minimalist studio experience by Kenzo Architects. High contrast editorial layouts."; }
        else if (idx === 1) { tText = "Aesthetic Spatial Grids"; cText = "Where math meets modern lifestyle spatial flows."; narr = "Our central grid showcase. Elegant portfolios aligning geometry and light structures."; }
        else if (idx === 2) { tText = "Award Winning Legacy"; cText = "A decade creating pristine living concepts."; narr = "Built with detailed craftsmanship, reflecting dozens of premium structural designs."; }
        else if (idx === 3) { tText = "Pristine Materials Pricing"; cText = "Transparent consult models matching scales."; narr = "Learn about our customized design pricing models tailored to accommodate home scopes."; }
        else if (idx === 4) { tText = "Schedule a consultation"; cText = "Let's align values on your next development."; narr = "Get in touch today. Our team will coordinate your spatial plans seamlessly."; }
      } else if (template.id === "shop") {
        if (idx === 0) { tText = "Aura Premium Shop"; cText = "Designed for active lifestyles with organic fabrics."; narr = "Welcome to Aura lifestyle. Elegant apparel showcasing premium performance and organic materials."; }
        else if (idx === 1) { tText = "Summer Collections"; cText = "Comfort and design metrics that align perfectly."; narr = "Scroll to discover our featured catalog. Complete arrays with beautiful imagery."; }
        else if (idx === 2) { tText = "Pristine Fabric Ethics"; cText = "100% sourced under global eco friendly certificates."; narr = "Every apparel layout features premium, award-winning textiles optimized for comfort."; }
        else if (idx === 3) { tText = "Membership Bundles"; cText = "Unlock exclusive discounts and early arrivals."; narr = "Explore our loyalty rewards packages tailored around frequent apparel needs."; }
        else if (idx === 4) { tText = "Get 20% Off Today"; cText = "Start shopping and save on your first layout."; narr = "Join our mailing lists today and secure instant discounts on premium catalog setups."; }
      }

      return {
        ...scene,
        title: tText,
        caption: cText,
        narrationText: narr
      };
    });

    setScenes(generatedScenesProps);
    setCurrentTime(0);
    setIsPlaying(false);
    setApiSuccessMsg(`Loaded preset template: ${template.name}`);
    setApiErrorMsg(null);
  };

  // Run Gemini Storyboard AI director
  const handleGenerateAiStoryboard = async (url: string, description: string) => {
    setIsGeneratingStoryboard(true);
    setApiErrorMsg(null);
    setApiSuccessMsg(null);

    try {
      const payload = {
        url,
        description,
        theme: settings.theme
      };

      const response = await fetch("/api/generate-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Unable to contact AI director server.");
      }

      const data = await response.json();
      if (data.scenes && data.scenes.length > 0) {
        setScenes(data.scenes);
        if (data.siteName) setSiteName(data.siteName);
        if (data.tagline) setTagline(data.tagline);
        if (data.accentColor) {
          setSettings(prev => ({
            ...prev,
            primaryColor: data.accentColor
          }));
        }

        if (data.error) {
          // Fallback warning included
          setApiErrorMsg(data.error);
        } else {
          setApiSuccessMsg("Gemini-3.5-Flash successfully synthesized an custom cinematic storyboard script!");
        }
        
        setCurrentTime(0);
        setIsPlaying(false);
      }
    } catch (err: any) {
      console.error(err);
      setApiErrorMsg("AI Service is temporarily busy. Storyboard timeline loaded standard cinematic flow.");
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  // Handle Play Pause controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const stopPlay = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    window.speechSynthesis?.cancel();
  };

  const selectScene = (idx: number) => {
    let accum = 0;
    for (let i = 0; i < idx; i++) {
      accum += scenes[i].duration;
    }
    // Anchor current playback exactly at start of clicked scene
    setCurrentTime(accum + 0.05);
    setActiveIndex(idx);
  };

  // Determine container dimensions to fit preview display ratio
  const getAspectRatioClass = () => {
    switch (settings.aspectRatio) {
      case "9:16":
        return "max-w-sm aspect-[9/16] h-[580px]";
      case "1:1":
        return "max-w-xl aspect-square h-[480px]";
      default: // 16:9
        return "max-w-3xl aspect-[16/9] h-[390px]";
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* 1. Header Navigation */}
      <header className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 p-[1px] shadow-lg shadow-indigo-900/10 flex items-center justify-center">
              <div className="w-full h-full rounded-[11px] bg-zinc-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold font-display tracking-tight text-white flex items-center gap-1.5 leading-none">
                Website Image to Video Generator
              </h1>
              <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                CINEMATIC SCREENSHOTS DIRECTING MATRIX // v1.2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full text-indigo-300 font-medium tracking-wide uppercase">
              STUDIO EDITION
            </span>
          </div>
        </div>
      </header>

      {/* Main Container body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Secrets Guidance message overlay if missing API key */}
        {!process.env.GEMINI_API_KEY && (
          <div className="bg-gradient-to-r from-indigo-950/30 to-zinc-950 border border-indigo-900/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans shadow-lg animate-fade-in">
            <div className="flex gap-3 items-start">
              <Info className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
              <div>
                <div className="text-xs font-bold text-indigo-300">AI Narrative Mode Available!</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5 max-w-3xl">
                  Connect your personal Gemini API Key inside the **Settings &gt; Secrets** panel. The generator will automatically scan landing page structures, write personalized captions, and organize cinematic scrolls!
                </p>
              </div>
            </div>
            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded font-mono shrink-0 uppercase">
              DEMO ENGINE RUNNING
            </span>
          </div>
        )}

        {/* Global alert feedback cards */}
        {apiSuccessMsg && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-950 rounded-xl text-emerald-400 text-xs flex items-center gap-2 font-mono">
            <Check className="w-4 h-4 shrink-0" />
            <span>Success: {apiSuccessMsg}</span>
          </div>
        )}
        {apiErrorMsg && (
          <div className="p-3 bg-red-950/20 border border-red-950 rounded-xl text-red-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Notice: {apiErrorMsg}</span>
          </div>
        )}

        {/* 2. Top visual panels layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Config choices */}
          <div className="lg:col-span-5 h-[620px]">
            <ControlPanel
              settings={settings}
              setSettings={setSettings}
              onUrlCapture={handleUrlCapture}
              onImageUpload={handleImageUpload}
              onSelectTemplate={handleSelectTemplate}
              onGenerateAiStoryboard={handleGenerateAiStoryboard}
              isCapturing={isCapturing}
              isGeneratingStoryboard={isGeneratingStoryboard}
              activeTemplateId={activeTemplateId}
            />
          </div>

          {/* Right panel: Animated Video Preview Player */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-[620px] relative overflow-hidden group">
            
            {/* Visual tech grid overlays */}
            <div className="absolute inset-x-0 top-0 h-[100px] pointer-events-none bg-gradient-to-b from-indigo-500/[0.015] to-transparent"></div>

            {/* Top Play/Pause HUD header */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-red-500 animate-ping" : "bg-zinc-600"}`}></div>
                <span className="text-xs font-semibold text-zinc-100 uppercase tracking-widest">{isPlaying ? "NOW PREVIEWING" : "PREVIEW PAUSED"}</span>
              </div>

              {/* Layout ratios status badges */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] bg-zinc-950 px-2.5 py-1 border border-zinc-850 rounded font-mono text-zinc-400">
                  {settings.deviceType.toUpperCase()}
                </span>
                <span className="text-[10px] bg-zinc-950 px-2.5 py-1 border border-zinc-850 rounded font-mono text-zinc-400">
                  {settings.aspectRatio}
                </span>
              </div>
            </div>

            {/* Core Interactive Display screen device wrapper */}
            <div className="flex-1 flex items-center justify-center py-6 w-full relative z-0 overflow-hidden">
              
              {/* Spinning/Processing AI wait screens */}
              {(isCapturing || isGeneratingStoryboard) ? (
                <div className="absolute inset-0 bg-zinc-950/90 z-20 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-4 border-indigo-900/30 border-t-indigo-500 animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Gemini Director orchestrating script...</h5>
                    <p className="text-xs text-zinc-400 mt-2 font-mono h-6 overflow-hidden">
                      {loadingText}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Dynamic device sizing viewport wrapper frame */}
              <div className={`w-full flex items-center justify-center transition-all ${getAspectRatioClass()}`}>
                <DeviceFrame
                  imageUrl={imageUrl}
                  scrollPercent={frameAnimationState.currentScroll}
                  focusMode={frameAnimationState.activeScene.focusMode}
                  settings={settings}
                  siteName={siteName}
                />
              </div>
            </div>

            {/* Interactive play controls panel overlay */}
            <div className="bg-zinc-950/80 p-4 border border-zinc-850 rounded-xl space-y-3 shrink-0 z-10">
              
              {/* Title descriptions overlays shown on top of player */}
              {settings.showSubtitles && (
                <div className="border-l-2 border-indigo-500 bg-white/[0.01] p-2.5 rounded-r">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                    <span className="text-[9px] text-zinc-500 font-mono">SCENE {activeIndex + 1}</span>
                    {activeScene.title}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                    {activeScene.caption}
                  </p>
                </div>
              )}

              {/* Master playback and timing slider bar */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={togglePlay}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                      isPlaying 
                        ? "bg-amber-600/20 text-amber-400 hover:bg-amber-600/30" 
                        : "bg-white text-zinc-900 hover:bg-white/90"
                    }`}
                    title={isPlaying ? "Pause Preview" : "Play Preview Animation"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={stopPlay}
                    className="p-2.5 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-all"
                    title="Stop & Reset Timeline"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Scannable timeline progress state */}
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={totalDuration}
                    step="0.05"
                    value={currentTime}
                    onChange={(e) => {
                      setCurrentTime(Number(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[11px] font-mono text-zinc-400 tracking-wide select-none">
                    {currentTime.toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Horizontal track editor storyboard timeline block */}
        <StoryboardTimeline
          scenes={scenes}
          setScenes={setScenes}
          activeIndex={activeIndex}
          onSelectScene={selectScene}
          timelineProgress={timelineProgress}
          currentTime={currentTime}
        />

        {/* 4. Canvas Exporter panel */}
        <VideoExporter
          scenes={scenes}
          settings={settings}
          imageUrl={imageUrl}
        />

      </main>
    </div>
  );
}
