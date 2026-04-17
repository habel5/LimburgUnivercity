import { useState } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function LoginModal({ isOpen, onClose, redirectTo }: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success("Succesvol ingelogd!");
        onClose();
        if (redirectTo) {
          navigate(redirectTo);
        }
      } else {
        toast.error("Ongeldige inloggegevens");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Er is een fout opgetreden bij het inloggen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#204448]/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[linear-gradient(180deg,#ffffff_0%,#fff5ee_100%)] border border-[#ec644a]/12 rounded-[18px] shadow-[0_24px_60px_rgba(36,53,55,0.12)]">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="vista-heading text-[26px] font-bold uppercase text-[#204448]">Inloggen</CardTitle>
          <CardDescription className="text-[18px] text-[#567073]">
            Log in als admin, gemeente of onderwijs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black text-[18px]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="voorbeeld@limburgunivercity.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black text-[18px]">
                Wachtwoord
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Voer wachtwoord in"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ec644a] hover:bg-[#f56565] text-white"
              >
                {isLoading ? 'Inloggen...' : 'Inloggen'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
