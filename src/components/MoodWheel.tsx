import { useState } from "react";
import { cn } from "@/lib/utils";

type Mood = {
  emoji: string;
  label: string;
  color: string;
  bgClass: string;
};

const moods: Mood[] = [
  { emoji: "😊", label: "Happy",    color: "mood-happy",   bgClass: "bg-mood-happy" },
  { emoji: "😢", label: "Sad",      color: "mood-sad",     bgClass: "bg-mood-sad" },
  { emoji: "😰", label: "Anxious",  color: "mood-anxious", bgClass: "bg-mood-anxious" },
  { emoji: "😤", label: "Angry",    color: "mood-angry",   bgClass: "bg-mood-angry" },
  { emoji: "😲", label: "Surprise", color: "mood-excited", bgClass: "bg-mood-calm" },
  { emoji: "❤️", label: "Love",     color: "mood-calm",    bgClass: "bg-mood-excited" },
  // { emoji: "😌", label: "Calm",     color: "mood-calm",    bgClass: "bg-mood-calm" },
];

interface MoodWheelProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string) => void;
}

const MoodWheel = ({ selectedMood, onMoodSelect }: MoodWheelProps) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className="relative">
      <h3 className="text-center font-serif text-xl font-semibold text-foreground mb-6">
        How are you feeling right now?
      </h3>
      
      <div className="flex flex-wrap justify-center gap-4 max-w-md mx-auto">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.label;
          const isHovered = hoveredMood === mood.label;
          
          return (
            <button
              key={mood.label}
              onClick={() => onMoodSelect(mood.label)}
              onMouseEnter={() => setHoveredMood(mood.label)}
              onMouseLeave={() => setHoveredMood(null)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
                isSelected
                  ? `${mood.bgClass} shadow-lg scale-110`
                  : "bg-card/80 hover:bg-card shadow-sm",
                isHovered && !isSelected && "shadow-md"
              )}
            >
              <span className="text-4xl">{mood.emoji}</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {selectedMood && (
        <p className="text-center mt-6 text-muted-foreground animate-fade-in-up">
          You're feeling <span className="font-semibold text-foreground">{selectedMood.toLowerCase()}</span>. That's completely okay.
        </p>
      )}
    </div>
  );
};

export default MoodWheel;
