import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 hero-gradient opacity-50" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-lavender/30 blur-3xl floating" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-peach/30 blur-3xl floating-delayed" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-sky/30 blur-3xl floating" />
      
      <div className="container max-w-7xl mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
          
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in-up-delay-1">
              Understand your emotions.{" "}
              <span className="text-gradient">One journal at a time.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up-delay-2">
              Reflect on your day, understand your emotions, and discover simple ways to take care of your mind.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up-delay-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/journal">Start Journaling</Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start text-sm text-muted-foreground animate-fade-in-up-delay-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-mint-deep" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Privacy-focused
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-mint-deep" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Encrypted data
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-mint-deep" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No social sharing
              </div>
            </div>
          </div>
          
          {/* Hero illustration */}
          <div className="relative animate-fade-in-up-delay-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/50 to-peach/50 rounded-3xl blur-2xl" />
              <img
                src={heroIllustration}
                alt="Person journaling peacefully"
                className="relative w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
