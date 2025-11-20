import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import {
  ArrowLeft,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  FileText,
  Send,
  Clock
} from "lucide-react";

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
        {/* Enhanced Header with Vibrant Colors */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 rounded-2xl p-6 border-2 border-orange-200/50 flex-1 mr-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                {validatedMode === "custom" ? (
                  <Sparkles className="h-10 w-10 text-white" />
                ) : (
                  <Target className="h-10 w-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  {validatedMode === "custom" ? "Request Custom Training" : "Apply for Day-One Ready Cohort"}
                </h1>
                <p className="text-gray-700 max-w-2xl mt-2 text-lg font-medium">
                  Share your hiring playbook so we can spin up industry-ready cohorts tailored to your tools, KPIs, and ramp
                  timelines.
                </p>
                {status && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg flex items-center gap-2 shadow-md">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700 font-semibold">{status}</p>
                  </div>
                )}
                {formError && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-lg flex items-center gap-2 shadow-md">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-700 font-semibold">{formError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate("/industry/role-ready-freshers")}
            className="border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
        </div>

        {training && (
          <Card className="mb-8 border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white rounded-t-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/30 backdrop-blur-md rounded-xl shadow-lg">
                  <Briefcase className="h-7 w-7" />
                </div>
                <CardTitle className="text-3xl font-extrabold drop-shadow-lg">{training.roleName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  <div>
                    <span className="font-semibold">Industry:</span> {training.industry}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div>
                    <span className="font-semibold">Mode:</span> {training.trainingMode}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <span className="font-semibold">Duration:</span> {training.trainingDuration}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <div>
                    <span className="font-semibold">Intake Capacity:</span> {training.totalStudentsAllowed}
                  </div>
                </div>
                <div className="md:col-span-2 pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <span className="font-semibold">Day-One Summary:</span>
                      <p className="text-gray-700 mt-1">{training.dayOneSummary}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Company Information Section */}
          <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50/30 to-white">
            <CardHeader className="bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 border-b-2 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Company Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    name="companyName" 
                    value={form.companyName} 
                    onChange={updateForm} 
                    placeholder="Enter company name"
                    className="border-2 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-600" />
                    Company Website
                  </label>
                  <Input
                    name="companyWebsite"
                    value={form.companyWebsite}
                    onChange={updateForm}
                    placeholder="https://example.com"
                    className="border-2 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="contactName"
                    value={form.contactName}
                    onChange={updateForm}
                    placeholder="Primary point of contact"
                    className="border-2 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-600" />
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={updateForm}
                    placeholder="contact@example.com"
                    className="border-2 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-600" />
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={updateForm}
                    placeholder="Include country code"
                    className="border-2 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-600" />
                    Industry Contact Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="industryContactNumber"
                    value={form.industryContactNumber}
                    onChange={updateForm}
                    placeholder="Operations or plant SPOC"
                    className="border-2 focus:border-orange-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Training Requirements Section */}
          <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50/30 to-white">
            <CardHeader className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 border-b-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Training Requirements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Number of Candidates <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="numberOfCandidates"
                    value={form.numberOfCandidates}
                    onChange={updateForm}
                    min="1"
                    placeholder="e.g., 20"
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Preferred Start Date
                  </label>
                  <Input 
                    type="date" 
                    name="preferredStartDate" 
                    value={form.preferredStartDate} 
                    onChange={updateForm}
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Desired Skills (comma separated)
                  </label>
                  <Input
                    name="desiredSkills"
                    value={form.desiredSkills}
                    onChange={updateForm}
                    placeholder="SQL, Salesforce, Communication"
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Example Company
                  </label>
                  <Input
                    name="exampleCompany"
                    value={form.exampleCompany}
                    onChange={updateForm}
                    placeholder="Reference brand or cohort benchmark"
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Specific Role <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="specificRole"
                    value={form.specificRole}
                    onChange={updateForm}
                    placeholder="e.g., Salesforce SDR, BMS Engineer"
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="targetIndustry"
                    value={form.targetIndustry}
                    onChange={updateForm}
                    placeholder="e.g., SaaS Sales, Facilities Management"
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    Package After Selection <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="packageAfterSelection"
                    value={form.packageAfterSelection}
                    onChange={updateForm}
                    placeholder="e.g., ₹6 LPA + incentives"
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    Stipend <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="stipendDetails"
                    value={form.stipendDetails}
                    onChange={updateForm}
                    placeholder="e.g., ₹10k monthly stipend"
                    className="border-2 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Training Section */}
          {validatedMode === "custom" && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border-b-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Custom Training Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="customRoleName"
                      value={form.customRoleName}
                      onChange={updateForm}
                      placeholder="e.g., Revenue Operations Analyst"
                      className="border-2 focus:border-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Training Requirements
                    </label>
                    <Textarea
                      name="customRequirements"
                      value={form.customRequirements}
                      onChange={updateForm}
                      placeholder="Describe tech stack, SOPs, KPIs, ramp timeline..."
                      rows={4}
                      className="border-2 focus:border-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information Section */}
          <Card className="border-2 border-gray-200 shadow-lg bg-gradient-to-br from-gray-50/30 to-white">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-slate-100 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent">Additional Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Additional Notes</label>
                  <Textarea
                    name="additionalNotes"
                    value={form.additionalNotes}
                    onChange={updateForm}
                    placeholder="Share onboarding expectations, compliance requirements, or other details"
                    rows={4}
                    className="border-2 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Other Requirements</label>
                  <Textarea
                    name="otherRequirements"
                    value={form.otherRequirements}
                    onChange={updateForm}
                    placeholder="Assessments, certifications, language proficiency, etc."
                    rows={3}
                    className="border-2 focus:border-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex justify-end gap-4 pt-6 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 shadow-lg">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/industry/role-ready-freshers")}
              className="px-8 border-2 border-gray-300 hover:border-gray-400 font-semibold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="px-10 py-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RoleReadyFreshersRequest;


