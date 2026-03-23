import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { Lightbulb, Users, Target, TrendingUp, MapPin, Briefcase, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { projectId, publicAnonKey } from '../config/env';
import { Listing } from "../lib/supabase";
import { ListingCard } from "./ListingCard";

// Counter animation hook
function useCounter(end: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted || end === 0) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * end);
      
      setCount(current);

      if (now >= endTime) {
        setCount(end);
        clearInterval(timer);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration, hasStarted]);

  return { count, start: () => setHasStarted(true) };
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stats, setStats] = useState({ challenges: 0, proposals: 0, municipalities: 0 });
  const [recentChallenges, setRecentChallenges] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize counters
  const challengesCounter = useCounter(stats.challenges, 2000);
  const proposalsCounter = useCounter(stats.proposals, 2000);
  const municipalitiesCounter = useCounter(stats.municipalities, 2000);

  useEffect(() => {
    fetchStats();
    fetchRecentChallenges();
  }, []);

  // Start counters when stats are loaded
  useEffect(() => {
    if (stats.challenges > 0 || stats.proposals > 0 || stats.municipalities > 0) {
      // Small delay to make it feel more natural
      setTimeout(() => {
        challengesCounter.start();
        proposalsCounter.start();
        municipalitiesCounter.start();
      }, 300);
    }
  }, [stats]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Error response from server:', response.status, response.statusText);
        // Keep default stats (all 0)
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default stats (all 0)
    }
  };

  const fetchRecentChallenges = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges?limit=3`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentChallenges(data);
      } else {
        console.error('Error response from server:', response.status, response.statusText);
        setRecentChallenges([]);
      }
    } catch (error) {
      console.error('Error fetching recent challenges:', error);
      // Set empty array so UI doesn't break
      setRecentChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceChallenge = () => {
    if (isAuthenticated) {
      navigate('/add');
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#2c2a64] via-[#2c2a64] to-[#1f1d4a] min-h-screen">
      {/* Hero Section */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-28 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#8dc49f] opacity-[0.03] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-[#8dc49f] opacity-[0.03] rounded-full blur-3xl"></div>
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#8dc49f]/10 border border-[#8dc49f]/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#8dc49f]" />
            <span className="text-[#8dc49f] text-[14px] font-medium">Limburg University × Gemeentes</span>
          </div>
          
          <h1 className="text-white font-bold text-[40px] sm:text-[50px] md:text-[72px] leading-[1.1] mb-6 animate-fade-in">
            Verbind Gemeentes met <span className="bg-gradient-to-r from-[#8dc49f] to-[#a8e4b5] bg-clip-text text-transparent">Innovatieve Oplossingen</span>
          </h1>
          <p className="text-gray-300 text-[18px] sm:text-[20px] md:text-[24px] mb-12 leading-relaxed opacity-90 max-w-3xl mx-auto">
            Een platform waar maatschappelijke uitdagingen van Limburgse gemeentes samenkomen met de kennis en creativiteit van Limburg University
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/cases')}
              className="bg-gradient-to-r from-[#8dc49f] to-[#7ab88d] hover:from-[#7ab88d] hover:to-[#6aa77d] text-white text-[18px] px-8 h-[56px] rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold group"
            >
              Ontdek Cases
              <ArrowRight className="w-5 h-5 ml-2 inline transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              onClick={handlePlaceChallenge}
              className="bg-white hover:bg-gray-50 text-[#2c2a64] text-[18px] px-8 h-[56px] rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold"
            >
              Plaats een Case
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section with gradient background */}
      <div className="bg-gradient-to-b from-[#211568] via-[#1d1257] to-[#211568] py-16 md:py-20 relative overflow-hidden">
        {/* Decorative gradient circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8dc49f] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8dc49f] opacity-5 rounded-full blur-3xl"></div>
        
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center transition-all duration-500 hover:scale-105 bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
              <div className="text-[#8dc49f] text-[48px] md:text-[72px] font-bold mb-2 bg-gradient-to-br from-[#8dc49f] to-[#a8e4b5] bg-clip-text text-transparent">
                {challengesCounter.count}
              </div>
              <div className="text-white text-[18px] md:text-[20px] opacity-90 font-medium">Actieve Cases</div>
            </div>
            <div className="text-center transition-all duration-500 hover:scale-105 bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
              <div className="text-[#8dc49f] text-[48px] md:text-[72px] font-bold mb-2 bg-gradient-to-br from-[#8dc49f] to-[#a8e4b5] bg-clip-text text-transparent">
                {proposalsCounter.count}
              </div>
              <div className="text-white text-[18px] md:text-[20px] opacity-90 font-medium">Ingediende Challenges</div>
            </div>
            <div className="text-center transition-all duration-500 hover:scale-105 bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
              <div className="text-[#8dc49f] text-[48px] md:text-[72px] font-bold mb-2 bg-gradient-to-br from-[#8dc49f] to-[#a8e4b5] bg-clip-text text-transparent">
                {municipalitiesCounter.count}
              </div>
              <div className="text-white text-[18px] md:text-[20px] opacity-90 font-medium">Deelnemende Gemeentes</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - More Visual */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-white font-bold text-[36px] md:text-[48px] mb-4">
            Hoe werkt het?
          </h2>
          <p className="text-gray-300 text-[18px] md:text-[20px] opacity-80 max-w-2xl mx-auto">
            Van uitdaging tot oplossing in drie eenvoudige stappen
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connection arrows for desktop */}
          <div className="hidden md:block absolute top-[80px] left-[33%] w-[15%] h-[2px] bg-gradient-to-r from-[#8dc49f] to-transparent opacity-30"></div>
          <div className="hidden md:block absolute top-[80px] right-[33%] w-[15%] h-[2px] bg-gradient-to-r from-transparent to-[#8dc49f] opacity-30"></div>
          
          <div className="bg-gradient-to-br from-[#211568] to-[#1a1050] p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#8dc49f]/20 relative group">
            {/* Step number */}
            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-[20px]">
              1
            </div>
            
            <div className="bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto group-hover:rotate-6 transition-transform duration-300">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-[22px] md:text-[26px] mb-4 text-center">
              Gemeente plaatst case
            </h3>
            <p className="text-gray-300 text-[16px] md:text-[18px] opacity-80 text-center leading-relaxed">
              Gemeentes delen hun maatschappelijke uitdagingen en vragen om innovatieve ideeën
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#211568] to-[#1a1050] p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#8dc49f]/20 relative group">
            {/* Step number */}
            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-[20px]">
              2
            </div>
            
            <div className="bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto group-hover:rotate-6 transition-transform duration-300">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-[22px] md:text-[26px] mb-4 text-center">
              Docenten dienen challenges in
            </h3>
            <p className="text-gray-300 text-[16px] md:text-[18px] opacity-80 text-center leading-relaxed">
              Docenten reageren met creatieve voorstellen en kunnen interesse tonen voor samenwerking
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#211568] to-[#1a1050] p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#8dc49f]/20 relative group">
            {/* Step number */}
            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-[20px]">
              3
            </div>
            
            <div className="bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto group-hover:rotate-6 transition-transform duration-300">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-[22px] md:text-[26px] mb-4 text-center">
              Samen naar resultaat
            </h3>
            <p className="text-gray-300 text-[16px] md:text-[18px] opacity-80 text-center leading-relaxed">
              Door samenwerking ontstaan concrete oplossingen voor lokale uitdagingen
            </p>
          </div>
        </div>
      </div>

      {/* Recent Challenges */}
      {!loading && recentChallenges.length > 0 && (
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-white font-bold text-[32px] md:text-[42px] mb-2">
                Recente Cases
              </h2>
              <p className="text-gray-300 text-[16px] md:text-[18px] opacity-80">
                Bekijk de nieuwste uitdagingen van gemeentes
              </p>
            </div>
            <Button 
              onClick={() => navigate('/cases')}
              className="bg-[#8dc49f] hover:bg-[#7ab88d] text-white rounded-[8px] px-6 h-[48px] group"
            >
              Bekijk Alle
              <ArrowRight className="w-4 h-4 ml-2 inline transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recentChallenges.map((challenge) => (
              <ListingCard key={challenge.id} listing={challenge} />
            ))}
          </div>
        </div>
      )}

      {/* Features Section - Icon Grid */}
      <div className="bg-gradient-to-b from-[#211568] to-[#1a1050] py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#8dc49f] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#8dc49f] opacity-5 rounded-full blur-3xl"></div>
        
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-white font-bold text-[36px] md:text-[48px] mb-4">
              Waarom dit platform?
            </h2>
            <p className="text-gray-300 text-[18px] md:text-[20px] opacity-80 max-w-2xl mx-auto">
              Samen bouwen aan een beter Limburg
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-6xl mx-auto">
            <div className="text-center group bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-[#8dc49f]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-[20px] md:text-[22px] mb-3">
                Lokale Impact
              </h3>
              <p className="text-gray-300 text-[14px] md:text-[16px] opacity-70">
                Direct bijdragen aan je regio
              </p>
            </div>

            <div className="text-center group bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-[#8dc49f]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-[20px] md:text-[22px] mb-3">
                Praktijkervaring
              </h3>
              <p className="text-gray-300 text-[14px] md:text-[16px] opacity-70">
                Werk aan echte cases
              </p>
            </div>

            <div className="text-center group bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-[#8dc49f]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-[20px] md:text-[22px] mb-3">
                Innovatieve Oplossingen
              </h3>
              <p className="text-gray-300 text-[14px] md:text-[16px] opacity-70">
                Creatieve aanpak van uitdagingen
              </p>
            </div>

            <div className="text-center group bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-[#8dc49f]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#8dc49f] to-[#7ab88d] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-[20px] md:text-[22px] mb-3">
                Sterke Samenwerking
              </h3>
              <p className="text-gray-300 text-[14px] md:text-[16px] opacity-70">
                Verbinding tussen kennis en praktijk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="bg-gradient-to-br from-[#211568] to-[#1a1050] rounded-2xl p-10 md:p-16 text-center shadow-2xl border border-[#8dc49f]/20 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8dc49f] opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8dc49f] opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#8dc49f]/10 border border-[#8dc49f]/20 rounded-full px-4 py-2 mb-6">
              <CheckCircle2 className="w-4 h-4 text-[#8dc49f]" />
              <span className="text-[#8dc49f] text-[14px] font-medium">Gratis en toegankelijk</span>
            </div>
            
            <h2 className="text-white font-bold text-[36px] md:text-[48px] mb-6">
              Klaar om bij te dragen?
            </h2>
            <p className="text-gray-300 text-[18px] md:text-[22px] mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Word onderdeel van de oplossing en maak samen met ons het verschil in Limburg
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/cases')}
                className="bg-gradient-to-r from-[#8dc49f] to-[#7ab88d] hover:from-[#7ab88d] hover:to-[#6aa77d] text-white text-[18px] px-8 h-[56px] rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold group"
              >
                Ontdek Cases
                <ArrowRight className="w-5 h-5 ml-2 inline transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                onClick={handlePlaceChallenge}
                className="bg-white hover:bg-gray-50 text-[#2c2a64] text-[18px] px-8 h-[56px] rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold"
              >
                Plaats een Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        redirectTo="/add"
      />
    </div>
  );
}
