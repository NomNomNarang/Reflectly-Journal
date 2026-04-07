import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, TrendingUp, BarChart3, Sun, Moon, Cloud } from "lucide-react";

const API = "http://localhost:4000";

const moodColors: Record<string, string> = {
  Happy:    "bg-mood-happy",
  Sad:      "bg-mood-sad",
  Anxious:  "bg-mood-anxious",
  Angry:    "bg-mood-angry",
  Surprise: "bg-mood-calm",
  Love:     "bg-mood-excited",
  Calm:     "bg-mood-tired",
  // Tired:    "bg-mood-tired",
  // Excited:  "bg-mood-excited",
};

const moodEmoji: Record<string, string> = {
  Happy:    "😊",
  Sad:      "😢",
  Anxious:  "😰",
  Angry:    "😤",
  Surprise: "😲",
  Love:     "❤️",
  Calm:     "😌",
  // Tired:    "😴",
  // Excited:  "🤩",
};

const Dashboard = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long", year: "numeric" });

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const [moodData, setMoodData] = useState<Record<number, string>>({});
  const [weeklyStats, setWeeklyStats] = useState<{ mood: string; count: number; percentage: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/journal/dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        setMoodData(data.moodData || {});
        setWeeklyStats(data.weeklyStats || []);
        setStreak(data.streak || 0);
      } catch (err: any) {
        console.error("[Dashboard fetch]", err);
        setError("Could not load your data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Mood Journey
            </h1>
            <p className="text-muted-foreground text-lg">
              Track patterns, celebrate progress, and understand yourself better.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-muted-foreground py-20 text-lg animate-pulse">
              Loading your mood data…
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {currentMonth}
                    </h2>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const mood = moodData[day];
                      const isToday = day === today.getDate();
                      return (
                        <div
                          key={day}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                            mood ? `${moodColors[mood]} shadow-sm` : "bg-muted/50"
                          } ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                          <span className={`text-sm font-medium ${mood ? "text-foreground" : "text-muted-foreground"}`}>
                            {day}
                          </span>
                          {mood && <span className="text-lg">{moodEmoji[mood]}</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
                    {Object.entries(moodColors).map(([mood, color]) => (
                      <div key={mood} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color}`} />
                        <span className="text-sm text-muted-foreground">{mood}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Weekly stats */}
                <div className="glass-card p-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    This Month's Moods
                  </h3>
                  {weeklyStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries yet this month.</p>
                  ) : (
                    <div className="space-y-3">
                      {weeklyStats.slice(0, 4).map((stat) => (
                        <div key={stat.mood} className="flex items-center gap-3">
                          <span className="text-xl">{moodEmoji[stat.mood] || "🙂"}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground font-medium">{stat.mood}</span>
                              <span className="text-muted-foreground">{stat.count}x</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${moodColors[stat.mood] || "bg-primary"} transition-all`}
                                style={{ width: `${stat.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Insights */}
                <div className="glass-card p-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-mint/30">
                      <Sun className="w-5 h-5 text-mint-deep mt-0.5" />
                      <p className="text-sm text-foreground">
                        You feel more <span className="font-semibold">calm on weekends</span>. Great self-care!
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-peach/30">
                      <Cloud className="w-5 h-5 text-peach-deep mt-0.5" />
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">Stress peaks mid-week</span>. Try short breaks on Wednesdays.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-lavender/30">
                      <Moon className="w-5 h-5 text-lavender-deep mt-0.5" />
                      <p className="text-sm text-foreground">
                        Your <span className="font-semibold">mood improves</span> when you journal regularly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="glass-card p-6 text-center">
                  <div className="text-4xl mb-2">🔥</div>
                  <div className="font-serif text-3xl font-bold text-foreground">{streak}</div>
                  <p className="text-muted-foreground text-sm">Day journaling streak</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
