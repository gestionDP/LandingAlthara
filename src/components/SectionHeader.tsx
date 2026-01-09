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
          isDark ? "border-[#e6e2d7]" : "border-[#e6e2d7]"
        } flex items-center justify-center`}
      >
        <span
          className={`${
            isDark ? "text-[#e6e2d7]" : "text-[#e6e2d7]"
          } font-normal text-sm`}
        >
          {letter}
        </span>
      </div>
      <h2
        className={`${
          isDark ? "text-[#e6e2d7]" : "text-[#e6e2d7]"
        } text-sm font-normal tracking-wider uppercase`}
      >
        {title}
      </h2>
      <div
        className={`flex-1 h-px ${isDark ? "bg-[#e6e2d7]" : "bg-[#e6e2d7]/20"} ml-4`}
      ></div>
    </div>
  );
}
