import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeColorProvider } from "./context/ThemeColor.tsx";
import { JoinedBusinessProvider } from "./context/JoinedBusinessContext.tsx";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeColorProvider>
          <JoinedBusinessProvider>
            <App />
          </JoinedBusinessProvider>
        </ThemeColorProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
