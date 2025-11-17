import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import apiClient from "@/lib/apiClient.js";
import {
  Calendar,
  Loader2,
  MapPin,
  Users,
  Video,
  Globe,
  ArrowLeft,
} from "lucide-react";

const ExpertDetails = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/expert-sessions");
        const experts = response.data || [];
        const foundExpert = experts.find((e) => e.id === expertId);
        if (foundExpert) {
          setExpert(foundExpert);
        } else {
          setError("Expert not found");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load expert details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (expertId) {
      fetchExpert();
    }
  }, [expertId]);


  const formatCurrency = (value) => {
    const numericValue =
      typeof value === "number" ? value : value ? Number(value) : Number.NaN;
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return "Not available";
    }
    return `₹${numericValue.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading expert details...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !expert) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate("/institutes/expert-sessions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expert Sessions
          </Button>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-red-700">
            {error || "Expert not found"}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/institutes/expert-sessions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Expert Session Details</h1>
            <p className="text-muted-foreground mt-2">
              View detailed information and enroll for a session with {expert.fullName}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column - Expert Info */}
          <Card>
            <div className="relative h-64 w-full overflow-hidden bg-muted">
              <img
                src={expert.photoUrl}
                alt={expert.fullName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <CardContent className="space-y-6 p-6">
              <div>
                <h2 className="text-2xl font-semibold">{expert.fullName}</h2>
                <p className="text-sm text-muted-foreground">
                  {expert.designation}
                  {expert.organization ? ` · ${expert.organization}` : ""}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{expert.summary}</p>
              <DetailList title="Expertise domains" items={expert.expertiseDomains} />
              <DetailList title="Session formats" items={expert.sessionFormats} icon={Video} />
              <DetailList title="Session durations" items={expert.sessionDurations} />
              <DetailList title="Topics covered" items={expert.topicsCovered} />
              <div className="grid gap-3 rounded-md border bg-muted/30 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Video className="h-4 w-4" /> Online per hour
                  </span>
                  <span className="font-semibold">{formatCurrency(expert.pricingPerHourOnline)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> Offline per hour
                  </span>
                  <span className="font-semibold">{formatCurrency(expert.pricingPerHourOffline)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {expert.yearsOfExperience ? (
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {expert.yearsOfExperience}+ years experience
                  </span>
                ) : null}
                {expert.languages?.length ? (
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {expert.languages.join(", ")}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Session Details */}
          <Card>
            <CardContent className="px-6 py-6">
              <div className="space-y-6">
                <div className="space-y-4 text-sm text-slate-700">
                  <p>
                    Book a tailored session with {expert.fullName}. Select the delivery mode, share
                    institute contact details, and outline expectations so the expert team can respond
                    quickly.
                  </p>
                  <div className="rounded-md border bg-muted/40 p-4">
                    <h4 className="text-sm font-semibold text-slate-800">Session quick facts</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {expert.sessionDurations?.join(" · ") || "Flexible timelines"}
                      </li>
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        {expert.sessionFormats?.join(" · ") || "Available on request"}
                      </li>
                      {expert.baseLocation && (
                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Based in {expert.baseLocation}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Suggested pre-work</h4>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                      <li>Share institute context and session goals via enrollment notes.</li>
                      <li>Confirm preferred duration and participant profile.</li>
                      <li>Indicate audio-visual setup needs for offline engagements.</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => navigate(`/institutes/expert-sessions/${expertId}/enroll`)}
                    className="w-full"
                    size="lg"
                  >
                    Enroll for Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};


const DetailList = ({ title, items, icon: Icon }) => {
  if (!items || !items.length) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExpertDetails;

