export type AspectRatio = "16:9" | "9:16" | "1:1";

export type DeviceType = "laptop" | "mobile" | "desktop";

export type AnimationStyle = "center" | "zoom-in" | "pan-left" | "pan-right" | "tilt-3d";

export interface VideoScene {
  id: string;
  title: string;
  caption: string;
  duration: number; // in seconds
  scrollPercentage: number; // 0 to 100
  focusMode: AnimationStyle;
  narrationText: string;
}

export interface VideoSettings {
  aspectRatio: AspectRatio;
  deviceType: DeviceType;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  theme: string;
  showSubtitles: boolean;
  enableVoiceover: boolean;
  musicVolume: number;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  accentColor: string;
}
