import { Home, BookOpen, Utensils, Dumbbell, Shield, Users, Wifi, Clock, Heart, GraduationCap } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const facilities = [
  {
    icon: Home,
    title: "Residential Hostels",
    description: "Separate well-maintained hostels for boys and girls with comfortable accommodation, clean beds, and homely environment. Each hostel has trained wardens ensuring safety and discipline.",
    features: ["24/7 Security", "Warden Supervision", "Clean Rooms", "Personal Storage"]
  },
  {
    icon: BookOpen,
    title: "Modern Classrooms",
    description: "Well-ventilated, spacious classrooms equipped with modern teaching aids. Our classrooms are designed to foster interactive learning with comfortable seating for focused study.",
    features: ["Audio-Visual Aids", "Small Batches", "Library Access", "Study Materials"]
  },
  {
    icon: Utensils,
    title: "Nutritious Dining",
    description: "Hygienic kitchen serving balanced, nutritious meals thrice daily plus evening snacks. Menu designed by nutrition experts to support growing children's health and energy needs.",
    features: ["3 Meals Daily", "Evening Snacks", "Hygienic Kitchen", "Balanced Diet"]
  },
  {
    icon: Dumbbell,
    title: "Sports & Fitness",
    description: "Dedicated spaces for physical activities including playground, yoga hall, and sports equipment. Daily PT, yoga, and meditation sessions for holistic development.",
    features: ["Daily Exercise", "Yoga Sessions", "Sports Ground", "PT Training"]
  },
  {
    icon: Shield,
    title: "Campus Security",
    description: "Safe and secure campus with CCTV surveillance, controlled entry points, and professional security personnel. Parents can have complete peace of mind about their child's safety.",
    features: ["CCTV Coverage", "Entry Control", "Night Security", "Emergency Response"]
  },
  {
    icon: Users,
    title: "Student Support",
    description: "Dedicated academic coordinators and counselors for personalized guidance. Regular parent-teacher meetings and progress reports keep families informed about their child's development.",
    features: ["Extra Tuition", "Mentoring", "Parent Updates", "Counseling"]
  }
];

const additionalAmenities = [
  { icon: Wifi, label: "Clean Drinking Water" },
  { icon: Clock, label: "Structured Daily Routine" },
  { icon: Heart, label: "First Aid & Medical Care" },
  { icon: GraduationCap, label: "Printed Study Notes" }
];

const Facilities = () => {
  return (
    <section id="facilities" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
              Our Facilities
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              A <span className="text-secondary">Nurturing Environment</span> for Growth
            </h2>
            <p className="text-muted-foreground text-lg">
              We provide comprehensive facilities ensuring students have everything they need 
              to focus on their studies, health, and personal development in a safe environment.
            </p>
          </div>
        </ScrollAnimation>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => (
            <ScrollAnimation key={facility.title} animation="fade-up" delay={index * 0.1}>
              <div className="bg-card rounded-2xl p-8 shadow-soft card-hover border border-border overflow-hidden relative group h-full">
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
            </ScrollAnimation>
          ))}
        </div>

        {/* Additional Amenities */}
        <ScrollAnimation animation="fade-up" delay={0.3}>
          <div className="mt-16 bg-card rounded-2xl p-8 border border-border">
            <h3 className="font-serif text-xl font-bold text-foreground text-center mb-8">
              Additional Amenities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {additionalAmenities.map((amenity) => (
                <div key={amenity.label} className="flex flex-col items-center text-center p-4 rounded-xl bg-muted">
                  <amenity.icon className="h-8 w-8 text-secondary mb-3" />
                  <span className="text-sm font-medium text-foreground">{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default Facilities;
