import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { X } from "lucide-react";

const createEmptyStudent = () => ({
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
});

const StudentTrainingRoleReady = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [formData, setFormData] = useState(createEmptyStudent);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/trainings");
        setTrainings(response.data ?? []);
      } catch (error) {
        console.error("Error fetching trainings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const handleEnroll = (training) => {
    setSelectedTraining(training);
    setFormData(createEmptyStudent());
    setStatusMessage("");
    setShowEnrollmentForm(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeModal = () => {
    setShowEnrollmentForm(false);
    setSelectedTraining(null);
    setStatusMessage("");
  };

  const validateForm = () => {
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "gender",
      "dateOfBirth",
      "addressLine1",
      "city",
      "state",
      "pincode",
      "highestQualification",
      "collegeName",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        return false;
      }
    }

    return true;
  };

  const submitEnrollment = async ({ closeAfterSave }) => {
    if (!selectedTraining) {
      return;
    }

    if (!validateForm()) {
      alert("Please fill in all required fields before proceeding.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        percentageOrCgpa: formData.percentageOrCgpa ? parseFloat(formData.percentageOrCgpa) : 0,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience, 10) : 0,
        knownSkills: formData.knownSkills
          ? formData.knownSkills.split(",").map((skill) => skill.trim()).filter(Boolean)
          : [],
      };

      await apiClient.post(`/trainings/${selectedTraining.id}/enroll`, payload);

      if (closeAfterSave) {
        alert("Student data saved successfully.");
        closeModal();
      } else {
        setStatusMessage("Student data saved. You can add another student now.");
        setFormData(createEmptyStudent());
      }
    } catch (error) {
      console.error("Error enrolling student:", error);
      alert("Failed to save enrollment. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Student Training (Role Ready)</h1>
            <p className="text-muted-foreground">
              Enroll batches of students into industry-aligned Role Ready training programs.
            </p>
          </div>

          {trainings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No training programs available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((training) => (
                <Card key={training.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{training.roleName}</CardTitle>
                    <CardDescription className="line-clamp-2">{training.roleDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm">
                    <div>
                      <span className="font-semibold">Industry:</span> {training.industry}
                    </div>
                    <div>
                      <span className="font-semibold">Duration:</span> {training.trainingDuration}
                    </div>
                    <div>
                      <span className="font-semibold">Student Fees:</span> ₹{Number(training.trainingFees ?? 0).toLocaleString()}
                    </div>
                    {typeof training.instituteTrainingFees === "number" && (
                      <div>
                        <span className="font-semibold">Institute Fees:</span> ₹{Number(training.instituteTrainingFees ?? 0).toLocaleString()}
                      </div>
                    )}
                    {typeof training.totalStudentsAllowed === "number" && (
                      <div>
                        <span className="font-semibold">Total Seats:</span> {training.totalStudentsAllowed}
                      </div>
                    )}
                    {training.stipendIncluded && (
                      <div className="text-green-600">
                        <span className="font-semibold">Stipend:</span> ₹{Number(training.stipendAmount ?? 0).toLocaleString()}/month
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
                    <Button type="button" onClick={() => handleEnroll(training)} className="w-full">
                      Enroll Students
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {showEnrollmentForm && selectedTraining && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold">Enroll Students for {selectedTraining.roleName}</h2>
                {statusMessage && <p className="text-sm text-green-600 mt-1">{statusMessage}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="h-8 w-8"
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitEnrollment({ closeAfterSave: true });
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
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter student's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter student's email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter student's phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
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
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
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
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    required
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <Input
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
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
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      placeholder="Pincode"
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
                      value={formData.highestQualification}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., B.Tech, B.Com, M.Com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialization</label>
                    <Input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science, Finance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      College Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter college/university name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Graduation Year</label>
                    <Input
                      type="number"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
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
                      value={formData.percentageOrCgpa}
                      onChange={handleInputChange}
                      placeholder="e.g., 75.5 or 8.5"
                      step="0.01"
                      min="0"
                      max="100"
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
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Known Skills</label>
                    <Input
                      name="knownSkills"
                      value={formData.knownSkills}
                      onChange={handleInputChange}
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
                    value={formData.resumeUrl}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Notes</label>
                  <Textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    placeholder="Any additional information about the student"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Data"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => submitEnrollment({ closeAfterSave: false })}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Add New Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentTrainingRoleReady;

