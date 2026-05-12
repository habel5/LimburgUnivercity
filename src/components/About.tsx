import { useState, useEffect } from "react";
import { Link } from "react-router";
import imgKennisFestivalBannerEdited1 from "../assets/vista-flyer.jpeg";
import imgVistaLogo from "../assets/logo-vista.png";
import imgZuydLogo from "../assets/logo-zuyd.png";
import { Target, Users, Lightbulb, Heart } from "lucide-react";
import { api } from "../lib/api";
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
  const [loading, setLoading] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);

  const animatedChallenges = useCountUp(stats.challenges, 1200, startAnimation);
  const animatedProposals = useCountUp(stats.proposals, 1200, startAnimation);
  const animatedMunicipalities = useCountUp(stats.municipalities, 1200, startAnimation);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.stats();
      setStats({
        challenges: data.challenges || 0,
        proposals: data.proposals || 0,
        municipalities: data.municipalities || municipalities.length,
      });
      setStartAnimation(true);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vista-page min-h-screen">
      {/* Hero Section */}
      <div className="h-[calc(100vh-60px)] flex items-center relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#0b6168] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-[#0b6168] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-6 relative z-10">
          {/* Desktop & Tablet */}
          <div className="hidden md:flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            <div className="lg:w-1/2 space-y-4">
              <h1 className="vista-heading text-[#204448] font-bold text-[40px] lg:text-[52px] leading-[1.02] uppercase">
                Over <span className="text-[#ec644a]">Ons Platform</span>
              </h1>
              <div className="text-[#486467] text-[15px] lg:text-[16px] leading-relaxed space-y-3">
                <p className="opacity-90">
                  Het Limburg University Knowledge Festival is een uniek platform waar docenten en lokale gemeenten samenkomen om maatschappelijke cases aan te pakken.
                </p>
                <p className="opacity-90">
                  Onze missie is om innovatieve oplossingen te creëren voor stedelijke problemen door academische kennis te combineren met praktijkervaring. We geloven in de kracht van samenwerking tussen onderwijsinstellingen en gemeenten.
                </p>
                <p className="opacity-90">
                  Door middel van dit platform brengen we gemeentelijke cases onder de aandacht van docenten en onderzoekers die met creatieve voorstellen kunnen komen. Samen maken we Limburg slimmer, socialer en duurzamer.
                </p>
              </div>
              <div className="vista-soft-panel p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[#ec644a] font-bold text-[17px] lg:text-[19px] mb-1">
                      "The City Is Our Campus"
                    </p>
                    <p className="text-[#567073] text-[14px] lg:text-[15px]">
                      We leren niet alleen in collegebanken, maar ook in de straten, parken en wijken van onze steden. Elke case is een kans om te leren, te innoveren en impact te maken.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 flex items-center justify-center">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#ec644a]/10 h-[calc(100vh-160px)] max-h-[700px]">
                <img
                  src={imgKennisFestivalBannerEdited1}
                  alt="Kennis Festival Banner"
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col items-center space-y-5">
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-[#ec644a]/10">
              <img
                src={imgKennisFestivalBannerEdited1}
                alt="Kennis Festival Banner"
                className="w-full h-auto object-contain"
              />
            </div>
            <h1 className="vista-heading text-[#204448] font-bold text-[28px] text-center uppercase">
              Over <span className="text-[#ec644a]">Ons Platform</span>
            </h1>
            <div className="text-[#486467] text-[15px] text-center leading-relaxed space-y-3">
              <p className="opacity-90">
                Het Limburg University Knowledge Festival is een uniek platform waar docenten en lokale gemeenten samenkomen om maatschappelijke cases aan te pakken.
              </p>
              <p className="opacity-90">
                Onze missie is om innovatieve oplossingen te creëren voor stedelijke problemen door academische kennis te combineren met praktijkervaring.
              </p>
              <p className="opacity-90">
                Door middel van dit platform brengen we gemeentelijke cases onder de aandacht van docenten en onderzoekers. Samen maken we Limburg slimmer, socialer en duurzamer.
              </p>
              <div className="vista-soft-panel rounded-xl p-4 mt-2">
                <p className="text-[#ec644a] font-bold text-[16px] mb-1">"The City Is Our Campus"</p>
                <p className="text-[#567073] text-[13px]">Elke case is een kans om te leren, te innoveren en impact te maken.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-y border-[#0b6168]/10 shadow-sm">
        <div className="mx-auto flex max-w-[1536px] flex-col divide-y divide-[#0b6168]/10 sm:flex-row sm:divide-x sm:divide-y-0 px-4 sm:px-6 md:px-12">
          {[
            { value: animatedChallenges, label: "Actieve Cases", to: "/cases" as string | null },
            { value: animatedProposals, label: "Ingediende Voorstellen", to: null },
            { value: animatedMunicipalities, label: "Deelnemende Gemeenten", to: null },
          ].map(({ value, label, to }) => (
            <div key={label} className="flex-1 px-6 py-7 text-center">
              {loading ? (
                <div className="mx-auto mb-2 h-12 w-20 animate-pulse rounded bg-[#0b6168]/15" />
              ) : (
                <div className="text-[44px] md:text-[54px] font-bold leading-none text-[#0b6168] tabular-nums">
                  {value}
                </div>
              )}
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#567073]">
                {to ? <Link to={to} className="hover:text-[#0b6168] transition-colors">{label}</Link> : label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visie & Missie */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-20">
        <div className="vista-aqua-panel rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-[20px] md:text-[22px] uppercase">Onze Visie</h3>
            </div>
            <p className="text-white/85 text-[16px] md:text-[17px] leading-relaxed">
              Een Limburg waar onderwijs en gemeenten structureel samenwerken aan duurzame oplossingen voor maatschappelijke vraagstukken — en studenten actief bijdragen aan hun leefomgeving.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-[20px] md:text-[22px] uppercase">Onze Missie</h3>
            </div>
            <p className="text-white/85 text-[16px] md:text-[17px] leading-relaxed">
              Academische expertise verbinden met gemeentelijke uitdagingen via een toegankelijk platform waar kennis, creativiteit en samenwerking samenkomen.
            </p>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 pb-16 md:pb-24">
        <h2 className="vista-heading text-[#204448] font-bold text-[24px] md:text-[30px] mb-8 uppercase text-center">
          In Samenwerking Met
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <a
            href="https://vistacollege.nl/"
            target="_blank"
            rel="noopener noreferrer"
            className="vista-soft-panel vista-clickable rounded-2xl p-5 hover:border-[#ec644a]/30 hover:scale-105 w-[200px] h-[110px] flex items-center justify-center"
          >
            <img src={imgVistaLogo} alt="VISTA Logo" className="max-w-full max-h-full object-contain" />
          </a>
          <a
            href="https://www.zuyd.nl/"
            target="_blank"
            rel="noopener noreferrer"
            className="vista-clickable bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:scale-105 w-[200px] h-[110px] flex items-center justify-center"
          >
            <img src={imgZuydLogo} alt="Hogeschool Zuyd Logo" className="max-w-full max-h-full object-contain" />
          </a>
        </div>
      </div>
    </div>
  );
}
