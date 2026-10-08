import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth";
import { AppShell, AuthFrame, RequireAdmin, SessionGate } from "./shell";
import { SCREEN001 } from "./pages/SCREEN001";
import { SCREEN002 } from "./pages/SCREEN002";
import { SCREEN003 } from "./pages/SCREEN003";
import { SCREEN004 } from "./pages/SCREEN004";
import { SCREEN005 } from "./pages/SCREEN005";
import { SCREEN006 } from "./pages/SCREEN006";
import { SCREEN403 } from "./pages/SCREEN403";
import { SCREEN404 } from "./pages/SCREEN404";
import { SCREENOFFLINE } from "./pages/SCREENOFFLINE";

/** Routes generated from ui-spec. Shell owns nav, account name, and admin gating. */
export function App() {
  return (
    <SessionGate>
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<AppShell><SCREEN001 /></AppShell>} />
        <Route path="/posts/:id" element={<AppShell><SCREEN002 /></AppShell>} />
        <Route path="/signup" element={<AuthFrame><SCREEN003 /></AuthFrame>} />
        <Route path="/login" element={<AuthFrame><SCREEN004 /></AuthFrame>} />
        <Route path="/admin/posts/new" element={<RequireAuth><RequireAdmin><AppShell><SCREEN005 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/admin/posts/:id/edit" element={<RequireAuth><RequireAdmin><AppShell><SCREEN005 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/admin/posts/new and /admin/posts/:id/edit" element={<RequireAuth><RequireAdmin><AppShell><SCREEN005 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/admin/posts" element={<RequireAuth><RequireAdmin><AppShell><SCREEN006 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/403" element={<AppShell><SCREEN403 /></AppShell>} />
        <Route path="/404" element={<AppShell><SCREEN404 /></AppShell>} />
        <Route path="/offline" element={<AppShell><SCREENOFFLINE /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
    </SessionGate>
  );
}
