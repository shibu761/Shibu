import { VideoScene, VideoSettings } from "../types";

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Calculates current scroll, scale, translation, and rotation parameters for a specific timeline time.
 */
export function getTimelineFrameState(
  time: number,
  scenes: VideoScene[]
) {
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const clampedTime = Math.min(totalDuration, Math.max(0, time));

  let accumulatedTime = 0;
  let activeIndex = 0;

  for (let i = 0; i < scenes.length; i++) {
    if (clampedTime >= accumulatedTime && clampedTime <= accumulatedTime + scenes[i].duration) {
      activeIndex = i;
      break;
    }
    accumulatedTime += scenes[i].duration;
    if (i === scenes.length - 1) {
      activeIndex = i;
    }
  }

  const activeScene = scenes[activeIndex];
  const sceneStartTime = accumulatedTime;
  const sceneElapsedTime = clampedTime - sceneStartTime;
  const progress = activeScene.duration > 0 ? Math.min(1, Math.max(0, sceneElapsedTime / activeScene.duration)) : 0;
  const t_ease = easeInOutQuad(progress);

  // Scroll offset interpolation
  const prevScene = activeIndex > 0 ? scenes[activeIndex - 1] : null;
  const startScroll = prevScene ? prevScene.scrollPercentage : activeScene.scrollPercentage;
  const endScroll = activeScene.scrollPercentage;
  const currentScroll = startScroll + (endScroll - startScroll) * t_ease;

  // Let's compute cinematic camera settings based on focus mode
  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;
  let rotate = 0;

  const mode = activeScene.focusMode;
  if (mode === "zoom-in") {
    // Zoom in slowly from 1.0 to 1.15
    scale = 1.0 + 0.15 * progress;
  } else if (mode === "pan-left") {
    // Translate from right to left
    translateX = 35 * (1 - progress * 2); // 35 to -35
    scale = 1.05;
  } else if (mode === "pan-right") {
    // Translate from left to right
    translateX = 35 * (progress * 2 - 1); // -35 to 35
    scale = 1.05;
  } else if (mode === "tilt-3d") {
    // Rotate canvas slightly and zoom in
    rotate = -0.015 + 0.03 * progress; // -0.015 to 0.015 radians
    scale = 1.04 + 0.04 * progress;
  } else {
    // center / subtle modern breathing
    scale = 1.02 + 0.02 * Math.sin(clampedTime * 1.5);
  }

  return {
    activeScene,
    activeIndex,
    progress,
    currentScroll,
    scale,
    translateX,
    translateY,
    rotate,
    totalDuration
  };
}

/**
 * Renders a single frame of the website showcases on the canvas
 */
