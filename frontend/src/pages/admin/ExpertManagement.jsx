import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import apiClient from "@/lib/apiClient.js";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  BarChart3,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const ExpertManagement = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [selectedExpertStats, setSelectedExpertStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    designation: "",
    organization: "",
    baseLocation: "",
    photoUrl: "",
    expertiseDomains: [],
    summary: "",
    sessionFormats: [],
    sessionDurations: [],
    pricingPerHourOnline: "",
    pricingPerHourOffline: "",
    topicsCovered: [],
    yearsOfExperience: "",
    languages: [],
    availableForInstitute: true,
    availableForIndustry: true,
  });
  const [newDomain, setNewDomain] = useState("");
  const [newFormat, setNewFormat] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/expert-sessions");
      setExperts(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addArrayItem = (field, value) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        pricingPerHourOnline: formData.pricingPerHourOnline
          ? Number(formData.pricingPerHourOnline)
          : null,
        pricingPerHourOffline: formData.pricingPerHourOffline
          ? Number(formData.pricingPerHourOffline)
          : null,
        yearsOfExperience: formData.yearsOfExperience
          ? Number(formData.yearsOfExperience)
          : null,
      };

      if (editingExpert) {
        await apiClient.put(`/expert-sessions/admin/expert-sessions/${editingExpert.id}`, payload);
      } else {
        await apiClient.post("/expert-sessions/admin/expert-sessions", payload);
      }

      setShowForm(false);
      setEditingExpert(null);
      resetForm();
      fetchExperts();
    } catch (err) {
      console.error(err);
      alert("Failed to save expert. Please try again.");
    }
  };

  const handleEdit = (expert) => {
    setEditingExpert(expert);
    setFormData({
      id: expert.id || "",
      fullName: expert.fullName || "",
      designation: expert.designation || "",
      organization: expert.organization || "",
      baseLocation: expert.baseLocation || "",
      photoUrl: expert.photoUrl || "",
      expertiseDomains: expert.expertiseDomains || [],
      summary: expert.summary || "",
      sessionFormats: expert.sessionFormats || [],
      sessionDurations: expert.sessionDurations || [],
      pricingPerHourOnline: expert.pricingPerHourOnline || "",
      pricingPerHourOffline: expert.pricingPerHourOffline || "",
      topicsCovered: expert.topicsCovered || [],
      yearsOfExperience: expert.yearsOfExperience || "",
      languages: expert.languages || [],
      availableForInstitute: expert.availableForInstitute !== undefined ? expert.availableForInstitute : true,
      availableForIndustry: expert.availableForIndustry !== undefined ? expert.availableForIndustry : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expert?")) return;

    try {
      await apiClient.delete(`/expert-sessions/admin/expert-sessions/${id}`);
      fetchExperts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete expert. Please try again.");
    }
  };

  const handleViewStats = async (expert) => {
    try {
      setStatsLoading(true);
      const response = await apiClient.get(`/expert-sessions/admin/expert-sessions/${expert.id}/stats`);
      setSelectedExpertStats({ expert, stats: response.data });
    } catch (err) {
      console.error(err);
      alert("Failed to load stats. Please try again.");
    } finally {
      setStatsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      fullName: "",
      designation: "",
      organization: "",
      baseLocation: "",
      photoUrl: "",
      expertiseDomains: [],
      summary: "",
      sessionFormats: [],
      sessionDurations: [],
      pricingPerHourOnline: "",
      pricingPerHourOffline: "",
      topicsCovered: [],
      yearsOfExperience: "",
      languages: [],
      availableForInstitute: true,
      availableForIndustry: true,
    });
    setNewDomain("");
    setNewFormat("");
    setNewDuration("");
    setNewTopic("");
    setNewLanguage("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Expert Management</h1>
              <p className="text-muted-foreground mt-2">
                Add, update, and manage expert sessions. View statistics and allocate experts to institutes or industry.
              </p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); setEditingExpert(null); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expert
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingExpert ? "Edit Expert" : "Add New Expert"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expert ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.id}
                      onChange={(e) => handleInputChange("id", e.target.value)}
                      placeholder="exp-expert-name"
                      required
                      disabled={!!editingExpert}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization</label>
                    <Input
                      value={formData.organization}
                      onChange={(e) => handleInputChange("organization", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Base Location</label>
                    <Input
                      value={formData.baseLocation}
                      onChange={(e) => handleInputChange("baseLocation", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Photo URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.photoUrl}
                      onChange={(e) => handleInputChange("photoUrl", e.target.value)}
                      placeholder="/assets/experts/expert.jpg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Summary</label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange("summary", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Years of Experience</label>
                    <Input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pricing Per Hour (Online)</label>
                    <Input
                      type="number"
                      value={formData.pricingPerHourOnline}
                      onChange={(e) => handleInputChange("pricingPerHourOnline", e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pricing Per Hour (Offline)</label>
                    <Input
                      type="number"
                      value={formData.pricingPerHourOffline}
                      onChange={(e) => handleInputChange("pricingPerHourOffline", e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Expertise Domains */}
                <div>
                  <label className="block text-sm font-medium mb-2">Expertise Domains</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="Add expertise domain"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("expertiseDomains", newDomain);
                          setNewDomain("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("expertiseDomains", newDomain);
                        setNewDomain("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertiseDomains.map((domain, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("expertiseDomains", index)}
                          className="text-primary hover:text-primary/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Session Formats */}
                <div>
                  <label className="block text-sm font-medium mb-2">Session Formats</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      placeholder="e.g., Online, Offline, Hybrid"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("sessionFormats", newFormat);
                          setNewFormat("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("sessionFormats", newFormat);
                        setNewFormat("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.sessionFormats.map((format, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
                      >
                        {format}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("sessionFormats", index)}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Session Durations */}
                <div>
                  <label className="block text-sm font-medium mb-2">Session Durations</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="e.g., 60 minutes, 90 minutes"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("sessionDurations", newDuration);
                          setNewDuration("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("sessionDurations", newDuration);
                        setNewDuration("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.sessionDurations.map((duration, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                      >
                        {duration}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("sessionDurations", index)}
                          className="text-green-700 hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Topics Covered */}
                <div>
                  <label className="block text-sm font-medium mb-2">Topics Covered</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Add topic"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("topicsCovered", newTopic);
                          setNewTopic("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("topicsCovered", newTopic);
                        setNewTopic("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.topicsCovered.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("topicsCovered", index)}
                          className="text-purple-700 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium mb-2">Languages</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="e.g., English, Hindi"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("languages", newLanguage);
                          setNewLanguage("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("languages", newLanguage);
                        setNewLanguage("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("languages", index)}
                          className="text-orange-700 hover:text-orange-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Allocation */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-4">Expert Allocation</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="availableForInstitute"
                        checked={formData.availableForInstitute}
                        onChange={(e) => handleInputChange("availableForInstitute", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="availableForInstitute" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Available for Institutes
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="availableForIndustry"
                        checked={formData.availableForIndustry}
                        onChange={(e) => handleInputChange("availableForIndustry", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="availableForIndustry" className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Available for Industry
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit">{editingExpert ? "Update Expert" : "Add Expert"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingExpert(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <Card key={expert.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                      <img
                        src={expert.photoUrl}
                        alt={expert.fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{expert.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{expert.designation}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Organization:</strong> {expert.organization || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Location:</strong> {expert.baseLocation || "N/A"}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${expert.availableForInstitute ? 'text-green-600' : 'text-gray-400'}`}>
                        {expert.availableForInstitute ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        Institute
                      </span>
                      <span className={`flex items-center gap-1 ${expert.availableForIndustry ? 'text-green-600' : 'text-gray-400'}`}>
                        {expert.availableForIndustry ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        Industry
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expert.expertiseDomains?.slice(0, 3).map((domain, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {domain}
                      </span>
                    ))}
                    {expert.expertiseDomains?.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{expert.expertiseDomains.length - 3} more</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewStats(expert)}
                      className="flex-1"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(expert)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(expert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedExpertStats && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Statistics for {selectedExpertStats.expert.fullName}</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedExpertStats(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                    <p className="text-2xl font-bold">{selectedExpertStats.stats.totalEnrollments || 0}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Institute Enrollments
                    </p>
                    <p className="text-2xl font-bold">{selectedExpertStats.stats.instituteEnrollments || 0}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Industry Enrollments
                    </p>
                    <p className="text-2xl font-bold">{selectedExpertStats.stats.industryEnrollments || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExpertManagement;

