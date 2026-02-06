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
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
