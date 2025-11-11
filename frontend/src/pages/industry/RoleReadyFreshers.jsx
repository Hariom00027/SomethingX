import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";

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
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg">Loading role ready cohorts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Role Ready Freshers</h1>
            <p className="text-muted-foreground max-w-2xl">
              Access day-one ready talent pipelines or tailor a bespoke training cohort for niche roles. Each program is
              benchmarked to deliver candidates who can contribute from day one.
            </p>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
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
              className="relative"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                navigate("/industry/role-ready-freshers/request", {
                  state: { mode: "custom" },
                })
              }
            >
              Request Custom Training
            </Button>
          </div>
        </div>

        {displayTrainings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground">
              No training programs found. Seed demo data or add trainings to continue.
            </p>
            <div className="space-y-2 text-left max-w-xl mx-auto">
              <p className="text-sm text-gray-600">Seed sample trainings via:</p>
              <pre className="bg-gray-900 text-white text-sm rounded p-3 overflow-x-auto">
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
                {notifications.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        You don’t have any training updates yet. We’ll notify you here as soon as an admin confirms a cohort.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`border ${
                        notification.status !== "READ" ? "border-green-500 shadow-lg" : "border-muted"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{notification.subject}</CardTitle>
                            {notification.trainingName && (
                              <p className="text-sm text-muted-foreground">
                                Training: {notification.trainingName}
                              </p>
                            )}
                            {notification.trainingStatus && (
                              <p className="text-xs font-semibold uppercase text-green-600">
                                Status: {notification.trainingStatus}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                              {new Date(notification.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                            {notification.status !== "READ" && (
                              <Button size="sm" variant="outline" onClick={() => markNotificationAsRead(notification.id)}>
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <p className="whitespace-pre-wrap">{notification.message}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {notification.pricingDetails && (
                            <div>
                              <span className="font-semibold">Pricing:</span> {notification.pricingDetails}
                            </div>
                          )}
                          {notification.schedule && (
                            <div>
                              <span className="font-semibold">Schedule:</span> {notification.schedule}
                            </div>
                          )}
                          {notification.adminContactName && (
                            <div>
                              <span className="font-semibold">Contact:</span>{" "}
                              {notification.adminContactName}
                              {notification.adminContactEmail && ` • ${notification.adminContactEmail}`}
                              {notification.adminContactPhone && ` • ${notification.adminContactPhone}`}
                            </div>
                          )}
                          {notification.resourceLink && (
                            <div>
                              <span className="font-semibold">Resources:</span>{" "}
                              <a href={notification.resourceLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                Open link
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
            {displayTrainings.map((training) => (
              <Card key={training.apiId} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between gap-2">
                    {training.roleName}
                    <span
                      className={`text-xs font-semibold uppercase ${
                        training.dayOneReady ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {training.dayOneReady ? "Day-One Ready" : "In Ramp-Up"}
                    </span>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{training.roleDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Industry:</span> {training.industry}
                  </div>
                  <div>
                    <span className="font-semibold">Mode:</span> {training.trainingMode}
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span> {training.trainingDuration}
                  </div>
                  <div>
                    <span className="font-semibold">Intake Capacity:</span> {training.totalStudentsAllowed}
                  </div>
                  <div>
                    <span className="font-semibold">Day-One Summary:</span> {training.dayOneSummary}
                  </div>
                  {training.dayOneDeliverables?.length > 0 && (
                    <div>
                      <span className="font-semibold">Core Deliverables:</span>
                      <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                        {training.dayOneDeliverables.map((deliverable, idx) => (
                          <li key={idx}>{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Key Skills:</span>
                    <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                      {training.skillsCovered?.slice(0, 4).map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                      {training.skillsCovered?.length > 4 && (
                        <li className="text-muted-foreground">
                          +{training.skillsCovered.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    disabled={!training.apiId}
                    title={!training.apiId ? "Training identifier missing. Please refresh." : undefined}
                    onClick={() =>
                      navigate("/industry/role-ready-freshers/request", {
                        state: { training, mode: "existing" },
                      })
                    }
                  >
                    Apply for Cohort
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      navigate("/industry/role-ready-freshers/request", {
                        state: { training, mode: "custom" },
                      })
                    }
                  >
                    Request Custom Training
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Training Requests</CardTitle>
          </CardHeader>
          <CardContent>
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