import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
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
    navigate(`/institutes/expert-sessions/${expert.id}`);
  };

  const openEnrollment = (expert) => {
    navigate(`/institutes/expert-sessions/${expert.id}/enroll`);
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
      <div className="space-y-8 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 via-cyan-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        </div>

        <header className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-2xl p-6 sm:p-8 border border-indigo-100/50 shadow-lg backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Expert Session Service
              </h1>
            </div>
            <p className="text-slate-700 text-base leading-relaxed max-w-2xl font-medium">
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
            className="border-2 border-indigo-300 text-indigo-700 bg-white/80 hover:bg-indigo-50 hover:border-indigo-400 shadow-md hover:shadow-lg transition-all font-semibold px-6 py-2.5"
          >
            {refreshing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Refresh activity
              </span>
            )}
          </Button>
        </header>

        {toast && (
          <div
            className={`rounded-xl border-2 px-5 py-4 text-sm font-medium transition-all shadow-lg animate-in slide-in-from-top-2 ${
              toast.type === "success"
                ? "border-emerald-400 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 text-emerald-900 shadow-emerald-200/50"
                : "border-rose-400 bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 text-rose-900 shadow-rose-200/50"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <div className="p-1 rounded-full bg-emerald-500">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="p-1 rounded-full bg-rose-500">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {toast.message}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-80 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/50 shadow-inner">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
                </div>
              </div>
              <span className="flex items-center gap-2 text-indigo-700 font-semibold text-lg">
                Fetching curated experts for you...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 px-6 py-8 text-rose-900 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-base">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-8 py-16 text-center shadow-inner">
                <div className="space-y-3">
                  <div className="inline-flex p-4 rounded-full bg-slate-200">
                    <Users className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-slate-700 font-semibold text-lg">
                    No expert sessions are available yet. Please check back soon.
                  </p>
                </div>
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
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 rounded-2xl p-6 border border-indigo-100/50 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Service Snapshot
          </h2>
        </div>
        <p className="text-sm text-slate-700 font-medium mb-5 leading-relaxed">
          Track service health and recent enrollment activity from institutes.
        </p>
        <div className="grid gap-4">
          <StatPill 
            icon={<Users className="h-5 w-5 text-blue-600" />} 
            label="Active experts" 
            value={expertCount}
            color="blue"
          />
          <StatPill 
            icon={<GraduationCap className="h-5 w-5 text-purple-600" />} 
            label="Domains covered" 
            value={domainCount}
            color="purple"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Recent enrollments</h3>
          </div>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={onRefresh} 
            disabled={refreshing}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/80 font-semibold"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {notifications && notifications.length ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50/80 via-emerald-50/60 to-cyan-50/40 p-4 shadow-md hover:shadow-lg transition-all hover:border-teal-400 hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="p-1 rounded-md bg-teal-500 mt-0.5">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-sm font-bold leading-tight text-slate-800 flex-1">
                    {notification.instituteName}
                  </p>
                </div>
                <div className="space-y-1.5 pl-6">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold">{notification.contactPersonName}</span> · 
                    <span className="font-bold text-indigo-700 mx-1">{notification.preferredMode}</span>
                    {" · "}
                    <span className="font-bold text-purple-700">{formatDate(notification.preferredDate)}</span>
                    {notification.preferredTime ? <span className="text-slate-600"> {notification.preferredTime}</span> : ""}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    For <span className="font-bold text-slate-800">{notification.expertNameSnapshot}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex p-3 rounded-full bg-slate-200 mb-3">
                <Calendar className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600 font-medium">
                No enrollments yet. They will appear here once institutes submit requests.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatPill = ({ icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "border-blue-300 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 text-blue-900 shadow-blue-200/50",
    purple: "border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 text-purple-900 shadow-purple-200/50",
  };
  
  return (
    <div className={`flex items-center justify-between rounded-xl border-2 px-4 py-3.5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center gap-3 text-sm font-bold">
        <div className="p-1.5 rounded-lg bg-white/80 shadow-sm">
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <span className="text-2xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        {value}
      </span>
    </div>
  );
};

const ExpertCard = ({ expert, onViewDetails, onEnroll, formatCurrency }) => {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border-2 border-slate-200 hover:border-indigo-400 group bg-white hover:bg-gradient-to-b hover:from-white hover:to-indigo-50/20">
      {/* Image Section with Overlay */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
        <img
          src={expert.photoUrl}
          alt={expert.fullName}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Badge overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
            <span className="text-[8px] font-bold text-indigo-700">EXPERT</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <CardHeader className="pb-2 pt-3 px-3 bg-gradient-to-b from-white to-slate-50/30">
        <CardTitle className="text-sm leading-tight line-clamp-1 font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
          {expert.fullName}
        </CardTitle>
        <p className="text-[10px] text-slate-600 line-clamp-1 mt-1 font-semibold">{expert.designation}</p>
        {expert.organization && (
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{expert.organization}</p>
        )}
      </CardHeader>

      {/* Content Section */}
      <CardContent className="flex-1 space-y-2 px-3 pb-3">
        {/* Domain Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(expert.expertiseDomains || []).slice(0, 2).map((domain, idx) => (
            <span
              key={domain}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold line-clamp-1 max-w-full shadow-sm ${
                idx === 0 
                  ? "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300" 
                  : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300"
              }`}
            >
              {domain.length > 12 ? `${domain.slice(0, 12)}...` : domain}
            </span>
          ))}
          {(expert.expertiseDomains || []).length > 2 && (
            <span className="rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 text-[9px] font-bold shadow-sm">
              +{(expert.expertiseDomains || []).length - 2}
            </span>
          )}
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 p-2 shadow-inner">
          <div className="text-center">
            <p className="text-slate-700 flex items-center justify-center gap-1 font-bold text-[9px] mb-1">
              <Video className="h-3 w-3 text-blue-600" /> Online
            </p>
            <p className="font-extrabold text-[11px] leading-tight text-emerald-700 bg-white/60 rounded px-1 py-0.5">
              {formatCurrency(expert.pricingPerHourOnline)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-700 flex items-center justify-center gap-1 font-bold text-[9px] mb-1">
              <MapPin className="h-3 w-3 text-rose-600" /> Offline
            </p>
            <p className="font-extrabold text-[11px] leading-tight text-emerald-700 bg-white/60 rounded px-1 py-0.5">
              {formatCurrency(expert.pricingPerHourOffline)}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="text-[9px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {expert.summary || ""}
        </div>
      </CardContent>

      {/* Footer Buttons */}
      <CardFooter className="gap-2 px-3 pb-3 pt-0">
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          className="flex-1 text-[10px] h-8 px-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 font-bold shadow-sm hover:shadow-md transition-all" 
          onClick={onViewDetails}
        >
          Details
        </Button>
        <Button 
          type="button"
          size="sm"
          className="flex-1 text-[10px] h-8 px-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all font-bold hover:scale-105" 
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
      <p className="text-xs uppercase tracking-wider text-slate-700 font-bold mb-3">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-300 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            {Icon && <Icon className="h-4 w-4 text-indigo-600" />}
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





