import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit3, Eye, Palette, Save, Download, EyeOff } from "lucide-react";

const emptyResume = (studentId, templateId) => ({
  studentId,
  templateId,
  personalInfo: { fullName: "John Doe", email: "john.doe@email.com", phone: "+1 (555) 123-4567", location: "New York, NY", title: "Software Engineer" },
  summary: "Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable web applications and leading development teams.",
  bio: "I am a dedicated software engineer who loves solving complex problems and building innovative solutions. I enjoy working in collaborative environments and mentoring junior developers.",
  education: [
    { degree: "Bachelor of Science in Computer Science", institution: "University of Technology", fieldOfStudy: "Computer Science", startDate: "2018", endDate: "2022" }
  ],
  experience: [
    { role: "Senior Software Engineer", company: "Tech Corp", startDate: "2022", endDate: "Present", achievements: ["Led development of microservices architecture", "Improved system performance by 40%", "Mentored 3 junior developers"] },
    { role: "Software Engineer", company: "StartupXYZ", startDate: "2020", endDate: "2022", achievements: ["Developed RESTful APIs", "Implemented CI/CD pipelines", "Collaborated with cross-functional teams"] }
  ],
  projects: [
    { name: "E-commerce Platform", description: "Built a full-stack e-commerce platform using React and Node.js", link: "https://github.com/johndoe/ecommerce", technologies: ["React", "Node.js", "MongoDB", "Express"], startDate: "2023", endDate: "2023" },
    { name: "Task Management App", description: "Created a collaborative task management application with real-time updates", link: "https://github.com/johndoe/taskapp", technologies: ["Vue.js", "Socket.io", "PostgreSQL"], startDate: "2022", endDate: "2022" }
  ],
  skills: ["JavaScript", "Python", "React", "Node.js", "MongoDB", "PostgreSQL", "AWS", "Docker"],
  achievements: ["Led a team of 5 developers", "Reduced application load time by 50%", "Implemented automated testing reducing bugs by 30%"],
  certificates: [
    { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", issueDate: "2023" },
    { name: "Certified Scrum Master", issuer: "Scrum Alliance", issueDate: "2022" }
  ],
  hobbies: ["Photography", "Hiking", "Cooking", "Reading"],
  languages: [
    { name: "English", proficiency: "Native" },
    { name: "Spanish", proficiency: "Intermediate" }
  ],
  links: [],
  sectionOrder: [
    'personalInfo',
    'summary', 
    'bio',
    'experience',
    'education',
    'projects',
    'skills',
    'achievements',
    'certificates',
    'languages',
    'hobbies'
  ],
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#3b82f6'
  }
});

