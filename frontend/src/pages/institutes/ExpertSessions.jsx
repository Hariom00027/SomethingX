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
  Phone,
  Mail,
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
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const defaultFormState = {
    instituteName: "",
    place: "",
    contactNumber: "",
    email: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    preferredMode: "Online",
    preferredDate: "",
    preferredTime: "",
    expectedParticipantCount: "",
    additionalNotes: "",
  };
  
  const [enrollmentForm, setEnrollmentForm] = useState(defaultFormState);

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
  }, []);

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
        `/expert-sessions/institutes/${selectedExpert.id}/enroll`,
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
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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

      {selectedExpert && (
        <ExpertModal
          expert={selectedExpert}
          mode={modalMode}
          onClose={closeModal}
          onSwitchMode={setModalMode}
          enrollmentForm={enrollmentForm}
          onFormChange={onFormChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          formatCurrency={formatCurrency}
        />
      )}
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
    <Card className="flex flex-col overflow-hidden">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <img
          src={expert.photoUrl}
          alt={expert.fullName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{expert.fullName}</CardTitle>
        <p className="text-sm text-muted-foreground">{expert.designation}</p>
        {expert.organization && (
          <p className="text-xs text-muted-foreground">{expert.organization}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Domains</p>
          <div className="flex flex-wrap gap-2">
            {(expert.expertiseDomains || []).slice(0, 3).map((domain) => (
              <span
                key={domain}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3 text-xs">
          <div>
            <p className="text-muted-foreground flex items-center gap-1 font-medium">
              <Video className="h-3.5 w-3.5" /> Online
            </p>
            <p className="mt-1 font-semibold">{formatCurrency(expert.pricingPerHourOnline)}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5" /> Offline
            </p>
            <p className="mt-1 font-semibold">{formatCurrency(expert.pricingPerHourOffline)}</p>
          </div>
        </div>
        {expert.baseLocation && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {expert.baseLocation}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {(expert.summary || "").length > 140
            ? `${expert.summary.slice(0, 140)}...`
            : expert.summary}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button 
          type="button"
          variant="outline" 
          className="flex-1" 
          onClick={onViewDetails}
        >
          View details
        </Button>
        <Button 
          type="button"
          className="flex-1" 
          onClick={onEnroll}
        >
          Enroll
        </Button>
      </CardFooter>
    </Card>
  );
};

const ExpertModal = ({
  expert,
  mode,
  onClose,
  onSwitchMode,
  enrollmentForm,
  onFormChange,
  onSubmit,
  submitting,
  formatCurrency,
}) => {
  if (!expert) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative max-h-full w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground text-2xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="border-r bg-slate-50">
            <div className="relative h-64 w-full overflow-hidden bg-muted">
              <img
                src={expert.photoUrl}
                alt={expert.fullName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-6 p-6">
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
              <DetailList title="Session durations" items={expert.sessionDurations} icon={Clock} />
              <DetailList title="Topics covered" items={expert.topicsCovered} />
              <div className="grid gap-3 rounded-md border bg-white p-4 text-sm shadow-inner">
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
            </div>
          </div>
          <div className="flex flex-col">
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {mode === "enroll" ? "Enroll for a session" : "Session details"}
                </h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={mode === "details" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSwitchMode("details")}
                  >
                    Overview
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "enroll" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSwitchMode("enroll")}
                  >
                    Enroll
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {mode === "enroll" ? (
                <form className="space-y-4" onSubmit={onSubmit}>
                  <FormField
                    label="Institute name"
                    required
                    value={enrollmentForm.instituteName}
                    onChange={(event) => onFormChange("instituteName", event.target.value)}
                  />
                  <FormField
                    label="City / place"
                    required
                    value={enrollmentForm.place}
                    onChange={(event) => onFormChange("place", event.target.value)}
                    icon={MapPin}
                  />
                  <FormField
                    label="Primary contact number"
                    required
                    value={enrollmentForm.contactNumber}
                    onChange={(event) => onFormChange("contactNumber", event.target.value)}
                    icon={Phone}
                  />
                  <FormField
                    label="Primary email"
                    required
                    value={enrollmentForm.email}
                    onChange={(event) => onFormChange("email", event.target.value)}
                    icon={Mail}
                  />
                  <FormField
                    label="Contact person's name"
                    required
                    value={enrollmentForm.contactPersonName}
                    onChange={(event) => onFormChange("contactPersonName", event.target.value)}
                  />
                  <FormField
                    label="Contact person's designation"
                    value={enrollmentForm.contactPersonDesignation}
                    onChange={(event) =>
                      onFormChange("contactPersonDesignation", event.target.value)
                    }
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Preferred mode</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={enrollmentForm.preferredMode}
                        onChange={(event) => onFormChange("preferredMode", event.target.value)}
                      >
                        <option value="" disabled>
                          Select mode
                        </option>
                        {(expert.sessionFormats || ["Online", "Offline"]).map((modeOption) => (
                          <option key={modeOption} value={modeOption}>
                            {modeOption}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        label="Preferred date"
                        required
                        type="date"
                        value={enrollmentForm.preferredDate}
                        onChange={(event) => onFormChange("preferredDate", event.target.value)}
                        icon={Calendar}
                      />
                      <FormField
                        label="Preferred time"
                        required
                        type="time"
                        value={enrollmentForm.preferredTime}
                        onChange={(event) => onFormChange("preferredTime", event.target.value)}
                        icon={Clock}
                      />
                    </div>
                  </div>
                  <FormField
                    label="Expected number of participants"
                    type="number"
                    min="1"
                    value={enrollmentForm.expectedParticipantCount}
                    onChange={(event) => onFormChange("expectedParticipantCount", event.target.value)}
                    icon={Users}
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Additional notes (agenda, expectations, logistics)
                    </label>
                    <Textarea
                      placeholder="Share specific expectations from the expert..."
                      value={enrollmentForm.additionalNotes}
                      onChange={(event) => onFormChange("additionalNotes", event.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending request
                      </span>
                    ) : (
                      "Submit enrollment"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-slate-700">
                  <p>
                    Use the enrollment tab to book a tailored session with {expert.fullName}. Select
                    the delivery mode, share institute contact details, and outline expectations so
                    the expert team can respond quickly.
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, value, onChange, type = "text", required, icon: Icon, ...rest }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
      <Input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={Icon ? "pl-9" : undefined}
        {...rest}
      />
    </div>
  </div>
);

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
