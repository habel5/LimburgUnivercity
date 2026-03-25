import { Link } from "react-router";
import { Clock, Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Listing, municipalityLabels } from "../lib/supabase";
import svgPaths from "../imports/svg-j82t6p4shp";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const timeAgo = getTimeAgo(listing.created_at);

  return (
    <Link to={`/listing/${listing.id}`} className="group">
      <Card className="h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <CardContent className="p-5 md:p-6 flex flex-col h-full">
          {/* Title */}
          <h3 className="font-bold text-[22px] md:text-[26px] text-black leading-tight mb-3 line-clamp-2 group-hover:text-[#2a2321] transition-colors">
            {listing.title}
          </h3>
          
          {/* Organization */}
          <p className="text-black/80 text-[18px] md:text-[20px] mb-4 line-clamp-1">
            {listing.organization || listing.author}
          </p>

          {/* Badge */}
          <Badge className="bg-[#ec644a] hover:bg-[#f56565] text-white text-[17px] md:text-[19px] px-4 py-1.5 rounded-[5px] w-fit mb-4 transition-colors">
            {getMunicipalityLabel(listing.municipality)}
          </Badge>

          {/* Spacer to push content to bottom */}
          <div className="flex-1"></div>

          {/* Challenges count */}
          <div className="flex items-center gap-2 text-black/70 text-[17px] md:text-[19px] mb-4">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p4906540} stroke="#B2B3B4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>{listing.proposal_count || 0} challenges</span>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-[#B2B3B4] mb-4" />

          {/* Date */}
          <div className="text-black/60 text-[16px] md:text-[18px]">
            Geplaatst op {formatDate(listing.created_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m geleden`;
  } else if (diffInHours < 24) {
    return `${diffInHours}u geleden`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d geleden`;
  } else {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  }
}