export function renderCanvasFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  scenes: VideoScene[],
  settings: VideoSettings,
  img: HTMLImageElement | null
) {
  // Clear background
  ctx.save();
  ctx.fillStyle = settings.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw background abstract radial or linear gradients for luxury cinematic depth
  const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
  grad.addColorStop(0, settings.backgroundColor);
  
  // Mix secondary color context
  const primaryRGB = hexToRgb(settings.primaryColor) || { r: 99, g: 102, b: 241 };
  grad.addColorStop(1, `rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0.15)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Draw modern decorative technical grids in margin for cyberpunk or tech layout
  if (settings.theme === "cyberpunk" || settings.theme === "dark") {
    ctx.strokeStyle = `rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0.05)`;
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  if (scenes.length === 0) {
    // Draw simple loading box if no storyboard loaded
    ctx.font = "bold 24px system-ui";
    ctx.fillStyle = settings.textColor;
    ctx.textAlign = "center";
    ctx.fillText("Ready to Generate Promotional Video", width / 2, height / 2);
    ctx.restore();
    return;
  }

  const state = getTimelineFrameState(time, scenes);
  const activeScene = state.activeScene;

  // Apply Camera animations (Scale, Translate, Rotate around Canvas Center)
  ctx.translate(width / 2, height / 2);
  ctx.scale(state.scale, state.scale);
  ctx.rotate(state.rotate);
  ctx.translate(state.translateX, state.translateY);
  ctx.translate(-width / 2, -height / 2);

  // Draw Device Frame Mockup
  const isMobile = settings.deviceType === "mobile";
  const isLaptop = settings.deviceType === "laptop";
  
  if (isLaptop) {
    // Screen Container Dimensions
    const screenWidth = width * 0.65;
    const screenHeight = height * 0.52;
    const screenX = (width - screenWidth) / 2;
    const screenY = (height - screenHeight) / 2 - 25;

    // Draw Laptop Bezel Border
    ctx.fillStyle = "#1e1e24"; // Sleek premium titanium gray
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;
    
    // Smooth rounded screen frame
    roundRect(ctx, screenX - 18, screenY - 18, screenWidth + 36, screenHeight + 36, 16, true, false);
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0; // reset shadow for contents

    // Glossy camera notch inside top bezel
    ctx.fillStyle = "#0c0a09";
    ctx.beginPath();
    ctx.arc(width / 2, screenY - 9, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw Screen Content Clipping Mask
    ctx.save();
    roundRect(ctx, screenX, screenY, screenWidth, screenHeight, 4, false, false);
    ctx.clip();

    if (img && img.complete) {
      // Calculate Scroll translation
      const maxScrollHeight = Math.max(0, img.height - screenHeight);
      const scrollY = (state.currentScroll / 100) * maxScrollHeight;
      
      // Draw screenshot inside frame
      ctx.drawImage(img, 0, scrollY, img.width, screenHeight, screenX, screenY, screenWidth, screenHeight);
    } else {
      // Placeholder webpage style if raw image not ready
      drawWebPagePlaceholder(ctx, screenX, screenY, screenWidth, screenHeight, state.currentScroll, settings.primaryColor);
    }

    // Top glossy reflection gradient line overlay on screen
    const reflectGrad = ctx.createLinearGradient(screenX, screenY, screenX + screenWidth, screenY + screenHeight);
    reflectGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    reflectGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.01)");
    reflectGrad.addColorStop(0.31, "rgba(255, 255, 255, 0)");
    reflectGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(screenX, screenY, screenWidth, screenHeight);

    ctx.restore(); // end clip

    // Draw Keyboard Laptop Base
    const baseWidth = screenWidth * 1.15;
    const baseHeight = 24;
    const baseX = (width - baseWidth) / 2;
    const baseY = screenY + screenHeight + 18;

    // Drawing 3D laptop hub stand
    ctx.fillStyle = "#27272a";
    roundRect(ctx, baseX - 10, baseY + 6, baseWidth + 20, 10, { tl: 0, tr: 0, bl: 10, br: 10 }, true, false);
    
    // Keyboard metal shelf
    const shelfGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + baseHeight);
    shelfGrad.addColorStop(0, "#4b5563");
    shelfGrad.addColorStop(0.5, "#374151");
    shelfGrad.addColorStop(1, "#1f2937");
    ctx.fillStyle = shelfGrad;
    roundRect(ctx, baseX, baseY, baseWidth, baseHeight, { tl: 10, tr: 10, bl: 2, br: 2 }, true, false);

    // Laptop center finger-lift recess notch
    ctx.fillStyle = "#111827";
    roundRect(ctx, width / 2 - 40, baseY, 80, 8, { tl: 0, tr: 0, bl: 4, br: 4 }, true, false);

  } else if (isMobile) {
    // Phone container is portrait focused
    const phoneWidth = width * 0.28;
    const phoneHeight = height * 0.65;
    const phoneX = (width - phoneWidth) / 2;
    const phoneY = (height - phoneHeight) / 2 - 25;

    // Matte phone border
    ctx.fillStyle = "#18181b"; // Dark deep carbon black
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;
    roundRect(ctx, phoneX - 12, phoneY - 12, phoneWidth + 24, phoneHeight + 24, 38, true, false);
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0; // reset

    // Draw speaker ear bar at top of border
    ctx.fillStyle = "#3f3f46";
    roundRect(ctx, width / 2 - 30, phoneY - 6, 60, 4, 2, true, false);

    // Body Clip
    ctx.save();
    roundRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, 28, false, false);
    ctx.clip();

    if (img && img.complete) {
      // Calculate best scaled fit
      const maxScrollHeight = Math.max(0, img.height - phoneHeight);
      const scrollY = (state.currentScroll / 100) * maxScrollHeight;
      ctx.drawImage(img, 0, scrollY, img.width, phoneHeight, phoneX, phoneY, phoneWidth, phoneHeight);
    } else {
      drawWebPagePlaceholder(ctx, phoneX, phoneY, phoneWidth, phoneHeight, state.currentScroll, settings.primaryColor);
    }

    // Dynamic Notch (pill-shape island) overlay
    ctx.fillStyle = "#09090b";
    roundRect(ctx, width / 2 - 35, phoneY + 8, 70, 16, 8, true, false);
    // Highlight reflection within lens
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(width / 2 + 20, phoneY + 16, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // ends phone content wrap

  } else {
    // Regular Desktop display
    const screenWidth = width * 0.72;
    const screenHeight = height * 0.50;
    const screenX = (width - screenWidth) / 2;
    const screenY = (height - screenHeight) / 2 - 50;

    // Outer thick monitor bezel
    ctx.fillStyle = "#111827";
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 18;
    roundRect(ctx, screenX - 10, screenY - 10, screenWidth + 20, screenHeight + 20, 8, true, false);
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Monitor stand and plate base
    ctx.fillStyle = "#1f2937";
    const standW = 55;
    const standH = 80;
    ctx.fillRect(width / 2 - standW / 2, screenY + screenHeight + 10, standW, standH);

    // Desk plate stand
    const standPlateW = 160;
    const standPlateH = 10;
    ctx.fillStyle = "#111827";
    roundRect(ctx, width / 2 - standPlateW / 2, screenY + screenHeight + standH, standPlateW, standPlateH, 4, true, false);

    // Screen Browser details bar
    ctx.save();
    roundRect(ctx, screenX, screenY, screenWidth, screenHeight, 4, false, false);
    ctx.clip();

    // Top window panel style
    ctx.fillStyle = "#e4e4e7";
    ctx.fillRect(screenX, screenY, screenWidth, 30);
    
    // Window control mini circles
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(screenX + 15, screenY + 15, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#eab308";
    ctx.beginPath(); ctx.arc(screenX + 27, screenY + 15, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#22c55e";
    ctx.beginPath(); ctx.arc(screenX + 39, screenY + 15, 4.5, 0, Math.PI * 2); ctx.fill();

    // Pseudo search address bar
    ctx.fillStyle = "white";
    roundRect(ctx, screenX + 60, screenY + 7, screenWidth - 100, 16, 4, true, false);
    ctx.font = "normal 10px monospace";
    ctx.fillStyle = "#71717a";
    ctx.fillText("https://my-spectacular-landing-page.ai", screenX + 75, screenY + 19);

    const innerY = screenY + 30;
    const innerHeight = screenHeight - 30;

    if (img && img.complete) {
      const maxScrollHeight = Math.max(0, img.height - innerHeight);
      const scrollY = (state.currentScroll / 100) * maxScrollHeight;
      ctx.drawImage(img, 0, scrollY, img.width, innerHeight, screenX, innerY, screenWidth, innerHeight);
    } else {
      drawWebPagePlaceholder(ctx, screenX, innerY, screenWidth, innerHeight, state.currentScroll, settings.primaryColor);
    }

    ctx.restore();
  }

  // Restore camera transformations before rendering Overlays
  ctx.restore();

  // Draw Lower-Third Text overlay and video caption (Fades in/out nicely)
  if (settings.showSubtitles) {
    const subtitleY = height - 100;
    
    // Lower overlay base plate
    ctx.save();
    ctx.fillStyle = "rgba(10, 10, 12, 0.82)"; // Dark acrylic frosting
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    
    const bannerW = width * 0.72;
    const bannerH = 75;
    const bannerX = (width - bannerW) / 2;
    
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 20;
    roundRect(ctx, bannerX, subtitleY - 20, bannerW, bannerH, 12, true, true);
    ctx.shadowBlur = 0; // reset

    // Animated Accent side indicator element matching active scene primary color
    ctx.fillStyle = settings.primaryColor;
    roundRect(ctx, bannerX + 4, subtitleY - 14, 4, 63, 2, true, false);

    // Left scene count indicator
    ctx.font = "bold 13px Courier, monospace";
    ctx.fillStyle = settings.primaryColor;
    ctx.fillText(`SCENE 0${state.activeIndex + 1}`, bannerX + 30, subtitleY + 7);

    // Draw main bold title
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(activeScene.title, bannerX + 110, subtitleY + 7);

    // Supporting caption
    ctx.font = "normal 14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText(activeScene.caption, bannerX + 110, subtitleY + 28);

    // Draw little running visual progress indicator on bottom border
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(bannerX + 30, subtitleY + 41, bannerW - 140, 4);
    
    ctx.fillStyle = settings.primaryColor;
    ctx.fillRect(bannerX + 30, subtitleY + 41, (bannerW - 140) * state.progress, 4);

    ctx.restore();
  }

  // Draw subtle digital clock or watermark indicator in top corners
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText("WEBOVIDEO CANVAS BUILD", 40, 40);

  // Time stamp progress
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 100);
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  
  ctx.font = 'normal 13px "Courier New", monospace';
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText(`REC // ${timeFormatted} / 30FPS`, width - 165, 40);
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Subordinate drawing of simulated Web page lines/shapes inside frame
function drawWebPagePlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scrollPercent: number,
  color: string
) {
  const contentHeight = h * 2.5;
  const scrollOffset = -(scrollPercent / 100) * (contentHeight - h);

  ctx.save();
  ctx.translate(0, scrollOffset);

  // Draw Web Header
  ctx.fillStyle = "#1e1b4b";
  ctx.fillRect(x, y + 0, w, 120);

  // Big Hero Headline lines
  ctx.fillStyle = "white";
  ctx.fillRect(x + 40, y + 40, w * 0.45, 12);
  ctx.fillRect(x + 40, y + 60, w * 0.6, 12);

  // CTA button
  ctx.fillStyle = color;
  roundRect(ctx, x + 40, y + 85, 95, 24, 4, true, false);

  // Large decorative promo graphic card block
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, x + w * 0.6, y + 30, w * 0.35, 70, 6, true, false);

  // Body content section
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x, y + 120, w, contentHeight - 120);

  // Section 2: Features cards block
  const section2Y = y + 200;
  ctx.fillStyle = "white";
  ctx.fillRect(x + w / 2 - 80, section2Y, 160, 10);
  
  // Draw 3 columns
  const colW = (w - 100) / 3;
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  roundRect(ctx, x + 30, section2Y + 40, colW, 110, 6, true, false);
  roundRect(ctx, x + 30 + colW + 20, section2Y + 40, colW, 110, 6, true, false);
  roundRect(ctx, x + 30 + 2 * (colW + 20), section2Y + 40, colW, 110, 6, true, false);

  ctx.fillStyle = color;
  ctx.fillRect(x + 50, section2Y + 55, 30, 6);
  ctx.fillRect(x + 30 + colW + 40, section2Y + 55, 30, 6);
  ctx.fillRect(x + 30 + 2 * (colW + 20) + 20, section2Y + 55, 30, 6);

  // Section 3: Mid-page dashboard widget representation
  const section3Y = y + 420;
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  roundRect(ctx, x + 30, section3Y, w - 60, 200, 8, true, false);
  
  // Draw small circular graph and list lines
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + 100, section3Y + 100, 45, 0, Math.PI * 1.5);
  ctx.stroke();

  ctx.fillStyle = "#4b5563";
  ctx.fillRect(x + 190, section3Y + 60, w - 260, 8);
  ctx.fillRect(x + 190, section3Y + 85, w - 300, 8);
  ctx.fillRect(x + 190, section3Y + 110, w - 240, 8);

  // Section 4: pricing grid layout representation
  const section4Y = y + 720;
  ctx.fillStyle = "white";
  ctx.fillRect(x + 50, section4Y, 130, 8);
  ctx.fillRect(x + 50, section4Y + 20, w - 100, 2);

  // Two packages
  const gridW = (w - 80) / 2;
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, x + 30, section4Y + 50, gridW, 140, 6, true, false);
  
  ctx.fillStyle = color;
  roundRect(ctx, x + w / 2 + 10, section4Y + 50, gridW, 140, 6, true, false);

  // Section 5: footer layout representation
  const section5Y = y + 965;
  ctx.fillStyle = "#020617";
  ctx.fillRect(x, section5Y, w, 200);

  ctx.fillStyle = "white";
  ctx.font = "normal 12px sans-serif";
  ctx.fillText("Copyright © 2026 WebVideo Platform", x + 40, section5Y + 50);

  ctx.restore();
}

/**
 * Helper to easily draw rounded corners on a canvas 2D context
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl: number; tr: number; bl: number; br: number },
  fill: boolean,
  stroke: boolean
) {
  let r = { tl: 0, tr: 0, bl: 0, br: 0 };
  if (typeof radius === "number") {
    r = { tl: radius, tr: radius, bl: radius, br: radius };
  } else {
    r = radius;
  }

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
