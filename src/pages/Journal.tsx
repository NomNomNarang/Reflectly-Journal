
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuickTags from "@/components/QuickTags";
import JournalInput from "@/components/JournalInput";
import AISuggestions from "@/components/AISuggestions";

const Journal = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!journalEntry.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsAnalyzing(false);
    setShowSuggestions(true);
  };

  const handleNewEntry = () => {
    setSelectedTags([]);
    setJournalEntry("");
    setShowSuggestions(false);
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
          </div>

          {!showSuggestions ? (
            <div className="space-y-12">

              {/* Factors Affecting You */}
              <div className="glass-card p-8">
                <QuickTags
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                />
              </div>

              {/* Journal Entry */}
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
              journalText={journalEntry}
              tags={selectedTags}
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