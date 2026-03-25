import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Clock, Tag, User, Building2, Lightbulb } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Listing, Proposal, municipalityLabels } from "../lib/supabase";
import { ProposalCard } from "./ProposalCard";
import { projectId, publicAnonKey } from '../config/env';
import { useAuth } from "../lib/auth";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchChallengeDetails();
  }, [id]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch challenge');
      }

      const data = await response.json();
      setListing(data.challenge);
      setProposals(data.proposals);
    } catch (error) {
      console.error('Error fetching challenge details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#2a2321] min-h-[calc(100vh-149px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-white text-lg">Case laden...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-[#2a2321] min-h-[calc(100vh-149px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Case niet gevonden</h2>
          <Button onClick={() => navigate('/cases')} className="bg-[#ec644a] hover:bg-[#f56565] text-white">
            Terug naar overzicht
          </Button>
        </div>
      </div>
    );
  }

  const timeAgo = getTimeAgo(listing.created_at);

  return (
    <div className="bg-[#2a2321] min-h-[calc(100vh-149px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/cases')}
          className="mb-4 md:mb-6 gap-2 text-white hover:text-[#ec644a] hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Terug naar overzicht</span>
          <span className="sm:hidden">Terug</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Challenge Details */}
            <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                  <Badge className="bg-[#ec644a] hover:bg-[#ec644a] text-white text-[16px] sm:text-[18px] md:text-[20px] px-3 md:px-4 py-1 rounded-[5px] h-[28px] md:h-[30px]">
                    {getMunicipalityLabel(listing.municipality)}
                  </Badge>
                  <Badge variant="outline" className="text-black border-gray-300 text-sm sm:text-base">
                    {getCategoryLabel(listing.category)}
                  </Badge>
                </div>

                <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold mb-4 md:mb-6 text-black leading-tight">
                  {listing.title}
                </h1>

                <div className="flex items-center gap-2 text-[#ec644a] font-bold text-xl sm:text-2xl mb-4 md:mb-6">
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
                  {proposals.length} challenges ontvangen
                </div>

                <Separator className="my-4 md:my-6 bg-[#B2B3B4]" />

                <div>
                  <h2 className="font-semibold text-base sm:text-lg mb-2 md:mb-3 text-black">Beschrijving</h2>
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px] sm:text-[16px] md:text-[18px]">
                    {listing.description}
                  </p>
                </div>

                <Separator className="my-4 md:my-6 bg-[#B2B3B4]" />

                <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Geplaatst {timeAgo}</span>
                </div>
              </CardContent>
            </Card>

            {/* Proposals Section */}
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Lightbulb className="w-6 h-6 md:w-7 md:h-7 text-[#ec644a]" />
                <h2 className="text-white font-bold text-[22px] sm:text-[24px] md:text-[28px]">
                  Challenges ({proposals.length})
                </h2>
              </div>

              {isAdmin ? (
                proposals.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {proposals.map((proposal) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                      <p className="text-gray-600 text-base sm:text-lg mb-2">
                        Nog geen challenges ingediend
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        Wees de eerste om een challenge in te dienen!
                      </p>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-gray-600 text-base sm:text-lg mb-2">
                      Challenges zijn alleen zichtbaar voor beheerders
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Log in als admin om de challenges te bekijken
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-20 bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-3 md:mb-4 text-black">Contact</h3>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Organisatie</p>
                      <p className="font-medium text-black text-sm sm:text-base break-words">{listing.author}</p>
                    </div>
                  </div>

                  {listing.organization && (
                    <div className="flex items-start gap-2 md:gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">Afdeling</p>
                        <p className="font-medium text-black text-sm sm:text-base break-words">{listing.organization}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 md:gap-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Email</p>
                      <p className="font-medium text-xs sm:text-sm break-all text-black">{listing.email}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 md:my-6 bg-[#B2B3B4]" />

                <Button
                  className="w-full gap-2 bg-[#ec644a] hover:bg-[#f56565] text-white text-sm sm:text-base"
                  onClick={() => navigate(`/listing/${id}/submit-proposal`)}
                >
                  <Mail className="w-4 h-4" />
                  Dien een challenge in
                </Button>

                <p className="text-[10px] sm:text-xs text-gray-600 mt-3 md:mt-4 text-center">
                  Deel je ideeën en challenges voor deze case
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMunicipalityLabel(municipality: string): string {
  return municipalityLabels[municipality as keyof typeof municipalityLabels] || municipality;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    duurzaamheid: 'Duurzaamheid',
    mobiliteit: 'Mobiliteit',
    'sociale-cohesie': 'Sociale Cohesie',
    veiligheid: 'Veiligheid',
    innovatie: 'Innovatie',
    overig: 'Overig',
  };
  return labels[category] || category;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuten geleden`;
  } else if (diffInHours < 24) {
    return `${diffInHours} uur geleden`;
  } else if (diffInDays < 7) {
    return `${diffInDays} dagen geleden`;
  } else {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
