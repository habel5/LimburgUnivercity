import { MessageSquare, User, Building2, Clock } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Proposal } from "../lib/supabase";

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const timeAgo = getTimeAgo(proposal.created_at);

  return (
    <Card className="bg-[#f2f2f2] border-0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-5 md:p-6">
        {/* Title and Description */}
        <div className="flex items-start gap-3 mb-5">
          <MessageSquare className="w-6 h-6 text-[#f2644c] mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[20px] md:text-[22px] text-black mb-2 line-clamp-2">
              {proposal.title}
            </h3>
            <p className="text-gray-700 text-[15px] md:text-[16px] leading-relaxed line-clamp-3">
              {proposal.description}
            </p>
          </div>
        </div>

        <Separator className="my-4 bg-[#B2B3B4]" />

        {/* Footer Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-[150px]">{proposal.author}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-[150px]">{proposal.organization}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 ml-auto">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{timeAgo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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