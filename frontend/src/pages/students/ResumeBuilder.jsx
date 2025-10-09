import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "@/lib/utils";

const emptyResume = (studentId, templateId) => ({
  studentId,
  templateId,
  personalInfo: { fullName: "", email: "", phone: "", location: "", title: "" },
  summary: "",
  bio: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  achievements: [],
  certificates: [],
  hobbies: [],
  languages: [],
  links: [],
});

const ResumeBuilder = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const studentId = "demo-student-1"; // TODO: integrate with auth when available

  useEffect(() => {
    axios.get(`${api.baseURL}/resume-templates`).then((res) => setTemplates(res.data));
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) return;
    setResume(emptyResume(studentId, selectedTemplateId));
  }, [selectedTemplateId]);

  const onChange = (path, value) => {
    setResume((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      if (resume.id) {
        const { data } = await axios.put(`${api.baseURL}/resumes/${resume.id}`, resume);
        setResume(data);
      } else {
        const { data } = await axios.post(`${api.baseURL}/resumes`, resume);
        setResume(data);
      }
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    if (!resume?.id) return;
    try {
      const res = await axios.get(`${api.baseURL}/resumes/${resume.id}/pdf`, { 
        responseType: "blob",
        headers: {
          'Accept': 'application/pdf'
        }
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading PDF. Please try again.");
    }
  };

  const previewHtml = async () => {
    if (!resume?.id) return;
    try {
      const res = await axios.get(`${api.baseURL}/resumes/${resume.id}/html`);
      const newWindow = window.open();
      newWindow.document.write(res.data);
      newWindow.document.close();
    } catch (error) {
      console.error("Error previewing HTML:", error);
      alert("Error previewing resume. Please try again.");
    }
  };

  const requestReview = async (type) => {
    if (!resume?.id) return;
    const { data } = await axios.post(`${api.baseURL}/reviews`, { resumeId: resume.id, type });
    setFeedback(`Review requested (${type}). Status: ${data.status}`);
  };

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <h1 className="text-2xl font-bold mb-4">Resume Builder</h1>

      {/* Template gallery */}
      {!selectedTemplateId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:shadow" onClick={() => setSelectedTemplateId(t.id)}>
              <CardHeader>
                <CardTitle>{t.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={t.previewUrl} alt={t.name} className="w-full h-48 object-contain" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor */}
      {selectedTemplateId && resume && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={() => setSelectedTemplateId("")} variant="ghost">Back</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button onClick={previewHtml} disabled={!resume?.id}>Preview HTML</Button>
            <Button onClick={downloadPdf} disabled={!resume?.id}>Download PDF</Button>
            <Button onClick={() => requestReview("AI")} disabled={!resume?.id}>AI Review</Button>
            <Button onClick={() => requestReview("HUMAN")} disabled={!resume?.id}>Mentor Review</Button>
          </div>

          <Card>
            <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Full name" value={resume.personalInfo.fullName} onChange={(e) => onChange("personalInfo.fullName", e.target.value)} />
              <Input placeholder="Title" value={resume.personalInfo.title} onChange={(e) => onChange("personalInfo.title", e.target.value)} />
              <Input placeholder="Email" value={resume.personalInfo.email} onChange={(e) => onChange("personalInfo.email", e.target.value)} />
              <Input placeholder="Phone" value={resume.personalInfo.phone} onChange={(e) => onChange("personalInfo.phone", e.target.value)} />
              <Input placeholder="Location" value={resume.personalInfo.location} onChange={(e) => onChange("personalInfo.location", e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={4} value={resume.summary} onChange={(e) => onChange("summary", e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>About Me (Bio)</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={3} value={resume.bio} onChange={(e) => onChange("bio", e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Skills (comma separated)</CardTitle></CardHeader>
            <CardContent>
              <Input value={(resume.skills || []).join(", ")} onChange={(e) => onChange("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Key Achievements (one per line)</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={4} value={(resume.achievements || []).join("\n")} onChange={(e) => onChange("achievements", e.target.value.split("\n").filter(Boolean))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(resume.certificates || []).map((cert, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
                  <Input placeholder="Certificate Name" value={cert.name || ""} onChange={(e) => {
                    const newCerts = [...(resume.certificates || [])];
                    newCerts[index] = { ...newCerts[index], name: e.target.value };
                    onChange("certificates", newCerts);
                  }} />
                  <Input placeholder="Issuing Organization" value={cert.issuer || ""} onChange={(e) => {
                    const newCerts = [...(resume.certificates || [])];
                    newCerts[index] = { ...newCerts[index], issuer: e.target.value };
                    onChange("certificates", newCerts);
                  }} />
                  <Input placeholder="Issue Date" value={cert.issueDate || ""} onChange={(e) => {
                    const newCerts = [...(resume.certificates || [])];
                    newCerts[index] = { ...newCerts[index], issueDate: e.target.value };
                    onChange("certificates", newCerts);
                  }} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const newCerts = (resume.certificates || []).filter((_, i) => i !== index);
                      onChange("certificates", newCerts);
                    }}>Remove</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                const newCerts = [...(resume.certificates || []), { name: "", issuer: "", issueDate: "" }];
                onChange("certificates", newCerts);
              }}>Add Certificate</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Languages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(resume.languages || []).map((lang, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
                  <Input placeholder="Language" value={lang.name || ""} onChange={(e) => {
                    const newLangs = [...(resume.languages || [])];
                    newLangs[index] = { ...newLangs[index], name: e.target.value };
                    onChange("languages", newLangs);
                  }} />
                  <select className="px-3 py-2 border rounded" value={lang.proficiency || ""} onChange={(e) => {
                    const newLangs = [...(resume.languages || [])];
                    newLangs[index] = { ...newLangs[index], proficiency: e.target.value };
                    onChange("languages", newLangs);
                  }}>
                    <option value="">Select Proficiency</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Native">Native</option>
                  </select>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const newLangs = (resume.languages || []).filter((_, i) => i !== index);
                      onChange("languages", newLangs);
                    }}>Remove</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                const newLangs = [...(resume.languages || []), { name: "", proficiency: "" }];
                onChange("languages", newLangs);
              }}>Add Language</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Hobbies & Interests (comma separated)</CardTitle></CardHeader>
            <CardContent>
              <Input value={(resume.hobbies || []).join(", ")} onChange={(e) => onChange("hobbies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button onClick={previewHtml} disabled={!resume?.id}>Preview HTML</Button>
            <Button onClick={downloadPdf} disabled={!resume?.id}>Download PDF</Button>
          </div>

          {feedback && (
            <div className="mt-4 p-4 bg-blue-100 rounded-md">
              <h3 className="font-semibold">Feedback:</h3>
              <p>{feedback}</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResumeBuilder;
