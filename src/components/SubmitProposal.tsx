import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Listing } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { projectId, publicAnonKey } from '../config/env';

export default function SubmitProposal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    email: '',
    organization: '',
    interestType: '',
  });

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Je moet inloggen om een challenge in te dienen');
      navigate(`/listing/${id}`);
    }
  }, [isAuthenticated, navigate, id]);

  const fetchChallenge = async () => {
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
      setChallenge(data.challenge);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      toast.error('Kon case niet laden');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.author || !formData.email || !formData.organization || !formData.interestType) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('=== FRONTEND: Creating proposal ===');
      console.log('Challenge ID:', id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/proposals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': accessToken || '',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            challenge_id: id,
            title: formData.title,
            description: formData.description,
            author: formData.author,
            email: formData.email,
            organization: formData.organization,
            interest_type: formData.interestType,
          }),
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create proposal:', errorData);
        throw new Error(errorData.error || 'Failed to create proposal');
      }

      const result = await response.json();
      console.log('Proposal created successfully:', result);
      
      toast.success('Challenge succesvol ingediend!');
      setTimeout(() => {
        navigate(`/listing/${id}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Er is een fout opgetreden bij het indienen van de challenge');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#2c2a64] min-h-[calc(100vh-149px)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-white text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !challenge) {
    return null;
  }

  return (
    <div className="bg-[#2c2a64] min-h-[calc(100vh-149px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/listing/${id}`)}
          className="mb-6 gap-2 text-white hover:text-[#8dc49f] hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar case
        </Button>

        <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <CardHeader>
            <CardTitle className="text-[26px] font-bold text-black">Challenge Indienen</CardTitle>
            <CardDescription className="text-[18px] text-gray-700">
              Dien je challenge in voor: <span className="font-semibold">{challenge.title}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-black text-[18px]">
                  Titel van je challenge *
                </Label>
                <Input
                  id="title"
                  placeholder="Bijv. Groen vervoer initiatief"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black text-[18px]">Beschrijving *</Label>
                <Textarea
                  id="description"
                  placeholder="Beschrijf je challenge in detail..."
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author" className="text-black text-[18px]">Naam *</Label>
                <Input
                  id="author"
                  placeholder="Voor- en achternaam"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black text-[18px]">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organization" className="text-black text-[18px]">
                  Organisatie *
                </Label>
                <Input
                  id="organization"
                  placeholder="Bijv. Hogeschool Zuyd"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Interest Type */}
              <div className="space-y-2">
                <Label htmlFor="interestType" className="text-black text-[18px]">
                  Interesse Type *
                </Label>
                <Select
                  value={formData.interestType}
                  onValueChange={(value) => setFormData({ ...formData, interestType: value })}
                  required
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecteer interesse type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meer-over-weten">Meer over weten</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="educatie">Ik wil dit onderwerp in mijn educatie</SelectItem>
                    <SelectItem value="oplossing">Oplossing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#8dc49f] hover:bg-[#7ab88d] text-white"
                  disabled={submitting}
                >
                  {submitting ? 'Bezig...' : 'Challenge Indienen'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/listing/${id}`)}
                  className="bg-white hover:bg-gray-100"
                  disabled={submitting}
                >
                  Annuleren
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
