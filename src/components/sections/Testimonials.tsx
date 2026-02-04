import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ramesh Kumar",
    role: "Father of Aditya, Class 8",
    content: "My son has transformed since joining Matru Bharati. The discipline and academic focus here is exceptional. The teachers truly care about each student's success.",
    rating: 5
  },
  {
    name: "Sunita Patil",
    role: "Mother of Priya, Class 6",
    content: "The hostel facilities are excellent and the staff treats children like their own. My daughter is preparing for Navodaya exam with full confidence.",
    rating: 5
  },
  {
    name: "Dr. Manjunath",
    role: "Father of Rahul, Class 10",
    content: "The specialized coaching for competitive exams is outstanding. Rahul cleared Sainik School entrance in his first attempt. Highly recommended!",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-muted pattern-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
            Parent Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by <span className="text-secondary">Parents</span> Across the Region
          </h2>
          <p className="text-muted-foreground text-lg">
            Hear from parents who have seen the transformation in their children.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-2xl p-8 shadow-soft border border-border relative"
            >
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
