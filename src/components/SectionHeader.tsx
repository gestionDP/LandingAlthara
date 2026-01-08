interface SectionHeaderProps {
  letter: string;
  title: string;
  className?: string;
  variant?: "light" | "dark";
}

export default function SectionHeader({
  letter,
  title,
  className = "",
  variant = "light",
}: SectionHeaderProps) {
  const isDark = variant === "dark";

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`w-8 h-8 border-1 ${
          isDark ? "border-white" : "border-black"
        } flex items-center justify-center`}
      >
        <span
          className={`${
            isDark ? "text-white" : "text-black"
          } font-normal text-sm`}
        >
          {letter}
        </span>
      </div>
      <h2
        className={`${
          isDark ? "text-white" : "text-black"
        } text-sm font-normal tracking-wider uppercase`}
      >
        {title}
      </h2>
      <div
        className={`flex-1 h-px ${isDark ? "bg-white" : "bg-gray-600"} ml-4`}
      ></div>
    </div>
  );
}
