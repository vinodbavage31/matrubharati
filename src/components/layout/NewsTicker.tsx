import { Bell } from "lucide-react";

const NewsTicker = () => {
  const announcements = [
    "🎉 Admissions Open for 2025-26 Academic Year",
    "📅 School Launching on 15 May 2025",
    "🏆 Special Training for Sainik & Navodaya Entrance Exams",
    "📚 Limited Seats Available - Enroll Now!",
  ];

  return (
    <div className="bg-secondary text-secondary-foreground py-2 overflow-hidden mt-[88px] md:mt-[128px]">
      <div className="container mx-auto px-4 flex items-center">
        <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded-full shrink-0 mr-4">
          <Bell className="h-4 w-4" />
          <span className="font-semibold text-sm">UPDATES</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap flex gap-16">
            {[...announcements, ...announcements].map((text, index) => (
              <span key={index} className="font-medium">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
