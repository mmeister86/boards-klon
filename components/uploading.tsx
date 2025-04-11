// components/Loader.tsx
import React from "react";

const UpLoader: React.FC = () => {
  // Basiskonstanten für Lesbarkeit (optional)
  const circleBaseClasses =
    "w-5 h-5 absolute rounded-full bg-gray-800 origin-center animate-bounce-circle"; // bg-gray-800 statt weiß für Sichtbarkeit
  const shadowBaseClasses =
    "w-5 h-1 absolute rounded-full bg-black/50 origin-center -z-10 blur-[1px] animate-shrink-shadow"; // bg-black/50 für angepassten Schatten

  return (
    // Wrapper Div
    <div className="relative w-[200px] h-[60px] z-10">
      {/* Circles */}
      <div
        className={`${circleBaseClasses} left-[15%]`}
        // Keine Verzögerung für das erste Element
      ></div>
      <div
        className={`${circleBaseClasses} left-[45%]`}
        style={{ animationDelay: "0.2s" }} // Inline-Style für Verzögerung
      ></div>
      <div
        className={`${circleBaseClasses} left-auto right-[15%]`} // Position von rechts
        style={{ animationDelay: "0.3s" }} // Inline-Style für Verzögerung
      ></div>

      {/* Shadows */}
      <div
        className={`${shadowBaseClasses} left-[15%] top-[62px]`}
        // Keine Verzögerung für das erste Element
      ></div>
      <div
        className={`${shadowBaseClasses} left-[45%] top-[62px]`}
        style={{ animationDelay: "0.2s" }} // Inline-Style für Verzögerung
      ></div>
      <div
        className={`${shadowBaseClasses} left-auto right-[15%] top-[62px]`} // Position von rechts
        style={{ animationDelay: "0.3s" }} // Inline-Style für Verzögerung
      ></div>
    </div>
  );
};

export default UpLoader;
