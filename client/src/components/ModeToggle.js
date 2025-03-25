import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react"; // Use Lucide icons (similar to the provided document)

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <button
        className="p-2 border border-border rounded-md hover:bg-secondary transition-colors"
        onClick={() => {
          document.getElementById("theme-dropdown").classList.toggle("hidden");
        }}
      >
        <Sun className={`h-5 w-5 ${theme === "dark" ? "hidden" : "block"}`} />
        <Moon className={`h-5 w-5 ${theme === "dark" ? "block" : "hidden"}`} />
        <span className="sr-only">Toggle theme</span>
      </button>
      <div
        id="theme-dropdown"
        className="hidden absolute right-0 mt-2 w-32 bg-card border border-border rounded-md shadow-lg z-10"
      >
        <button
          onClick={() => setTheme("light")}
          className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
        >
          Dark
        </button>
        <button
          onClick={() => setTheme("system")}
          className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
        >
          System
        </button>
      </div>
    </div>
  );
}