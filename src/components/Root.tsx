import { Outlet, Link, useLocation } from "react-router";
import { ArrowRight, LayoutGrid, LogOut, Menu, Plus } from "lucide-react";
import imgWhite12 from "../assets/logo-limburg.png";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Root() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canCreateCase = user?.role === "gemeente" || user?.role === "admin";
  const isAdmin = user?.role === "admin";
  const displayName =
    user?.role === "onderwijs"
      ? "Onderwijs"
      : user?.name || user?.email || "Admin";

  const navItems = [
    { to: "/", label: "Home", exact: true },
    { to: "/cases", label: "Cases" },
    { to: "/about", label: "Over" },
  ];

  const isActivePath = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Succesvol uitgelogd");
    setMobileMenuOpen(false);
  };

  return (
    <div className="vista-page min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0b6168]">
        <div className="mx-auto max-w-[1536px] px-4 sm:px-6 md:px-12">
          {/* Desktop */}
          <div className="hidden h-[60px] items-center justify-between gap-6 xl:flex">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <img src={imgWhite12} alt="Limburg University" className="h-[36px] w-auto brightness-0 invert" />
            </Link>

            <nav className="flex h-full items-center gap-1">
              {navItems.map((item) => {
                const isActive = isActivePath(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex h-full items-center border-b-[3px] px-4 text-[15px] font-medium text-white transition-colors ${
                      isActive
                        ? "border-white"
                        : "border-transparent hover:border-white/50 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-[14px] font-medium transition-colors ${
                    isActivePath("/admin")
                      ? "bg-white text-[#0b6168]"
                      : "text-white hover:bg-white/15"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Admin
                </Link>
              )}
              {canCreateCase && (
                <Link
                  to="/add"
                  className="inline-flex items-center gap-2 rounded bg-white px-3 py-1.5 text-[14px] font-medium text-[#0b6168] transition-colors hover:bg-white/90"
                >
                  <Plus className="h-4 w-4" />
                  Plaats case
                </Link>
              )}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-white/80">{displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded border border-white/30 px-3 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-white/15"
                  >
                    <LogOut className="h-4 w-4" />
                    Uitloggen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-2 rounded border border-white/30 px-3 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-white/15"
                >
                  Login
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="flex h-[56px] items-center justify-between xl:hidden">
            <Link to="/" className="flex items-center gap-3">
              <img src={imgWhite12} alt="Limburg University" className="h-[32px] w-auto brightness-0 invert" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/15 rounded"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-white/20 bg-[#0b6168] xl:hidden">
            <div className="mx-auto max-w-[1536px] px-4 py-3 sm:px-6">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = isActivePath(item.to, item.exact);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded px-3 py-2.5 text-[16px] font-medium text-white transition-colors ${
                        isActive ? "bg-white/20" : "hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-3 space-y-1 border-t border-white/20 pt-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2.5 text-[16px] font-medium text-white hover:bg-white/10"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                {canCreateCase && (
                  <Link
                    to="/add"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded bg-white px-3 py-2.5 text-[16px] font-medium text-[#0b6168]"
                  >
                    <Plus className="h-4 w-4" />
                    Plaats case
                  </Link>
                )}
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-[14px] text-white/70">{displayName}</div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded px-3 py-2.5 text-left text-[16px] font-medium text-white hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                    className="flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-[16px] font-medium text-white hover:bg-white/10"
                  >
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-[#0b6168]/10 bg-[rgba(255,250,245,0.9)] md:mt-16">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
          <p className="text-center text-[#567073] text-xs sm:text-sm">
            © 2026 Limburg University - Cases Platform
          </p>
        </div>
      </footer>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
