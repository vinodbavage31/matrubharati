import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Target, BookOpen, Shield, Star, CheckCircle, Users, Clock } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const examPrograms = [
  {
    icon: Shield,
    name: "Sainik School",
    description: "Comprehensive preparation for Sainik School entrance exam with focus on mathematics, English, general knowledge, and intelligence tests. Our specialized curriculum covers all AISSEE patterns.",
    highlight: true,
    features: ["AISSEE Pattern", "Mock Tests", "Interview Prep"]
  },
  {
    icon: Star,
    name: "Navodaya Vidyalaya",
    description: "Specialized coaching for JNV entrance (JNVST) with intensive mental ability training, arithmetic practice, and language proficiency development for Class 6 and Class 9 admissions.",
    highlight: true,
    features: ["Mental Ability", "Arithmetic", "Language Skills"]
  },
  {
    icon: Award,
    name: "Kittur Schools",
    description: "Dedicated preparation program for Kittur Rani Chennamma Residential School entrance. Comprehensive coverage of syllabus with regular practice tests.",
    features: ["State Syllabus", "Practice Tests", "Regular Assessments"]
  },
  {
    icon: Target,
    name: "Morarji Desai Schools",
    description: "Focused training for MDRS entrance examinations with proven teaching methodology and individual attention to each student's learning needs.",
    features: ["MDRS Pattern", "Individual Focus", "Success Track"]
  },
  {
    icon: BookOpen,
    name: "National Military Schools",
    description: "Expert coaching for Rashtriya Military School entrance examinations including written tests and physical fitness preparation.",
    features: ["Written Exam", "Physical Training", "Medical Guidance"]
  },
  {
    icon: Award,
    name: "Other Competitive Exams",
    description: "Preparation for various state and national level academic competitive examinations including scholarship tests and olympiads.",
    features: ["Olympiads", "Scholarship Tests", "State Exams"]
  }
];

const trainingHighlights = [
  { icon: Users, label: "Small Batch Size", value: "20-25 Students" },
  { icon: Clock, label: "Daily Practice", value: "3+ Hours" },
  { icon: Target, label: "Success Rate", value: "95%" },
  { icon: BookOpen, label: "Study Material", value: "Printed Notes" }
];

const Programs = () => {
  return (
    <section id="programs" className="py-20 bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="accent-line mx-auto mb-6" />
            <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-bold uppercase tracking-wider mb-4">
              Competitive Exam Training
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Specialized <span className="text-accent">Entrance Exam</span> Preparation
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              We specialize in training students from Class 3rd to 10th for prestigious entrance examinations, 
              with our expert faculty providing focused guidance to ensure success in competitive exams.
            </p>
          </div>
        </ScrollAnimation>

        {/* Training Highlights */}
        <ScrollAnimation animation="fade-up" delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {trainingHighlights.map((item) => (
              <div key={item.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                <item.icon className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-sm text-white/70">{item.label}</div>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {examPrograms.map((program, index) => (
            <ScrollAnimation key={program.name} animation="fade-up" delay={index * 0.08}>
              <div
                className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1 h-full ${
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
                <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
                  {program.description}
                </p>
                {program.features && (
                  <div className="flex flex-wrap gap-2">
                    {program.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Why Our Coaching Works */}
        <ScrollAnimation animation="fade-up" delay={0.2}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12">
            <h3 className="font-serif text-2xl font-bold text-center mb-8">Why Our Coaching Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Expert Faculty</h4>
                  <p className="text-sm text-white/70">Teachers with proven track records in competitive exam coaching from across India</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Comprehensive Material</h4>
                  <p className="text-sm text-white/70">Complete printed notes, previous year papers, and practice tests included</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Weekly Assessments</h4>
                  <p className="text-sm text-white/70">Regular Sunday tests to track progress and identify areas for improvement</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* CTA */}
        <ScrollAnimation animation="fade-up" delay={0.3}>
          <div className="text-center">
            <Button variant="accent" size="xl" asChild>
              <a href="#admissions">
                Enroll for Exam Training
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <p className="mt-4 text-white/60 text-sm">Limited seats available. Early enrollment recommended.</p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default Programs;
