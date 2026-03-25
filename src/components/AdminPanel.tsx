import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { projectId, publicAnonKey } from '../config/env';
import { categories, municipalities, municipalityLabels, Category, Municipality } from "../lib/supabase";
import { ArrowLeft, Database, BarChart3, FileText, Pencil, Trash } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  municipality: string;
  category: string;
  author: string;
  email: string;
  organization?: string;
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

interface ChallengeFormState {
  id: string;
  title: string;
  description: string;
  municipality: Municipality | "";
  category: Category | "";
  organization: string;
  email: string;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<ChallengeFormState | null>(null);
  const [savingChallenge, setSavingChallenge] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated && !accessToken) {
      toast.error('Geen toegang! U moet ingelogd zijn als admin om het admin paneel te openen.');
      navigate('/');
      return;
    }
  }, [isAuthenticated, accessToken, navigate]);

  useEffect(() => {
    if (isAuthenticated || accessToken) {
      fetchData();
    }
  }, [isAuthenticated, accessToken]);

  const handleExpiredSession = () => {
    logout();
    toast.error('Je adminsessie is verlopen. Log opnieuw in om verder te gaan.');
    navigate('/');
  };

  const getResponseErrorMessage = async (response: Response, fallback: string) => {
    try {
      const errorData = await response.json();
      return errorData.error || fallback;
    } catch {
      const errorText = await response.text();
      return errorText || fallback;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [challengesResponse, proposalsResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/proposals`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }),
      ]);

      let challengesData: Challenge[] = [];
      let proposalsData: Proposal[] = [];

      if (challengesResponse.ok) {
        const parsedChallenges = await challengesResponse.json();
        challengesData = Array.isArray(parsedChallenges) ? parsedChallenges : [];
      } else {
        const errorMessage = await getResponseErrorMessage(challengesResponse, 'Failed to fetch challenges');
        if (challengesResponse.status === 401 && errorMessage.toLowerCase().includes('session')) {
          handleExpiredSession();
          return;
        }
        console.error('Failed to fetch challenges:', challengesResponse.status, errorMessage);
      }

      if (proposalsResponse.ok) {
        const parsedProposals = await proposalsResponse.json();
        proposalsData = Array.isArray(parsedProposals) ? parsedProposals : [];
      } else {
        const errorMessage = await getResponseErrorMessage(proposalsResponse, 'Failed to fetch proposals');
        if (proposalsResponse.status === 401 && errorMessage.toLowerCase().includes('session')) {
          handleExpiredSession();
          return;
        }
        console.error('Failed to fetch proposals:', proposalsResponse.status, errorMessage);
      }

      setChallenges(challengesData);
      setProposals(proposalsData);

      const challengesByMunicipality: Record<string, number> = {};
      const challengesByCategory: Record<string, number> = {};
      let totalProposals = 0;

      challengesData.forEach((challenge) => {
        challengesByMunicipality[challenge.municipality] = (challengesByMunicipality[challenge.municipality] || 0) + 1;
        challengesByCategory[challenge.category] = (challengesByCategory[challenge.category] || 0) + 1;
        totalProposals += challenge.proposal_count || 0;
      });

      setStats({
        totalChallenges: challengesData.length,
        totalProposals,
        challengesByMunicipality,
        challengesByCategory,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Er is een fout opgetreden bij het ophalen van data');
      setChallenges([]);
      setProposals([]);
      setStats({
        totalChallenges: 0,
        totalProposals: 0,
        challengesByMunicipality: {},
        challengesByCategory: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm(`Weet je zeker dat je case ${id} wilt verwijderen? Dit verwijdert ook alle bijbehorende voorstellen.`)) {
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
        const errorMessage = await getResponseErrorMessage(response, 'Failed to delete challenge');
        if (response.status === 401 && errorMessage.toLowerCase().includes('session')) {
          handleExpiredSession();
          return;
        }
        throw new Error(errorMessage);
      }

      toast.success(`Case ${id} verwijderd`);
      await fetchData();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden bij het verwijderen');
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
        const errorMessage = await getResponseErrorMessage(response, 'Failed to delete proposal');
        if (response.status === 401 && errorMessage.toLowerCase().includes('session')) {
          handleExpiredSession();
          return;
        }
        throw new Error(errorMessage);
      }

      toast.success(`Voorstel ${proposalId} verwijderd`);
      await fetchData();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (challenge: Challenge) => {
    setEditingChallenge({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      municipality: challenge.municipality as Municipality,
      category: challenge.category as Category,
      organization: challenge.organization || "",
      email: challenge.email,
    });
  };

  const handleSaveChallenge = async () => {
    if (!editingChallenge) return;

    if (
      !editingChallenge.title ||
      !editingChallenge.description ||
      !editingChallenge.municipality ||
      !editingChallenge.category ||
      !editingChallenge.organization ||
      !editingChallenge.email
    ) {
      toast.error("Vul alle verplichte velden in");
      return;
    }

    try {
      setSavingChallenge(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges/${editingChallenge.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": accessToken || "",
          },
          body: JSON.stringify({
            title: editingChallenge.title,
            description: editingChallenge.description,
            category: editingChallenge.category,
            municipality: editingChallenge.municipality,
            author: editingChallenge.organization,
            email: editingChallenge.email,
            organization: editingChallenge.organization,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await getResponseErrorMessage(response, "Failed to update challenge");
        if (response.status === 401 && errorMessage.toLowerCase().includes('session')) {
          handleExpiredSession();
          return;
        }
        throw new Error(errorMessage);
      }

      toast.success(`Case ${editingChallenge.id} bijgewerkt`);
      setEditingChallenge(null);
      fetchData();
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast.error("Er is een fout opgetreden bij het opslaan van de case");
    } finally {
      setSavingChallenge(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
    <div className="bg-[#2a2321] min-h-[calc(100vh-149px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2 text-white hover:text-[#ec644a] hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar home
        </Button>

        <div className="space-y-6">
          <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <CardHeader className="pb-6">
              <CardTitle className="text-[26px] font-bold text-black flex items-center gap-2">
                <Database className="w-6 h-6 text-[#ec644a]" />
                Admin Paneel
              </CardTitle>
              <CardDescription className="text-[18px] text-gray-700">
                Beheer cases, voorstellen en bekijk statistieken
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
                      <BarChart3 className="w-5 h-5 text-[#ec644a]" />
                      Statistieken
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#2a2321]">{stats.totalChallenges}</div>
                        <div className="text-sm text-gray-600">Totaal Cases</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#2a2321]">{stats.totalProposals}</div>
                        <div className="text-sm text-gray-600">Totaal Voorstellen</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#ec644a]">
                          {stats.totalChallenges > 0 ? (stats.totalProposals / stats.totalChallenges).toFixed(1) : '0'}
                        </div>
                        <div className="text-sm text-gray-600">Gem. Voorstellen/Case</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#2a2321]">
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
                              <span className="font-semibold text-[#2a2321]">{count}</span>
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
                              <span className="font-semibold text-[#2a2321]">{count}</span>
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
                    <FileText className="w-5 h-5 text-[#ec644a]" />
                    Cases ({challenges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challenges.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Geen cases gevonden</p>
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
                              <span className="text-xs bg-[#ec644a] text-white px-2 py-0.5 rounded">
                                {municipalityLabels[challenge.municipality as keyof typeof municipalityLabels] || challenge.municipality}
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
                          <div className="ml-4 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(challenge)}
                              className="text-[#2a2321] hover:text-[#ec644a] hover:bg-orange-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChallenge(challenge.id)}
                              disabled={deletingId === challenge.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
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
                    <FileText className="w-5 h-5 text-[#ec644a]" />
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

      <Dialog open={editingChallenge !== null} onOpenChange={(open) => !open && setEditingChallenge(null)}>
        <DialogContent className="bg-[#f2f2f2] border-0 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">Case bewerken</DialogTitle>
            <DialogDescription className="text-gray-700">
              Pas de gegevens van deze case aan en sla de wijzigingen op.
            </DialogDescription>
          </DialogHeader>

          {editingChallenge && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-black">Titel</Label>
                <Input
                  id="edit-title"
                  value={editingChallenge.title}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-municipality" className="text-black">Gemeente</Label>
                  <Select
                    value={editingChallenge.municipality}
                    onValueChange={(value) =>
                      setEditingChallenge({ ...editingChallenge, municipality: value as Municipality })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecteer een gemeente" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((municipality) => (
                        <SelectItem key={municipality.value} value={municipality.value}>
                          {municipality.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-black">Categorie</Label>
                  <Select
                    value={editingChallenge.category}
                    onValueChange={(value) =>
                      setEditingChallenge({ ...editingChallenge, category: value as Category })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecteer een categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-black">Beschrijving</Label>
                <Textarea
                  id="edit-description"
                  rows={6}
                  value={editingChallenge.description}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-organization" className="text-black">Afdeling</Label>
                  <Input
                    id="edit-organization"
                    value={editingChallenge.organization}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, organization: e.target.value })}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-black">Contact Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingChallenge.email}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, email: e.target.value })}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingChallenge(null)}
              disabled={savingChallenge}
              className="bg-white hover:bg-gray-100"
            >
              Annuleren
            </Button>
            <Button
              type="button"
              onClick={handleSaveChallenge}
              disabled={savingChallenge}
              className="bg-[#ec644a] hover:bg-[#f56565] text-white"
            >
              {savingChallenge ? "Opslaan..." : "Wijzigingen opslaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
