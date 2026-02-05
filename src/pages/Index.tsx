import Header from "@/components/layout/Header";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Programs from "@/components/sections/Programs";
import Facilities from "@/components/sections/Facilities";
import Testimonials from "@/components/sections/Testimonials";
import Admissions from "@/components/sections/Admissions";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { LoginForm } from "@/components/auth/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta handled in index.html */}
      
      <Header />
      <NewsTicker />
      
      <main>
        <Hero />
        <WhyChooseUs />
        <Programs />
        <Facilities />
        <Testimonials />
        <Admissions />
        
        {/* Login Section */}
        <section id="login" className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Portal Login
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Access your academic dashboard. Students, parents, teachers, and administrators can log in here.
              </p>
            </div>
            <div className="flex justify-center">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
