import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
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
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const defaultFormState = {
  instituteName: "",
  place: "",
  contactNumber: "",
  email: "",
  contactPersonName: "",
  contactPersonDesignation: "",
  preferredMode: "",
  preferredDate: "",
  preferredTime: "",
  expectedParticipantCount: "",
  additionalNotes: "",
};

const ExpertEnrollment = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollmentForm, setEnrollmentForm] = useState(defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/expert-sessions");
        const experts = response.data || [];
        const foundExpert = experts.find((e) => e.id === expertId);
        if (foundExpert) {
          setExpert(foundExpert);
          setEnrollmentForm({
            ...defaultFormState,
            preferredMode: foundExpert?.sessionFormats?.[0] || "Online",
          });
        } else {
          setError("Expert not found");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load expert details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (expertId) {
      fetchExpert();
    }
  }, [expertId]);

  const onFormChange = (field, value) => {
    setEnrollmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!expert) return;

    const payload = {
      ...enrollmentForm,
      expectedParticipantCount: enrollmentForm.expectedParticipantCount
        ? Number(enrollmentForm.expectedParticipantCount)
        : null,
    };

    try {
      setSubmitting(true);
      await apiClient.post(`/expert-sessions/${expert.id}/enroll`, payload);
      setSuccess(true);
      // Navigate back to expert sessions page after 2 seconds with refresh parameter
      setTimeout(() => {
        navigate("/institutes/expert-sessions?refresh=true");
      }, 2000);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error ||
        "Something went wrong while submitting the enrollment. Please retry.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading expert details...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !expert) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate("/institutes/expert-sessions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expert Sessions
          </Button>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-red-700">
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Enrollment Request Submitted!</h2>
            <p className="text-muted-foreground">
              Your enrollment request for {expert?.fullName} has been submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              You will be redirected to the Expert Sessions page shortly...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(`/institutes/expert-sessions/${expertId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Enroll for Expert Session</h1>
            <p className="text-muted-foreground mt-2">
              Fill in the details below to request a session with {expert?.fullName}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {expert && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                  <img
                    src={expert.photoUrl}
                    alt={expert.fullName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <CardTitle>{expert.fullName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {expert.designation}
                    {expert.organization ? ` · ${expert.organization}` : ""}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
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
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                    type="email"
                    value={enrollmentForm.email}
                    onChange={(event) => onFormChange("email", event.target.value)}
                    icon={Mail}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Preferred mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={enrollmentForm.preferredMode}
                      onChange={(event) => onFormChange("preferredMode", event.target.value)}
                      required
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
                  <FormField
                    label="Expected number of participants"
                    type="number"
                    min="1"
                    value={enrollmentForm.expectedParticipantCount}
                    onChange={(event) => onFormChange("expectedParticipantCount", event.target.value)}
                    icon={Users}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Additional notes (agenda, expectations, logistics)
                  </label>
                  <Textarea
                    placeholder="Share specific expectations from the expert, session goals, agenda items, or any special requirements..."
                    value={enrollmentForm.additionalNotes}
                    onChange={(event) => onFormChange("additionalNotes", event.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/institutes/expert-sessions/${expertId}`)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Enrollment Request"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
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

export default ExpertEnrollment;

