import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { X } from "lucide-react";

const EMPTY_FORM = {
  companyName: "",
  companyWebsite: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  industryContactNumber: "",
  numberOfCandidates: "",
  preferredStartDate: "",
  desiredSkills: "",
  additionalNotes: "",
  customRoleName: "",
  customRequirements: "",
  exampleCompany: "",
  specificRole: "",
  targetIndustry: "",
  packageAfterSelection: "",
  stipendDetails: "",
  otherRequirements: "",
};

const RoleReadyFreshers = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({
    open: false,
    mode: "existing",
    training: null,
    form: { ...EMPTY_FORM },
    submitting: false,
    status: "",
    formError: "",
  });

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/trainings");
        console.log("Fetched trainings", response.data);
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

  const displayTrainings = useMemo(() => {
    const items = trainings ?? [];
    const sorted = [...items].sort((a, b) => {
      const aReady = a.dayOneReady ? 1 : 0;
      const bReady = b.dayOneReady ? 1 : 0;
      return bReady - aReady;
    });
    return sorted;
  }, [trainings]);

  const resetModal = () => {
    setModal({
      open: false,
      mode: "existing",
      training: null,
      form: { ...EMPTY_FORM },
      submitting: false,
      status: "",
      formError: "",
    });
  };

  const openExistingModal = (training) => {
    console.log("Open existing modal", training);
    if (!training?.apiId) {
      setModal({
        open: true,
        mode: "existing",
        training: null,
        form: { ...EMPTY_FORM },
        submitting: false,
        status: "",
        formError: "This training is missing an identifier. Please refresh the page.",
      });
      return;
    }

    setModal({
      open: true,
      mode: "existing",
      training,
      form: {
        ...EMPTY_FORM,
        numberOfCandidates: String(training.totalStudentsAllowed ?? 20),
        desiredSkills: training.skillsCovered?.slice(0, 5).join(", ") ?? "",
        specificRole: training.roleName ?? "",
        targetIndustry: training.industry ?? "",
        packageAfterSelection: training.packageAfterTraining ?? "",
        stipendDetails: training.stipendIncluded
          ? `Stipend ₹${training.stipendAmount}`
          : "No stipend",
        exampleCompany: training.trainingProvider ?? "",
      },
      submitting: false,
      status: "",
      formError: "",
    });
  };

  const openCustomModal = (training) => {
    console.log("Open custom modal", training);
    setModal({
      open: true,
      mode: "custom",
      training,
      form: {
        ...EMPTY_FORM,
        customRoleName: training ? `${training.roleName} Specialist` : "",
        customRequirements: training
          ? `Adapt ${training.roleName} curriculum for ${training.industry} workflows.`
          : "",
        specificRole: training?.roleName ?? "",
        targetIndustry: training?.industry ?? "",
        packageAfterSelection: training?.packageAfterTraining ?? "",
        stipendDetails: training
          ? training.stipendIncluded
            ? `Stipend ₹${training.stipendAmount}`
            : "No stipend"
          : "",
        exampleCompany: training?.trainingProvider ?? "",
      },
      submitting: false,
      status: "",
      formError: "",
    });
  };

  const closeModal = () => {
    if (modal.submitting) return;
    setModal((prev) => ({ ...prev, open: false }));
    setTimeout(() => resetModal(), 200);
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
    const requiredCommon = [
      { key: "companyName", label: "Company Name" },
      { key: "contactName", label: "Contact Name" },
      { key: "contactEmail", label: "Contact Email" },
      { key: "contactPhone", label: "Contact Phone" },
      { key: "industryContactNumber", label: "Industry Contact Number" },
      { key: "numberOfCandidates", label: "Number of Candidates" },
      { key: "specificRole", label: "Specific Role" },
      { key: "targetIndustry", label: "Industry" },
      { key: "packageAfterSelection", label: "Package After Selection" },
      { key: "stipendDetails", label: "Stipend" },
    ];

    const fieldsToCheck = [...requiredCommon];
    if (modal.mode === "custom") {
      fieldsToCheck.push({ key: "customRoleName", label: "Role Name" });
    } else if (!modal.training?.apiId) {
      return { valid: false, message: "Training identifier missing. Please refresh." };
    }

    for (const field of fieldsToCheck) {
      const raw = modal.form[field.key];
      if (raw === undefined || String(raw).trim() === "") {
        return { valid: false, message: `Please provide ${field.label}.` };
      }
    }

    const candidates = parseInt(modal.form.numberOfCandidates, 10);
    if (Number.isNaN(candidates) || candidates <= 0) {
      return { valid: false, message: "Number of candidates must be a positive number." };
    }

    return { valid: true };
  };

  const submitRequest = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      setModal((prev) => ({ ...prev, formError: validation.message }));
      return;
    }

    const desiredSkills = modal.form.desiredSkills
      ? modal.form.desiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const payload = {
      companyName: modal.form.companyName.trim(),
      companyWebsite: modal.form.companyWebsite.trim() || null,
      contactName: modal.form.contactName.trim(),
      contactEmail: modal.form.contactEmail.trim(),
      contactPhone: modal.form.contactPhone.trim(),
      industryContactNumber: modal.form.industryContactNumber.trim(),
      numberOfCandidates: parseInt(modal.form.numberOfCandidates, 10),
      preferredStartDate: modal.form.preferredStartDate || null,
      additionalNotes: modal.form.additionalNotes.trim() || null,
      desiredSkills,
      exampleCompany: modal.form.exampleCompany.trim() || null,
      specificRole: modal.form.specificRole.trim(),
      targetIndustry: modal.form.targetIndustry.trim(),
      packageAfterSelection: modal.form.packageAfterSelection.trim(),
      stipendDetails: modal.form.stipendDetails.trim(),
      otherRequirements: modal.form.otherRequirements.trim() || null,
    };

    if (modal.mode === "existing") {
      payload.trainingId = modal.training.apiId;
      payload.requestType = "EXISTING";
    } else {
      payload.trainingId = null;
      payload.requestType = "CUSTOM";
      payload.customRoleName = modal.form.customRoleName.trim();
      payload.customRequirements = modal.form.customRequirements.trim() || null;
      // capture context about the base program for internal triage
      if (modal.training?.roleName && !payload.additionalNotes) {
        payload.additionalNotes = `Custom cohort inspired by ${modal.training.roleName}.`;
      }
    }

    try {
      setModal((prev) => ({ ...prev, submitting: true, formError: "", status: "" }));
      await apiClient.post("/industry-training/apply", payload);
      setModal((prev) => ({
        ...prev,
        submitting: false,
        status: "Request submitted successfully. Our partnerships team will contact you soon.",
      }));

      setTimeout(() => {
        closeModal();
        alert("Your request has been submitted successfully.");
      }, 400);
    } catch (err) {
      console.error("Failed to submit industry request", err);
      const message = err?.response?.data ?? "Unable to submit request right now. Please try again.";
      setModal((prev) => ({ ...prev, submitting: false, formError: String(message) }));
    }
  };

  const renderModal = () => {
    if (!modal.open) return null;

    const isCustom = modal.mode === "custom";
    const title = isCustom
      ? "Request Custom Training"
      : `Apply for ${modal.training?.roleName ?? "Training"}`;

    return createPortal(
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
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
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {modal.training?.dayOneSummary && !isCustom && (
                <p className="text-sm text-muted-foreground">
                  Day-one promise: {modal.training.dayOneSummary}
                </p>
              )}
              {modal.formError && <p className="text-sm text-red-600 mt-2">{modal.formError}</p>}
              {modal.status && <p className="text-sm text-green-600 mt-2">{modal.status}</p>}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeModal}
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
                  Industry Contact Number <span className="text-red-500">*</span>
                </label>
                <Input
                  name="industryContactNumber"
                  value={modal.form.industryContactNumber}
                  onChange={updateForm}
                  placeholder="Operations or plant SPOC"
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
                  min="1"
                  placeholder="e.g., 20"
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Example Company
                </label>
                <Input
                  name="exampleCompany"
                  value={modal.form.exampleCompany}
                  onChange={updateForm}
                  placeholder="Reference brand or cohort benchmark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Specific Role <span className="text-red-500">*</span>
                </label>
                <Input
                  name="specificRole"
                  value={modal.form.specificRole}
                  onChange={updateForm}
                  placeholder="e.g., Salesforce SDR, BMS Engineer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Industry <span className="text-red-500">*</span>
                </label>
                <Input
                  name="targetIndustry"
                  value={modal.form.targetIndustry}
                  onChange={updateForm}
                  placeholder="e.g., SaaS Sales, Facilities Management"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Package After Selection <span className="text-red-500">*</span>
                </label>
                <Input
                  name="packageAfterSelection"
                  value={modal.form.packageAfterSelection}
                  onChange={updateForm}
                  placeholder="e.g., ₹6 LPA + incentives"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stipend <span className="text-red-500">*</span>
                </label>
                <Input
                  name="stipendDetails"
                  value={modal.form.stipendDetails}
                  onChange={updateForm}
                  placeholder="e.g., ₹10k monthly stipend"
                  required
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
                    placeholder="Describe tech stack, SOPs, KPIs, ramp timeline..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {!isCustom && modal.training?.dayOneDeliverables?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Day-One Deliverables</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {modal.training.dayOneDeliverables.map((deliverable, idx) => (
                    <li key={idx}>{deliverable}</li>
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
                placeholder="Share onboarding expectations, compliance requirements, or other details"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Other Requirements</label>
              <Textarea
                name="otherRequirements"
                value={modal.form.otherRequirements}
                onChange={updateForm}
                placeholder="Assessments, certifications, language proficiency, etc."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={closeModal} disabled={modal.submitting}>
                Cancel
              </Button>
              <Button type="button" onClick={submitRequest} disabled={modal.submitting}>
                {modal.submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  useEffect(() => {
    console.log("Modal state", modal);
  }, [modal]);

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
                Access day-one ready talent pipelines or tailor a bespoke training cohort for niche roles. Each program
                is benchmarked to deliver candidates who can contribute from day one.
              </p>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openCustomModal(null);
              }}
            >
              Request Custom Training
            </Button>
          </div>

          {displayTrainings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No day-one ready programs available yet. Check back soon or speak with our partnerships team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openExistingModal(training);
                      }}
                      disabled={!training.apiId}
                      title={!training.apiId ? "Training identifier missing. Please refresh." : undefined}
                    >
                      Apply for Cohort
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openCustomModal(training);
                      }}
                    >
                      Request Custom Training
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


