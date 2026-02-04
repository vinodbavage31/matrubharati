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
  Heart
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Teachers",
    description: "Specially skilled educators hired from across India"
  },
  {
    icon: Home,
    title: "Residential Options",
    description: "Separate hostels for boys and girls with 24/7 security"
  },
  {
    icon: Shield,
    title: "Safe Campus",
    description: "Secure environment with round-the-clock supervision"
  },
  {
    icon: Utensils,
    title: "Nutritious Meals",
    description: "3 meals + evening snacks, balanced nutrition daily"
  },
  {
    icon: BookCheck,
    title: "After-School Support",
    description: "Extra tuition and printed notes for all subjects"
  },
  {
    icon: Brain,
    title: "Mental Ability Training",
    description: "Special coaching for reasoning and aptitude"
  },
  {
    icon: Calendar,
    title: "Weekly Evaluations",
    description: "Every Sunday tests to track progress consistently"
  },
  {
    icon: Dumbbell,
    title: "Physical Wellness",
    description: "Daily yoga, meditation, sports and exercise"
  },
  {
    icon: Users,
    title: "Personal Attention",
    description: "Small batch sizes ensuring individual focus"
  },
  {
    icon: Target,
    title: "Result Focused",
    description: "Strong academic results and competitive exam success"
  },
  {
    icon: Clock,
    title: "Disciplined Routine",
    description: "Structured daily schedule building character"
  },
  {
    icon: Heart,
    title: "Holistic Development",
    description: "Academic, physical, and moral growth together"
  }
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-20 bg-background pattern-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Building <span className="text-primary">Tomorrow's Leaders</span> Today
          </h2>
          <p className="text-muted-foreground text-lg">
            At Matru Bharati, we combine academic excellence with discipline and care, 
            creating an environment where every child can thrive and succeed.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-6 shadow-soft card-hover border border-border"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors">
                <feature.icon className="h-6 w-6 text-primary group-hover:text-secondary transition-colors" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
