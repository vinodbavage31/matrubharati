import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, CheckCircle, ArrowRight } from "lucide-react";

const Admissions = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    parentName: "",
    phone: "",
    email: "",
    childName: "",
    currentClass: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend
    console.log("Form submitted:", formData);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
    setFormData({
      parentName: "",
      phone: "",
      email: "",
      childName: "",
      currentClass: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="admissions" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Admissions Open Banner */}
        <div className="bg-gradient-to-r from-secondary via-secondary to-accent rounded-2xl p-8 md:p-12 mb-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
              Limited Seats Available
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
              Admissions Open 2025-26
            </h2>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Secure your child's future at Matru Bharati. Classes 3rd to 10th. 
              Special batch for competitive exam preparation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:9611215121"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-lg hover:bg-white/90 transition-all"
              >
                <Phone className="h-5 w-5" />
                Call Now: +91 9611215121
              </a>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div>
            <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
              Get in Touch
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Begin Your Child's <span className="text-primary">Success Journey</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Take the first step towards your child's bright future. Contact us for admission enquiries, 
              campus visits, or any questions about our programs.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Phone / WhatsApp</h4>
                  <a href="tel:9611215121" className="text-muted-foreground hover:text-secondary transition-colors">
                    +91 9611215121
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <a href="mailto:info@matrubharati.com" className="text-muted-foreground hover:text-secondary transition-colors">
                    info@matrubharati.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Location</h4>
                  <p className="text-muted-foreground">
                    Near Laxmi Temple, Khatak Chincholi<br />
                    Tq: Bhalki, Dist: Bidar<br />
                    Karnataka, India
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-muted rounded-xl h-48 flex items-center justify-center border border-border">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Google Maps Integration</p>
                <p className="text-xs text-muted-foreground/70">Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
              Request a Callback
            </h3>
            <p className="text-muted-foreground mb-6">
              Fill in your details and we'll get back to you within 24 hours.
            </p>

            {formSubmitted ? (
              <div className="bg-muted border border-border rounded-xl p-8 text-center">
                <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Thank You!</h4>
                <p className="text-muted-foreground">
                  We've received your enquiry and will contact you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Parent/Guardian Name *
                    </label>
                    <Input
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Child's Name *
                    </label>
                    <Input
                      name="childName"
                      value={formData.childName}
                      onChange={handleChange}
                      placeholder="Student name"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Current Class *
                    </label>
                    <select
                      name="currentClass"
                      value={formData.currentClass}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="">Select class</option>
                      <option value="3rd">3rd Class</option>
                      <option value="4th">4th Class</option>
                      <option value="5th">5th Class (Competitive Exam)</option>
                      <option value="6th">6th Class</option>
                      <option value="7th">7th Class</option>
                      <option value="8th">8th Class</option>
                      <option value="9th">9th Class</option>
                      <option value="10th">10th Class</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Message (Optional)
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any specific questions or requirements?"
                    rows={3}
                    className="bg-background"
                  />
                </div>

                <Button type="submit" variant="cta" size="lg" className="w-full">
                  Submit Enquiry
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to be contacted by our admissions team.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Admissions;
