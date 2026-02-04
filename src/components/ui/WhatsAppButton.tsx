import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "919611215121";
  const message = encodeURIComponent("Hello! I am interested in admission at Matru Bharati School. Please provide more information.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 animate-float"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative group">
        {/* Pulse ring */}
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25" />
        
        {/* Button */}
        <div className="relative w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
          <MessageCircle className="h-8 w-8 text-white fill-white" />
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-card text-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with us
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-card" />
        </div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
