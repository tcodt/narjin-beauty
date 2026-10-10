import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type ThemeColorName =
  | "primary-green"
  | "orange"
  | "blue"
  | "red"
  | "green"
  | "purple"
  | "yellow";

interface ThemeColorContextType {
  themeColor: ThemeColorName;
  setThemeColor: (color: ThemeColorName) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(
  undefined,
);

const COLOR_MAP: Record<ThemeColorName, string> = {
  "primary-green": "#19705D",
  orange: "#f97316",
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
  purple: "#a855f7",
  yellow: "#eab308",
};

export const ThemeColorProvider = ({ children }: { children: ReactNode }) => {
  const [themeColor, setThemeColor] = useState<ThemeColorName>(() => {
    const saved = localStorage.getItem("themeColor") as ThemeColorName | null;
    return saved && COLOR_MAP[saved] ? saved : "primary-green";
  });

  useEffect(() => {
    localStorage.setItem("themeColor", themeColor);
    document.documentElement.style.setProperty(
      "--theme-color",
      COLOR_MAP[themeColor],
    );
    document.documentElement.setAttribute("data-theme", themeColor);
  }, [themeColor]);

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
};

export const useThemeColor = (): ThemeColorContextType => {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
};
