import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { X } from "lucide-react";

const EMPTY_REQUEST = {
  companyName: "",
  companyWebsite: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  numberOfCandidates: "",
  preferredStartDate: "",
  customRoleName: "",
  customRequirements: "",
  desiredSkills: "",
  additionalNotes: "",
};

const RoleReadyFreshers = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState({
    open: false,
    mode: "existing",
    training: null,
    form: { ...EMPTY_REQUEST },
    error: "",
    status: "",
    submitting: false,
  });

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        setFetchError("");
        const response = await apiClient.get("/trainings");
        const normalized = (response.data ?? []).map((item, index) => {
          const apiId = item.id ?? item._id ?? item.trainingId ?? item?.identifier ?? null;
          const clientKey = apiId ?? (item.roleName ? `${item.roleName}-${index}` : `training-${index}`);
          return {
            ...item,
            apiId,
            clientKey,
          };
        });
        setTrainings(normalized.filter((t) => t.dayOneReady));
      } catch (error) {
        console.error("Error fetching trainings:", error);
        setFetchError("Unable to load role ready programs. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const usableTrainings = useMemo(() => trainings ?? [], [trainings]);

  const openExistingModal = (training) => {
    if (!training?.apiId) {
      setModal({
        open: true,
        mode: "existing",
        training: null,
        form: { ...EMPTY_REQUEST },
        error: "This training is missing an identifier. Please refresh and try again.",
        status: "",
        submitting: false,
      });
      return;
    }

    setModal({
      open: true,
      mode: "existing",
      training,
      form: {
        ...EMPTY_REQUEST,
        numberOfCandidates: "15",
      },
      error: "",
      status: "",
      submitting: false,
    });
  };

  const openCustomModal = () => {
    setModal({
      open: true,
      mode: "custom",
      training: null,
      form: { ...EMPTY_REQUEST },
      error: "",
      status: "",
      submitting: false,
    });
  };

  const closeModal = () => {
    if (modal.submitting) return;
    setModal((prev) => ({ ...prev, open: false }));
    setTimeout(() => {
      setModal({
        open: false,
        mode: "existing",
        training: null,
        form: { ...EMPTY_REQUEST },
        error: "",
        status: "",
        submitting: false,
      });
    }, 200);
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setModal((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [name]: value,
      },
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      { name: "companyName", label: "Company Name" },
      { name: "contactName", label: "Contact Name" },
      { name: "contactEmail", label: "Contact Email" },
      { name: "contactPhone", label: "Contact Phone" },
      { name: "numberOfCandidates", label: "Number of Candidates" },
    ];

    if (modal.mode === "custom") {
      requiredFields.push({ name: "customRoleName", label: "Role Name" });
    }

    if (modal.mode === "existing" && !modal.training?.apiId) {
      return { valid: false, message: "Training identifier missing. Please refresh the page." };
    }

    for (const field of requiredFields) {
      const raw = modal.form[field.name];
      if (raw === undefined || String(raw).trim() === "") {
        return { valid: false, message: `Please provide ${field.label}.` };
      }
    }

    if (Number.isNaN(parseInt(modal.form.numberOfCandidates, 10)) || parseInt(modal.form.numberOfCandidates, 10) <= 0) {
      return { valid: false, message: "Number of candidates must be a positive number." };
    }

    return { valid: true };
  };

  const submitRequest = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      setModal((prev) => ({ ...prev, error: validation.message }));
      return;
    }

    try {
      setModal((prev) => ({ ...prev, submitting: true, error: "", status: "" }));

      const payload = {
        companyName: modal.form.companyName.trim(),
        companyWebsite: modal.form.companyWebsite.trim() || null,
        contactName: modal.form.contactName.trim(),
        contactEmail: modal.form.contactEmail.trim(),
        contactPhone: modal.form.contactPhone.trim(),
        numberOfCandidates: parseInt(modal.form.numberOfCandidates, 10),
        preferredStartDate: modal.form.preferredStartDate || null,
        additionalNotes: modal.form.additionalNotes.trim() || null,
        customRoleName: modal.mode === "custom" ? modal.form.customRoleName.trim() : null,
        customRequirements: modal.mode === "custom" ? modal.form.customRequirements.trim() : null,
        desiredSkills:
          modal.form.desiredSkills
            ?.split(",")
            .map((skill) => skill.trim())
            .filter(Boolean) ?? [],
        requestType: modal.mode === "custom" ? "CUSTOM" : "EXISTING",
        trainingId: modal.mode === "existing" ? modal.training.apiId : null,
      };

      const response = await apiClient.post("/industry-training/apply", payload);
      setModal((prev) => ({
        ...prev,
        submitting: false,
        status: "Request submitted successfully. Our team will contact you within 24 hours.",
      }));

      setTimeout(() => {
        closeModal();
        alert("Your training request has been submitted successfully.");
      }, 300);

      return response;
    } catch (error) {
      console.error("Error submitting industry training request:", error);
      const notFound = error?.response?.status === 404;
      setModal((prev) => ({
        ...prev,
        submitting: false,
        error: notFound
          ? "Selected training is no longer available. Please refresh and pick another program."
          : "Unable to submit request right now. Please try again.",
      }));
    }
  };

  const renderModal = () => {
    if (!modal.open) return null;

    const isCustom = modal.mode === "custom";
    const title = isCustom ? "Request Custom Training" : `Request ${modal.training?.roleName ?? "Training"}`;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget && !modal.submitting) {
            closeModal();
          }
        }}
      >
        <div
          className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {modal.training?.dayOneSummary && !isCustom && (
                <p className="text-sm text-muted-foreground">
                  Day-one promise: {modal.training.dayOneSummary}
                </p>
              )}
              {modal.error && <p className="text-sm text-red-600 mt-1">{modal.error}</p>}
              {modal.status && <p className="text-sm text-green-600 mt-1">{modal.status}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="h-8 w-8"
              type="button"
              disabled={modal.submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="companyName"
                  value={modal.form.companyName}
                  onChange={updateForm}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Website</label>
                <Input
                  name="companyWebsite"
                  value={modal.form.companyWebsite}
                  onChange={updateForm}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="contactName"
                  value={modal.form.contactName}
                  onChange={updateForm}
                  placeholder="Primary point of contact"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="contactEmail"
                  value={modal.form.contactEmail}
                  onChange={updateForm}
                  placeholder="contact@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  name="contactPhone"
                  value={modal.form.contactPhone}
                  onChange={updateForm}
                  placeholder="Include country code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Candidates <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="numberOfCandidates"
                  value={modal.form.numberOfCandidates}
                  onChange={updateForm}
                  placeholder="e.g., 20"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Start Date</label>
                <Input
                  type="date"
                  name="preferredStartDate"
                  value={modal.form.preferredStartDate}
                  onChange={updateForm}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Desired Skills (comma separated)</label>
                <Input
                  name="desiredSkills"
                  value={modal.form.desiredSkills}
                  onChange={updateForm}
                  placeholder="SQL, Salesforce, Communication"
                />
              </div>
            </div>

            {isCustom && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="customRoleName"
                    value={modal.form.customRoleName}
                    onChange={updateForm}
                    placeholder="e.g., Revenue Operations Analyst"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Training Requirements</label>
                  <Textarea
                    name="customRequirements"
                    value={modal.form.customRequirements}
                    onChange={updateForm}
                    placeholder="Describe role expectations, tools, success metrics..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {!isCustom && modal.training?.dayOneDeliverables?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Day-One Deliverables</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {modal.training.dayOneDeliverables.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <Textarea
                name="additionalNotes"
                value={modal.form.additionalNotes}
                onChange={updateForm}
                placeholder="Share onboarding timelines, assessment expectations, or other details"
                rows={4}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={modal.submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitRequest}
                disabled={modal.submitting}
              >
                {modal.submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    <>
      <DashboardLayout sidebar={<div>Sidebar</div>}>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Role Ready Freshers</h1>
              <p className="text-muted-foreground max-w-2xl">
                Access day-one ready talent pipelines or request bespoke training for niche roles. Candidates graduate
                with hands-on deliverables aligned to your tech stack and SOPs.
              </p>
              {fetchError && <p className="text-sm text-red-600 mt-2">{fetchError}</p>}
            </div>
            <Button type="button" onClick={openCustomModal}>
              Request Custom Training
            </Button>
          </div>

          {usableTrainings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No day-one ready programs available yet. Request a custom training to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {usableTrainings.map((training) => (
                <Card key={training.clientKey} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center justify-between gap-2">
                      {training.roleName}
                      <span className="text-xs font-semibold uppercase text-green-600">Day-One Ready</span>
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
                      <span className="font-semibold">Candidate Intake:</span> {training.totalStudentsAllowed}
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
                  <CardFooter>
                    <Button
                      type="button"
                      onClick={() => openExistingModal(training)}
                      className="w-full"
                      disabled={!training.apiId}
                      title={!training.apiId ? "Training identifier missing. Please refresh." : undefined}
                    >
                      Request Candidates
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {renderModal()}
    </>
  );
};

export default RoleReadyFreshers;
