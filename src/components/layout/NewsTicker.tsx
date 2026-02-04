import { Bell } from "lucide-react";

const NewsTicker = () => {
  const announcements = [
    "🎉 Admissions Open for 2025-26 Academic Year",
    "📅 School Launching on 15 May 2025",
    "🏆 Special Training for Sainik & Navodaya Entrance Exams",
    "📚 Limited Seats Available - Enroll Now!",
  ];

  return (
    <div className="fixed top-[80px] md:top-[120px] left-0 right-0 z-40 bg-secondary text-white py-2 overflow-hidden shadow-md">
      <div className="container mx-auto px-4 flex items-center">
        <div className="flex items-center gap-2 bg-foreground text-background px-2 sm:px-3 py-1 rounded-full shrink-0 mr-3 sm:mr-4">
          <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="font-semibold text-xs sm:text-sm">UPDATES</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll whitespace-nowrap inline-flex">
            {[...announcements, ...announcements].map((text, index) => (
              <span key={index} className="font-medium text-sm sm:text-base inline-block px-4 sm:px-8">
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
