import { Outlet } from "react-router-dom";
import { BackgroundLayers } from "./BackgroundLayers";
import { Sidebar } from "./Sidebar";

export function Shell() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <BackgroundLayers />
      <div className="app">
        <Sidebar />
        <main id="main-content" className="application-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
