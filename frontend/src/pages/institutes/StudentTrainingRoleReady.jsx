import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { X } from "lucide-react";

const EMPTY_INSTITUTE = {
  instituteName: "",
  instituteContactPerson: "",
  instituteEmail: "",
  institutePhone: "",
  instituteNotes: "",
};

const EMPTY_STUDENT = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  highestQualification: "",
  specialization: "",
  collegeName: "",
  graduationYear: "",
  percentageOrCgpa: "",
  yearsOfExperience: "",
  knownSkills: "",
  resumeUrl: "",
  additionalNotes: "",
};

const REQUIRED_INSTITUTE_FIELDS = [
  { name: "instituteName", label: "Institute Name" },
  { name: "instituteContactPerson", label: "Primary Contact Person" },
  { name: "instituteEmail", label: "Contact Email" },
  { name: "institutePhone", label: "Contact Phone" },
];

const REQUIRED_STUDENT_FIELDS = [
  { name: "fullName", label: "Full Name" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "gender", label: "Gender" },
  { name: "dateOfBirth", label: "Date of Birth" },
  { name: "addressLine1", label: "Address Line 1" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "pincode", label: "Pincode" },
  { name: "highestQualification", label: "Highest Qualification" },
  { name: "collegeName", label: "College Name" },
];

const buildDefaultFlowState = () => ({
  visible: false,
  step: "INSTITUTE",
  training: null,
  institute: { ...EMPTY_INSTITUTE },
  student: { ...EMPTY_STUDENT },
  status: "",
  error: "",
  submitting: false,
});

