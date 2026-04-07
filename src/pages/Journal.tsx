import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JournalInput from "@/components/JournalInput";
import AISuggestions from "@/components/AISuggestions";

const API = "http://localhost:4000";

const Journal = () => {
  const [selectedTags, setSelectedTags]     = useState<string[]>([]);
  const [journalEntry, setJournalEntry]     = useState("");
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectedMood, setDetectedMood]     = useState("Calm");
  const [error, setError]                   = useState("");
  const [insight, setInsight]               = useState<string | null>(null); // ✅ NEW

  const handleSubmit = async () => {
    if (!journalEntry.trim()) return;

    setIsAnalyzing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/journal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: journalEntry, tags: selectedTags }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || `Request failed (${res.status})`);
      }

      const data = await res.json();

      // ✅ Set mood from ML model
      setDetectedMood(data.emotion || "Calm");

      // ✅ NEW: set Groq insight (null if Groq was unavailable)
      setInsight(data.insight || null);

      setShowSuggestions(true);
    } catch (err: any) {
      console.error("[Journal submit]", err);
      setError(err.message || "Something went wrong. Please try again.");
      // Still show suggestions so UX isn't blocked
      setDetectedMood("Calm");
      setInsight(null);
      setShowSuggestions(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewEntry = () => {
    setSelectedTags([]);
    setJournalEntry("");
    setShowSuggestions(false);
    setError("");
    setDetectedMood("Calm");
    setInsight(null); // ✅ NEW: reset insight on new entry
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Daily Reflection
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Write about what's been on your mind today. We'll gently help you
              understand how you might be feeling.
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Some days will be messy. Some days will feel peaceful. Reflectly is here for all of them.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          {!showSuggestions ? (
            <div className="space-y-12">
              <div className="glass-card p-8 animate-fade-in-up">
                <h3 className="text-center font-serif text-xl font-semibold text-foreground mb-4">
                  Write about what you're feeling
                </h3>
                <p className="text-center text-sm text-muted-foreground mb-6">
                  You can write about anything — your day, something that
                  bothered you, or something that made you feel good.
                </p>
                <JournalInput
                  value={journalEntry}
                  onChange={setJournalEntry}
                  onSubmit={handleSubmit}
                  isSubmitting={isAnalyzing}
                />
              </div>
            </div>
          ) : (
            <AISuggestions
              mood={detectedMood}
              tags={selectedTags}
              insight={insight}       // ✅ NEW: pass Groq insight
              onNewEntry={handleNewEntry}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Journal;