import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { Lightbulb, Users, Target, MapPin, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { Listing } from "../lib/supabase";
import { ListingCard } from "./ListingCard";
import { toast } from "sonner";
import { api } from "../lib/api";
import bannerImg from "../assets/brands-people-Ax8IA8GAjVg-unsplash.jpg";

function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted || end === 0) return;

    const startTime = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress >= 1) {
        setCount(end);
        clearInterval(timer);
      }
    }, 16);

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

  const challengesCounter = useCounter(stats.challenges, 1200);
  const proposalsCounter = useCounter(stats.proposals, 1200);
  const municipalitiesCounter = useCounter(stats.municipalities, 1200);

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (stats.challenges > 0 || stats.proposals > 0 || stats.municipalities > 0) {
      challengesCounter.start();
      proposalsCounter.start();
      municipalitiesCounter.start();
    }
  }, [stats]);

  const fetchHomeData = async () => {
    try {
      const params = new URLSearchParams({ limit: '3' });
      const [statsData, challengesData] = await Promise.all([
        api.stats(),
        api.challenges(params),
      ]);
      setStats(statsData);
      setRecentChallenges(Array.isArray(challengesData) ? challengesData : []);
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

      {/* ── HERO ── */}
      <div className="relative flex items-end overflow-hidden min-h-[62vh] md:min-h-[76vh]">
        <img
          src={bannerImg}
          alt="Samenwerking en innovatie"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b6168]/85 via-[#0b6168]/55 to-[#0b6168]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b6168]/60 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-6 sm:px-10 md:px-16 pb-16 md:pb-20 pt-24">
          <h1 className="vista-heading mb-5 max-w-2xl font-bold uppercase leading-[0.92] text-white text-[52px] sm:text-[68px] md:text-[88px]">
            De stad is{" "}
            <span className="block text-[#f4a48a]">onze leerschool</span>
          </h1>
          <p className="mb-9 max-w-lg text-[17px] leading-relaxed text-white/85 sm:text-[19px]">
            Limburgse gemeenten en onderwijs werken samen aan echte uitdagingen. Praktijkgericht, lokaal verankerd.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => navigate('/cases')}
              className="h-[52px] rounded-[10px] bg-[#ec644a] px-8 text-[17px] font-semibold text-white shadow-lg transition-all hover:bg-[#f56565] hover:scale-105 group"
            >
              Ontdek Cases
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              onClick={handlePlaceChallenge}
              className="h-[52px] rounded-[10px] border border-white/35 bg-white/15 px-8 text-[17px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-105"
            >
              Plaats een Case
            </Button>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="bg-white border-b border-[#0b6168]/10 shadow-sm">
        <div className="mx-auto flex max-w-[1536px] flex-col divide-y divide-[#0b6168]/10 sm:flex-row sm:divide-x sm:divide-y-0 px-6 sm:px-10 md:px-16">
          {[
            { counter: challengesCounter, label: "Actieve Cases", icon: <Lightbulb className="w-4 h-4" /> },
            { counter: proposalsCounter, label: "Ingediende Voorstellen", icon: <Target className="w-4 h-4" /> },
            { counter: municipalitiesCounter, label: "Deelnemende Gemeenten", icon: <MapPin className="w-4 h-4" /> },
          ].map(({ counter, label, icon }) => (
            <div key={label} className="flex-1 px-6 py-7 text-center">
              {loading ? (
                <div className="mx-auto mb-2 h-12 w-20 animate-pulse rounded bg-[#0b6168]/15" />
              ) : (
                <div className="text-[44px] md:text-[54px] font-bold leading-none text-[#0b6168] tabular-nums">
                  {counter.count}
                </div>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#567073]">
                <span className="text-[#0b6168]">{icon}</span>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT CASES ── */}
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 md:px-16 py-20 md:py-28">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="vista-heading text-[#204448] font-bold text-[30px] md:text-[40px] mb-1 uppercase">
              Recente Cases
            </h2>
            <p className="text-[#567073] text-[15px] md:text-[17px]">
              Nieuwste uitdagingen van Limburgse gemeenten
            </p>
          </div>
          <Button
            onClick={() => navigate('/cases')}
            className="flex-shrink-0 bg-[#ec644a] hover:bg-[#f56565] text-white rounded-[8px] px-6 h-[46px] group"
          >
            Bekijk alle
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[linear-gradient(180deg,#ffffff_0%,#fff5ee_100%)] border border-[#ec644a]/10 rounded-[18px] shadow-[0_18px_36px_rgba(36,53,55,0.08)] p-5 md:p-6 animate-pulse"
              >
                <div className="h-7 bg-[#0b6168]/10 rounded-md mb-2 w-full" />
                <div className="h-7 bg-[#0b6168]/10 rounded-md mb-4 w-3/4" />
                <div className="h-5 bg-[#0b6168]/8 rounded mb-4 w-1/2" />
                <div className="h-7 bg-[#ec644a]/15 rounded-[5px] mb-6 w-28" />
                <div className="h-5 bg-gray-200 rounded mb-4 w-1/3" />
                <div className="w-full h-[1px] bg-[#B2B3B4] mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/5" />
              </div>
            ))}
          </div>
        ) : recentChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recentChallenges.map((challenge) => (
              <ListingCard key={challenge.id} listing={challenge} />
            ))}
          </div>
        ) : null}
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 md:px-16 pb-20 md:pb-28">
        <div className="text-center mb-14">
          <h2 className="vista-heading text-[#204448] font-bold text-[32px] md:text-[44px] mb-3 uppercase">
            Hoe werkt het?
          </h2>
          <p className="text-[#567073] text-[16px] md:text-[18px] max-w-lg mx-auto">
            Van uitdaging tot samenwerking in drie stappen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {[
            {
              step: "01",
              icon: <Lightbulb className="w-7 h-7 text-white" />,
              title: "Gemeente plaatst case",
              text: "Gemeenten delen hun uitdagingen en vragen om innovatieve ideeën vanuit het onderwijs.",
            },
            {
              step: "02",
              icon: <Users className="w-7 h-7 text-white" />,
              title: "Docenten dienen voorstellen in",
              text: "Docenten reageren met creatieve voorstellen en tonen interesse voor samenwerking.",
            },
            {
              step: "03",
              icon: <Target className="w-7 h-7 text-white" />,
              title: "Samen naar resultaat",
              text: "Door samenwerking ontstaan concrete oplossingen voor lokale uitdagingen.",
            },
          ].map(({ step, icon, title, text }) => (
            <div
              key={step}
              className="vista-soft-panel p-7 md:p-9 group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[56px] md:text-[68px] font-bold leading-none text-[#0b6168]/10 select-none tabular-nums">
                  {step}
                </span>
                <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-13 h-13 min-w-[52px] min-h-[52px] rounded-xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300">
                  {icon}
                </div>
              </div>
              <h3 className="text-[#204448] font-bold text-[19px] md:text-[21px] mb-3 uppercase leading-tight">
                {title}
              </h3>
              <p className="text-[#567073] text-[15px] md:text-[16px] leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOR WHOM ── */}
      <div className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[40%] bg-[#0b6168]/04 blur-3xl pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[40%] bg-[#ec644a]/04 blur-3xl pointer-events-none" />
        <div className="max-w-[1536px] mx-auto px-6 sm:px-10 md:px-16 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="vista-heading text-[#204448] font-bold text-[32px] md:text-[44px] mb-3 uppercase">
              Voor wie is het platform?
            </h2>
            <p className="text-[#567073] text-[16px] md:text-[18px] max-w-lg mx-auto">
              Eén platform, twee perspectieven
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="vista-aqua-panel p-8 md:p-10 rounded-2xl">
              <div className="bg-white/15 w-13 h-13 min-w-[52px] min-h-[52px] rounded-xl flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-[22px] md:text-[26px] mb-5 uppercase">Gemeente</h3>
              <ul className="space-y-3.5 mb-8">
                {[
                  "Plaats lokale uitdagingen als publieke case",
                  "Ontvang creatieve voorstellen vanuit het onderwijs",
                  "Vergroot de betrokkenheid van jonge professionals",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/90 text-[15px] md:text-[16px] leading-snug">
                    <CheckCircle2 className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/cases')}
                className="bg-white hover:bg-[#fff4ef] text-[#204448] font-semibold h-[46px] px-6 rounded-[8px] transition-all hover:scale-105"
              >
                Bekijk cases
              </Button>
            </div>

            <div className="vista-soft-panel p-8 md:p-10 rounded-2xl">
              <div className="bg-gradient-to-br from-[#ec644a] to-[#f56565] w-13 h-13 min-w-[52px] min-h-[52px] rounded-xl flex items-center justify-center mb-5 shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#204448] font-bold text-[22px] md:text-[26px] mb-5 uppercase">Onderwijs</h3>
              <ul className="space-y-3.5 mb-8">
                {[
                  "Verbind lessen aan echte lokale uitdagingen",
                  "Dien voorstellen in namens studenten of jouw instelling",
                  "Bouw aan een praktijkgericht netwerk in Limburg",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#567073] text-[15px] md:text-[16px] leading-snug">
                    <CheckCircle2 className="w-5 h-5 text-[#ec644a] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/cases')}
                className="bg-[#ec644a] hover:bg-[#f56565] text-white font-semibold h-[46px] px-6 rounded-[8px] transition-all hover:scale-105 shadow-md"
              >
                Bekijk cases
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 md:px-16 py-16 md:py-24">
        <div className="vista-aqua-panel rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#ec644a] opacity-[0.12] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#ec644a] opacity-[0.12] rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="vista-heading text-white font-bold text-[30px] md:text-[44px] mb-4 uppercase">
              Klaar om bij te dragen?
            </h2>
            <p className="text-white/85 text-[16px] md:text-[20px] mb-8 max-w-xl mx-auto leading-relaxed">
              Word onderdeel van de oplossing en maak samen met ons het verschil in Limburg
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/cases')}
                className="bg-gradient-to-r from-[#ec644a] to-[#f56565] hover:from-[#f56565] hover:to-[#f56565] text-white text-[17px] px-8 h-[52px] rounded-[8px] shadow-lg transition-all hover:shadow-xl hover:scale-105 font-semibold group"
              >
                Ontdek Cases
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={handlePlaceChallenge}
                className="bg-white hover:bg-[#fff4ef] text-[#204448] text-[17px] px-8 h-[52px] rounded-[8px] shadow-lg transition-all hover:shadow-xl hover:scale-105 font-semibold"
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
