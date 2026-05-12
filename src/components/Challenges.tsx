import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ListingCard } from "./ListingCard";
import { categories, municipalities, Category, Municipality, Listing } from "../lib/supabase";
import svgPaths from "../imports/svg-paths";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { useNavigate } from "react-router";
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Lightbulb, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<"all" | Municipality>("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | Category>("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchChallenges();
  }, [debouncedSearchQuery, selectedMunicipality, selectedCategory]);

  const fetchChallenges = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
    if (selectedMunicipality !== 'all') params.append('municipality', selectedMunicipality);
    if (selectedCategory !== 'all') params.append('category', selectedCategory);

    try {
      const data = await api.challenges(params);
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Kon cases niet laden. Probeer de pagina te vernieuwen.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceChallenge = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (user?.role !== 'gemeente' && user?.role !== 'admin') {
      toast.error('Alleen gemeente- en adminaccounts kunnen cases plaatsen');
      return;
    }

    navigate('/add');
  };

  return (
    <div className="vista-page min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0b6168] opacity-[0.1] rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ec644a] opacity-[0.08] rounded-full blur-3xl"></div>

      {/* Hero Section with glassmorphism */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20 relative z-10">
        {/* Title Section with modern styling */}
        <div className="mb-10 md:mb-16">

          <h1 className="vista-heading text-[#204448] font-bold text-[40px] sm:text-[50px] md:text-[60px] leading-[1.02] mb-6 uppercase">
            Cases van <br />
            <span className="text-[#ec644a]">
              Limburgse Gemeenten
            </span>
          </h1>
          <p className="text-[#567073] text-[18px] sm:text-[20px] md:text-[22px] max-w-2xl leading-relaxed">
            Zoek en filter cases van gemeenten in Limburg en draag bij aan de toekomst van jouw regio
          </p>
        </div>
        
        {/* Action Button with modern style */}
        <div className="mb-12 md:mb-16">
          <Button 
            onClick={handlePlaceChallenge}
            className="bg-gradient-to-r from-[#ec644a] to-[#f56565] hover:from-[#f56565] hover:to-[#f56565] text-white text-[16px] md:text-[18px] px-8 md:px-10 h-[50px] md:h-[56px] rounded-full shadow-lg shadow-[#ec644a]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#ec644a]/40 hover:-translate-y-1 group"
          >
            <Lightbulb className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Plaats case
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Search and Filters Card with glassmorphism */}
        <div className="vista-panel p-6 md:p-8 mb-12">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Zoek cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[50px] md:h-[56px] bg-white rounded-[12px] border-[#0b6168]/15 pr-[70px] text-base md:text-lg shadow-sm focus:bg-white transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-[42px] md:h-[48px] w-[50px] md:w-[56px] bg-[#0b6168] hover:bg-[#084f56] rounded-[10px] flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 18 18">
                <path d={svgPaths.pbc21670} fill="white" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Select value={selectedMunicipality} onValueChange={(value) => setSelectedMunicipality(value as any)}>
              <SelectTrigger className="w-full sm:w-64 bg-white border-[#0b6168]/15 h-[50px] rounded-[12px] shadow-sm hover:bg-white transition-colors">
                <SelectValue placeholder="Gemeente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle gemeenten</SelectItem>
                {municipalities.map((mun) => (
                  <SelectItem key={mun.value} value={mun.value}>
                    {mun.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
              <SelectTrigger className="w-full sm:w-64 bg-white border-[#0b6168]/15 h-[50px] rounded-[12px] shadow-sm hover:bg-white transition-colors">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="mt-6 pt-6 border-t border-[#0b6168]/10">
            <p className="text-[#325457] text-sm md:text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0b6168]" />
              {loading ? <span className="inline-block h-4 w-24 animate-pulse rounded bg-[#0b6168]/15 align-middle" /> : `${listings.length} ${listings.length === 1 ? 'case' : 'cases'} gevonden`}
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-12 md:pb-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[linear-gradient(180deg,#ffffff_0%,#fff5ee_100%)] border border-[#ec644a]/10 rounded-[18px] shadow-[0_18px_36px_rgba(36,53,55,0.08)] p-5 md:p-6 animate-pulse">
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
        ) : listings.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="vista-panel p-12 max-w-md mx-auto">
              <Lightbulb className="w-16 h-16 text-[#0b6168] mx-auto mb-4 opacity-60" />
              <p className="text-[#204448] text-lg md:text-xl">Geen cases gevonden</p>
              <p className="text-[#6b8487] text-sm mt-2">Probeer een andere zoekopdracht of filter</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-12 md:pb-20">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
