import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import apiClient from "@/lib/apiClient.js";
import {
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Users,
  Video,
  Globe,
  ArrowLeft,
  GraduationCap,
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
          <Button variant="outline" onClick={() => navigate("/industry/expert-sessions")}>
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
          <Button variant="outline" onClick={() => navigate("/industry/expert-sessions")}>
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
              <div className="space-y-6 text-sm text-slate-700">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Expert Profile
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Designation & Post</p>
                      <p className="font-medium text-slate-800">{expert.designation}</p>
                      {expert.organization && (
                        <p className="text-sm text-muted-foreground mt-1">{expert.organization}</p>
                      )}
                    </div>
                    {expert.yearsOfExperience && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Experience</p>
                        <p className="font-medium text-slate-800">{expert.yearsOfExperience}+ years of professional experience</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Domain of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(expert.expertiseDomains || []).map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Session Duration
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(expert.sessionDurations || []).map((duration) => (
                      <span
                        key={duration}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {duration}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Pricing Per Hour
                  </h4>
                  <div className="grid gap-3 rounded-lg border bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                    <div className="flex items-center justify-between p-3 rounded-md bg-white border border-slate-200">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <Video className="h-4 w-4 text-green-600" /> 
                        Online Mode
                      </span>
                      <span className="font-bold text-lg text-green-700">{formatCurrency(expert.pricingPerHourOnline)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-white border border-slate-200">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <MapPin className="h-4 w-4 text-blue-600" /> 
                        Offline Mode
                      </span>
                      <span className="font-bold text-lg text-blue-700">{formatCurrency(expert.pricingPerHourOffline)}</span>
                    </div>
                  </div>
                </div>

                  <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Topics Covered in Sessions
                  </h4>
                  {expert.topicsCovered && expert.topicsCovered.length > 0 ? (
                    <ul className="space-y-2">
                      {expert.topicsCovered.map((topic, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="text-slate-700">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Topics will be customized based on your requirements</p>
                  )}
                </div>

                <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Session Formats Available</h4>
                  <div className="flex flex-wrap gap-2">
                    {(expert.sessionFormats || []).map((format) => (
                      <span
                        key={format}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {format === "Online" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                {expert.baseLocation && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Based in {expert.baseLocation}</span>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-4">
                    Ready to book a session? Click the button below to submit your enrollment request.
                  </p>
                  <Button
                    onClick={() => navigate(`/industry/expert-sessions/${expertId}/enroll`)}
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

