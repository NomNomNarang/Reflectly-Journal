import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Smile, Brain, LineChart, Shield } from "lucide-react";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center">
          <div className="container max-w-4xl mx-auto">
           
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              A safe space to slow down and check in with yourself
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Reflectly is a simple place to write about how you're feeling. Some days you will have a lot to say. 
              Other days maybe not. Either way, it's your space to pause, reflect and understand your emotions.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/journal">Try It Free</Link>
            </Button>
          </div>
        </section>

        {/* How it works steps */}
        <HowItWorks />

        {/* Features detail */}
        <section className="py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="glass-card p-8">
                <div className="flex flex-wrap gap-4 mb-6">
                  {["😊", "😢", "😰", "😌", "😤", "😴", "🤩"].map((emoji) => (
                    <div
                      key={emoji}
                      className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Stress", "Studies", "Relationships", "Work"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender to-lavender-deep flex items-center justify-center mb-4">
                  <Smile className="w-7 h-7 text-foreground/80" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                  Express How You Feel
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Start by choosing a mood that matches what you're feeling at the moment. There are no rules.
                  Sometimes you may have a lot to say, other days maybe not. Both are completely okay.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
              <div className="order-2 md:order-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky to-sky-deep flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-foreground/80" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                  AI That Understands
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                As you continue Journaling, Reflectly quietly looks for patterns in your enteries.
                You might notice things like certain days feel heavier than others or moments where your mood slowly improves.
                The insights are meant to help you understand yourself better, not to judge or analyze you.
                </p>
              </div>
              <div className="glass-card p-8 order-1 md:order-2">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-mint/30">
                    <p className="text-sm font-medium text-foreground">
                      "You seem overwhelmed but hopeful. That's completely okay."
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 p-3 rounded-xl bg-lavender/30">
                      <p className="text-xs text-muted-foreground">Detected</p>
                      <p className="text-sm font-medium">Hope + Stress</p>
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-peach/30">
                      <p className="text-xs text-muted-foreground">Intensity</p>
                      <p className="text-sm font-medium">Moderate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
              <div className="glass-card p-8">
                <div className="space-y-3">
                  {[
                    { icon: "✓", text: "Try writing one thing you did well today" },
                    { icon: "💭", text: "What's one tiny thing that could bring you comfort?" },
                    { icon: "🧘", text: "Try a 2-minute breathing exercise" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                        {item.icon}
                      </span>
                      <p className="text-sm text-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-peach to-peach-deep flex items-center justify-center mb-4">
                  <LineChart className="w-7 h-7 text-foreground/80" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                  Actionable Suggestions
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sometimes when we are overwhelmed, it's hard to know what might help.
                  Reflectly suggests small things that you can try. Maybe a short reflection question, a calming 
                  exercise, or simply a reminder to pause and breathe. 
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-mint to-mint-deep flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-foreground/80" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Your Privacy Comes First
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your journal is yours and yours alone. No ads. No data selling. No public sharing.
              Everything you write stays private.
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Some days will be messy. Some days will feel peaceful. Reflectly is here for all of them.
            </p>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/journal">Begin your reflection</Link>
            </Button>
            
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
