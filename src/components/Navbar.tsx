import { Link } from "react-router-dom";
import { BookHeart } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender to-peach flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <BookHeart className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              Reflectly
            </span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              About Us
            </Link>
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Dashboard
            </Link>
          </div>

          {/* CTA */}
          <Link
            to="/journal"
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-md shadow-primary/20"
          >
            Start writing
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
