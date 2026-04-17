import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { Lightbulb, Users, Target, TrendingUp, MapPin, Briefcase, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { projectId, publicAnonKey } from '../config/env';
import { Listing } from "../lib/supabase";
import { ListingCard } from "./ListingCard";
import { toast } from "sonner";

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
  const { isAuthenticated, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stats, setStats] = useState({ challenges: 0, proposals: 0, municipalities: 0 });
  const [recentChallenges, setRecentChallenges] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize counters
  const challengesCounter = useCounter(stats.challenges, 2000);
  const proposalsCounter = useCounter(stats.proposals, 2000);
  const municipalitiesCounter = useCounter(stats.municipalities, 2000);

  useEffect(() => {
    fetchHomeData();
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

  const fetchHomeData = async () => {
    try {
      const [statsResponse, challengesResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/stats`,
          {
            headers: {
              'apikey': publicAnonKey,
            },
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges?limit=3`,
          {
            headers: {
              'apikey': publicAnonKey,
            },
          }
        ),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.error('Error response from stats endpoint:', statsResponse.status, statsResponse.statusText);
      }

      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json();
        setRecentChallenges(Array.isArray(challengesData) ? challengesData : []);
      } else {
        console.error('Error response from challenges endpoint:', challengesResponse.status, challengesResponse.statusText);
        setRecentChallenges([]);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      setRecentChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceChallenge = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (user?.role === 'gemeente' || user?.role === 'admin') {
      navigate('/add');
    } else {
      toast.error('Alleen gemeente- en adminaccounts kunnen cases plaatsen');
    }
  };

  return (
    <div className="vista-page min-h-screen">
      {/* Hero Section */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-28 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#0b6168] opacity-[0.08] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-[#ec644a] opacity-[0.08] rounded-full blur-3xl"></div>
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div>
            <div className="vista-kicker mb-6">
              <Sparkles className="w-4 h-4 text-[#0b6168]" />
              <span className="text-[#0b6168] text-[14px] font-medium">Limburg University × Gemeenten</span>
            </div>
            
            <h1 className="vista-heading text-[#204448] font-bold text-[40px] sm:text-[50px] md:text-[72px] leading-[0.98] mb-6 uppercase animate-fade-in">
              De stad is <br />
              <span className="text-[#ec644a]">onze leerschool</span>
            </h1>
            <p className="text-[#486467] text-[18px] sm:text-[20px] md:text-[24px] mb-10 leading-relaxed max-w-3xl mx-auto">
              Samen leren, samen werken en samen impact maken. Deze omgeving brengt Limburgse cases, onderwijs en praktijk dichter bij elkaar in een lichte VISTA-uitstraling.
            </p>
            <div className="vista-panel mx-auto mb-10 flex max-w-5xl flex-col overflow-hidden rounded-[20px] border-[#0b6168]/10 sm:flex-row">
              <div className="flex-1 border-b border-[#0b6168]/10 px-5 py-4 text-center sm:border-b-0 sm:border-r">
                <div className="text-[28px] font-bold leading-none text-[#0b6168] md:text-[34px]">
                  {challengesCounter.count}
                </div>
                <div className="mt-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#567073]">
                  Actieve Cases
                </div>
              </div>
              <div className="flex-1 border-b border-[#0b6168]/10 px-5 py-4 text-center sm:border-b-0 sm:border-r">
                <div className="text-[28px] font-bold leading-none text-[#0b6168] md:text-[34px]">
                  {proposalsCounter.count}
                </div>
                <div className="mt-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#567073]">
                  Ingediende Challenges
                </div>
              </div>
              <div className="flex-1 px-5 py-4 text-center">
                <div className="text-[28px] font-bold leading-none text-[#0b6168] md:text-[34px]">
                  {municipalitiesCounter.count}
                </div>
                <div className="mt-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#567073]">
                  Deelnemende Gemeenten
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/cases')}
                className="bg-gradient-to-r from-[#ec644a] to-[#f56565] hover:from-[#f56565] hover:to-[#ec644a] text-white text-[18px] px-8 h-[56px] rounded-[12px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold group"
              >
                Ontdek Cases
                <ArrowRight className="w-5 h-5 ml-2 inline transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                onClick={handlePlaceChallenge}
                className="bg-[#0b6168] hover:bg-[#084f56] text-white text-[18px] px-8 h-[56px] rounded-[12px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold"
              >
                Plaats een Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - More Visual */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="vista-heading text-[#204448] font-bold text-[36px] md:text-[48px] mb-4 uppercase">
            Hoe werkt het?
          </h2>
          <p className="text-[#567073] text-[18px] md:text-[20px] max-w-2xl mx-auto">
            Van case tot oplossing in drie eenvoudige stappen
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connection arrows for desktop */}
          <div className="hidden md:block absolute top-[80px] left-[33%] w-[15%] h-[2px] bg-gradient-to-r from-[#0b6168]/30 to-transparent"></div>
          <div className="hidden md:block absolute top-[80px] right-[33%] w-[15%] h-[2px] bg-gradient-to-r from-transparent to-[#ec644a]/30"></div>
          
          <div className="vista-soft-panel p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] relative group">
            {/* Step number */}
            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#ec644a] to-[#f56565] w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-[20px]">
              1
            </div>
            
            <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto group-hover:rotate-6 transition-transform duration-300">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-[#204448] font-bold text-[22px] md:text-[26px] mb-4 text-center uppercase">
              Gemeente plaatst case
            </h3>
            <p className="text-[#567073] text-[16px] md:text-[18px] text-center leading-relaxed">
              Gemeenten delen hun cases en vragen om innovatieve ideeën
            </p>
          </div>

          <div className="vista-soft-panel p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] relative group">
            {/* Step number */}
            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#ec644a] to-[#f56565] w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-[20px]">
              2
            </div>
            
            <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto group-hover:rotate-6 transition-transform duration-300">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-[#204448] font-bold text-[22px] md:text-[26px] mb-4 text-center uppercase">
              Docenten dienen challenges in
            </h3>
            <p className="text-[#567073] text-[16px] md:text-[18px] text-center leading-relaxed">
              Docenten reageren met creatieve voorstellen en kunnen interesse tonen voor samenwerking
            </p>
          </div>

          <div className="vista-soft-panel p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] relative group">
            {/* Step number */}
            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#ec644a] to-[#f56565] w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-[20px]">
              3
            </div>
            
            <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto group-hover:rotate-6 transition-transform duration-300">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-[#204448] font-bold text-[22px] md:text-[26px] mb-4 text-center uppercase">
              Samen naar resultaat
            </h3>
            <p className="text-[#567073] text-[16px] md:text-[18px] text-center leading-relaxed">
              Door samenwerking ontstaan concrete oplossingen voor lokale cases
            </p>
          </div>
        </div>
      </div>

      {/* Recent Challenges */}
      {!loading && recentChallenges.length > 0 && (
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="vista-heading text-[#204448] font-bold text-[32px] md:text-[42px] mb-2 uppercase">
                Recente Cases
              </h2>
              <p className="text-[#567073] text-[16px] md:text-[18px]">
                Bekijk de nieuwste cases van gemeenten
              </p>
            </div>
            <Button 
              onClick={() => navigate('/cases')}
              className="bg-[#ec644a] hover:bg-[#f56565] text-white rounded-[8px] px-6 h-[48px] group"
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
      <div className="py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#0b6168] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#ec644a] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="vista-heading text-[#204448] font-bold text-[36px] md:text-[48px] mb-4 uppercase">
              Waarom dit platform?
            </h2>
            <p className="text-[#567073] text-[18px] md:text-[20px] max-w-2xl mx-auto">
              Samen bouwen aan een beter Limburg
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-6xl mx-auto">
            <div className="text-center group vista-soft-panel p-6 hover:border-[#ec644a]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[20px] md:text-[22px] mb-3 uppercase">
                Lokale Impact
              </h3>
              <p className="text-[#567073] text-[14px] md:text-[16px]">
                Direct bijdragen aan je regio
              </p>
            </div>

            <div className="text-center group vista-soft-panel p-6 hover:border-[#ec644a]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[20px] md:text-[22px] mb-3 uppercase">
                Praktijkervaring
              </h3>
              <p className="text-[#567073] text-[14px] md:text-[16px]">
                Werk aan echte cases
              </p>
            </div>

            <div className="text-center group vista-soft-panel p-6 hover:border-[#ec644a]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[20px] md:text-[22px] mb-3 uppercase">
                Innovatieve Oplossingen
              </h3>
              <p className="text-[#567073] text-[14px] md:text-[16px]">
                Creatieve aanpak van cases
              </p>
            </div>

            <div className="text-center group vista-soft-panel p-6 hover:border-[#ec644a]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[20px] md:text-[22px] mb-3 uppercase">
                Sterke Samenwerking
              </h3>
              <p className="text-[#567073] text-[14px] md:text-[16px]">
                Verbinding tussen kennis en praktijk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="vista-aqua-panel rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ec644a] opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ec644a] opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 mb-6">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-white text-[14px] font-medium">Gratis en toegankelijk</span>
            </div>
            
            <h2 className="vista-heading text-white font-bold text-[36px] md:text-[48px] mb-6 uppercase">
              Klaar om bij te dragen?
            </h2>
            <p className="text-white/85 text-[18px] md:text-[22px] mb-10 max-w-2xl mx-auto leading-relaxed">
              Word onderdeel van de oplossing en maak samen met ons het verschil in Limburg
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/cases')}
                className="bg-gradient-to-r from-[#ec644a] to-[#f56565] hover:from-[#f56565] hover:to-[#f56565] text-white text-[18px] px-8 h-[56px] rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold group"
              >
                Ontdek Cases
                <ArrowRight className="w-5 h-5 ml-2 inline transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                onClick={handlePlaceChallenge}
                className="bg-white hover:bg-[#fff4ef] text-[#204448] text-[18px] px-8 h-[56px] rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold"
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
