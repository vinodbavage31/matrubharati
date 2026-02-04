import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Target, BookOpen, Shield, Star } from "lucide-react";

const examPrograms = [
  {
    icon: Shield,
    name: "Sainik School",
    description: "Comprehensive preparation for Sainik School entrance exam with focus on mathematics, English, and general knowledge.",
    highlight: true
  },
  {
    icon: Star,
    name: "Navodaya Vidyalaya",
    description: "Specialized coaching for JNV entrance with mental ability, arithmetic, and language proficiency training.",
    highlight: true
  },
  {
    icon: Award,
    name: "Kittur Schools",
    description: "Dedicated preparation program for Kittur Rani Chennamma Residential School entrance."
  },
  {
    icon: Target,
    name: "Morarji Desai Schools",
    description: "Focused training for MDRS entrance examinations with proven teaching methodology."
  },
  {
    icon: BookOpen,
    name: "National Military Schools",
    description: "Expert coaching for Rashtriya Military School entrance examinations."
  },
  {
    icon: Award,
    name: "Other Competitive Exams",
    description: "Preparation for various state and national level academic competitive examinations."
  }
];

const Programs = () => {
  return (
    <section id="programs" className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="accent-line mx-auto mb-6" />
          <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            Competitive Exam Training
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Specialized <span className="text-accent">Entrance Exam</span> Preparation
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            We specialize in training Class 5th students for prestigious entrance examinations, 
            with our expert faculty guiding students to success.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {examPrograms.map((program, index) => (
            <div
              key={program.name}
              className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                program.highlight 
                  ? "border-accent shadow-[0_0_30px_rgba(251,191,36,0.1)]" 
                  : "border-white/10"
              }`}
            >
              {program.highlight && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                program.highlight ? "bg-accent/20" : "bg-white/10"
              }`}>
                <program.icon className={`h-6 w-6 ${program.highlight ? "text-accent" : "text-white"}`} />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">{program.name}</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                {program.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="accent" size="xl" asChild>
            <a href="#admissions">
              Enroll for Exam Training
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Programs;
