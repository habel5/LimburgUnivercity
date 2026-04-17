import { useState, useEffect } from "react";
import { Link } from "react-router";
import imgKennisFestivalBannerEdited1 from "../assets/vista-flyer.jpeg";
import imgVistaLogo from "figma:asset/29444d676ea0be3981c0e5c3036ea8817d3926c9.png";
import imgZuydLogo from "figma:asset/203acb71bc15783d4542299713c310ad058b71a2.png";
import { Sparkles, Target, Users, Lightbulb, Award, Heart } from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../config/env";
import { municipalities } from "../lib/supabase";

// Custom hook for counting animation
function useCountUp(
  end: number,
  duration: number = 2000,
  startCounting: boolean = false,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting || end === 0) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1,
      );

      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = Math.floor(
        startValue + (end - startValue) * easeOutQuad(progress),
      );

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, startCounting]);

  return count;
}

export default function About() {
  const [stats, setStats] = useState({
    challenges: 0,
    proposals: 0,
    municipalities: municipalities.length,
  });
  const [startAnimation, setStartAnimation] = useState(false);

  // Animated counters
  const animatedChallenges = useCountUp(
    stats.challenges,
    2000,
    startAnimation,
  );
  const animatedProposals = useCountUp(
    stats.proposals,
    2500,
    startAnimation,
  );
  const animatedMunicipalities = useCountUp(
    stats.municipalities,
    1800,
    startAnimation,
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/stats`,
        {
          headers: {
            apikey: publicAnonKey,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        setStats({
          challenges: data.challenges || 0,
          proposals: data.proposals || 0,
          municipalities: data.municipalities || municipalities.length,
        });

        // Start animation after data is loaded
        setTimeout(() => setStartAnimation(true), 100);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="vista-page min-h-screen">
      {/* Hero Section */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-28 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#0b6168] opacity-[0.05] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-[#0b6168] opacity-[0.05] rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="vista-kicker">
              <Sparkles className="w-4 h-4 text-[#0b6168]" />
              <span className="text-[#0b6168] text-[14px] font-medium">Limburg University × Gemeenten</span>
            </div>
          </div>

          {/* Desktop & Tablet View */}
          <div className="hidden md:flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h1 className="vista-heading text-[#204448] font-bold text-[48px] lg:text-[64px] leading-[1.02] uppercase">
                Over <span className="text-[#ec644a]">Ons Platform</span>
              </h1>

              <div className="text-[#486467] text-[18px] lg:text-[20px] leading-relaxed space-y-6">
                <p className="opacity-90">
                  Het Limburg University Knowledge Festival is een
                  uniek platform waar docenten en lokale gemeenten
                  samenkomen om maatschappelijke cases aan
                  te pakken.
                </p>
                <p className="opacity-90">
                  Onze missie is om innovatieve oplossingen te
                  creëren voor stedelijke problemen door
                  academische kennis te combineren met
                  praktijkervaring. We geloven in de kracht van
                  samenwerking tussen onderwijsinstellingen en
                  gemeenten.
                </p>
                <p className="opacity-90">
                  Door middel van dit platform brengen we
                  gemeentelijke cases onder de aandacht van
                  docenten en onderzoekers die met creatieve
                  voorstellen kunnen komen. Samen maken we Limburg
                  slimmer, socialer en duurzamer.
                </p>
                
                {/* Motto */}
                <div className="vista-soft-panel p-6 mt-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[#ec644a] font-bold text-[20px] lg:text-[24px] mb-2">
                        "The City Is Our Campus"
                      </p>
                      <p className="text-[#567073] text-[16px] lg:text-[18px]">
                        We leren niet alleen in collegebanken, maar ook in de
                        straten, parken en wijken van onze steden. Elke case is een
                        kans om te leren, te innoveren en impact te maken.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#ec644a]/10">
                <img
                  src={imgKennisFestivalBannerEdited1}
                  alt="Kennis Festival Banner"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden flex flex-col items-center space-y-8">
            <div className="w-full max-w-[354px] rounded-2xl overflow-hidden shadow-2xl border border-[#ec644a]/10">
              <img
                src={imgKennisFestivalBannerEdited1}
                alt="Kennis Festival Banner"
                className="w-full h-auto object-cover"
              />
            </div>

            <h1 className="vista-heading text-[#204448] font-bold text-[32px] text-center uppercase">
              Over <span className="text-[#ec644a]">Ons Platform</span>
            </h1>

            <div className="max-w-[320px] text-[#486467] text-[16px] text-center leading-relaxed space-y-4">
              <p className="opacity-90">
                Het Limburg University Knowledge Festival is een
                uniek platform waar docenten en lokale gemeenten
                samenkomen om maatschappelijke cases aan te
                pakken.
              </p>
              <p className="opacity-90">
                Onze missie is om innovatieve oplossingen te
                creëren voor stedelijke problemen door academische
                kennis te combineren met praktijkervaring.
              </p>
              
              <div className="vista-soft-panel rounded-xl p-4 mt-6">
                <p className="text-[#ec644a] font-bold text-[18px] mb-2">
                  "The City Is Our Campus"
                </p>
                <p className="text-[#567073] text-[14px]">
                  Elke case is een kans om te leren en impact te maken.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 md:py-20 relative overflow-hidden">
        {/* Decorative gradient circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0b6168] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0b6168] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="text-center mb-12">
            <h2 className="vista-heading text-[#204448] font-bold text-[32px] md:text-[42px] mb-3 uppercase">
              Platform in Cijfers
            </h2>
            <p className="text-[#567073] text-[16px] md:text-[18px]">
              Real-time statistieken van ons groeiende platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <Link 
              to="/cases" 
              className="vista-stat-card vista-clickable hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="text-[#0b6168] text-[56px] md:text-[72px] font-bold mb-2 bg-gradient-to-br from-[#0b6168] to-[#6eaab0] bg-clip-text text-transparent">
                {animatedChallenges}
              </div>
              <div className="text-[#243537] text-[18px] md:text-[20px] font-medium">Actieve Cases</div>
            </Link>
            <div className="vista-stat-card hover:-translate-y-1 hover:scale-[1.02]">
              <div className="text-[#0b6168] text-[56px] md:text-[72px] font-bold mb-2 bg-gradient-to-br from-[#0b6168] to-[#6eaab0] bg-clip-text text-transparent">
                {animatedProposals}
              </div>
              <div className="text-[#243537] text-[18px] md:text-[20px] font-medium">Ingediende Challenges</div>
            </div>
            <div className="vista-stat-card hover:-translate-y-1 hover:scale-[1.02]">
              <div className="text-[#0b6168] text-[56px] md:text-[72px] font-bold mb-2 bg-gradient-to-br from-[#0b6168] to-[#6eaab0] bg-clip-text text-transparent">
                {animatedMunicipalities}
              </div>
              <div className="text-[#243537] text-[18px] md:text-[20px] font-medium">Deelnemende Gemeenten</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission Section */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="vista-heading text-[#204448] font-bold text-[36px] md:text-[48px] mb-4 uppercase">
            Onze Visie & Missie
          </h2>
          <p className="text-[#567073] text-[18px] md:text-[20px] max-w-2xl mx-auto">
            Waar we voor staan en wat we willen bereiken
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div className="vista-soft-panel p-8 md:p-10 hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#ec644a] font-bold text-[28px] md:text-[32px]">
                Onze Visie
              </h3>
            </div>
            <p className="text-[#567073] text-[17px] md:text-[19px] leading-relaxed">
              Een Limburg waar universiteiten en gemeenten
              structureel samenwerken aan duurzame oplossingen
              voor maatschappelijke vraagstukken. Waar studenten
              niet alleen studeren, maar actief bijdragen aan
              hun leefomgeving.
            </p>
          </div>

          <div className="vista-soft-panel p-8 md:p-10 hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#ec644a] font-bold text-[28px] md:text-[32px]">
                Onze Missie
              </h3>
            </div>
            <p className="text-[#567073] text-[17px] md:text-[19px] leading-relaxed">
              Het verbinden van academische expertise met
              gemeentelijke cases door een toegankelijk
              platform te bieden waar kennis, creativiteit en
              burgerbetrokkenheid samenkomen.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#0b6168] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#ec644a] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="vista-heading text-[#204448] font-bold text-[36px] md:text-[48px] mb-4 uppercase">
              Onze Kernwaarden
            </h2>
            <p className="text-[#567073] text-[18px] md:text-[20px] max-w-2xl mx-auto">
              De principes die ons platform drijven
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
            <div className="text-center group vista-soft-panel p-6 md:p-8 hover:border-[#ec644a]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[22px] md:text-[24px] mb-3 uppercase">
                Samenwerking
              </h3>
              <p className="text-[#567073] text-[15px] md:text-[17px] leading-relaxed">
                We geloven in de kracht van samenwerking tussen gemeenten, universiteiten en docenten
              </p>
            </div>

            <div className="text-center group vista-soft-panel p-6 md:p-8 hover:border-[#ec644a]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[22px] md:text-[24px] mb-3 uppercase">
                Innovatie
              </h3>
              <p className="text-[#567073] text-[15px] md:text-[17px] leading-relaxed">
                Creatieve en innovatieve oplossingen voor complexe maatschappelijke cases
              </p>
            </div>

            <div className="text-center group vista-soft-panel p-6 md:p-8 hover:border-[#ec644a]/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[22px] md:text-[24px] mb-3 uppercase">
                Impact
              </h3>
              <p className="text-[#567073] text-[15px] md:text-[17px] leading-relaxed">
                Concrete, meetbare impact op de leefomgeving in Limburg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="vista-heading text-[#204448] font-bold text-[36px] md:text-[48px] mb-4 uppercase">
            In Samenwerking Met
          </h2>
          <p className="text-[#567073] text-[18px] md:text-[20px]">
            Onze partners maken dit platform mogelijk
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <a 
            href="https://vistacollege.nl/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="vista-soft-panel vista-clickable rounded-2xl p-6 hover:border-[#ec644a]/30 hover:scale-105 w-[240px] h-[140px] flex items-center justify-center"
          >
            <img
              src={imgVistaLogo}
              alt="VISTA Logo"
              className="max-w-full max-h-full object-contain"
            />
          </a>
          <a 
            href="https://www.zuyd.nl/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="vista-clickable bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 w-[240px] h-[140px] flex items-center justify-center"
          >
            <img
              src={imgZuydLogo}
              alt="Hogeschool Zuyd Logo"
              className="max-w-full max-h-full object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
