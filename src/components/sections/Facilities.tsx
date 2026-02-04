import { Home, BookOpen, Utensils, Dumbbell, Shield, Users } from "lucide-react";

const facilities = [
  {
    icon: Home,
    title: "Residential Hostels",
    description: "Separate well-maintained hostels for boys and girls with comfortable accommodation, clean beds, and homely environment.",
    features: ["24/7 Security", "Warden Supervision", "Clean Rooms"]
  },
  {
    icon: BookOpen,
    title: "Modern Classrooms",
    description: "Well-ventilated, spacious classrooms equipped with teaching aids for an engaging learning experience.",
    features: ["Audio-Visual Aids", "Small Batches", "Library Access"]
  },
  {
    icon: Utensils,
    title: "Nutritious Dining",
    description: "Hygienic kitchen serving balanced, nutritious meals thrice daily plus evening snacks.",
    features: ["3 Meals Daily", "Evening Snacks", "Hygienic Kitchen"]
  },
  {
    icon: Dumbbell,
    title: "Sports & Fitness",
    description: "Dedicated spaces for physical activities, yoga, meditation, and various sports.",
    features: ["Daily Exercise", "Yoga Sessions", "Sports Ground"]
  },
  {
    icon: Shield,
    title: "Campus Security",
    description: "Safe and secure campus with controlled access and constant monitoring.",
    features: ["CCTV Coverage", "Entry Control", "Night Security"]
  },
  {
    icon: Users,
    title: "Student Support",
    description: "Dedicated staff for academic support, counseling, and personal development.",
    features: ["Extra Tuition", "Mentoring", "Parent Updates"]
  }
];

const Facilities = () => {
  return (
    <section id="facilities" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
            Our Facilities
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            A <span className="text-secondary">Nurturing Environment</span> for Growth
          </h2>
          <p className="text-muted-foreground text-lg">
            We provide world-class facilities ensuring students have everything they need 
            to focus on their studies and personal development.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => (
            <div
              key={facility.title}
              className="bg-card rounded-2xl p-8 shadow-soft card-hover border border-border overflow-hidden relative group"
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-accent to-secondary" />
              
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <facility.icon className="h-7 w-7 text-secondary" />
              </div>
              
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                {facility.title}
              </h3>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {facility.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {facility.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
