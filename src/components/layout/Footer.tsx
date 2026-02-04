import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Programs", href: "#programs" },
    { name: "Facilities", href: "#facilities" },
    { name: "Admissions", href: "#admissions" },
    { name: "Contact", href: "#contact" },
  ];

  const programs = [
    { name: "Sainik School Prep", href: "#programs" },
    { name: "Navodaya Coaching", href: "#programs" },
    { name: "Kittur Schools", href: "#programs" },
    { name: "Morarji Desai", href: "#programs" },
    { name: "NMS Entrance", href: "#programs" },
  ];

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Matru Bharati" className="h-16 w-auto bg-white rounded-full p-1" />
              <div>
                <h3 className="font-serif text-xl font-bold">Matru Bharati</h3>
                <p className="text-sm text-primary-foreground/70">School & Coaching Center</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Building tomorrow's leaders through discipline, dedication, and academic excellence. 
              Preparing students for success in competitive examinations.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Our Programs</h4>
            <ul className="space-y-3">
              {programs.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <a href="tel:9611215121" className="hover:text-accent transition-colors">
                    +91 9611215121
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <a href="mailto:info@matrubharati.com" className="hover:text-accent transition-colors">
                  info@matrubharati.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <address className="not-italic text-primary-foreground/70 text-sm">
                  Near Laxmi Temple, Khatak Chincholi<br />
                  Tq: Bhalki, Dist: Bidar<br />
                  Karnataka, India
                </address>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© {currentYear} Matru Bharati School & Coaching Center. All rights reserved.</p>
            <p>Medium of Instruction: Kannada & English</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
