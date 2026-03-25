import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { categories, municipalities, Category, Municipality } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { projectId, publicAnonKey } from '../config/env';

export default function AddListing() {
  const navigate = useNavigate();
  const { isAuthenticated, user, accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as Category | '',
    municipality: '' as Municipality | '',
    organization: '',
    email: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Je moet inloggen om een case te plaatsen');
      navigate('/');
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.municipality || !formData.organization || !formData.email) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('=== FRONTEND: Creating challenge ===');
      console.log('Access token (first 20 chars):', accessToken?.substring(0, 20));
      console.log('User:', user?.email);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/challenges`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': accessToken || '',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            municipality: formData.municipality,
            author: formData.organization,
            email: formData.email,
            organization: formData.organization,
          }),
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create challenge:', errorData);
        throw new Error(errorData.error || 'Failed to create challenge');
      }

      const result = await response.json();
      console.log('Challenge created successfully:', result);
      
      toast.success('Case succesvol geplaatst!');
      setTimeout(() => {
        navigate('/cases');
      }, 1000);
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Er is een fout opgetreden bij het plaatsen van de case');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-[#2a2321] min-h-[calc(100vh-149px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/cases')}
          className="mb-6 gap-2 text-white hover:text-[#ec644a] hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar overzicht
        </Button>

        <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <CardHeader>
            <CardTitle className="text-[26px] font-bold text-black">Nieuwe Case Plaatsen</CardTitle>
            <CardDescription className="text-[18px] text-gray-700">
              Plaats een nieuwe gemeentelijke case voor burgers en studenten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-black text-[18px]">
                  Titel (begin met "Hoe kunnen we...") *
                </Label>
                <Input
                  id="title"
                  placeholder="Bijv. Hoe kunnen we de luchtkwaliteit verbeteren?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Municipality */}
              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-black text-[18px]">Gemeente *</Label>
                <Select
                  value={formData.municipality}
                  onValueChange={(value) => setFormData({ ...formData, municipality: value as Municipality })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecteer een gemeente" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((mun) => (
                      <SelectItem key={mun.value} value={mun.value}>
                        {mun.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-black text-[18px]">Categorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecteer een categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black text-[18px]">Beschrijving *</Label>
                <Textarea
                  id="description"
                  placeholder="Geef een gedetailleerde beschrijving van de case..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organization" className="text-black text-[18px]">Afdeling *</Label>
                <Input
                  id="organization"
                  placeholder="Bijv. Afdeling Duurzaamheid"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black text-[18px]">Contact Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="afdeling@maastricht.nl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-white"
                />
                <p className="text-sm text-gray-600">
                  Burgers kunnen contact opnemen via dit emailadres
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#ec644a] hover:bg-[#f56565] text-white"
                  disabled={submitting}
                >
                  {submitting ? 'Bezig...' : 'Case Plaatsen'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/cases')}
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
