import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { projectId, publicAnonKey } from '../config/env';
import { ArrowLeft, Database, BarChart3, FileText, Trash } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  municipality: string;
  category: string;
  created_at: string;
  proposal_count?: number;
}

interface Proposal {
  id: string;
  challenge_id: string;
  title: string;
  author: string;
  organization: string;
  created_at: string;
}

interface Stats {
  totalChallenges: number;
  totalProposals: number;
  challengesByMunicipality: Record<string, number>;
  challengesByCategory: Record<string, number>;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Geen toegang! U moet ingelogd zijn als admin om het admin paneel te openen.');
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch challenges
      const challengesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData);

        // Calculate stats
        const challengesByMunicipality: Record<string, number> = {};
        const challengesByCategory: Record<string, number> = {};
        let totalProposals = 0;

        challengesData.forEach((ch: Challenge) => {
          // Count by municipality
          challengesByMunicipality[ch.municipality] = (challengesByMunicipality[ch.municipality] || 0) + 1;
          
          // Count by category
          challengesByCategory[ch.category] = (challengesByCategory[ch.category] || 0) + 1;
          
          // Count proposals
          totalProposals += ch.proposal_count || 0;
        });

        setStats({
          totalChallenges: challengesData.length,
          totalProposals,
          challengesByMunicipality,
          challengesByCategory,
        });
      }

      // Fetch all proposals directly from new endpoint
      const proposalsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/proposals`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (proposalsResponse.ok) {
        const proposalsData = await proposalsResponse.json();
        setProposals(proposalsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Er is een fout opgetreden bij het ophalen van data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm(`Weet je zeker dat je uitdaging ${id} wilt verwijderen? Dit verwijdert ook alle bijbehorende voorstellen.`)) {
      return;
    }

    try {
      setDeletingId(id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': accessToken || '',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete challenge');
      }

      toast.success(`Uitdaging ${id} verwijderd`);
      fetchData();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteProposal = async (proposalId: string, challengeId: string) => {
    if (!confirm(`Weet je zeker dat je voorstel ${proposalId} wilt verwijderen?`)) {
      return;
    }

    try {
      setDeletingId(proposalId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges/${challengeId}/proposals/${proposalId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': accessToken || '',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete proposal');
      }

      toast.success(`Voorstel ${proposalId} verwijderd`);
      fetchData();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const municipalityLabels: Record<string, string> = {
    'maastricht': 'Maastricht',
    'heerlen': 'Heerlen',
    'sittard-geleen': 'Sittard-Geleen',
    'venlo': 'Venlo',
    'roermond': 'Roermond',
  };

  const categoryLabels: Record<string, string> = {
    'duurzaamheid': 'Duurzaamheid',
    'mobiliteit': 'Mobiliteit',
    'sociale-cohesie': 'Sociale Cohesie',
    'veiligheid': 'Veiligheid',
    'innovatie': 'Innovatie',
    'overig': 'Overig',
  };

  return (
    <div className="bg-[#2c2a64] min-h-[calc(100vh-149px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2 text-white hover:text-[#8dc49f] hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar home
        </Button>

        <div className="space-y-6">
          <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <CardHeader className="pb-6">
              <CardTitle className="text-[26px] font-bold text-black flex items-center gap-2">
                <Database className="w-6 h-6 text-[#8dc49f]" />
                Admin Paneel
              </CardTitle>
              <CardDescription className="text-[18px] text-gray-700">
                Beheer uitdagingen, voorstellen en bekijk statistieken
              </CardDescription>
            </CardHeader>
          </Card>

          {loading ? (
            <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <CardContent className="py-8 text-center text-gray-600">
                Laden...
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Statistics */}
              {stats && (
                <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <CardHeader>
                    <CardTitle className="text-[22px] font-bold text-black flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#8dc49f]" />
                      Statistieken
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#2c2a64]">{stats.totalChallenges}</div>
                        <div className="text-sm text-gray-600">Totaal Uitdagingen</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#2c2a64]">{stats.totalProposals}</div>
                        <div className="text-sm text-gray-600">Totaal Voorstellen</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#8dc49f]">
                          {stats.totalChallenges > 0 ? (stats.totalProposals / stats.totalChallenges).toFixed(1) : '0'}
                        </div>
                        <div className="text-sm text-gray-600">Gem. Voorstellen/Uitdaging</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#2c2a64]">
                          {Object.keys(stats.challengesByMunicipality).length}
                        </div>
                        <div className="text-sm text-gray-600">Actieve Gemeentes</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* By Municipality */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-black mb-3">Per Gemeente</h4>
                        <div className="space-y-2">
                          {Object.entries(stats.challengesByMunicipality).map(([key, count]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">{municipalityLabels[key] || key}</span>
                              <span className="font-semibold text-[#2c2a64]">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* By Category */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-black mb-3">Per Categorie</h4>
                        <div className="space-y-2">
                          {Object.entries(stats.challengesByCategory).map(([key, count]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">{categoryLabels[key] || key}</span>
                              <span className="font-semibold text-[#2c2a64]">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Challenges List */}
              <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <CardHeader>
                  <CardTitle className="text-[22px] font-bold text-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#8dc49f]" />
                    Uitdagingen ({challenges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challenges.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Geen uitdagingen gevonden</p>
                  ) : (
                    <div className="space-y-2">
                      {challenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm text-gray-500">{challenge.id}</span>
                              <span className="text-xs bg-[#8dc49f] text-white px-2 py-0.5 rounded">
                                {municipalityLabels[challenge.municipality]}
                              </span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                {categoryLabels[challenge.category]}
                              </span>
                            </div>
                            <h4 className="font-semibold text-black truncate mb-1">{challenge.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{challenge.proposal_count || 0} voorstellen</span>
                              <span>{formatDate(challenge.created_at)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            disabled={deletingId === challenge.id}
                            className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Proposals List */}
              <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <CardHeader>
                  <CardTitle className="text-[22px] font-bold text-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#8dc49f]" />
                    Voorstellen ({proposals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposals.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Geen voorstellen gevonden</p>
                  ) : (
                    <div className="space-y-2">
                      {proposals.map((proposal) => (
                        <div
                          key={proposal.id}
                          className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm text-gray-500">{proposal.id}</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                voor {proposal.challenge_id}
                              </span>
                            </div>
                            <h4 className="font-semibold text-black truncate mb-1">{proposal.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{proposal.author}</span>
                              <span>{proposal.organization}</span>
                              <span>{formatDate(proposal.created_at)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProposal(proposal.id, proposal.challenge_id)}
                            disabled={deletingId === proposal.id}
                            className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
