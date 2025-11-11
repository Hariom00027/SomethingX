import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "DECLINED", "ALL"];

const emptyResponse = {
  pricingDetails: "",
  adminContactName: "",
  adminContactEmail: "",
  adminContactPhone: "",
  message: "",
  resourceLink: "",
  schedule: "",
};

const IndustryTrainingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [responseDrafts, setResponseDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const params =
        statusFilter && statusFilter !== "ALL"
          ? { params: { status: statusFilter } }
          : undefined;
      const response = await apiClient.get("/industry-training/requests", params);
      const data = response.data ?? [];
      setRequests(data);

      const initialDrafts = {};
      data.forEach((request) => {
        initialDrafts[request.id] = {
          pricingDetails: request.adminPricingDetails ?? "",
          adminContactName: request.adminContactName ?? "",
          adminContactEmail: request.adminContactEmail ?? "",
          adminContactPhone: request.adminContactPhone ?? "",
          message: request.adminMessage ?? "",
          resourceLink: request.adminResourceLink ?? "",
          schedule: request.adminSchedule ?? "",
        };
      });

      setResponseDrafts(initialDrafts);
    } catch (err) {
      console.error("Failed to load industry training requests", err);
      setError("Unable to load training requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateDraft = (id, field, value) => {
    setResponseDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyResponse),
        [field]: value,
      },
    }));
  };

  const handleRespond = async (requestId, status) => {
    const draft = responseDrafts[requestId] ?? emptyResponse;

    if (status === "APPROVED") {
      if (
        !draft.pricingDetails.trim() ||
        !draft.adminContactName.trim() ||
        !draft.adminContactEmail.trim() ||
        !draft.adminContactPhone.trim() ||
        !draft.schedule.trim()
      ) {
        alert("Pricing, schedule, contact name, email, and phone are required to approve a request.");
        return;
      }
    }

    try {
      setSubmittingId(requestId);
      const payload = {
        status,
        pricingDetails: draft.pricingDetails || null,
        adminContactName: draft.adminContactName || null,
        adminContactEmail: draft.adminContactEmail || null,
        adminContactPhone: draft.adminContactPhone || null,
        message: draft.message || null,
        resourceLink: draft.resourceLink || null,
        schedule: draft.schedule || null,
      };

      await apiClient.put(`/industry-training/requests/${requestId}/admin-response`, payload);
      await fetchRequests();
      alert(status === "APPROVED" ? "Training confirmed and notification sent." : "Training request updated.");
    } catch (err) {
      console.error("Failed to submit admin response", err);
      const backendMessage = err?.response?.data;
      alert(backendMessage ?? "Unable to submit response right now. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "PENDING").length,
    [requests]
  );

  return (
    <DashboardLayout sidebar={<div>Admin</div>}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Industry Training Requests</h1>
            <p className="text-muted-foreground">
              Review and respond to Role Ready Freshers training requests submitted by industry partners.
            </p>
            {pendingCount > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                {pendingCount} request{pendingCount > 1 ? "s" : ""} awaiting review.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All statuses" : option}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={fetchRequests}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading training requests...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-center text-red-600">{error}</CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No requests found for the selected filter.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => {
              const draft = responseDrafts[request.id] ?? emptyResponse;
              return (
                <Card key={request.id}>
                  <CardHeader className="flex flex-col gap-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <CardTitle className="text-xl">
                        {request.companyName} •{" "}
                        <span className="font-semibold">
                          {request.specificRole || request.trainingRoleName || request.customRoleName}
                        </span>
                      </CardTitle>
                      <span
                        className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${
                          request.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : request.status === "DECLINED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Contact: {request.contactName} • {request.contactEmail} • {request.contactPhone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted on{" "}
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Unknown"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="font-semibold block mb-1">Requested Cohort</span>
                        <p>{request.requestType === "CUSTOM" ? "Custom Training" : "Existing Program"}</p>
                        {request.customRequirements && (
                          <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                            {request.customRequirements}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Cohort Details</span>
                        <p>Candidates: {request.numberOfCandidates}</p>
                        {request.preferredStartDate && <p>Preferred Start: {request.preferredStartDate}</p>}
                        <p>Industry: {request.targetIndustry}</p>
                        {request.adminSchedule && (
                          <p className="text-xs text-green-700 font-medium mt-1">Confirmed Schedule: {request.adminSchedule}</p>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Offers & Stipend</span>
                        <p>Package: {request.packageAfterSelection}</p>
                        <p>Stipend: {request.stipendDetails}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Pricing Details *</label>
                        <Textarea
                          rows={3}
                          value={draft.pricingDetails}
                          onChange={(event) => updateDraft(request.id, "pricingDetails", event.target.value)}
                          placeholder="Outline cohort pricing, payment milestones, or discounts."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Admin Notes to Industry</label>
                        <Textarea
                          rows={3}
                          value={draft.message}
                          onChange={(event) => updateDraft(request.id, "message", event.target.value)}
                          placeholder="Share onboarding expectations, timelines, or next steps."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium">Training Schedule *</label>
                        <Input
                          value={draft.schedule}
                          onChange={(event) => updateDraft(request.id, "schedule", event.target.value)}
                          placeholder="e.g., Starts 5 Dec • 6 weeks • Weekdays 6-8 PM"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Contact Name *</label>
                        <Input
                          value={draft.adminContactName}
                          onChange={(event) => updateDraft(request.id, "adminContactName", event.target.value)}
                          placeholder="Partnership manager"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Contact Email *</label>
                        <Input
                          type="email"
                          value={draft.adminContactEmail}
                          onChange={(event) => updateDraft(request.id, "adminContactEmail", event.target.value)}
                          placeholder="name@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Contact Phone *</label>
                        <Input
                          value={draft.adminContactPhone}
                          onChange={(event) => updateDraft(request.id, "adminContactPhone", event.target.value)}
                          placeholder="+91..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Resource Link</label>
                        <Input
                          value={draft.resourceLink}
                          onChange={(event) => updateDraft(request.id, "resourceLink", event.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        disabled={submittingId === request.id}
                        onClick={() => handleRespond(request.id, "DECLINED")}
                      >
                        Decline
                      </Button>
                      <Button
                        disabled={submittingId === request.id}
                        onClick={() => handleRespond(request.id, "APPROVED")}
                      >
                        {submittingId === request.id ? "Submitting..." : "Confirm Training"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IndustryTrainingRequests;


