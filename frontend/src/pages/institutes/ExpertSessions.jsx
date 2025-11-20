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
        {/* Vibrant decorative background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-300/30 via-purple-300/30 via-indigo-300/30 to-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-300/30 via-teal-300/30 via-emerald-300/30 to-green-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-yellow-300/20 via-orange-300/20 via-red-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <header className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between bg-gradient-to-br from-pink-100/40 via-purple-100/40 via-indigo-100/40 to-blue-100/40 rounded-2xl p-6 sm:p-8 border-2 border-purple-200/50 shadow-xl backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 via-indigo-500 to-blue-500 shadow-xl animate-pulse">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 via-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
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
            className="border-2 border-purple-400 text-purple-700 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 hover:border-purple-500 shadow-lg hover:shadow-xl transition-all font-bold px-6 py-2.5"
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
          <div className="flex h-80 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400 bg-gradient-to-br from-pink-100 via-purple-100 via-indigo-100 to-blue-100 shadow-inner">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 animate-pulse"></div>
                </div>
              </div>
              <span className="flex items-center gap-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold text-lg">
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
              <div className="rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-pink-50 via-purple-50 via-indigo-50 to-blue-50 px-8 py-16 text-center shadow-inner">
                <div className="space-y-3">
                  <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold text-lg">
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
      <div className="bg-gradient-to-br from-pink-50/60 via-purple-50/60 via-indigo-50/60 to-blue-50/60 rounded-2xl p-6 border-2 border-purple-200/50 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 via-indigo-500 to-blue-500 shadow-lg">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
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

      <div className="bg-gradient-to-br from-cyan-50/50 via-teal-50/50 via-emerald-50/50 to-green-50/50 rounded-2xl p-6 border-2 border-teal-200/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 via-teal-500 via-emerald-500 to-green-500 shadow-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">Recent enrollments</h3>
          </div>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={onRefresh} 
            disabled={refreshing}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 font-bold bg-gradient-to-r from-pink-50 to-purple-50"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {notifications && notifications.length ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="rounded-xl border-2 border-cyan-300 bg-gradient-to-br from-cyan-100/90 via-teal-100/80 via-emerald-100/70 to-green-100/60 p-4 shadow-lg hover:shadow-xl transition-all hover:border-cyan-400 hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="p-1 rounded-md bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 shadow-md mt-0.5">
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
    blue: "border-blue-400 bg-gradient-to-br from-blue-100 via-cyan-100 via-sky-100 to-blue-100 text-blue-900 shadow-blue-300/60 border-2",
    purple: "border-purple-400 bg-gradient-to-br from-purple-100 via-pink-100 via-fuchsia-100 to-purple-100 text-purple-900 shadow-purple-300/60 border-2",
  };
  
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3.5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center gap-3 text-sm font-bold">
        <div className="p-1.5 rounded-lg bg-white/90 shadow-md">
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <span className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
        {value}
      </span>
    </div>
  );
};

const ExpertCard = ({ expert, onViewDetails, onEnroll, formatCurrency }) => {
  // Generate a vibrant color scheme for each card
  const colorSchemes = [
    { bg: 'from-pink-300 via-purple-300 to-indigo-300', border: 'border-pink-400', badge: 'bg-pink-500', text: 'text-pink-700', hover: 'hover:bg-pink-50/30' },
    { bg: 'from-blue-300 via-cyan-300 to-teal-300', border: 'border-blue-400', badge: 'bg-blue-500', text: 'text-blue-700', hover: 'hover:bg-blue-50/30' },
    { bg: 'from-purple-300 via-pink-300 to-rose-300', border: 'border-purple-400', badge: 'bg-purple-500', text: 'text-purple-700', hover: 'hover:bg-purple-50/30' },
    { bg: 'from-indigo-300 via-blue-300 to-cyan-300', border: 'border-indigo-400', badge: 'bg-indigo-500', text: 'text-indigo-700', hover: 'hover:bg-indigo-50/30' },
    { bg: 'from-emerald-300 via-teal-300 to-cyan-300', border: 'border-emerald-400', badge: 'bg-emerald-500', text: 'text-emerald-700', hover: 'hover:bg-emerald-50/30' },
    { bg: 'from-orange-300 via-pink-300 to-purple-300', border: 'border-orange-400', badge: 'bg-orange-500', text: 'text-orange-700', hover: 'hover:bg-orange-50/30' },
  ];
  const colorScheme = colorSchemes[expert.id % colorSchemes.length] || colorSchemes[0];
  
  return (
    <Card className={`flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border-2 ${colorScheme.border} group bg-white ${colorScheme.hover}`}>
      {/* Image Section with Overlay */}
      <div className={`relative h-32 w-full overflow-hidden bg-gradient-to-br ${colorScheme.bg}`}>
        <img
          src={expert.photoUrl}
          alt={expert.fullName}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Badge overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`px-2 py-1 rounded-full ${colorScheme.badge} backdrop-blur-sm shadow-xl`}>
            <span className="text-[8px] font-bold text-white">EXPERT</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <CardHeader className="pb-2 pt-3 px-3 bg-gradient-to-b from-white to-slate-50/30">
        <CardTitle className={`text-sm leading-tight line-clamp-1 font-bold text-slate-800 group-hover:${colorScheme.text.replace('text-', 'text-')} transition-colors`} style={{ '--hover-color': colorScheme.text }}>
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
          {(expert.expertiseDomains || []).slice(0, 2).map((domain, idx) => {
            const tagColors = [
              "bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 text-pink-800 border-pink-300",
              "bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 text-blue-800 border-blue-300",
              "bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 text-purple-800 border-purple-300",
              "bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 text-emerald-800 border-emerald-300",
            ];
            return (
              <span
                key={domain}
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold line-clamp-1 max-w-full shadow-md border ${tagColors[idx % tagColors.length]}`}
              >
                {domain.length > 12 ? `${domain.slice(0, 12)}...` : domain}
              </span>
            );
          })}
          {(expert.expertiseDomains || []).length > 2 && (
            <span className="rounded-full bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 text-orange-800 border border-orange-300 px-2 py-0.5 text-[9px] font-bold shadow-md">
              +{(expert.expertiseDomains || []).length - 2}
            </span>
          )}
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 via-blue-50 via-indigo-50 to-purple-50 p-2 shadow-inner">
          <div className="text-center">
            <p className="text-slate-700 flex items-center justify-center gap-1 font-bold text-[9px] mb-1">
              <Video className="h-3 w-3 text-blue-600" /> Online
            </p>
            <p className="font-extrabold text-[11px] leading-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent bg-white/80 rounded px-1 py-0.5">
              {formatCurrency(expert.pricingPerHourOnline)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-700 flex items-center justify-center gap-1 font-bold text-[9px] mb-1">
              <MapPin className="h-3 w-3 text-rose-600" /> Offline
            </p>
            <p className="font-extrabold text-[11px] leading-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent bg-white/80 rounded px-1 py-0.5">
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
          className="flex-1 text-[10px] h-8 px-2 bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all font-bold hover:scale-105" 
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
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-100 via-purple-100 via-indigo-100 to-blue-100 border-2 border-purple-400 px-3 py-1.5 text-xs font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer"
          >
            {Icon && <Icon className="h-4 w-4 text-purple-600" />}
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">{item}</span>
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





