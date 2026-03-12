import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, getStatusColor } from "@/lib/formatters";
import { Handshake, TrendingUp, Clock, Users, ArrowRight, Target, Shield } from "lucide-react";
import type { Deal, Project, Asset, Investor } from "@shared/schema";

interface DealCardProps {
  deal: Deal;
  project?: Project;
  asset?: Asset;
  matchedInvestors?: Investor[];
  progress: number;
  onView?: () => void;
  onInvest?: () => void;
  testId?: string;
}

export function DealCard({ deal, project, asset, matchedInvestors, progress, onView, onInvest, testId }: DealCardProps) {
  const dealName = (deal as any).projectName || project?.phase || deal.phase || "Unnamed Deal";
  const isFullyFunded = progress >= 100;
  const isAlmostFunded = progress >= 75 && progress < 100;

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
      data-testid={testId}
      onClick={onView}
    >
      {/* Gradient header based on funding status */}
      <div className={`h-2 w-full ${isFullyFunded ? 'bg-gradient-to-r from-chart-2 to-emerald-400' : isAlmostFunded ? 'bg-gradient-to-r from-chart-3 to-amber-400' : 'bg-gradient-to-r from-primary to-blue-400'}`} />

      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-semibold truncate">{dealName}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {asset?.name || asset?.assetType || "Mixed-Use Development"} • {asset?.location || "Location TBD"}
            </p>
          </div>
          <Badge variant="secondary" className={`${getStatusColor(deal.status)} shrink-0`}>
            {deal.status}
          </Badge>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative">
            {/* Outer ring */}
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                opacity="0.3"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke={isFullyFunded ? "#10b981" : isAlmostFunded ? "#f59e0b" : "hsl(var(--primary))"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${progress * 3.02} 301.6`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{progress}%</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Funded</span>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-semibold">{formatCurrency(deal.capitalRequired)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className={`font-semibold ${isFullyFunded ? 'text-chart-2' : ''}`}>{formatCurrency(deal.capitalRaised)}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Deal Terms */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{deal.returnProfile}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{deal.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{deal.riskLevel} Risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{deal.complexity}</span>
          </div>
        </div>

        {/* Investor Match (if applicable) */}
        {matchedInvestors && matchedInvestors.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-chart-2/10 mb-4">
            <Users className="h-3.5 w-3.5 text-chart-2" />
            <span className="text-xs text-chart-2 font-medium">
              {matchedInvestors.length} matched investors
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onInvest?.();
          }}
        >
          <span className="flex items-center gap-2">
            {isFullyFunded ? 'View Details' : 'View Deal'}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
