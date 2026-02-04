import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, BookOpen } from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center mt-[120px] md:mt-[160px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroCampus}
          alt="Matru Bharati School Campus"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Award className="h-5 w-5 text-accent" />
            <span className="text-accent font-medium text-sm">
              Premier Residential School in Bidar District
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Where Discipline Meets{" "}
            <span className="text-gradient">Destiny</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Empowering young minds through academic excellence, disciplined guidance, and specialized training for{" "}
            <strong className="text-accent">Sainik School, Navodaya & Competitive Entrance Exams.</strong>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild>
              <a href="#admissions">
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#about">Learn More About Us</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Users className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-white/70">Students</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <BookOpen className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-white">Class 3-10</div>
              <div className="text-sm text-white/70">Grades</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Award className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-white">95%</div>
              <div className="text-sm text-white/70">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
