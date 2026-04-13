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
import svgPaths from "../imports/svg-j82t6p4shp";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { useNavigate } from "react-router";
import { projectId, publicAnonKey } from '../config/env';
import { toast } from 'sonner';
import { Sparkles, Lightbulb, ArrowRight, CheckCircle2 } from "lucide-react";

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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch challenges: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
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
    <div className="bg-gradient-to-b from-[#2a2321] via-[#1f1a19] to-[#171312] min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0b6168] opacity-[0.12] rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0b6168] opacity-[0.08] rounded-full blur-3xl"></div>

      {/* Hero Section with glassmorphism */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20 relative z-10">
        {/* Title Section with modern styling */}
        <div className="mb-10 md:mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="w-5 h-5 text-[#0b6168]" />
              <span className="text-[#0b6168] text-sm font-medium">Ontdek alle cases</span>
            </div>
          </div>
          <h1 className="text-white font-bold text-[40px] sm:text-[50px] md:text-[60px] leading-[1.1] mb-6">
            Cases van <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ec644a] to-[#0b6168]">
              Limburgse Gemeenten
            </span>
          </h1>
          <p className="text-white/80 text-[18px] sm:text-[20px] md:text-[22px] max-w-2xl leading-relaxed">
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
        <div className="bg-white/10 backdrop-blur-md rounded-[20px] border border-white/20 p-6 md:p-8 mb-12 shadow-xl">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Zoek cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[50px] md:h-[56px] bg-white/90 backdrop-blur-sm rounded-[12px] border-white/30 pr-[70px] text-base md:text-lg shadow-sm focus:bg-white transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-[42px] md:h-[48px] w-[50px] md:w-[56px] bg-[#1f1a19] hover:bg-[#2a2321] rounded-[10px] flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 18 18">
                <path d={svgPaths.pbc21670} fill="white" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Select value={selectedMunicipality} onValueChange={(value) => setSelectedMunicipality(value as any)}>
              <SelectTrigger className="w-full sm:w-64 bg-white/90 backdrop-blur-sm border-white/30 h-[50px] rounded-[12px] shadow-sm hover:bg-white transition-colors">
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
              <SelectTrigger className="w-full sm:w-64 bg-white/90 backdrop-blur-sm border-white/30 h-[50px] rounded-[12px] shadow-sm hover:bg-white transition-colors">
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
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-white/90 text-sm md:text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0b6168]" />
              {loading ? 'Laden...' : `${listings.length} ${listings.length === 1 ? 'case' : 'cases'} gevonden`}
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-full">
              <div className="w-5 h-5 border-2 border-[#0b6168] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white text-lg md:text-xl">Laden...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="bg-white/10 backdrop-blur-sm rounded-[20px] border border-white/20 p-12 max-w-md mx-auto">
              <Lightbulb className="w-16 h-16 text-[#0b6168] mx-auto mb-4 opacity-60" />
              <p className="text-white text-lg md:text-xl">Geen cases gevonden</p>
              <p className="text-white/60 text-sm mt-2">Probeer een andere zoekopdracht of filter</p>
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
