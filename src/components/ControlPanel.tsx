import React, { useState } from "react";
import { 
  Globe, 
  UploadCloud, 
  Sparkles, 
  Laptop, 
  Smartphone, 
  Monitor, 
  Tv, 
  Layers, 
  Music, 
  Sliders,
  Check,
  Type as FontIcon,
  RefreshCw
} from "lucide-react";
import { AspectRatio, DeviceType, VideoSettings, WebsiteTemplate } from "../types";
import { TEMPLATES } from "../data/templates";

interface ControlPanelProps {
  settings: VideoSettings;
  setSettings: React.Dispatch<React.SetStateAction<VideoSettings>>;
  onUrlCapture: (url: string) => Promise<void>;
  onImageUpload: (base64: string) => void;
  onSelectTemplate: (template: WebsiteTemplate) => void;
  onGenerateAiStoryboard: (url: string, description: string) => Promise<void>;
  isCapturing: boolean;
  isGeneratingStoryboard: boolean;
  activeTemplateId: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  setSettings,
  onUrlCapture,
  onImageUpload,
  onSelectTemplate,
  onGenerateAiStoryboard,
  isCapturing,
  isGeneratingStoryboard,
  activeTemplateId
}) => {
  const [activeTab, setActiveTab] = useState<"source" | "settings" | "ai">("source");
  const [urlInput, setUrlInput] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // File Upload Handlers (Supports Drag & Drop)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPEG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageUpload(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    let formattedUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
    onUrlCapture(formattedUrl);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateAiStoryboard(urlInput, aiPrompt);
  };

  const presetColors = [
    { name: "Indigo Tech", primary: "#6366f1", bg: "#09090b", text: "#f4f4f5" },
    { name: "Emerald Mint", primary: "#10b981", bg: "#022c22", text: "#ecfdf5" },
    { name: "Cyber Sunset", primary: "#ec4899", bg: "#0c0a09", text: "#fff7ed" },
    { name: "Sleek Dark", primary: "#f43f5e", bg: "#111822", text: "#f8fafc" },
    { name: "Studio Light", primary: "#2563eb", bg: "#f8fafc", text: "#0f172a" },
    { name: "Warm Gold", primary: "#d97706", bg: "#171212", text: "#fffbeb" }
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden h-full">
      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-2 gap-1">
        <button
          onClick={() => setActiveTab("source")}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "source" 
              ? "bg-zinc-800 text-white shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          1. Digital Asset
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "ai" 
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          2. AI Storyboard
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "settings" 
              ? "bg-zinc-800 text-white shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          3. Video Casing
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {/* Tab 1: Source asset picker */}
        {activeTab === "source" && (
          <div className="space-y-6 transition-all duration-300">
            {/* Capture from real URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                Capture Website Live
              </label>
              <form onSubmit={handleCaptureSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="E.g., react.dev, stripe.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                    disabled={isCapturing}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCapturing || !urlInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg px-4 py-2 transition-all disabled:opacity-50 flex items-center gap-1.5 font-sans"
                >
                  {isCapturing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Slicing...
                    </>
                  ) : (
                    "Capture"
                  )}
                </button>
              </form>
              <p className="text-[10px] text-zinc-500">
                Pulls the live homepage layout automatically using clean page captures.
              </p>
            </div>

            {/* Separator */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-zinc-600 font-mono uppercase">OR UPLOAD screenshot</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Manual Image Upload with Drag Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                Upload Custom Image
              </label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative ${
                  dragActive 
                    ? "border-emerald-500 bg-emerald-500/5" 
                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-300 font-medium">Drag website screenshot here</p>
                <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG, or WebP (Up to 5MB)</p>
              </div>
            </div>

            {/* Separator */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-zinc-600 font-mono uppercase">OR CHOOSE DESIGN TEMPLATE</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Custom high-end mockup Templates */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">Preset Product Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => onSelectTemplate(tpl)}
                    className={`text-left p-2.5 rounded-xl border transition-all relative overflow-hidden group ${
                      activeTemplateId === tpl.id 
                        ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20" 
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                    }`}
                  >
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: tpl.accentColor }}>
                      {activeTemplateId === tpl.id && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div className="text-[11px] font-bold text-zinc-200 group-hover:text-white truncate pr-4">{tpl.name}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5 truncate">{tpl.category}</div>
                    <div className="text-[9px] text-zinc-600 line-clamp-1 mt-1 font-sans">{tpl.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Prompt Config */}
        {activeTab === "ai" && (
          <div className="space-y-5 transition-all duration-300">
            <div className="p-4 bg-indigo-950/40 border border-indigo-900/30 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                Gemini Multi-Scene Director
              </div>
              <p className="text-[11px] text-indigo-200/70 leading-relaxed font-sans">
                Gemini will scan your website asset details, write high-converting subtitles/voice narration scripts, and structure beautiful scene-specific camera scrolls (like zooming into sections, panning, and tilt motion).
              </p>
            </div>

            <form onSubmit={handleAiSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Web asset target URL</label>
                <input
                  type="text"
                  placeholder="Website URL (e.g. stripe.com)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">What does this product do?</label>
                <textarea
                  rows={4}
                  placeholder="E.g., AI powered photo optimizer. Focus on showing our pristine dashboards, the key benefits stats counters, and slide down to pricing grid..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingStoryboard}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl py-3 px-4 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isGeneratingStoryboard ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating AI Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Create Cinematic AI Storyboard
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Detailed video customization */}
        {activeTab === "settings" && (
          <div className="space-y-6 transition-all duration-300">
            {/* Device mock casing */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-zinc-400" />
                Physical Device Frame Casing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["laptop", "mobile", "desktop"] as DeviceType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSettings(prev => ({ ...prev, deviceType: type }))}
                    className={`py-3 px-2 rounded-xl text-xs border flex flex-col items-center gap-1.5 capitalize transition-all ${
                      settings.deviceType === type 
                        ? "border-white bg-white/5 text-white" 
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 text-zinc-400"
                    }`}
                  >
                    {type === "laptop" && <Laptop className="w-4 h-4" />}
                    {type === "mobile" && <Smartphone className="w-4 h-4" />}
                    {type === "desktop" && <Monitor className="w-4 h-4" />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio choice */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">Aspect Ratio (Output)</label>
              <div className="grid grid-cols-3 gap-2">
                {(["16:9", "9:16", "1:1"] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setSettings(prev => ({ ...prev, aspectRatio: ratio }))}
                    className={`py-3 px-2 rounded-xl text-xs border flex flex-col items-center transition-all ${
                      settings.aspectRatio === ratio 
                        ? "border-white bg-white/5 text-white" 
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 text-zinc-400"
                    }`}
                  >
                    <span className="font-bold text-xs">{ratio}</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">
                      {ratio === "16:9" && "YouTube/Web"}
                      {ratio === "9:16" && "TikTok/Shorts"}
                      {ratio === "1:1" && "Instagram"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Design Presets and cinematic themes */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">Cinematic Color presets</label>
              <div className="grid grid-cols-2 gap-2">
                {presetColors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSettings(prev => ({ 
                      ...prev, 
                      primaryColor: color.primary,
                      backgroundColor: color.bg,
                      textColor: color.text,
                      theme: color.name.toLowerCase().includes("light") ? "light" : "dark"
                    }))}
                    className="flex items-center gap-2 p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl text-left"
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: color.primary }}
                    />
                    <div className="truncate">
                      <div className="text-[10px] font-bold text-zinc-200">{color.name}</div>
                      <div className="text-[9px] text-zinc-500 font-mono truncate">{color.bg}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlays / subtitls */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FontIcon className="w-3.5 h-3.5 text-zinc-400" />
                Overlays & Subtitles
              </label>
              
              <div className="space-y-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">Show Captions Card</span>
                    <span className="text-[10px] text-zinc-500">Render styled lower-third banner overlay</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showSubtitles}
                    onChange={(e) => setSettings(prev => ({ ...prev, showSubtitles: e.target.checked }))}
                    className="accent-indigo-500 h-4 w-4 bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">Browser Narration Voiceover</span>
                    <span className="text-[10px] text-zinc-500">Synthesizes dynamic spoke narration</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableVoiceover}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableVoiceover: e.target.checked }))}
                    className="accent-indigo-500 h-4 w-4 bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
