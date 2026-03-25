import { Outlet, Link, useLocation } from "react-router";
import { ArrowRight, LayoutGrid, LogOut, Menu, Plus } from "lucide-react";
import imgWhite12 from "figma:asset/93ce601c3a15c1bda9ece7b02bdcafe207415acc.png";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Root() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#2a2321]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2a2321]/95 backdrop-blur-xl">
        <div className="h-1 w-full bg-[linear-gradient(90deg,#ec644a_0%,#f56565_45%,#0b6168_100%)]" />
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="relative my-4 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:px-6 md:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,101,101,0.24),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(11,97,104,0.26),transparent_28%),linear-gradient(90deg,rgba(255,255,255,0.04),transparent_42%,rgba(255,255,255,0.02))]" />
            <div className="relative flex min-h-[92px] items-center justify-between gap-4 sm:min-h-[108px] md:min-h-[124px] xl:hidden">
              <Link to="/" className="flex min-w-0 items-center gap-3">
                <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <img src={imgWhite12} alt="Limburg University" className="h-[44px] sm:h-[54px] md:h-[64px] w-auto" />
                </div>
                <div className="hidden md:block">
                  <p className="text-[11px] uppercase tracking-[0.36em] text-[#f1a08f]">VISTA netwerk</p>
                  <p className="text-sm text-white/80">Cases, samenwerking en innovatie in Limburg</p>
                </div>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full border border-white/10 bg-white/5 p-3 text-white shadow-[0_16px_30px_rgba(0,0,0,0.16)]"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="relative hidden min-h-[92px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 sm:min-h-[108px] md:min-h-[124px] xl:grid 2xl:gap-6">
              <Link to="/" className="flex min-w-max items-center gap-3">
                <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <img src={imgWhite12} alt="Limburg University" className="h-[44px] sm:h-[54px] md:h-[64px] w-auto" />
                </div>
                <div className="hidden max-w-[240px] 2xl:block">
                  <p className="text-[11px] uppercase tracking-[0.36em] text-[#f1a08f]">VISTA netwerk</p>
                  <p className="text-sm text-white/80">Cases, samenwerking en innovatie in Limburg</p>
                </div>
              </Link>

              <nav className="mx-auto flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.16)] 2xl:gap-2 2xl:p-2">
                {navItems.map((item) => {
                  const isActive = isActivePath(item.to, item.exact);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-full px-3 py-2.5 text-[15px] transition-all xl:px-4 xl:text-[16px] 2xl:px-5 2xl:py-3 2xl:text-[18px] ${
                        isActive
                          ? "bg-[linear-gradient(135deg,#ec644a_0%,#f56565_100%)] text-white shadow-[0_12px_24px_rgba(236,100,74,0.35)]"
                          : "text-[#f7c3b7] hover:bg-[#ec644a]/14 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center justify-end gap-2 2xl:gap-4">
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2.5 text-[15px] transition-all xl:px-4 xl:text-[16px] 2xl:px-4 2xl:py-3 2xl:text-[17px] ${
                      isActivePath("/admin")
                        ? "border-[#0b6168] bg-[#0b6168] text-white shadow-[0_12px_26px_rgba(11,97,104,0.35)]"
                        : "border-[#0b6168]/45 bg-[#0b6168]/12 text-[#b9e8ea] hover:border-[#0b6168] hover:bg-[#0b6168]/20 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/add"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#0b6168] px-3 py-2.5 text-[15px] text-white shadow-[0_16px_30px_rgba(11,97,104,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#084f56] xl:px-4 xl:text-[16px] 2xl:px-5 2xl:py-3 2xl:text-[17px]"
                >
                  <Plus className="h-4 w-4" />
                  Plaats case
                </Link>
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 2xl:gap-4">
                    <div className="rounded-full border border-[#ec644a]/20 bg-[#ec644a]/10 px-3 py-2 text-right xl:px-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#f6b4a7]">Ingelogd als</p>
                      <span className="text-[13px] text-white xl:text-[14px] 2xl:text-[16px]">{user?.name || user?.email || "Admin"}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#1f1a19] px-3 py-2.5 text-[15px] text-white shadow-[0_18px_32px_rgba(0,0,0,0.16)] transition-all hover:border-white/20 hover:bg-[#3a2d29] xl:px-4 xl:text-[16px] 2xl:px-5 2xl:py-3 2xl:text-[17px]"
                    >
                      <LogOut className="w-4 h-4" />
                      Uitloggen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#1f1a19] px-3 py-2.5 text-[15px] text-white shadow-[0_18px_32px_rgba(0,0,0,0.16)] transition-all hover:border-white/20 hover:bg-[#3a2d29] xl:px-4 xl:text-[16px] 2xl:px-5 2xl:py-3 2xl:text-[17px]"
                  >
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="space-y-3 pb-5 xl:hidden">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                <div className="mb-3 rounded-[22px] bg-[linear-gradient(135deg,rgba(236,100,74,0.2),rgba(11,97,104,0.2))] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#f1a08f]">Platform</p>
                  <p className="mt-1 text-sm text-white/85">Werk samen aan Limburgse cases met VISTA-uitstraling.</p>
                </div>
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = isActivePath(item.to, item.exact);

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-2xl px-4 py-3 text-[18px] transition-all ${
                          isActive
                            ? "bg-[linear-gradient(135deg,#ec644a_0%,#f56565_100%)] text-white shadow-[0_12px_24px_rgba(236,100,74,0.3)]"
                            : "text-[#f7c3b7] hover:bg-[#ec644a]/14 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
              {isAuthenticated && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-2xl border border-[#0b6168]/40 bg-[#0b6168]/10 px-4 py-3 text-[18px] text-[#a8dde1] transition-all hover:border-[#0b6168] hover:bg-[#0b6168]/20 hover:text-white"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link
                to="/add"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0b6168] px-4 py-3 text-[18px] text-white shadow-[0_16px_30px_rgba(11,97,104,0.32)] transition-all hover:bg-[#084f56]"
              >
                <Plus className="h-4 w-4" />
                Plaats case
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl border border-[#ec644a]/20 bg-[#ec644a]/10 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#f6b4a7]">Ingelogd als</p>
                    <div className="pt-1 text-[14px] text-white">{user?.name || user?.email || "Admin"}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#1f1a19] px-4 py-3 text-left text-[18px] text-white shadow-[0_18px_32px_rgba(0,0,0,0.16)] transition-all hover:border-white/20 hover:bg-[#3a2d29]"
                  >
                    <LogOut className="w-4 h-4" />
                    Uitloggen
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#1f1a19] px-4 py-3 text-left text-[18px] text-white shadow-[0_18px_32px_rgba(0,0,0,0.16)] transition-all hover:border-white/20 hover:bg-[#3a2d29]"
                >
                  Login
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#2a2321] border-t border-[#4b3a36] mt-8 md:mt-16">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
          <p className="text-center text-gray-400 text-xs sm:text-sm">
            © 2026 Limburg University - Cases Platform
          </p>
        </div>
      </footer>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