const StudentTrainingRoleReady = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [flow, setFlow] = useState(buildDefaultFlowState);

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
        setTrainings(normalized);
      } catch (error) {
        console.error("Error fetching trainings:", error);
        setFetchError("Unable to load trainings right now. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const usableTrainings = useMemo(() => trainings ?? [], [trainings]);

  const startEnrollment = (training) => {
    if (!training?.apiId) {
      setFlow((prev) => ({
        ...buildDefaultFlowState(),
        error: "This training is missing an identifier. Please refresh the page and try again.",
      }));
      return;
    }

    setFlow({
      ...buildDefaultFlowState(),
      visible: true,
      training,
      institute: { ...EMPTY_INSTITUTE },
      student: { ...EMPTY_STUDENT },
    });
  };

  const closeEnrollment = () => {
    setFlow(buildDefaultFlowState());
  };

  const updateInstituteField = (event) => {
    const { name, value } = event.target;
    setFlow((prev) => ({
      ...prev,
      institute: {
        ...prev.institute,
        [name]: value,
      },
    }));
  };

  const updateStudentField = (event) => {
    const { name, value } = event.target;
    setFlow((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        [name]: value,
      },
    }));
  };

  const validateFields = (values, requirements) => {
    for (const field of requirements) {
      const raw = values[field.name];
      if (raw === undefined || String(raw).trim() === "") {
        return { valid: false, missing: field.label };
      }
    }
    return { valid: true };
  };

  const proceedToStudentStep = () => {
    const validation = validateFields(flow.institute, REQUIRED_INSTITUTE_FIELDS);
    if (!validation.valid) {
      setFlow((prev) => ({
        ...prev,
        error: `Please provide ${validation.missing} before continuing.`,
      }));
      return;
    }

    setFlow((prev) => ({
      ...prev,
      error: "",
      step: "STUDENT",
    }));
  };

  const submitEnrollment = async ({ addAnother }) => {
    if (!flow.training?.apiId) {
      setFlow((prev) => ({
        ...prev,
        error: "Training identifier is missing. Close the form, refresh, and try again.",
      }));
      return;
    }

    const instituteCheck = validateFields(flow.institute, REQUIRED_INSTITUTE_FIELDS);
    if (!instituteCheck.valid) {
      setFlow((prev) => ({
        ...prev,
        error: `Please provide ${instituteCheck.missing} before saving.`,
      }));
      return;
    }

    const studentCheck = validateFields(flow.student, REQUIRED_STUDENT_FIELDS);
    if (!studentCheck.valid) {
      setFlow((prev) => ({
        ...prev,
        error: `Please provide ${studentCheck.missing} before saving.`,
      }));
      return;
    }

    try {
      setFlow((prev) => ({ ...prev, submitting: true, error: "", status: "" }));

      const payload = {
        ...flow.institute,
        ...flow.student,
        percentageOrCgpa: flow.student.percentageOrCgpa ? parseFloat(flow.student.percentageOrCgpa) : 0,
        yearsOfExperience: flow.student.yearsOfExperience ? parseInt(flow.student.yearsOfExperience, 10) : 0,
        knownSkills: flow.student.knownSkills
          ? flow.student.knownSkills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],
      };

      await apiClient.post(`/trainings/${flow.training.apiId}/enroll`, payload);

      if (addAnother) {
        setFlow((prev) => ({
          ...prev,
          submitting: false,
          status: "Student saved. You can add another now.",
          student: { ...EMPTY_STUDENT },
        }));
      } else {
        setFlow((prev) => ({
          ...prev,
          submitting: false,
        }));
        closeEnrollment();
        alert("Student enrollment saved successfully.");
      }
    } catch (error) {
      console.error("Error saving enrollment:", error);
      const notFound = error?.response?.status === 404;
      setFlow((prev) => ({
        ...prev,
        submitting: false,
        error: notFound
          ? "This training is no longer available. Please refresh the page."
          : "Unable to save enrollment right now. Please try again.",
      }));
    }
  };

  const renderInstituteForm = () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        proceedToStudentStep();
      }}
      className="p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Institute Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="instituteName"
            value={flow.institute.instituteName}
            onChange={updateInstituteField}
            placeholder="Enter institute or university name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Primary Contact Person <span className="text-red-500">*</span>
          </label>
          <Input
            name="instituteContactPerson"
            value={flow.institute.instituteContactPerson}
            onChange={updateInstituteField}
            placeholder="Name of coordinator"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            name="instituteEmail"
            value={flow.institute.instituteEmail}
            onChange={updateInstituteField}
            placeholder="coordinator@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            name="institutePhone"
            value={flow.institute.institutePhone}
            onChange={updateInstituteField}
            placeholder="Enter contact number"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes for SaarthiX Team</label>
          <Textarea
            name="instituteNotes"
            value={flow.institute.instituteNotes}
            onChange={updateInstituteField}
            placeholder="Share batch size, preferred timelines, or any special requirements"
            rows={4}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={closeEnrollment}>
          Cancel
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );

  const renderStudentForm = () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitEnrollment({ addAnother: false });
      }}
      className="p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="fullName"
            value={flow.student.fullName}
            onChange={updateStudentField}
            placeholder="Enter student's full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={flow.student.email}
            onChange={updateStudentField}
            placeholder="Enter student's email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            name="phone"
            value={flow.student.phone}
            onChange={updateStudentField}
            placeholder="Enter student's phone number"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={flow.student.gender}
            onChange={updateStudentField}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="dateOfBirth"
            value={flow.student.dateOfBirth}
            onChange={updateStudentField}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Address</h3>
        <div>
          <label className="block text-sm font-medium mb-1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <Input
            name="addressLine1"
            value={flow.student.addressLine1}
            onChange={updateStudentField}
            placeholder="Street address"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address Line 2</label>
          <Input
            name="addressLine2"
            value={flow.student.addressLine2}
            onChange={updateStudentField}
            placeholder="Apartment, suite, etc."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              name="city"
              value={flow.student.city}
              onChange={updateStudentField}
              placeholder="City"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <Input
              name="state"
              value={flow.student.state}
              onChange={updateStudentField}
              placeholder="State"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <Input
              name="pincode"
              value={flow.student.pincode}
              onChange={updateStudentField}
              placeholder="Pincode"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Highest Qualification <span className="text-red-500">*</span>
            </label>
            <Input
              name="highestQualification"
              value={flow.student.highestQualification}
              onChange={updateStudentField}
              placeholder="e.g., B.Tech, B.Com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <Input
              name="specialization"
              value={flow.student.specialization}
              onChange={updateStudentField}
              placeholder="e.g., Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              College Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="collegeName"
              value={flow.student.collegeName}
              onChange={updateStudentField}
              placeholder="Enter college/university name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Graduation Year</label>
            <Input
              type="number"
              name="graduationYear"
              value={flow.student.graduationYear}
              onChange={updateStudentField}
              placeholder="e.g., 2024"
              min="2000"
              max="2035"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Percentage/CGPA</label>
            <Input
              type="number"
              name="percentageOrCgpa"
              value={flow.student.percentageOrCgpa}
              onChange={updateStudentField}
              placeholder="e.g., 75.5 or 8.5"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Experience & Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Years of Experience</label>
            <Input
              type="number"
              name="yearsOfExperience"
              value={flow.student.yearsOfExperience}
              onChange={updateStudentField}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Known Skills</label>
            <Input
              name="knownSkills"
              value={flow.student.knownSkills}
              onChange={updateStudentField}
              placeholder="Comma-separated skills"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Resume URL (Optional)</label>
          <Input
            type="url"
            name="resumeUrl"
            value={flow.student.resumeUrl}
            onChange={updateStudentField}
            placeholder="https://drive.google.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Additional Notes</label>
          <Textarea
            name="additionalNotes"
            value={flow.student.additionalNotes}
            onChange={updateStudentField}
            placeholder="Any additional information about the student"
            rows={4}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFlow((prev) => ({ ...prev, step: "INSTITUTE", status: "", error: "" }))}
          disabled={flow.submitting}
        >
          Back
        </Button>
        <Button type="submit" disabled={flow.submitting}>
          {flow.submitting ? "Saving..." : "Save & Close"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => submitEnrollment({ addAnother: true })}
          disabled={flow.submitting}
        >
          {flow.submitting ? "Saving..." : "Save & Add Another"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={closeEnrollment}
          disabled={flow.submitting}
        >
          Discard
        </Button>
      </div>
    </form>
  );

  const renderModal = () => {
    if (!flow.visible || !flow.training) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget && !flow.submitting) {
            closeEnrollment();
          }
        }}
      >
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl font-bold">
                {flow.step === "INSTITUTE"
                  ? `Institute Enrollment for ${flow.training.roleName}`
                  : `Enroll Students for ${flow.training.roleName}`}
              </h2>
              <p className="text-sm text-muted-foreground">
                Step {flow.step === "INSTITUTE" ? "1" : "2"} of 2
              </p>
              {flow.status && flow.step === "STUDENT" && (
                <p className="text-sm text-green-600 mt-1">{flow.status}</p>
              )}
              {flow.error && <p className="text-sm text-red-600 mt-1">{flow.error}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeEnrollment}
              className="h-8 w-8"
              type="button"
              disabled={flow.submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {flow.step === "INSTITUTE" ? renderInstituteForm() : renderStudentForm()}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<div>Sidebar</div>}>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg">Loading trainings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout sidebar={<div>Sidebar</div>}>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold">Student Training (Role Ready)</h1>
            <p className="text-muted-foreground">
              Enroll batches of students into industry-aligned Role Ready training programs.
            </p>
            {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
          </header>

          {usableTrainings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No training programs available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usableTrainings.map((training) => (
                <Card key={training.clientKey} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{training.roleName}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {training.roleDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm">
                    <div>
                      <span className="font-semibold">Industry:</span> {training.industry}
                    </div>
                    <div>
                      <span className="font-semibold">Duration:</span> {training.trainingDuration}
                    </div>
                    <div>
                      <span className="font-semibold">Student Fees:</span> ₹
                      {Number(training.trainingFees ?? 0).toLocaleString()}
                    </div>
                    {typeof training.instituteTrainingFees === "number" && (
                      <div>
                        <span className="font-semibold">Institute Fees:</span> ₹
                        {Number(training.instituteTrainingFees ?? 0).toLocaleString()}
                      </div>
                    )}
                    {typeof training.totalStudentsAllowed === "number" && (
                      <div>
                        <span className="font-semibold">Total Seats:</span> {training.totalStudentsAllowed}
                      </div>
                    )}
                    {training.stipendIncluded && (
                      <div className="text-green-600">
                        <span className="font-semibold">Stipend:</span> ₹
                        {Number(training.stipendAmount ?? 0).toLocaleString()}/month
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Location:</span> {training.location}
                    </div>
                    <div>
                      <span className="font-semibold">Mode:</span> {training.trainingMode}
                    </div>
                    <div>
                      <span className="font-semibold">Placement Package:</span> {training.packageAfterTraining}
                    </div>
                    {training.certificationProvided && (
                      <div className="text-purple-600">
                        <span className="font-semibold">Certification:</span> {training.certificationName}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Provider:</span> {training.trainingProvider}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      onClick={() => startEnrollment(training)}
                      className="w-full"
                      disabled={!training.apiId}
                      title={!training.apiId ? "Training identifier missing. Please refresh." : undefined}
                    >
                      Enroll Students
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

export default StudentTrainingRoleReady;

