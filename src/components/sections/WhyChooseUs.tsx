import { 
  GraduationCap, 
  Shield, 
  Home, 
  Utensils, 
  BookCheck, 
  Brain, 
  Calendar, 
  Dumbbell,
  Users,
  Target,
  Clock,
  Heart,
  CheckCircle
} from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Teachers",
    description: "Specially skilled educators hired from across India with proven track records in competitive exam coaching"
  },
  {
    icon: Home,
    title: "Residential Options",
    description: "Separate hostels for boys and girls with 24/7 security, CCTV surveillance, and warden supervision"
  },
  {
    icon: Shield,
    title: "Safe Campus",
    description: "Secure environment with controlled access, round-the-clock monitoring, and emergency protocols"
  },
  {
    icon: Utensils,
    title: "Nutritious Meals",
    description: "3 balanced meals + evening snacks prepared in hygienic kitchen under dietitian guidance"
  },
  {
    icon: BookCheck,
    title: "After-School Support",
    description: "Dedicated evening tuition sessions with printed notes and study materials for all subjects"
  },
  {
    icon: Brain,
    title: "Mental Ability Training",
    description: "Specialized coaching for reasoning, aptitude, and problem-solving skills essential for entrance exams"
  },
  {
    icon: Calendar,
    title: "Weekly Evaluations",
    description: "Every Sunday comprehensive tests to track progress, identify weak areas, and ensure consistent improvement"
  },
  {
    icon: Dumbbell,
    title: "Physical Wellness",
    description: "Daily yoga, meditation, sports activities, and PT exercises for physical and mental fitness"
  },
  {
    icon: Users,
    title: "Personal Attention",
    description: "Small batch sizes of 20-25 students ensuring individual focus and personalized guidance"
  },
  {
    icon: Target,
    title: "Result Focused",
    description: "Proven track record of success in Sainik, Navodaya, and other competitive entrance examinations"
  },
  {
    icon: Clock,
    title: "Disciplined Routine",
    description: "Structured daily schedule from 5 AM to 9 PM building character, discipline, and time management"
  },
  {
    icon: Heart,
    title: "Holistic Development",
    description: "Balanced approach to academic excellence, physical fitness, moral values, and personality development"
  }
];

const achievements = [
  "95% success rate in competitive entrance exams",
  "Students selected for Sainik School every year",
  "Multiple Navodaya qualifiers annually",
  "State-level sports achievements",
  "100% parent satisfaction rate"
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-20 bg-background pattern-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="accent-line mx-auto mb-6" />
            <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-bold uppercase tracking-wider mb-4">
              Why Choose Us
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Building <span className="text-gradient">Tomorrow's Leaders</span> Today
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              At Matru Bharati, we combine academic excellence with discipline and care, 
              creating an environment where every child can thrive, compete, and succeed in life.
            </p>
          </div>
        </ScrollAnimation>

        {/* Achievements Banner */}
        <ScrollAnimation animation="fade-up" delay={0.1}>
          <div className="bg-foreground text-background rounded-2xl p-6 md:p-8 mb-16">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                  <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <ScrollAnimation
              key={feature.title}
              animation="fade-up"
              delay={index * 0.05}
            >
              <div className="group bg-card rounded-xl p-6 shadow-soft card-hover border border-border h-full">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Trust Statement */}
        <ScrollAnimation animation="fade-up" delay={0.2}>
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join <strong className="text-foreground">500+ families</strong> who have trusted us with their children's future. 
              Our commitment to excellence has made us the <strong className="text-secondary">preferred choice</strong> for quality education in Bidar district.
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default WhyChooseUs;
