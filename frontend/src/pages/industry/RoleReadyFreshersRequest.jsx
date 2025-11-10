import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";

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
  customRoleName: "",
  customRequirements: "",
  exampleCompany: "",
  specificRole: "",
  targetIndustry: "",
  packageAfterSelection: "",
  stipendDetails: "",
  otherRequirements: "",
  additionalNotes: "",
};

const RoleReadyFreshersRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state ?? {};

  const [mode, setMode] = useState(prefill.mode === "custom" ? "custom" : "existing");
  const [training, setTraining] = useState(prefill.training ?? null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setMode(prefill.mode === "custom" ? "custom" : "existing");
    setTraining(prefill.training ?? null);

    const trainingDefaults = prefill.training
      ? {
          numberOfCandidates: String(prefill.training.totalStudentsAllowed ?? ""),
          desiredSkills: prefill.training.skillsCovered?.slice(0, 5).join(", ") ?? "",
          specificRole: prefill.training.roleName ?? "",
          targetIndustry: prefill.training.industry ?? "",
          packageAfterSelection: prefill.training.packageAfterTraining ?? "",
          stipendDetails: prefill.training.stipendIncluded
            ? `Stipend ₹${prefill.training.stipendAmount}`
            : "No stipend",
          exampleCompany: prefill.training.trainingProvider ?? "",
          customRoleName:
            prefill.mode === "custom" && prefill.training?.roleName
              ? `${prefill.training.roleName} Specialist`
              : "",
          customRequirements:
            prefill.mode === "custom" && prefill.training
              ? `Adapt ${prefill.training.roleName} curriculum for ${prefill.training.industry} workflows.`
              : "",
        }
      : {};

    setForm({
      ...EMPTY_FORM,
      ...trainingDefaults,
    });
    setStatus("");
    setFormError("");
    setSubmitting(false);
  }, [prefill.mode, prefill.training]);

  const validatedMode = useMemo(() => mode, [mode]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const required = [
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
    if (validatedMode === "custom") {
      required.push({ key: "customRoleName", label: "Role Name" });
    } else if (!training?.apiId) {
      return { valid: false, message: "Training identifier missing. Please navigate back and refresh the list." };
    }

    for (const field of required) {
      const raw = form[field.key];
      if (raw === undefined || String(raw).trim() === "") {
        return { valid: false, message: `Please provide ${field.label}.` };
      }
    }

    const candidateCount = parseInt(form.numberOfCandidates, 10);
    if (Number.isNaN(candidateCount) || candidateCount <= 0) {
      return { valid: false, message: "Number of candidates must be a positive number." };
    }

    return { valid: true };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateForm();
    if (!validation.valid) {
      setFormError(validation.message);
      return;
    }

    const desiredSkills = form.desiredSkills
      ? form.desiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const payload = {
      companyName: form.companyName.trim(),
      companyWebsite: form.companyWebsite.trim() || null,
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      industryContactNumber: form.industryContactNumber.trim(),
      numberOfCandidates: parseInt(form.numberOfCandidates, 10),
      preferredStartDate: form.preferredStartDate || null,
      desiredSkills,
      exampleCompany: form.exampleCompany.trim() || null,
      specificRole: form.specificRole.trim(),
      targetIndustry: form.targetIndustry.trim(),
      packageAfterSelection: form.packageAfterSelection.trim(),
      stipendDetails: form.stipendDetails.trim(),
      otherRequirements: form.otherRequirements.trim() || null,
      additionalNotes: form.additionalNotes.trim() || null,
    };

    if (validatedMode === "existing") {
      payload.trainingId = training.apiId;
      payload.requestType = "EXISTING";
    } else {
      payload.trainingId = null;
      payload.requestType = "CUSTOM";
      payload.customRoleName = form.customRoleName.trim();
      payload.customRequirements = form.customRequirements.trim() || null;
      if (training?.roleName && !payload.additionalNotes) {
        payload.additionalNotes = `Custom cohort inspired by ${training.roleName}.`;
      }
    }

    try {
      setSubmitting(true);
      setFormError("");
      setStatus("");
      await apiClient.post("/industry-training/apply", payload);
      setStatus("Request submitted successfully. Our partnerships team will contact you soon.");
      setTimeout(() => {
        navigate("/industry/role-ready-freshers");
        alert("Your training request has been submitted successfully.");
      }, 400);
    } catch (err) {
      console.error("Failed to submit industry request", err);
      const message = err?.response?.data ?? "Unable to submit request right now. Please try again.";
      setFormError(String(message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {validatedMode === "custom" ? "Request Custom Training" : "Apply for Day-One Ready Cohort"}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Share your hiring playbook so we can spin up industry-ready cohorts tailored to your tools, KPIs, and ramp
              timelines.
            </p>
            {status && <p className="text-sm text-green-600 mt-2">{status}</p>}
            {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
          </div>
          <Button variant="outline" type="button" onClick={() => navigate("/industry/role-ready-freshers")}>
            Back to Programs
          </Button>
        </div>

        {training && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{training.roleName}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm grid gap-2 md:grid-cols-2">
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
              <div className="md:col-span-2">
                <span className="font-semibold">Day-One Summary:</span> {training.dayOneSummary}
              </div>
            </CardContent>
          </Card>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input name="companyName" value={form.companyName} onChange={updateForm} placeholder="Enter company name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company Website</label>
            <Input
              name="companyWebsite"
              value={form.companyWebsite}
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
              value={form.contactName}
              onChange={updateForm}
              placeholder="Primary point of contact"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={updateForm}
              placeholder="contact@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <Input
              name="contactPhone"
              value={form.contactPhone}
              onChange={updateForm}
              placeholder="Include country code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Industry Contact Number <span className="text-red-500">*</span>
            </label>
            <Input
              name="industryContactNumber"
              value={form.industryContactNumber}
              onChange={updateForm}
              placeholder="Operations or plant SPOC"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Candidates <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="numberOfCandidates"
              value={form.numberOfCandidates}
              onChange={updateForm}
              min="1"
              placeholder="e.g., 20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Start Date</label>
            <Input type="date" name="preferredStartDate" value={form.preferredStartDate} onChange={updateForm} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Desired Skills (comma separated)</label>
            <Input
              name="desiredSkills"
              value={form.desiredSkills}
              onChange={updateForm}
              placeholder="SQL, Salesforce, Communication"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Example Company</label>
            <Input
              name="exampleCompany"
              value={form.exampleCompany}
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
              value={form.specificRole}
              onChange={updateForm}
              placeholder="e.g., Salesforce SDR, BMS Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Industry <span className="text-red-500">*</span>
            </label>
            <Input
              name="targetIndustry"
              value={form.targetIndustry}
              onChange={updateForm}
              placeholder="e.g., SaaS Sales, Facilities Management"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Package After Selection <span className="text-red-500">*</span>
            </label>
            <Input
              name="packageAfterSelection"
              value={form.packageAfterSelection}
              onChange={updateForm}
              placeholder="e.g., ₹6 LPA + incentives"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Stipend <span className="text-red-500">*</span>
            </label>
            <Input
              name="stipendDetails"
              value={form.stipendDetails}
              onChange={updateForm}
              placeholder="e.g., ₹10k monthly stipend"
            />
          </div>

          {validatedMode === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="customRoleName"
                  value={form.customRoleName}
                  onChange={updateForm}
                  placeholder="e.g., Revenue Operations Analyst"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Training Requirements</label>
                <Textarea
                  name="customRequirements"
                  value={form.customRequirements}
                  onChange={updateForm}
                  placeholder="Describe tech stack, SOPs, KPIs, ramp timeline..."
                  rows={4}
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <Textarea
              name="additionalNotes"
              value={form.additionalNotes}
              onChange={updateForm}
              placeholder="Share onboarding expectations, compliance requirements, or other details"
              rows={4}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Other Requirements</label>
            <Textarea
              name="otherRequirements"
              value={form.otherRequirements}
              onChange={updateForm}
              placeholder="Assessments, certifications, language proficiency, etc."
              rows={3}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/industry/role-ready-freshers")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RoleReadyFreshersRequest;


