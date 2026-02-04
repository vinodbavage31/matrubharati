import { Star, Quote, CheckCircle } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Ramesh Kumar",
    role: "Father of Aditya, Class 8",
    content: "My son has transformed since joining Matru Bharati. The discipline and academic focus here is exceptional. The teachers truly care about each student's success. We've seen remarkable improvement in his confidence and studies.",
    rating: 5,
    location: "Bidar"
  },
  {
    name: "Sunita Patil",
    role: "Mother of Priya, Class 6",
    content: "The hostel facilities are excellent and the staff treats children like their own. My daughter is preparing for Navodaya exam with full confidence. The weekly tests and personal attention have made a real difference.",
    rating: 5,
    location: "Bhalki"
  },
  {
    name: "Dr. Manjunath",
    role: "Father of Rahul, Class 10",
    content: "The specialized coaching for competitive exams is outstanding. Rahul cleared Sainik School entrance in his first attempt. The faculty's dedication and systematic approach are truly commendable. Highly recommended!",
    rating: 5,
    location: "Humnabad"
  },
  {
    name: "Vijaya Lakshmi",
    role: "Mother of Sneha, Class 5",
    content: "We were looking for a school that focuses on both academics and values. Matru Bharati exceeded our expectations. The disciplined routine, nutritious food, and caring environment have helped Sneha flourish.",
    rating: 5,
    location: "Aurad"
  }
];

const trustIndicators = [
  { value: "500+", label: "Students Enrolled" },
  { value: "95%", label: "Exam Success Rate" },
  { value: "100%", label: "Parent Satisfaction" },
  { value: "24/7", label: "Campus Security" }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-muted pattern-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
              Parent Testimonials
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Trusted by <span className="text-secondary">Parents</span> Across the Region
            </h2>
            <p className="text-muted-foreground text-lg">
              Hear from parents who have witnessed the transformation in their children's academics, discipline, and overall personality.
            </p>
          </div>
        </ScrollAnimation>

        {/* Trust Indicators */}
        <ScrollAnimation animation="fade-up" delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {trustIndicators.map((item) => (
              <div key={item.label} className="bg-card rounded-xl p-6 text-center border border-border shadow-soft">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <ScrollAnimation key={testimonial.name} animation="fade-up" delay={index * 0.1}>
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border relative h-full">
                <Quote className="absolute top-6 right-6 h-10 w-10 text-secondary/20" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                
                <p className="text-foreground mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="font-serif font-bold text-secondary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground/70">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Trust Statement */}
        <ScrollAnimation animation="fade-up" delay={0.3}>
          <div className="bg-card rounded-2xl p-8 border border-border text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-secondary" />
              <span className="font-semibold text-foreground">Verified Parent Reviews</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These testimonials are from real parents whose children study at Matru Bharati. 
              We invite prospective parents to visit our campus and speak directly with our existing parent community.
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default Testimonials;
