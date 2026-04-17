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
      <header className="sticky top-0 z-50 border-b border-[#0b6168]/10 bg-[rgba(255,250,245,0.94)] backdrop-blur-xl">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="relative my-3 overflow-hidden rounded-[24px] border border-[#ec644a]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,240,232,0.94))] px-4 py-3 shadow-[0_14px_34px_rgba(36,53,55,0.06)] sm:px-5 md:px-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[36%] bg-[linear-gradient(135deg,rgba(236,100,74,0.14),transparent_72%)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[34%] bg-[linear-gradient(225deg,rgba(11,97,104,0.14),transparent_70%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,100,74,0.1),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(11,97,104,0.1),transparent_22%)]" />
            <div className="relative flex min-h-[68px] items-center justify-between gap-4 sm:min-h-[74px] md:min-h-[82px] xl:hidden">
              <Link to="/" className="flex min-w-0 items-center gap-3">
                <div className="shrink-0 rounded-[18px] border border-[#0b6168]/18 bg-[linear-gradient(135deg,#1f4f54_0%,#0b6168_100%)] px-2.5 py-1.5 shadow-[0_10px_24px_rgba(36,53,55,0.12)]">
                  <img src={imgWhite12} alt="Limburg University" className="h-[34px] sm:h-[40px] md:h-[46px] w-auto" />
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#ec644a]">VISTA netwerk</p>
                  <p className="text-[13px] text-[#466164]">Cases, samenwerking en innovatie in Limburg</p>
                </div>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-[16px] border border-[#ec644a]/14 bg-[#fff4ef] p-2.5 text-[#ec644a] shadow-[0_10px_24px_rgba(36,53,55,0.06)] hover:bg-[#ffe9df]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="relative hidden min-h-[68px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 sm:min-h-[74px] md:min-h-[82px] xl:grid 2xl:gap-5">
              <Link to="/" className="flex min-w-max items-center gap-3">
                <div className="shrink-0 rounded-[18px] border border-[#0b6168]/18 bg-[linear-gradient(135deg,#1f4f54_0%,#0b6168_100%)] px-2.5 py-1.5 shadow-[0_10px_24px_rgba(36,53,55,0.12)]">
                  <img src={imgWhite12} alt="Limburg University" className="h-[34px] sm:h-[40px] md:h-[46px] w-auto" />
                </div>
                <div className="hidden max-w-[220px] 2xl:block">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#ec644a]">VISTA netwerk</p>
                  <p className="text-[13px] text-[#466164]">Cases, samenwerking en innovatie in Limburg</p>
                </div>
              </Link>

              <nav className="mx-auto flex min-w-0 max-w-full items-center gap-1 rounded-[18px] border border-[#ec644a]/14 bg-[linear-gradient(90deg,rgba(255,241,236,0.96),rgba(255,255,255,0.94))] p-1 shadow-[0_10px_24px_rgba(36,53,55,0.06)] 2xl:gap-1.5 2xl:p-1.5">
                {navItems.map((item) => {
                  const isActive = isActivePath(item.to, item.exact);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-[14px] px-3 py-2 text-[14px] font-semibold transition-all xl:px-3.5 xl:text-[15px] 2xl:px-4 2xl:text-[16px] ${
                        isActive
                          ? "bg-[#ec644a] text-white shadow-[0_8px_18px_rgba(236,100,74,0.22)]"
                          : item.to === "/about"
                            ? "text-[#0b6168] hover:bg-[#0b6168]/10 hover:text-[#084f56]"
                            : "text-[#325457] hover:bg-[#ec644a]/10 hover:text-[#ec644a]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center justify-end gap-2 rounded-[18px] border border-[#0b6168]/10 bg-[linear-gradient(90deg,rgba(238,247,246,0.95),rgba(255,255,255,0.94))] px-2 py-1.5 shadow-[0_10px_24px_rgba(36,53,55,0.05)] 2xl:gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-[16px] border px-3 py-2 text-[14px] font-semibold transition-all xl:px-3.5 xl:text-[15px] 2xl:px-4 2xl:text-[16px] ${
                      isActivePath("/admin")
                        ? "border-[#0b6168] bg-[#0b6168] text-white shadow-[0_10px_20px_rgba(11,97,104,0.22)]"
                        : "border-[#0b6168]/20 bg-[#eef7f6] text-[#0b6168] hover:border-[#0b6168] hover:bg-[#d9efed] hover:text-[#084f56]"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                {canCreateCase && (
                  <Link
                    to="/add"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-[16px] bg-[linear-gradient(135deg,#0b6168_0%,#14747c_100%)] px-3 py-2 text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(11,97,104,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#084f56] xl:px-3.5 xl:text-[15px] 2xl:px-4 2xl:text-[16px]"
                  >
                    <Plus className="h-4 w-4" />
                    Plaats case
                  </Link>
                )}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 2xl:gap-3">
                    <div className="rounded-[16px] border border-[#ec644a]/14 bg-[linear-gradient(135deg,#fff3ec_0%,#fff9f6_100%)] px-3 py-2 text-right xl:px-3.5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#ec644a]">Ingelogd als</p>
                      <span className="text-[12px] font-medium text-[#243537] xl:text-[13px] 2xl:text-[14px]">{displayName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 whitespace-nowrap rounded-[16px] border border-[#ec644a]/12 bg-white px-3 py-2 text-[14px] font-semibold text-[#204448] shadow-[0_10px_20px_rgba(36,53,55,0.06)] transition-all hover:border-[#ec644a]/20 hover:bg-[#fff4ef] xl:px-3.5 xl:text-[15px] 2xl:px-4 2xl:text-[16px]"
                    >
                      <LogOut className="w-4 h-4" />
                      Uitloggen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-[16px] border border-[#ec644a]/12 bg-[#fff4ef] px-3 py-2 text-[14px] font-semibold text-[#ec644a] shadow-[0_10px_20px_rgba(36,53,55,0.06)] transition-all hover:border-[#ec644a]/24 hover:bg-[#ffe9df] xl:px-3.5 xl:text-[15px] 2xl:px-4 2xl:text-[16px]"
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
              <div className="rounded-[24px] border border-[#ec644a]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,240,232,0.94))] p-3 shadow-[0_18px_40px_rgba(36,53,55,0.08)]">
                <div className="mb-3 rounded-[18px] bg-[linear-gradient(135deg,rgba(236,100,74,0.18),rgba(11,97,104,0.14))] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#ec644a]">Platform</p>
                  <p className="mt-1 text-sm text-[#2f4a4d]">Werk samen aan Limburgse cases met VISTA-uitstraling.</p>
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
                            : item.to === "/about"
                              ? "text-[#0b6168] hover:bg-[#0b6168]/10 hover:text-[#084f56]"
                              : "text-[#325457] hover:bg-[#ec644a]/10 hover:text-[#ec644a]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-2xl border border-[#0b6168]/20 bg-[#eef7f6] px-4 py-3 text-[18px] text-[#0b6168] transition-all hover:border-[#0b6168] hover:bg-[#d9efed] hover:text-[#084f56]"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Admin
                </Link>
              )}
              {canCreateCase && (
                <Link
                  to="/add"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#0b6168] px-4 py-3 text-[18px] text-white shadow-[0_16px_30px_rgba(11,97,104,0.32)] transition-all hover:bg-[#084f56]"
                >
                  <Plus className="h-4 w-4" />
                  Plaats case
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl border border-[#ec644a]/20 bg-[#ec644a]/10 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#ec644a]">Ingelogd als</p>
                    <div className="pt-1 text-[14px] text-[#243537]">{displayName}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-2xl border border-[#204448]/12 bg-white px-4 py-3 text-left text-[18px] text-[#204448] shadow-[0_18px_32px_rgba(36,53,55,0.07)] transition-all hover:border-[#204448]/20 hover:bg-[#eef7f6]"
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
                  className="flex w-full items-center justify-between rounded-2xl border border-[#ec644a]/12 bg-[#fff4ef] px-4 py-3 text-left text-[18px] font-semibold text-[#ec644a] shadow-[0_18px_32px_rgba(36,53,55,0.07)] transition-all hover:border-[#ec644a]/24 hover:bg-[#ffe9df]"
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
