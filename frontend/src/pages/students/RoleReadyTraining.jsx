import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
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
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Briefcase,
  BookOpen
} from "lucide-react";

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
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (training) => {
    console.log("Enroll clicked for training:", training);
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

    const trainingId = selectedTraining.apiId ?? selectedTraining.id ?? selectedTraining._id;
    if (!trainingId) {
      alert("This training cannot be enrolled because it is missing an identifier. Please refresh and try again.");
      return;
    }

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

      await apiClient.post(`/trainings/${trainingId}/enroll`, enrollmentData);
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
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header with Vibrant Colors */}
          <div className="mb-8 space-y-4">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-blue-200/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                    Role Ready Training
                  </h1>
                  <p className="text-gray-700 mt-2 text-lg font-medium">
                    Enroll in specialized training programs to prepare for your dream job role
                  </p>
                </div>
              </div>
            </div>
            {trainings.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200 w-fit">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">
                  {trainings.length} training program{trainings.length !== 1 ? 's' : ''} available
                </span>
              </div>
            )}
          </div>

          {trainings.length === 0 ? (
            <div className="text-center py-16 space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-300">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">No training programs available</h3>
                <p className="text-gray-600">Check back soon for new opportunities!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((training, index) => {
                const colorVariants = [
                  'from-blue-500 via-purple-500 to-pink-500',
                  'from-emerald-500 via-teal-500 to-cyan-500',
                  'from-orange-500 via-red-500 to-pink-500',
                  'from-violet-500 via-purple-500 to-fuchsia-500',
                  'from-indigo-500 via-blue-500 to-cyan-500',
                  'from-rose-500 via-pink-500 to-orange-500'
                ];
                const bgVariants = [
                  'bg-gradient-to-br from-blue-50 to-purple-50',
                  'bg-gradient-to-br from-emerald-50 to-teal-50',
                  'bg-gradient-to-br from-orange-50 to-pink-50',
                  'bg-gradient-to-br from-violet-50 to-fuchsia-50',
                  'bg-gradient-to-br from-indigo-50 to-cyan-50',
                  'bg-gradient-to-br from-rose-50 to-orange-50'
                ];
                const borderVariants = [
                  'border-blue-200 hover:border-blue-400',
                  'border-emerald-200 hover:border-emerald-400',
                  'border-orange-200 hover:border-orange-400',
                  'border-violet-200 hover:border-violet-400',
                  'border-indigo-200 hover:border-indigo-400',
                  'border-rose-200 hover:border-rose-400'
                ];
                const variantIndex = index % colorVariants.length;
                return (
                <Card 
                  key={training.clientKey ?? training.id} 
                  className={`flex flex-col hover:shadow-2xl transition-all duration-300 border-2 ${borderVariants[variantIndex]} group overflow-hidden relative ${bgVariants[variantIndex]}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Vibrant Gradient Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${colorVariants[variantIndex]} shadow-lg`}></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
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
                  
                  <CardContent className="flex-1 space-y-4">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Industry</p>
                          <p className="font-medium">{training.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{training.trainingDuration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-medium">{training.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
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
                          <span className="text-sm font-semibold">Training Fees</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{Number(training.trainingFees ?? 0).toLocaleString()}
                        </span>
                      </div>
                      
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
                      
                      {training.accommodationProvided && (
                        <div className="flex items-center gap-2 text-sm p-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                          <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                          <span className="font-semibold text-cyan-700">Accommodation Provided</span>
                        </div>
                      )}
                      
                      {training.certificationProvided && (
                        <div className="flex items-center gap-2 text-sm p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <Award className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-700">Certification: {training.certificationName}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills Preview */}
                    {training.skillsCovered && training.skillsCovered.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Key Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {training.skillsCovered.slice(0, 3).map((skill, idx) => {
                            const skillColors = [
                              'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
                              'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
                              'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
                            ];
                            return (
                              <span 
                                key={idx} 
                                className={`px-3 py-1 ${skillColors[idx % skillColors.length]} text-xs rounded-full font-semibold shadow-sm`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                          {training.skillsCovered.length > 3 && (
                            <span className="px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs rounded-full font-semibold">
                              +{training.skillsCovered.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    {typeof training.totalStudentsAllowed === "number" && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <Users className="h-4 w-4" />
                        <span>{training.totalStudentsAllowed} seats available</span>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <Button
                      type="button"
                      onClick={() => handleEnroll(training)}
                      className={`w-full bg-gradient-to-r ${colorVariants[variantIndex]} hover:shadow-2xl text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 rounded-xl py-6`}
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Enroll Now
                    </Button>
                  </CardFooter>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Enhanced Enrollment Form Modal */}
      {showEnrollmentForm && selectedTraining && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 flex justify-between items-start z-10 rounded-t-2xl shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm"></div>
                <div className="relative flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-white/30 backdrop-blur-md rounded-xl shadow-lg">
                      <GraduationCap className="h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-extrabold drop-shadow-lg">
                      Enroll for {selectedTraining.roleName}
                    </h2>
                  </div>
                  <p className="text-white/90 text-sm font-medium">Fill in your details to complete enrollment</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  className="h-8 w-8 text-white hover:bg-white/20"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50/50 to-white">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Personal Information</h3>
                  </div>
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
                <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50/50 to-white">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-200">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Address</h3>
                  </div>
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
                <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50/50 to-white">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-200">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Education</h3>
                  </div>
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
                <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50/50 to-white">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Experience & Skills</h3>
                  </div>
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
                <div className="bg-white p-6 rounded-xl border-2 border-pink-200 shadow-lg bg-gradient-to-br from-pink-50/50 to-white">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pink-200">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-md">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Additional Information</h3>
                  </div>
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
                <div className="flex justify-end gap-4 pt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={submitting}
                    className="px-8 border-2 border-gray-300 hover:border-gray-400 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="px-10 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Submit Enrollment
                      </>
                    )}
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

