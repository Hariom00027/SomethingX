import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { 
  X, 
  GraduationCap, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Award, 
  Building2, 
  Sparkles,
  Loader2,
  BookOpen,
  CheckCircle2,
  Calendar,
  Briefcase,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  TrendingUp
} from "lucide-react";

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
  const [flow, setFlow] = useState(buildDefaultFlowState());

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

  useEffect(() => {
    console.log("Flow state changed:", flow);
  }, [flow]);

  const usableTrainings = useMemo(() => trainings ?? [], [trainings]);

  const startEnrollment = (training) => {
    console.log("startEnrollment called with training:", training);
    if (!training?.apiId) {
      console.error("Training missing apiId:", training);
      setFlow((prev) => ({
        ...buildDefaultFlowState(),
        error: "This training is missing an identifier. Please refresh the page and try again.",
      }));
      return;
    }

    const newFlow = {
      ...buildDefaultFlowState(),
      visible: true,
      training,
      institute: { ...EMPTY_INSTITUTE },
      student: { ...EMPTY_STUDENT },
    };
    console.log("Setting flow state:", newFlow);
    setFlow(newFlow);
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
      className="p-6 space-y-6 bg-gray-50"
    >
      <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50/50 to-white">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-200">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Institute Information</h3>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="instituteName" className="block text-sm font-medium mb-1">
            Institute Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="instituteName"
            name="instituteName"
            value={flow.institute.instituteName}
            onChange={updateInstituteField}
            placeholder="Enter institute or university name"
            required
          />
        </div>
        <div>
          <label htmlFor="instituteContactPerson" className="block text-sm font-medium mb-1">
            Primary Contact Person <span className="text-red-500">*</span>
          </label>
          <Input
            id="instituteContactPerson"
            name="instituteContactPerson"
            value={flow.institute.instituteContactPerson}
            onChange={updateInstituteField}
            placeholder="Name of coordinator"
            required
          />
        </div>
        <div>
          <label htmlFor="instituteEmail" className="block text-sm font-medium mb-1">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="instituteEmail"
            type="email"
            name="instituteEmail"
            value={flow.institute.instituteEmail}
            onChange={updateInstituteField}
            placeholder="coordinator@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="institutePhone" className="block text-sm font-medium mb-1">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <Input
            id="institutePhone"
            type="tel"
            name="institutePhone"
            value={flow.institute.institutePhone}
            onChange={updateInstituteField}
            placeholder="Enter contact number"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="instituteNotes" className="block text-sm font-medium mb-1">Notes for SaarthiX Team</label>
          <Textarea
            id="instituteNotes"
            name="instituteNotes"
            value={flow.institute.instituteNotes}
            onChange={updateInstituteField}
            placeholder="Share batch size, preferred timelines, or any special requirements"
            rows={4}
          />
        </div>
      </div>

      </div>
      <div className="flex flex-wrap justify-end gap-3 pt-6 bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
        <Button type="button" variant="outline" onClick={closeEnrollment} className="px-8 border-2 border-gray-300 hover:border-gray-400 font-semibold">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="px-10 py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );

  const renderStudentForm = () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitEnrollment({ addAnother: false });
      }}
      className="p-6 space-y-8 bg-gray-50"
    >
      <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50/50 to-white">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Student Information</h3>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="fullName"
            name="fullName"
            value={flow.student.fullName}
            onChange={updateStudentField}
            placeholder="Enter student's full name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            value={flow.student.email}
            onChange={updateStudentField}
            placeholder="Enter student's email"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            type="tel"
            name="phone"
            value={flow.student.phone}
            onChange={updateStudentField}
            placeholder="Enter student's phone number"
            required
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
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
          <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Input
            id="dateOfBirth"
            type="date"
            name="dateOfBirth"
            value={flow.student.dateOfBirth}
            onChange={updateStudentField}
            required
          />
        </div>
      </div>

      </div>
      <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50/50 to-white">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-200">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Address</h3>
        </div>
        <div className="space-y-4">
        <div>
          <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <Input
            id="addressLine1"
            name="addressLine1"
            value={flow.student.addressLine1}
            onChange={updateStudentField}
            placeholder="Street address"
            required
          />
        </div>
        <div>
          <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">Address Line 2</label>
          <Input
            id="addressLine2"
            name="addressLine2"
            value={flow.student.addressLine2}
            onChange={updateStudentField}
            placeholder="Apartment, suite, etc."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              id="city"
              name="city"
              value={flow.student.city}
              onChange={updateStudentField}
              placeholder="City"
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <Input
              id="state"
              name="state"
              value={flow.student.state}
              onChange={updateStudentField}
              placeholder="State"
              required
            />
          </div>
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <Input
              id="pincode"
              name="pincode"
              value={flow.student.pincode}
              onChange={updateStudentField}
              placeholder="Pincode"
              required
            />
          </div>
        </div>
      </div>

      </div>
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50/50 to-white">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-200">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Education</h3>
        </div>
        <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="highestQualification" className="block text-sm font-medium mb-1">
              Highest Qualification <span className="text-red-500">*</span>
            </label>
            <Input
              id="highestQualification"
              name="highestQualification"
              value={flow.student.highestQualification}
              onChange={updateStudentField}
              placeholder="e.g., B.Tech, B.Com"
              required
            />
          </div>
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium mb-1">Specialization</label>
            <Input
              id="specialization"
              name="specialization"
              value={flow.student.specialization}
              onChange={updateStudentField}
              placeholder="e.g., Computer Science"
            />
          </div>
          <div>
            <label htmlFor="collegeName" className="block text-sm font-medium mb-1">
              College Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="collegeName"
              name="collegeName"
              value={flow.student.collegeName}
              onChange={updateStudentField}
              placeholder="Enter college/university name"
              required
            />
          </div>
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium mb-1">Graduation Year</label>
            <Input
              id="graduationYear"
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
            <label htmlFor="percentageOrCgpa" className="block text-sm font-medium mb-1">Percentage/CGPA</label>
            <Input
              id="percentageOrCgpa"
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

      </div>
      <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50/50 to-white">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Experience & Skills</h3>
        </div>
        <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium mb-1">Years of Experience</label>
            <Input
              id="yearsOfExperience"
              type="number"
              name="yearsOfExperience"
              value={flow.student.yearsOfExperience}
              onChange={updateStudentField}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="knownSkills" className="block text-sm font-medium mb-1">Known Skills</label>
            <Input
              id="knownSkills"
              name="knownSkills"
              value={flow.student.knownSkills}
              onChange={updateStudentField}
              placeholder="Comma-separated skills"
            />
          </div>
        </div>
      </div>

      </div>
      <div className="bg-white p-6 rounded-xl border-2 border-pink-200 shadow-lg bg-gradient-to-br from-pink-50/50 to-white">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pink-200">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-md">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Additional Information</h3>
        </div>
        <div className="space-y-4">
        <div>
          <label htmlFor="resumeUrl" className="block text-sm font-medium mb-1">Resume URL (Optional)</label>
          <Input
            id="resumeUrl"
            type="url"
            name="resumeUrl"
            value={flow.student.resumeUrl}
            onChange={updateStudentField}
            placeholder="https://drive.google.com/..."
          />
        </div>
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium mb-1">Additional Notes</label>
          <Textarea
            id="additionalNotes"
            name="additionalNotes"
            value={flow.student.additionalNotes}
            onChange={updateStudentField}
            placeholder="Any additional information about the student"
            rows={4}
          />
        </div>
      </div>

      </div>
      <div className="flex flex-wrap justify-end gap-3 pt-6 bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFlow((prev) => ({ ...prev, step: "INSTITUTE", status: "", error: "" }))}
          disabled={flow.submitting}
          className="px-8 border-2 border-gray-300 hover:border-gray-400 font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={closeEnrollment}
          disabled={flow.submitting}
          className="px-8 border-2 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700 font-semibold"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Discard
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => submitEnrollment({ addAnother: true })}
          disabled={flow.submitting}
          className="px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold shadow-lg"
        >
          {flow.submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add New Student
            </>
          )}
        </Button>
        <Button 
          type="submit" 
          disabled={flow.submitting}
          className="px-10 py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
        >
          {flow.submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Data
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderModal = () => {
    console.log("renderModal called, flow state:", { visible: flow.visible, training: flow.training });
    if (!flow.visible || !flow.training) {
      console.log("Modal not rendering - visible:", flow.visible, "training:", flow.training);
      return null;
    }

    const modalContent = (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && !flow.submitting) {
            closeEnrollment();
          }
        }}
      >
        <div
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-fade-in"
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            maxWidth: '56rem',
            width: '100%',
            maxHeight: '90vh'
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 flex justify-between items-start z-10 rounded-t-2xl shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-emerald-600/90 to-teal-600/90 backdrop-blur-sm"></div>
            <div className="relative flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/30 backdrop-blur-md rounded-xl shadow-lg">
                  {flow.step === "INSTITUTE" ? (
                    <Building2 className="h-7 w-7" />
                  ) : (
                    <UserPlus className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold drop-shadow-lg">
                    {flow.step === "INSTITUTE"
                      ? `Institute Enrollment for ${flow.training.roleName}`
                      : `Enroll Students for ${flow.training.roleName}`}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold shadow-md">
                      Step {flow.step === "INSTITUTE" ? "1" : "2"} of 2
                    </div>
                  </div>
                </div>
              </div>
              {flow.status && flow.step === "STUDENT" && (
                <div className="mt-3 p-3 bg-green-500/30 backdrop-blur-md rounded-lg border border-white/20">
                  <p className="text-sm text-white font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {flow.status}
                  </p>
                </div>
              )}
              {flow.error && (
                <div className="mt-3 p-3 bg-red-500/30 backdrop-blur-md rounded-lg border border-white/20">
                  <p className="text-sm text-white font-semibold">{flow.error}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeEnrollment}
              className="h-8 w-8 text-white hover:bg-white/20"
              type="button"
              disabled={flow.submitting}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {flow.step === "INSTITUTE" ? renderInstituteForm() : renderStudentForm()}
        </div>
      </div>
    );

    // Render modal using portal to document.body to ensure it's above everything
    return createPortal(modalContent, document.body);
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<div>Sidebar</div>}>
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading training programs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout sidebar={<div>Sidebar</div>}>
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Enhanced Header with Vibrant Colors */}
          <header className="space-y-4">
            <div className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">
                    Student Training (Role Ready)
                  </h1>
                  <p className="text-gray-700 mt-2 text-lg font-medium">
                    Enroll batches of students into industry-aligned Role Ready training programs
                  </p>
                </div>
              </div>
            </div>
            {fetchError && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-lg shadow-md">
                <p className="text-sm text-red-700 font-semibold">{fetchError}</p>
              </div>
            )}
            {usableTrainings.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border border-green-200 w-fit">
                <Sparkles className="h-5 w-5 text-teal-600" />
                <span className="text-sm font-semibold text-teal-700">
                  {usableTrainings.length} training program{usableTrainings.length !== 1 ? 's' : ''} available
                </span>
              </div>
            )}
          </header>

          {usableTrainings.length === 0 ? (
            <div className="text-center py-16 space-y-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border-2 border-dashed border-green-300">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">No training programs available</h3>
                <p className="text-gray-600">Check back soon for new opportunities!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usableTrainings.map((training, index) => {
                const colorVariants = [
                  'from-green-500 via-emerald-500 to-teal-500',
                  'from-teal-500 via-cyan-500 to-blue-500',
                  'from-emerald-500 via-green-500 to-lime-500',
                  'from-cyan-500 via-teal-500 to-green-500',
                  'from-lime-500 via-emerald-500 to-teal-500',
                  'from-green-500 via-teal-500 to-cyan-500'
                ];
                const bgVariants = [
                  'bg-gradient-to-br from-green-50 to-emerald-50',
                  'bg-gradient-to-br from-teal-50 to-cyan-50',
                  'bg-gradient-to-br from-emerald-50 to-green-50',
                  'bg-gradient-to-br from-cyan-50 to-teal-50',
                  'bg-gradient-to-br from-lime-50 to-emerald-50',
                  'bg-gradient-to-br from-green-50 to-cyan-50'
                ];
                const borderVariants = [
                  'border-green-200 hover:border-green-400',
                  'border-teal-200 hover:border-teal-400',
                  'border-emerald-200 hover:border-emerald-400',
                  'border-cyan-200 hover:border-cyan-400',
                  'border-lime-200 hover:border-lime-400',
                  'border-green-200 hover:border-green-400'
                ];
                const variantIndex = index % colorVariants.length;
                return (
                <Card 
                  key={training.clientKey} 
                  className={`flex flex-col hover:shadow-2xl transition-all duration-300 border-2 ${borderVariants[variantIndex]} group overflow-hidden relative ${bgVariants[variantIndex]}`}
                >
                  {/* Vibrant Gradient Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${colorVariants[variantIndex]} shadow-lg`}></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-teal-600 transition-all">
                          {training.roleName}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm text-gray-600">
                          {training.roleDescription}
                        </CardDescription>
                      </div>
                      <div className={`p-3 bg-gradient-to-br ${colorVariants[variantIndex]} rounded-xl shadow-md transform group-hover:scale-110 transition-transform`}>
                        <Briefcase className="h-5 w-5 text-white" />
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
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{training.trainingDuration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-medium">{training.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Mode</p>
                          <p className="font-medium">{training.trainingMode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Benefits */}
                    <div className="space-y-2 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">Student Fees</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{Number(training.trainingFees ?? 0).toLocaleString()}
                        </span>
                      </div>
                      
                      {typeof training.instituteTrainingFees === "number" && (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Institute Fees</span>
                          <span className="font-bold">₹{Number(training.instituteTrainingFees ?? 0).toLocaleString()}</span>
                        </div>
                      )}
                      
                      {training.stipendIncluded && (
                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                          <div className="p-1.5 bg-green-500 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-green-700">
                            <span>Stipend:</span> ₹{Number(training.stipendAmount ?? 0).toLocaleString()}/month
                          </span>
                        </div>
                      )}
                      
                      {training.packageAfterTraining && (
                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                          <div className="p-1.5 bg-blue-500 rounded-lg">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-blue-700">
                            <span>Package:</span> {training.packageAfterTraining}
                          </span>
                        </div>
                      )}
                      
                      {training.certificationProvided && (
                        <div className="flex items-center gap-2 text-sm p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <Award className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-700">Certification: {training.certificationName}</span>
                        </div>
                      )}
                    </div>

                    {/* Seats Info */}
                    {typeof training.totalStudentsAllowed === "number" && (
                      <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                        <Users className="h-4 w-4" />
                        <span>{training.totalStudentsAllowed} seats available</span>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startEnrollment(training);
                      }}
                      className={`w-full bg-gradient-to-r ${colorVariants[variantIndex]} hover:shadow-2xl text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 rounded-xl py-6`}
                      disabled={!training.apiId}
                      title={!training.apiId ? "Training identifier missing. Please refresh." : undefined}
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Enroll Students
                    </Button>
                  </CardFooter>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>

      {renderModal()}
    </>
  );
};

export default StudentTrainingRoleReady;

