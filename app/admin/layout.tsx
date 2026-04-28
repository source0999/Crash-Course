/** @file app/admin/layout.tsx */

// ─────────────────────────────────────────
// SECTION: AdminLayout
// WHAT: Soft shell around every /admin/* route (login, dashboard, gallery, services).
// WHY: Separates admin chrome from the public site so cards can stay white-on-muted
//   without the full viewport flashing pure white.
// PHASE 4: No DB — layout-only.
// ─────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-theme-2 text-theme-4 antialiased">
      {children}
    </div>
  );
}
