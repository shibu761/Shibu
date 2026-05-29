import React, { useState } from "react";
import { 
  Sparkles,
  Clock, 
  Settings, 
  Trash2, 
  Plus, 
  MoveDown,
  Eye,
  Edit3,
  Check,
  RotateCcw
} from "lucide-react";
import { AnimationStyle, VideoScene } from "../types";

interface StoryboardTimelineProps {
  scenes: VideoScene[];
  setScenes: React.Dispatch<React.SetStateAction<VideoScene[]>>;
  activeIndex: number;
  onSelectScene: (idx: number) => void;
  timelineProgress: number; // 0 to 1
  currentTime: number;
}

export const StoryboardTimeline: React.FC<StoryboardTimelineProps> = ({
  scenes,
  setScenes,
  activeIndex,
  onSelectScene,
  timelineProgress,
  currentTime
}) => {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editNarration, setEditNarration] = useState("");
  const [editScroll, setEditScroll] = useState(0);
  const [editFocus, setEditFocus] = useState<AnimationStyle>("center");
  const [editDuration, setEditDuration] = useState(4);

  const startEdit = (scene: VideoScene) => {
    setEditingSceneId(scene.id);
    setEditTitle(scene.title);
    setEditCaption(scene.caption);
    setEditNarration(scene.narrationText);
    setEditScroll(scene.scrollPercentage);
    setEditFocus(scene.focusMode);
    setEditDuration(scene.duration);
  };

  const saveEdit = (id: string) => {
    setScenes(prev => prev.map(s => s.id === id ? {
      ...s,
      title: editTitle,
      caption: editCaption,
      narrationText: editNarration,
      scrollPercentage: editScroll,
      focusMode: editFocus,
      duration: editDuration
    } : s));
    setEditingSceneId(null);
  };

  const deleteScene = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (scenes.length <= 1) {
      alert("You must have at least 1 scene in your storyboard.");
      return;
    }
    setScenes(prev => prev.filter(s => s.id !== id));
  };

  const addScene = () => {
    const newId = `scene_${Date.now()}`;
    const newScene: VideoScene = {
      id: newId,
      title: "New Highlight Section",
      caption: "Configure your headlines and focus modes here.",
      duration: 4,
      scrollPercentage: Math.min(100, (scenes[scenes.length - 1]?.scrollPercentage || 0) + 15),
      focusMode: "center",
      narrationText: "Here is an additional highlight showcasing our interactive web interface layout."
    };
    setScenes(prev => [...prev, newScene]);
    onSelectScene(scenes.length);
  };

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5 leading-none">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Cinematic Storyboard Sequence
          </h3>
          <span className="text-[10px] text-zinc-500 mt-1">
            {scenes.length} Scenes Block // Active Segment Scroll depth: {scenes[activeIndex]?.scrollPercentage}%
          </span>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-850">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-mono text-zinc-300">
            {currentTime.toFixed(1)}s / {totalDuration.toFixed(0)}s
          </span>
        </div>
      </div>

      {/* Main Track progress bar visualization */}
      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden relative border border-zinc-850">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-100"
          style={{ width: `${timelineProgress * 100}%` }}
        />
        {/* Render scene marks */}
        {scenes.map((scene, idx) => {
          let accumSecs = 0;
          for (let i = 0; i < idx; i++) {
            accumSecs += scenes[i].duration;
          }
          const leftPercent = (accumSecs / totalDuration) * 100;
          return (
            <div 
              key={`mark_${scene.id}`} 
              className="absolute top-0 bottom-0 w-[1px] bg-zinc-800"
              style={{ left: `${leftPercent}%` }}
            />
          );
        })}
      </div>

      {/* Grid of editable scenes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto no-scrollbar pt-1">
        {scenes.map((scene, idx) => {
          const isActive = idx === activeIndex;
          const isEditing = editingSceneId === scene.id;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`border rounded-xl p-3.5 transition-all cursor-pointer flex flex-col relative h-full ${
                isActive 
                  ? "border-white bg-white/[0.03] ring-1 ring-white/10" 
                  : "border-zinc-850 hover:border-zinc-800 bg-zinc-955/40"
              }`}
            >
              {/* Corner badge index & triggers */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  isActive ? "bg-white text-zinc-900" : "bg-zinc-850 text-zinc-400"
                }`}>
                  SCENE {idx + 1}
                </span>

                <div className="flex items-center gap-1 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEditing) {
                        saveEdit(scene.id);
                      } else {
                        startEdit(scene);
                      }
                    }}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-all"
                    title={isEditing ? "Save details" : "Edit Scene details"}
                  >
                    {isEditing ? <Check className="w-3 h-3 text-emerald-400" /> : <Edit3 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => deleteScene(scene.id, e)}
                    className="p-1 hover:bg-red-950 hover:text-red-400 rounded text-zinc-500 transition-all"
                    title="Remove scene"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {isEditing ? (
                /* Edit panel fields */
                <div className="space-y-2 mt-1 z-20 text-xs" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title overlay"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Subtitle overlay"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300"
                    />
                  </div>
                  
                  {/* Grid of properties */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <div>
                      <label className="text-[9px] text-zinc-500 font-medium">Scroll: {editScroll}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editScroll}
                        onChange={(e) => setEditScroll(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 font-medium">Duration: {editDuration}s</label>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={editDuration}
                        onChange={(e) => setEditDuration(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <select
                      value={editFocus}
                      onChange={(e) => setEditFocus(e.target.value as AnimationStyle)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300"
                    >
                      <option value="center">Breathing Center</option>
                      <option value="zoom-in">Zoom In</option>
                      <option value="pan-left">Pan Left</option>
                      <option value="pan-right">Pan Right</option>
                      <option value="tilt-3d">3D Tilt Rotate</option>
                    </select>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={editNarration}
                      onChange={(e) => setEditNarration(e.target.value)}
                      placeholder="Voiceover narration narration..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* Standard static panel details */
                <div className="flex-1 flex flex-col justify-between mt-1">
                  <div>
                    <div className="text-[12px] font-bold text-zinc-200 line-clamp-1">{scene.title}</div>
                    <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{scene.caption}</div>
                  </div>

                  {/* Metadata labels */}
                  <div className="mt-4 pt-2 border-t border-zinc-900 grid grid-cols-2 gap-1 text-[9px] text-zinc-500 font-mono">
                    <div>
                      <span className="text-zinc-650">SCROLL:</span> {scene.scrollPercentage}%
                    </div>
                    <div>
                      <span className="text-zinc-650">LEN:</span> {scene.duration}s
                    </div>
                    <div className="col-span-2 mt-0.5 truncate capitalize">
                      <span className="text-zinc-650">CAM:</span> {scene.focusMode}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add scene trigger card */}
        {scenes.length < 10 && (
          <button
            onClick={addScene}
            className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-950/30 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] transition-all group"
          >
            <Plus className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 mb-1" />
            <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200">Add Segment</span>
          </button>
        )}
      </div>
    </div>
  );
};
