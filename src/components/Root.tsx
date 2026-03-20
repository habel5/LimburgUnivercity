import { Outlet, Link } from "react-router";
import { LogOut, Menu } from "lucide-react";
import imgWhite12 from "figma:asset/93ce601c3a15c1bda9ece7b02bdcafe207415acc.png";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { useState } from "react";
import { toast } from "sonner";

export default function Root() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Succesvol uitgelogd");
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#2c2a64]">
      {/* Header */}
      <header className="bg-[#2c2a64] border-b border-[#3d3a7e] sticky top-0 z-50">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex justify-between items-center h-[100px] sm:h-[120px] md:h-[149px]">
            <Link to="/" className="flex items-center">
              <img src={imgWhite12} alt="Limburg University" className="h-[50px] sm:h-[64px] md:h-[84px] w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
              <Link to="/" className="text-white text-[18px] xl:text-[20px] hover:text-[#8dc49f] transition-colors">
                Home
              </Link>
              <Link to="/toelichtingen" className="text-white text-[18px] xl:text-[20px] hover:text-[#8dc49f] transition-colors">
                Toelichtingen
              </Link>
              <Link to="/about" className="text-white text-[18px] xl:text-[20px] hover:text-[#8dc49f] transition-colors">
                Over
              </Link>
              {isAuthenticated && (
                <Link to="/admin" className="text-white text-[18px] xl:text-[20px] hover:text-[#8dc49f] transition-colors">
                  Admin
                </Link>
              )}
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-white text-[14px] xl:text-[16px]">Danny</span>
                  <button
                    onClick={handleLogout}
                    className="bg-[#211568] text-white text-[18px] xl:text-[20px] px-6 xl:px-8 py-2 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-[#2d1e8a] transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Uitloggen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-[#211568] text-white text-[18px] xl:text-[20px] px-6 xl:px-8 py-2 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-[#2d1e8a] transition-colors"
                >
                  Login
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 space-y-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white text-[18px] py-2 hover:text-[#8dc49f] transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/toelichtingen" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white text-[18px] py-2 hover:text-[#8dc49f] transition-colors"
              >
                Toelichtingen
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white text-[18px] py-2 hover:text-[#8dc49f] transition-colors"
              >
                Over
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white text-[18px] py-2 hover:text-[#8dc49f] transition-colors"
                >
                  Admin
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <div className="text-white text-[14px] py-2">Danny</div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-[#211568] text-white text-[18px] px-4 py-2 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-[#2d1e8a] transition-colors flex items-center gap-2"
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
                  className="w-full text-left bg-[#211568] text-white text-[18px] px-4 py-2 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-[#2d1e8a] transition-colors"
                >
                  Login
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
      <footer className="bg-[#2c2a64] border-t border-[#3d3a7e] mt-8 md:mt-16">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
          <p className="text-center text-gray-400 text-xs sm:text-sm">
            © 2026 Limburg University - Gemeente Uitdagingen Platform
          </p>
        </div>
      </footer>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
