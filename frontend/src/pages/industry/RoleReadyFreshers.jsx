import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  Briefcase, 
  Clock, 
  Users, 
  TrendingUp, 
  Sparkles,
  Loader2,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Target,
  Zap,
  ArrowRight
} from "lucide-react";

const RoleReadyFreshers = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/trainings");
        const catalogue = (response.data ?? []).map((item, index) => ({
          ...item,
          apiId: item.id ?? item._id ?? `training-${index}`,
        }));
        const enriched = catalogue.map((entry) => ({
          ...entry,
          dayOneReady: entry.dayOneReady === undefined ? true : entry.dayOneReady,
        }));
        setTrainings(enriched);
      } catch (err) {
        console.error("Failed to load trainings", err);
        setError("Unable to load role ready trainings right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const loadRequestsAndNotifications = useCallback(async () => {
    if (!user?.email) {
      return;
    }
    try {
      setRequestsLoading(true);
      setRequestsError("");
      const params = { params: { contactEmail: user.email } };
      const [requestsResponse, notificationsResponse] = await Promise.all([
        apiClient.get("/industry-training/requests", params),
        apiClient.get("/industry-training/notifications", params),
      ]);
      setRequests(requestsResponse.data ?? []);
      setNotifications(notificationsResponse.data ?? []);
    } catch (err) {
      console.error("Failed to load training requests or notifications", err);
      setRequestsError("Unable to load your training requests right now.");
    } finally {
      setRequestsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadRequestsAndNotifications();
  }, [loadRequestsAndNotifications]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }
    const interval = setInterval(() => {
      loadRequestsAndNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.email, loadRequestsAndNotifications]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/industry-training/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, status: "READ", readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => notification.status !== "READ").length,
    [notifications]
  );

  const displayTrainings = useMemo(() => {
    const items = trainings ?? [];
    return [...items].sort((a, b) => {
      const aReady = a.dayOneReady ? 1 : 0;
      const bReady = b.dayOneReady ? 1 : 0;
      return bReady - aReady;
    });
  }, [trainings]);

  if (loading) {
    return (
      <DashboardLayout sidebar={<div>Sidebar</div>}>
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading role ready cohorts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Enhanced Header with Vibrant Colors */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 rounded-2xl p-6 border-2 border-orange-200/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                <Target className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  Role Ready Freshers
                </h1>
                <p className="text-gray-700 max-w-2xl mt-2 text-lg font-medium">
                  Access day-one ready talent pipelines or tailor a bespoke training cohort for niche roles. Each program is
                  benchmarked to deliver candidates who can contribute from day one.
                </p>
                {error && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-lg shadow-md">
                    <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const nextValue = !showNotifications;
                setShowNotifications(nextValue);
                if (!showNotifications) {
                  await loadRequestsAndNotifications();
                }
              }}
              className="relative border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all font-semibold"
            >
              <Bell className="mr-2 h-4 w-4 text-orange-600" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              onClick={() =>
                navigate("/industry/role-ready-freshers/request", {
                  state: { mode: "custom" },
                })
              }
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Request Custom Training
            </Button>
          </div>
        </div>

        {displayTrainings.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-dashed border-orange-300">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">No training programs found</h3>
              <p className="text-gray-600">Seed demo data or add trainings to continue.</p>
            </div>
            <div className="space-y-2 text-left max-w-xl mx-auto mt-6">
              <p className="text-sm text-gray-700 font-medium">Seed sample trainings via:</p>
              <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-white text-sm rounded-lg p-4 overflow-x-auto border-2 border-gray-700 shadow-lg">
                curl -X POST http://localhost:8080/api/trainings/seed \
-H "Content-Type: application/json" \
-d @backend/src/main/resources/training-data.json
              </pre>
              <p className="text-sm text-gray-600">Refresh this page after seeding.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {showNotifications && (
              <div className="md:col-span-2 xl:col-span-3 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <h2 className="text-2xl font-bold">Notifications</h2>
                </div>
                {notifications.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Bell className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        You don't have any training updates yet. We'll notify you here as soon as an admin confirms a cohort.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`border-2 transition-all duration-300 ${
                        notification.status !== "READ" 
                          ? "border-green-500 shadow-xl bg-green-50/50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {notification.status !== "READ" && (
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              )}
                              <CardTitle className="text-lg font-bold">{notification.subject}</CardTitle>
                            </div>
                            {notification.trainingName && (
                              <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Training: {notification.trainingName}</span>
                              </div>
                            )}
                            {notification.trainingStatus && (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">
                                  {notification.trainingStatus}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(notification.createdAt).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                            {notification.status !== "READ" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="border-green-500 text-green-600 hover:bg-green-50"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{notification.message}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          {notification.pricingDetails && (
                            <div className="flex items-start gap-2">
                              <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <span className="font-semibold">Pricing:</span> {notification.pricingDetails}
                              </div>
                            </div>
                          )}
                          {notification.schedule && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <span className="font-semibold">Schedule:</span> {notification.schedule}
                              </div>
                            </div>
                          )}
                          {notification.adminContactName && (
                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                              <div>
                                <span className="font-semibold">Contact:</span>{" "}
                                {notification.adminContactName}
                                {notification.adminContactEmail && (
                                  <a href={`mailto:${notification.adminContactEmail}`} className="text-blue-600 hover:underline ml-1">
                                    {notification.adminContactEmail}
                                  </a>
                                )}
                                {notification.adminContactPhone && (
                                  <span className="text-muted-foreground ml-1">• {notification.adminContactPhone}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {notification.resourceLink && (
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <span className="font-semibold">Resources:</span>{" "}
                                <a href={notification.resourceLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                  Open link
                                  <ArrowRight className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
            {displayTrainings.map((training, index) => {
              const colorVariants = training.dayOneReady ? [
                'from-green-500 via-emerald-500 to-teal-500',
                'from-emerald-500 via-teal-500 to-cyan-500',
                'from-teal-500 via-cyan-500 to-blue-500',
              ] : [
                'from-amber-500 via-orange-500 to-red-500',
                'from-orange-500 via-red-500 to-pink-500',
                'from-yellow-500 via-amber-500 to-orange-500',
              ];
              const bgVariants = training.dayOneReady ? [
                'bg-gradient-to-br from-green-50 to-emerald-50',
                'bg-gradient-to-br from-emerald-50 to-teal-50',
                'bg-gradient-to-br from-teal-50 to-cyan-50',
              ] : [
                'bg-gradient-to-br from-amber-50 to-orange-50',
                'bg-gradient-to-br from-orange-50 to-red-50',
                'bg-gradient-to-br from-yellow-50 to-amber-50',
              ];
              const borderVariants = training.dayOneReady ? [
                'border-green-200 hover:border-green-400',
                'border-emerald-200 hover:border-emerald-400',
                'border-teal-200 hover:border-teal-400',
              ] : [
                'border-amber-200 hover:border-amber-400',
                'border-orange-200 hover:border-orange-400',
                'border-yellow-200 hover:border-yellow-400',
              ];
              const variantIndex = index % colorVariants.length;
              return (
              <Card 
                key={training.apiId} 
                className={`flex flex-col hover:shadow-2xl transition-all duration-300 border-2 ${borderVariants[variantIndex]} group overflow-hidden relative ${bgVariants[variantIndex]}`}
              >
                {/* Vibrant Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${colorVariants[variantIndex]} shadow-lg`}></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span
                    className={`px-4 py-2 text-xs font-bold uppercase rounded-full shadow-xl ${
                      training.dayOneReady 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-2 border-white/30" 
                        : "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-2 border-white/30"
                    }`}
                  >
                    {training.dayOneReady ? (
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        Day-One Ready
                      </span>
                    ) : (
                      "In Ramp-Up"
                    )}
                  </span>
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl shadow-md ${
                      training.dayOneReady 
                        ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                        : "bg-gradient-to-br from-amber-500 to-orange-600"
                    } transform group-hover:scale-110 transition-transform`}>
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-red-600 transition-all">
                        {training.roleName}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm text-gray-600">
                        {training.roleDescription}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4 text-sm">
                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Industry</p>
                        <p className="font-medium">{training.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Mode</p>
                        <p className="font-medium">{training.trainingMode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">{training.trainingDuration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Capacity</p>
                        <p className="font-medium">{training.totalStudentsAllowed}</p>
                      </div>
                    </div>
                  </div>

                  {/* Day-One Summary */}
                  {training.dayOneSummary && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <p className="text-xs font-semibold text-muted-foreground">Day-One Summary</p>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{training.dayOneSummary}</p>
                    </div>
                  )}

                  {/* Core Deliverables */}
                  {training.dayOneDeliverables?.length > 0 && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-xs font-semibold text-muted-foreground">Core Deliverables</p>
                      </div>
                      <ul className="space-y-1.5">
                        {training.dayOneDeliverables.slice(0, 3).map((deliverable, idx) => (
                          <li key={idx} className="text-xs flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span className="text-gray-700">{deliverable}</span>
                          </li>
                        ))}
                        {training.dayOneDeliverables.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{training.dayOneDeliverables.length - 3} more deliverables
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Key Skills */}
                  {training.skillsCovered && training.skillsCovered.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Key Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {training.skillsCovered.slice(0, 4).map((skill, idx) => {
                          const skillColors = [
                            'bg-gradient-to-r from-orange-500 to-red-500 text-white',
                            'bg-gradient-to-r from-red-500 to-pink-500 text-white',
                            'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
                            'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                          ];
                          return (
                            <span 
                              key={idx} 
                              className={`px-3 py-1 ${skillColors[idx % skillColors.length]} text-xs rounded-full font-semibold shadow-sm`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                        {training.skillsCovered.length > 4 && (
                          <span className="px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs rounded-full font-semibold">
                            +{training.skillsCovered.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="grid grid-cols-1 gap-2 pt-4">
                  <Button
                    type="button"
                    disabled={!training.apiId}
                    title={!training.apiId ? "Training identifier missing. Please refresh." : undefined}
                    onClick={() =>
                      navigate("/industry/role-ready-freshers/request", {
                        state: { training, mode: "existing" },
                      })
                    }
                    className={`w-full bg-gradient-to-r ${colorVariants[variantIndex]} hover:shadow-2xl text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 rounded-xl py-6`}
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Apply for Cohort
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate("/industry/role-ready-freshers/request", {
                        state: { training, mode: "custom" },
                      })
                    }
                    className="w-full border-2 border-orange-300 hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 font-semibold"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Request Custom Training
                  </Button>
                </CardFooter>
              </Card>
              );
            })}
          </div>
        )}

        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-xl font-bold">Your Training Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {requestsLoading ? (
              <p className="text-sm text-muted-foreground">Loading your requests...</p>
            ) : requestsError ? (
              <p className="text-sm text-red-600">{requestsError}</p>
            ) : requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have not submitted any training requests yet. Apply for a cohort to see the status here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2 whitespace-nowrap">Submitted On</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Schedule</th>
                      <th className="px-3 py-2 whitespace-nowrap">Candidates</th>
                      <th className="px-3 py-2">Pricing / Notes</th>
                      <th className="px-3 py-2">Admin Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-t">
                        <td className="px-3 py-2">
                          {request.specificRole || request.trainingRoleName || request.customRoleName || "—"}
                        </td>
                        <td className="px-3 py-2">
                          {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          <span
                            className={`px-2 py-1 rounded-full text-xs uppercase ${
                              request.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : request.status === "DECLINED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {request.status || "PENDING"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {request.adminSchedule ? (
                            <span>{request.adminSchedule}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Awaiting confirmation</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{request.numberOfCandidates ?? "—"}</td>
                        <td className="px-3 py-2">
                          {request.adminPricingDetails ? (
                            <div className="space-y-1">
                              <div>{request.adminPricingDetails}</div>
                              {request.adminMessage && <p className="text-xs text-muted-foreground">{request.adminMessage}</p>}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {request.adminMessage ? request.adminMessage : "Awaiting admin review"}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {request.adminContactName ? (
                            <div className="space-y-1">
                              <div>{request.adminContactName}</div>
                              {request.adminContactEmail && (
                                <a href={`mailto:${request.adminContactEmail}`} className="text-blue-600 underline text-xs">
                                  {request.adminContactEmail}
                                </a>
                              )}
                              {request.adminContactPhone && (
                                <div className="text-xs text-muted-foreground">{request.adminContactPhone}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RoleReadyFreshers;