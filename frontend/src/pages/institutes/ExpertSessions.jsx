import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import apiClient from "@/lib/apiClient.js";
import {
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Users,
  Video,
  GraduationCap,
  Globe,
} from "lucide-react";

const ExpertSessions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [enrollmentNotifications, setEnrollmentNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expertsResponse, enrollmentsResponse] = await Promise.all([
          apiClient.get("/expert-sessions"),
          apiClient.get("/expert-sessions/institutes/enrollments/latest"),
        ]);
        setExperts(expertsResponse.data || []);
        setEnrollmentNotifications(enrollmentsResponse.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load expert sessions right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.get("/expert-sessions/institutes/enrollments/latest");
      setEnrollmentNotifications(response.data || []);
      setToast({ type: "success", message: "Latest activity fetched" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Unable to refresh notifications" });
    } finally {
      setRefreshing(false);
    }
  };

  const openDetails = (expert) => {
    setSelectedExpert(expert);
    setModalMode("details");
  };

  const openEnrollment = (expert) => {
    setSelectedExpert(expert);
    setModalMode("enroll");
    setEnrollmentForm({
      ...defaultFormState,
      preferredMode: expert?.sessionFormats?.[0] || "Online",
    });
  };

  const closeModal = () => {
    setSelectedExpert(null);
    setModalMode(null);
    setEnrollmentForm(defaultFormState);
  };

  const onFormChange = (field, value) => {
    setEnrollmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedExpert) return;

    const payload = {
      ...enrollmentForm,
      expectedParticipantCount: enrollmentForm.expectedParticipantCount
        ? Number(enrollmentForm.expectedParticipantCount)
        : null,
    };

    try {
      setSubmitting(true);
      const response = await apiClient.post(
        `/expert-sessions/${selectedExpert.id}/enroll`,
        payload
      );
      setToast({ type: "success", message: "Enrollment request submitted" });
      setEnrollmentNotifications((prev) => [response.data, ...(prev || [])].slice(0, 10));
      closeModal();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error ||
        "Something went wrong while submitting the enrollment. Please retry.";
      setToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };


  const totalDomains = useMemo(() => {
    const domainSet = new Set();
    experts.forEach((expert) => {
      (expert.expertiseDomains || []).forEach((domain) => domainSet.add(domain));
    });
    return domainSet.size;
  }, [experts]);

  const formatCurrency = (value) => {
    const numericValue =
      typeof value === "number" ? value : value ? Number(value) : Number.NaN;
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return "Not available";
    }
    return `₹${numericValue.toLocaleString("en-IN")}`;
  };

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          expertCount={experts.length}
          domainCount={totalDomains}
          notifications={enrollmentNotifications}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      }
    >
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Expert Session Service</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Discover curated industry leaders ready to host tailored sessions for your institute.
              Browse expert profiles, review in-depth session details, and submit an enrollment
              request that fits your schedule and delivery mode.
            </p>
          </div>
          <Button 
            type="button"
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            {refreshing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing
              </span>
            ) : (
              "Refresh activity"
            )}
          </Button>
        </header>

        {toast && (
          <div
            className={`rounded-md border px-4 py-3 text-sm transition ${
              toast.type === "success"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Fetching curated experts for you...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {experts.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  onViewDetails={() => openDetails(expert)}
                  onEnroll={() => openEnrollment(expert)}
                  formatCurrency={formatCurrency}
                />
              ))}
            </section>
            {!experts.length && (
              <div className="rounded-lg border border-dashed px-6 py-10 text-center text-muted-foreground">
                No expert sessions are available yet. Please check back soon.
              </div>
            )}
          </>
        )}
      </div>

    </DashboardLayout>
  );
};

const Sidebar = ({ expertCount, domainCount, notifications, onRefresh, refreshing }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Service Snapshot</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Track service health and recent enrollment activity from institutes.
        </p>
        <div className="mt-4 grid gap-3">
          <StatPill icon={<Users className="h-4 w-4 text-primary" />} label="Active experts" value={expertCount} />
          <StatPill icon={<GraduationCap className="h-4 w-4 text-primary" />} label="Domains covered" value={domainCount} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Recent enrollments</h3>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={onRefresh} 
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
        <div className="space-y-3">
          {notifications && notifications.length ? (
            notifications.map((notification) => (
              <div key={notification.id} className="rounded-md border p-3">
                <p className="text-sm font-medium leading-tight">
                  {notification.instituteName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.contactPersonName} · {notification.preferredMode}
                  {" · "}
                  {formatDate(notification.preferredDate)}
                  {notification.preferredTime ? ` ${notification.preferredTime}` : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  For {notification.expertNameSnapshot}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No enrollments yet. They will appear here once institutes submit requests.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatPill = ({ icon, label, value }) => (
  <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2 shadow-sm">
    <div className="flex items-center gap-2 text-sm font-medium">
      {icon}
      {label}
    </div>
    <span className="text-base font-semibold">{value}</span>
  </div>
);

const ExpertCard = ({ expert, onViewDetails, onEnroll, formatCurrency }) => {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow h-full">
      <div className="relative h-24 w-full overflow-hidden bg-muted">
        <img
          src={expert.photoUrl}
          alt={expert.fullName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <CardHeader className="pb-1.5 pt-2 px-2.5">
        <CardTitle className="text-sm leading-tight line-clamp-1 font-semibold">{expert.fullName}</CardTitle>
        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{expert.designation}</p>
        {expert.organization && (
          <p className="text-xs text-muted-foreground">{expert.organization}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-1.5 px-2.5 pb-2">
        <div className="flex flex-wrap gap-1">
          {(expert.expertiseDomains || []).slice(0, 2).map((domain) => (
            <span
              key={domain}
              className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary line-clamp-1 max-w-full"
            >
              {domain.length > 12 ? `${domain.slice(0, 12)}...` : domain}
            </span>
          ))}
          {(expert.expertiseDomains || []).length > 2 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              +{(expert.expertiseDomains || []).length - 2}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5 rounded border bg-muted/30 p-1.5">
          <div>
            <p className="text-muted-foreground flex items-center gap-0.5 font-medium text-[9px]">
              <Video className="h-2.5 w-2.5" /> Online
            </p>
            <p className="mt-0.5 font-semibold text-[10px] leading-tight">{formatCurrency(expert.pricingPerHourOnline)}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-0.5 font-medium text-[9px]">
              <MapPin className="h-2.5 w-2.5" /> Offline
            </p>
            <p className="mt-0.5 font-semibold text-[10px] leading-tight">{formatCurrency(expert.pricingPerHourOffline)}</p>
          </div>
        </div>
        <div className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">
          {expert.summary || ""}
        </div>
      </CardContent>
      <CardFooter className="gap-1.5 px-2.5 pb-2 pt-0">
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          className="flex-1 text-[10px] h-7 px-2" 
          onClick={onViewDetails}
        >
          Details
        </Button>
        <Button 
          type="button"
          size="sm"
          className="flex-1 text-[10px] h-7 px-2" 
          onClick={onEnroll}
        >
          Enroll
        </Button>
      </CardFooter>
    </Card>
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
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
          >
            {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return "Date TBC";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

export default ExpertSessions;

