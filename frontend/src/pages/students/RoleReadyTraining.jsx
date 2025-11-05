import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const RoleReadyTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [formData, setFormData] = useState({
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/trainings");
      setTrainings(response.data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (training) => {
    console.log("Apply clicked for training:", training);
    setSelectedTraining(training);
    setShowEnrollmentForm(true);
    console.log("Modal state set - showEnrollmentForm should be true");
    // Reset form data
    setFormData({
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
  };

  // Debug effect to track state changes
  useEffect(() => {
    console.log("Modal state:", { showEnrollmentForm, selectedTraining: selectedTraining?.roleName });
    if (showEnrollmentForm && selectedTraining) {
      console.log("Modal should be visible now!");
      console.log("Selected training:", selectedTraining);
    }
  }, [showEnrollmentForm, selectedTraining]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTraining) return;

    try {
      setSubmitting(true);
      const enrollmentData = {
        ...formData,
        percentageOrCgpa: formData.percentageOrCgpa ? parseFloat(formData.percentageOrCgpa) : 0,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0,
        knownSkills: formData.knownSkills
          ? formData.knownSkills.split(",").map((s) => s.trim()).filter((s) => s)
          : [],
      };

      await apiClient.post(`/trainings/${selectedTraining.id}/enroll`, enrollmentData);
      alert("Enrollment successful! We will contact you soon.");
      setShowEnrollmentForm(false);
      setSelectedTraining(null);
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Failed to enroll. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowEnrollmentForm(false);
    setSelectedTraining(null);
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
            <h1 className="text-3xl font-bold mb-2">Role Ready Training</h1>
            <p className="text-muted-foreground">
              Enroll in specialized training programs to prepare for your dream job role
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
                  <CardContent className="flex-1 space-y-3">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Industry:</span> {training.industry}
                      </div>
                      <div>
                        <span className="font-semibold">Duration:</span> {training.trainingDuration}
                      </div>
                      <div>
                        <span className="font-semibold">Fees:</span> ₹{Number(training.trainingFees ?? 0).toLocaleString()}
                      </div>
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
                        <span className="font-semibold">Package:</span> {training.packageAfterTraining}
                      </div>
                      {training.accommodationProvided && (
                        <div className="text-blue-600">
                          <span className="font-semibold">Accommodation:</span> Provided
                        </div>
                      )}
                      {training.certificationProvided && (
                        <div className="text-purple-600">
                          <span className="font-semibold">Certification:</span> {training.certificationName}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Skills Covered:</span>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {training.skillsCovered?.slice(0, 3).map((skill, idx) => (
                            <li key={idx} className="text-xs">{skill}</li>
                          ))}
                          {training.skillsCovered?.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{training.skillsCovered.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold">Provider:</span> {training.trainingProvider}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      onClick={() => handleApply(training)}
                      className="w-full"
                    >
                      Apply Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Enrollment Form Modal - Rendered outside DashboardLayout */}
      {showEnrollmentForm && selectedTraining && (
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
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                maxWidth: '56rem',
                width: '100%',
                maxHeight: '90vh'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold">
                  Enroll for {selectedTraining.roleName}
                </h2>
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

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
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
                        placeholder="Enter your full name"
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
                        placeholder="Enter your email"
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
                        placeholder="Enter your phone number"
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
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <div className="space-y-4">
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
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Education</h3>
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
                        max="2030"
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

                {/* Experience & Skills */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Experience & Skills</h3>
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
                        placeholder="Comma-separated (e.g., Java, Python, SQL)"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="space-y-4">
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
                        placeholder="Any additional information you'd like to share..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Enrollment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
};

export default RoleReadyTraining;

