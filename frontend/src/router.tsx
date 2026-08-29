import { createBrowserRouter, Navigate } from "react-router-dom";
import { Shell } from "./components/Shell";
import { OverviewPage } from "./pages/OverviewPage";
import { SpillAnalysisPage } from "./pages/SpillAnalysisPage";
import { VesselsPage } from "./pages/VesselsPage";
import { DriftPage } from "./pages/DriftPage";
import { EvidencePage } from "./pages/EvidencePage";
import { ProbabilityPage } from "./pages/ProbabilityPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview",    element: <OverviewPage /> },
      { path: "spill",       element: <SpillAnalysisPage /> },
      { path: "vessels",     element: <VesselsPage /> },
      { path: "drift",       element: <DriftPage /> },
      { path: "evidence",    element: <EvidencePage /> },
      { path: "probability", element: <ProbabilityPage /> },
      { path: "*",           element: <Navigate to="/overview" replace /> },
    ],
  },
]);
