import React from "react";
import AppRoutes from "./routes/AppRoutes";
import "./fonts.css";
import { createTheme, ThemeProvider } from "@mui/material";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "./context/SidebarContext";
import MobileOnlyGuard from "./components/MobileOnlyGuard/MobileOnlyGuard";
import PwaInstallPrompt from "./components/PwaInstallPrompt/PwaInstallPrompt";

const App: React.FC = () => {
  const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [rtlPlugin],
  });

  const theme = createTheme({
    direction: "rtl",
    typography: {
      fontFamily: "myCustomFont",
    },
    palette: {
      primary: {
        main: "#19705D",
        contrastText: "#fff",
      },
      secondary: {
        main: "#14584b",
      },
    },
  });

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <SidebarProvider>
          <MobileOnlyGuard>
            <AppRoutes />
            <PwaInstallPrompt />
            <Toaster position="top-center" />
          </MobileOnlyGuard>
        </SidebarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