// Sortable Section Component
const SortableSection = ({ id, children, isEditing, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {isEditing && (
        <div className="absolute -left-8 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => onEdit(id)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Edit3 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1 hover:bg-red-200 rounded text-red-500"
          >
            ×
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

// Resume Preview Component
const ResumePreview = ({ resume, template, isEditing, onEdit, onDelete, colors }) => {
  const getSectionContent = (sectionId) => {
    switch (sectionId) {
      case 'personalInfo':
        return resume.personalInfo && (
          <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: colors.primary }}>
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
              {resume.personalInfo.fullName || 'Your Name'}
            </h1>
            <h2 className="text-lg mb-3" style={{ color: colors.secondary }}>
              {resume.personalInfo.title || 'Your Title'}
            </h2>
            <div className="text-sm space-x-4" style={{ color: colors.secondary }}>
              {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
              {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
              {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
            </div>
          </div>
        );
      
      case 'summary':
        return resume.summary && resume.summary.trim() && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
              Professional Summary
            </h3>
            <p className="text-sm">{resume.summary}</p>
          </div>
        );
      
      case 'bio':
        return resume.bio && resume.bio.trim() && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
              About Me
            </h3>
            <p className="text-sm">{resume.bio}</p>
          </div>
        );
      
      case 'experience':
        return resume.experience && resume.experience.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Professional Experience
            </h3>
            {resume.experience.map((exp, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{exp.role}</h4>
                  <span className="text-sm" style={{ color: colors.secondary }}>
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: colors.secondary }}>
                  {exp.company}
                </p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="text-sm list-disc list-inside ml-4">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'education':
        return resume.education && resume.education.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Education
            </h3>
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <span className="text-sm" style={{ color: colors.secondary }}>
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: colors.secondary }}>
                  {edu.institution}
                </p>
                {edu.fieldOfStudy && (
                  <p className="text-sm">{edu.fieldOfStudy}</p>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'projects':
        return resume.projects && resume.projects.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Projects
            </h3>
            {resume.projects.map((project, index) => (
              <div key={index} className="mb-3">
                <h4 className="font-semibold">{project.name}</h4>
                {project.description && (
                  <p className="text-sm mb-2">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: colors.accent, color: 'white' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'skills':
        return resume.skills && resume.skills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, index) => (
                <span key={index} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: colors.accent, color: 'white' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'achievements':
        return resume.achievements && resume.achievements.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Key Achievements
            </h3>
            <ul className="text-sm list-disc list-inside">
              {resume.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        );
      
      case 'certificates':
        return resume.certificates && resume.certificates.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Certifications
            </h3>
            {resume.certificates.map((cert, index) => (
              <div key={index} className="mb-2">
                <h4 className="font-semibold">{cert.name}</h4>
                <p className="text-sm" style={{ color: colors.secondary }}>
                  {cert.issuer} {cert.issueDate && `(${cert.issueDate})`}
                </p>
              </div>
            ))}
          </div>
        );
      
      case 'languages':
        return resume.languages && resume.languages.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Languages
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {resume.languages.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-sm" style={{ color: colors.secondary }}>
                    {lang.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'hobbies':
        return resume.hobbies && resume.hobbies.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
              Interests & Hobbies
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.hobbies.map((hobby, index) => (
                <span key={index} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: colors.accent, color: 'white' }}>
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const visibleSections = resume.sectionOrder.filter(sectionId => {
    const content = getSectionContent(sectionId);
    return content !== null;
  });

  return (
    <div className="bg-white p-6 shadow-lg max-w-4xl mx-auto" style={{ minHeight: '800px' }}>
      {visibleSections.map((sectionId) => (
        <SortableSection
          key={sectionId}
          id={sectionId}
          isEditing={isEditing}
          onEdit={onEdit}
          onDelete={onDelete}
        >
          {getSectionContent(sectionId)}
        </SortableSection>
      ))}
    </div>
  );
};

const ResumeBuilder = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      setFeedback("Resume saved successfully!");
    } catch (error) {
      setFeedback("Error saving resume. Please try again.");
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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setResume((prev) => {
        const oldIndex = prev.sectionOrder.indexOf(active.id);
        const newIndex = prev.sectionOrder.indexOf(over.id);
        
        return {
          ...prev,
          sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex)
        };
      });
    }
  };

  const handleEditSection = (sectionId) => {
    setEditingSection(sectionId);
    setIsEditing(false);
  };

  const handleDeleteSection = (sectionId) => {
    setResume((prev) => ({
      ...prev,
      sectionOrder: prev.sectionOrder.filter(id => id !== sectionId)
    }));
  };

  const updateColor = (colorType, color) => {
    setResume((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
  };

  const renderSectionEditor = () => {
    if (!editingSection) return null;

    switch (editingSection) {
      case 'personalInfo':
        return (
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
        );
      
      case 'summary':
        return (
          <Card>
            <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={4} value={resume.summary} onChange={(e) => onChange("summary", e.target.value)} />
            </CardContent>
          </Card>
        );
      
      case 'bio':
        return (
          <Card>
            <CardHeader><CardTitle>About Me (Bio)</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={3} value={resume.bio} onChange={(e) => onChange("bio", e.target.value)} />
            </CardContent>
          </Card>
        );
      
      case 'experience':
        return (
          <Card>
            <CardHeader><CardTitle>Professional Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(resume.experience || []).map((exp, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
                  <Input placeholder="Job Title" value={exp.role || ""} onChange={(e) => {
                    const newExp = [...(resume.experience || [])];
                    newExp[index] = { ...newExp[index], role: e.target.value };
                    onChange("experience", newExp);
                  }} />
                  <Input placeholder="Company" value={exp.company || ""} onChange={(e) => {
                    const newExp = [...(resume.experience || [])];
                    newExp[index] = { ...newExp[index], company: e.target.value };
                    onChange("experience", newExp);
                  }} />
                  <Input placeholder="Start Date" value={exp.startDate || ""} onChange={(e) => {
                    const newExp = [...(resume.experience || [])];
                    newExp[index] = { ...newExp[index], startDate: e.target.value };
                    onChange("experience", newExp);
                  }} />
                  <Input placeholder="End Date" value={exp.endDate || ""} onChange={(e) => {
                    const newExp = [...(resume.experience || [])];
                    newExp[index] = { ...newExp[index], endDate: e.target.value };
                    onChange("experience", newExp);
                  }} />
                  <div className="md:col-span-2">
                    <Textarea placeholder="Achievements (one per line)" rows={3} value={(exp.achievements || []).join("\n")} onChange={(e) => {
                      const newExp = [...(resume.experience || [])];
                      newExp[index] = { ...newExp[index], achievements: e.target.value.split("\n").filter(Boolean) };
                      onChange("experience", newExp);
                    }} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const newExp = (resume.experience || []).filter((_, i) => i !== index);
                      onChange("experience", newExp);
                    }}>Remove</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                const newExp = [...(resume.experience || []), { role: "", company: "", startDate: "", endDate: "", achievements: [] }];
                onChange("experience", newExp);
              }}>Add Experience</Button>
            </CardContent>
          </Card>
        );

      case 'education':
        return (
          <Card>
            <CardHeader><CardTitle>Education</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(resume.education || []).map((edu, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
                  <Input placeholder="Degree" value={edu.degree || ""} onChange={(e) => {
                    const newEdu = [...(resume.education || [])];
                    newEdu[index] = { ...newEdu[index], degree: e.target.value };
                    onChange("education", newEdu);
                  }} />
                  <Input placeholder="Institution" value={edu.institution || ""} onChange={(e) => {
                    const newEdu = [...(resume.education || [])];
                    newEdu[index] = { ...newEdu[index], institution: e.target.value };
                    onChange("education", newEdu);
                  }} />
                  <Input placeholder="Field of Study" value={edu.fieldOfStudy || ""} onChange={(e) => {
                    const newEdu = [...(resume.education || [])];
                    newEdu[index] = { ...newEdu[index], fieldOfStudy: e.target.value };
                    onChange("education", newEdu);
                  }} />
                  <Input placeholder="Start Date" value={edu.startDate || ""} onChange={(e) => {
                    const newEdu = [...(resume.education || [])];
                    newEdu[index] = { ...newEdu[index], startDate: e.target.value };
                    onChange("education", newEdu);
                  }} />
                  <Input placeholder="End Date" value={edu.endDate || ""} onChange={(e) => {
                    const newEdu = [...(resume.education || [])];
                    newEdu[index] = { ...newEdu[index], endDate: e.target.value };
                    onChange("education", newEdu);
                  }} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const newEdu = (resume.education || []).filter((_, i) => i !== index);
                      onChange("education", newEdu);
                    }}>Remove</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                const newEdu = [...(resume.education || []), { degree: "", institution: "", fieldOfStudy: "", startDate: "", endDate: "" }];
                onChange("education", newEdu);
              }}>Add Education</Button>
            </CardContent>
          </Card>
        );

      case 'projects':
        return (
          <Card>
            <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(resume.projects || []).map((project, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
                  <Input placeholder="Project Name" value={project.name || ""} onChange={(e) => {
                    const newProjects = [...(resume.projects || [])];
                    newProjects[index] = { ...newProjects[index], name: e.target.value };
                    onChange("projects", newProjects);
                  }} />
                  <Input placeholder="Project Link" value={project.link || ""} onChange={(e) => {
                    const newProjects = [...(resume.projects || [])];
                    newProjects[index] = { ...newProjects[index], link: e.target.value };
                    onChange("projects", newProjects);
                  }} />
                  <div className="md:col-span-2">
                    <Textarea placeholder="Project Description" rows={3} value={project.description || ""} onChange={(e) => {
                      const newProjects = [...(resume.projects || [])];
                      newProjects[index] = { ...newProjects[index], description: e.target.value };
                      onChange("projects", newProjects);
                    }} />
                  </div>
                  <div className="md:col-span-2">
                    <Input placeholder="Technologies (comma separated)" value={(project.technologies || []).join(", ")} onChange={(e) => {
                      const newProjects = [...(resume.projects || [])];
                      newProjects[index] = { ...newProjects[index], technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) };
                      onChange("projects", newProjects);
                    }} />
                  </div>
                  <Input placeholder="Start Date" value={project.startDate || ""} onChange={(e) => {
                    const newProjects = [...(resume.projects || [])];
                    newProjects[index] = { ...newProjects[index], startDate: e.target.value };
                    onChange("projects", newProjects);
                  }} />
                  <Input placeholder="End Date" value={project.endDate || ""} onChange={(e) => {
                    const newProjects = [...(resume.projects || [])];
                    newProjects[index] = { ...newProjects[index], endDate: e.target.value };
                    onChange("projects", newProjects);
                  }} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const newProjects = (resume.projects || []).filter((_, i) => i !== index);
                      onChange("projects", newProjects);
                    }}>Remove</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                const newProjects = [...(resume.projects || []), { name: "", description: "", link: "", technologies: [], startDate: "", endDate: "" }];
                onChange("projects", newProjects);
              }}>Add Project</Button>
            </CardContent>
          </Card>
        );

      case 'skills':
        return (
          <Card>
            <CardHeader><CardTitle>Skills (comma separated)</CardTitle></CardHeader>
            <CardContent>
              <Input value={(resume.skills || []).join(", ")} onChange={(e) => onChange("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </CardContent>
          </Card>
        );
      
      case 'achievements':
        return (
          <Card>
            <CardHeader><CardTitle>Key Achievements (one per line)</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={4} value={(resume.achievements || []).join("\n")} onChange={(e) => onChange("achievements", e.target.value.split("\n").filter(Boolean))} />
            </CardContent>
          </Card>
        );
      
      case 'certificates':
        return (
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
        );
      
      case 'languages':
        return (
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
        );
      
      case 'hobbies':
        return (
          <Card>
            <CardHeader><CardTitle>Hobbies & Interests (comma separated)</CardTitle></CardHeader>
            <CardContent>
              <Input value={(resume.hobbies || []).join(", ")} onChange={(e) => onChange("hobbies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
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
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setSelectedTemplateId("")} variant="ghost">Back</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "default" : "outline"}>
              {isEditing ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isEditing ? "Exit Edit" : "Edit Mode"}
            </Button>
            <Button onClick={() => setShowColorPicker(!showColorPicker)} variant="outline">
              <Palette className="w-4 h-4 mr-2" />
              Colors
            </Button>
            <Button onClick={() => setResume(emptyResume(studentId, selectedTemplateId))} variant="outline">
              Clear Sample Data
            </Button>
            <Button onClick={previewHtml} disabled={!resume?.id}>Preview HTML</Button>
            <Button onClick={downloadPdf} disabled={!resume?.id}>Download PDF</Button>
            <Button onClick={() => requestReview("AI")} disabled={!resume?.id}>AI Review</Button>
            <Button onClick={() => requestReview("HUMAN")} disabled={!resume?.id}>Mentor Review</Button>
          </div>

          {/* Color Picker */}
          {showColorPicker && (
            <Card>
              <CardHeader><CardTitle>Color Customization</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={resume.colors.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                    className="w-full h-10 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={resume.colors.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                    className="w-full h-10 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <input
                    type="color"
                    value={resume.colors.accent}
                    onChange={(e) => updateColor('accent', e.target.value)}
                    className="w-full h-10 border rounded"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Preview */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Resume Preview</h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={resume.sectionOrder} strategy={verticalListSortingStrategy}>
                  <ResumePreview
                    resume={resume}
                    template={templates.find(t => t.id === selectedTemplateId)}
                    isEditing={isEditing}
                    onEdit={handleEditSection}
                    onDelete={handleDeleteSection}
                    colors={resume.colors}
                  />
                </SortableContext>
              </DndContext>
            </div>

            {/* Section Editor */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Section Editor</h2>
              
              {/* Section Management */}
              <Card>
                <CardHeader><CardTitle>Add Sections</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'summary', label: 'Summary', icon: '📝' },
                      { id: 'bio', label: 'Bio', icon: '👤' },
                      { id: 'experience', label: 'Experience', icon: '💼' },
                      { id: 'education', label: 'Education', icon: '🎓' },
                      { id: 'projects', label: 'Projects', icon: '🚀' },
                      { id: 'skills', label: 'Skills', icon: '⚡' },
                      { id: 'achievements', label: 'Achievements', icon: '🏆' },
                      { id: 'certificates', label: 'Certificates', icon: '📜' },
                      { id: 'languages', label: 'Languages', icon: '🌍' },
                      { id: 'hobbies', label: 'Hobbies', icon: '🎯' }
                    ].map(section => (
                      <Button
                        key={section.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection(section.id);
                          // Initialize empty data for the section if it doesn't exist
                          if (section.id === 'experience' && (!resume.experience || resume.experience.length === 0)) {
                            onChange("experience", [{ role: "", company: "", startDate: "", endDate: "", achievements: [] }]);
                          } else if (section.id === 'education' && (!resume.education || resume.education.length === 0)) {
                            onChange("education", [{ degree: "", institution: "", fieldOfStudy: "", startDate: "", endDate: "" }]);
                          } else if (section.id === 'projects' && (!resume.projects || resume.projects.length === 0)) {
                            onChange("projects", [{ name: "", description: "", link: "", technologies: [], startDate: "", endDate: "" }]);
                          } else if (section.id === 'certificates' && (!resume.certificates || resume.certificates.length === 0)) {
                            onChange("certificates", [{ name: "", issuer: "", issueDate: "" }]);
                          } else if (section.id === 'languages' && (!resume.languages || resume.languages.length === 0)) {
                            onChange("languages", [{ name: "", proficiency: "" }]);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <span>{section.icon}</span>
                        {section.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {editingSection ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Editing: {editingSection}</h3>
                    <Button onClick={() => setEditingSection(null)} variant="outline">
                      Close
                    </Button>
                  </div>
                  {renderSectionEditor()}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Click on a section button above to start editing, or click on a section in the preview to edit it.
                </div>
              )}
            </div>
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