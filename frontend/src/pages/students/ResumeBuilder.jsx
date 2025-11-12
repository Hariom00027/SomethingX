import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { api } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
import { GripVertical, Edit3, Eye, Palette, Save, Download, EyeOff, ArrowLeft, FileText, Sparkles, X, CheckCircle2, Loader2, Plus, Trash2, Image as ImageIcon, Move, Maximize2, Upload, File } from "lucide-react";

// Draggable and Resizable Image Component
const DraggableResizableImage = ({ src, onUpdate, style, isEditing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const currentStyle = {
    width: style.width || '150px',
    height: style.height || '150px',
    left: style.left || 'auto',
    top: style.top || 'auto',
    position: style.position || 'relative',
    ...style
  };

  const handleMouseDown = (e, type) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - (parseFloat(currentStyle.left) || 0),
        y: e.clientY - (parseFloat(currentStyle.top) || 0)
      });
    } else if (type === 'resize') {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: parseFloat(currentStyle.width) || 150,
        height: parseFloat(currentStyle.height) || 150
      });
    }
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        const newLeft = e.clientX - dragStart.x;
        const newTop = e.clientY - dragStart.y;
        onUpdate({
          ...style,
          left: `${newLeft}px`,
          top: `${newTop}px`,
          position: 'absolute'
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(50, resizeStart.height + deltaY);
        onUpdate({
          ...style,
          width: `${newWidth}px`,
          height: `${newHeight}px`
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, style, onUpdate]);

  return (
    <div 
      className="profile-image-container relative inline-block"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <img 
        src={src} 
        alt="Profile" 
        className="profile-image"
        style={{
          ...currentStyle,
          cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none'
        }}
        onMouseDown={(e) => isEditing && handleMouseDown(e, 'drag')}
        draggable={false}
      />
      {isEditing && (
        <>
          <div
            className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-move flex items-center justify-center z-10"
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
            style={{ touchAction: 'none' }}
          >
            <Move className="w-2 h-2 text-white" />
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full cursor-nwse-resize flex items-center justify-center z-10"
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
            style={{ touchAction: 'none' }}
          >
            <Maximize2 className="w-2 h-2 text-white" />
          </div>
        </>
      )}
    </div>
  );
};

const emptyResume = (studentId, templateId) => ({
  studentId,
  templateId,
  personalInfo: { fullName: "John Doe", email: "john.doe@email.com", phone: "+1 (555) 123-4567", location: "New York, NY", title: "Software Engineer", profileImage: "", profileImageStyle: {} },
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
  customSections: [],
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
    accent: '#3b82f6',
    text: '#1f2937'
  },
  typography: {
    fontSize: '12px',
    fontSpacing: '1.6',
    sectionSpacing: '32px'
  },
  sectionTitles: {
    summary: 'Professional Summary',
    bio: 'About Me',
    experience: 'Professional Experience',
    education: 'Education',
    projects: 'Projects',
    skills: 'Skills',
    achievements: 'Key Achievements',
    certificates: 'Certifications',
    languages: 'Languages',
    hobbies: 'Interests & Hobbies'
  }
});

// Sortable Section Component
const SortableSection = ({ id, children, isEditing, onEdit, onDelete, onColorChange }) => {
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
    <div 
      ref={setNodeRef} 
      style={{
        ...style,
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        WebkitColumnBreakInside: 'avoid'
      }} 
      className="relative group"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
        <div className="absolute top-2 right-2 flex gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
          <button
            {...attributes}
            {...listeners}
            className="p-2 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
            className="p-2 hover:bg-blue-100 rounded text-blue-600"
            title="Edit section"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onColorChange(id);
            }}
            className="p-2 hover:bg-purple-100 rounded text-purple-600"
            title="Change color"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="p-2 hover:bg-red-100 rounded text-red-600"
            title="Remove section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

// A4 Page Component for multi-page support
const A4Page = ({ children, pageNumber, totalPages }) => {
  // A4 dimensions: 210mm x 297mm
  // At 96 DPI (screen): 210mm = 793.7px, 297mm = 1122.5px
  // Using precise values for better accuracy
  const A4_WIDTH = 793.7;  // 210mm at 96 DPI
  const A4_HEIGHT = 1122.5; // 297mm at 96 DPI
  const A4_ASPECT_RATIO = A4_HEIGHT / A4_WIDTH; // ~1.414 (√2)
  
  return (
    <div 
      className="bg-white shadow-2xl mx-auto mb-6 relative"
      style={{
        width: `${A4_WIDTH}px`,
        minHeight: `${A4_HEIGHT}px`,
        aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
        padding: '40px',
        boxSizing: 'border-box',
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid',
        border: '1px solid #e5e7eb'
      }}
    >
      {children}
    </div>
  );
};

// Editable Section Title Component
const EditableSectionTitle = ({ sectionId, title, isEditing, onUpdate, defaultTitle }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState(title || defaultTitle);

  useEffect(() => {
    setEditValue(title || defaultTitle);
  }, [title, defaultTitle]);

  const handleBlur = () => {
    setIsEditingTitle(false);
    if (editValue.trim() && editValue !== title) {
      onUpdate(editValue.trim());
    } else {
      setEditValue(title || defaultTitle);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(title || defaultTitle);
      setIsEditingTitle(false);
    }
  };

  // When not in edit mode, show non-editable title
  if (!isEditing) {
    return <div className="section-title">{title || defaultTitle}</div>;
  }

  // When in edit mode, show editable input directly (no click needed)
  return (
    <input
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsEditingTitle(true)}
      className="section-title-editable"
      style={{
        width: '100%',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        fontFamily: 'inherit',
        color: 'inherit',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid #3b82f6',
        borderRadius: '4px',
        padding: '2px 6px',
        outline: 'none',
        cursor: 'text',
        pointerEvents: 'auto',
        zIndex: 10,
        position: 'relative'
      }}
    />
  );
};

// Resume Upload Component
const ResumeUploadComponent = ({ templateId, studentId, onResumeParsed, onCancel, uploading, setUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const validExtensions = ['.pdf', '.docx', '.doc'];
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);

    if (!isValidType) {
      setError("Please upload a PDF or DOCX file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const uploadAndParse = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('templateId', templateId);
      formData.append('studentId', studentId);

      // When baseURL is empty (dev mode), use /api prefix for proxy
      // When baseURL is set (production), use it directly
      const parseUrl = api.baseURL 
        ? `${api.baseURL}/resumes/parse` 
        : '/api/resumes/parse';
      
      console.log("Uploading resume for parsing...", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        templateId,
        studentId,
        url: parseUrl,
        baseURL: api.baseURL
      });

      const response = await axios.post(parseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Parse response received:", response);
      console.log("Parsed resume data:", response.data);

      if (response.data) {
        // Ensure the resume has all required fields
        const parsedResume = {
          ...response.data,
          studentId: response.data.studentId || studentId,
          templateId: response.data.templateId || templateId,
          // Ensure arrays are initialized
          education: response.data.education || [],
          experience: response.data.experience || [],
          projects: response.data.projects || [],
          skills: response.data.skills || [],
          achievements: response.data.achievements || [],
          certificates: response.data.certificates || [],
          languages: response.data.languages || [],
          hobbies: response.data.hobbies || [],
          links: response.data.links || [],
          customSections: response.data.customSections || [],
          sectionOrder: response.data.sectionOrder || [
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
          colors: response.data.colors || {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#3b82f6',
            text: '#1f2937'
          },
          typography: response.data.typography || {
            fontSize: '12px',
            fontSpacing: '1.6',
            sectionSpacing: '32px'
          },
          sectionTitles: response.data.sectionTitles || {},
          personalInfo: {
            ...(response.data.personalInfo || {}),
            profileImage: response.data.personalInfo?.profileImage || "",
            profileImageStyle: response.data.personalInfo?.profileImageStyle || {}
          }
        };

        console.log("Final parsed resume to set:", parsedResume);
        onResumeParsed(parsedResume);
      } else {
        setError("Failed to parse resume. No data received from server.");
      }
    } catch (err) {
      console.error("Error parsing resume:", err);
      console.error("Error response:", err.response);
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           "Failed to parse resume. Please try again or use manual entry.";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-violet-400 via-purple-400 via-pink-400 to-orange-400 py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 mb-6 shadow-2xl">
              <Upload className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-white drop-shadow-lg">
              Upload Your Resume
            </h2>
            <p className="text-white/90 text-lg font-semibold drop-shadow-md">
              Upload your existing resume and we'll extract the information for you
            </p>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-8">
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Parsing your resume...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={uploadAndParse}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Parse Resume
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          setError("");
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Drag and drop your resume here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                        <File className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                    </label>
                    <p className="text-xs text-gray-400 mt-4">
                      Supported formats: PDF, DOCX, DOC (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  disabled={uploading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Resume Preview Component
const ResumePreview = ({ resume, template, isEditing, onEdit, onDelete, onColorChange, colors, onImageStyleUpdate, onSectionTitleUpdate }) => {
  // Get colors from template if not overridden
  const templateColors = {
    primary: colors?.primary || template?.primaryColor || '#2563eb',
    secondary: colors?.secondary || template?.secondaryColor || '#64748b',
    accent: colors?.accent || template?.accentColor || '#3b82f6',
    text: colors?.text || '#1f2937'
  };

  // Get typography settings
  const typography = resume.typography || {
    fontSize: '12px',
    fontSpacing: '1.6',
    sectionSpacing: '32px'
  };

  // Inject template CSS
  const templateCss = template?.css || '';
  
  const getSectionContent = (sectionId) => {
    const layoutType = template?.layoutType || 'single-column';
    const hasImage = template?.hasProfileImage && resume.personalInfo?.profileImage;
    
    switch (sectionId) {
      case 'personalInfo':
        return resume.personalInfo && (
          <div className={`header-section ${layoutType === 'sidebar' ? 'sidebar-header' : ''}`} style={{ position: 'relative' }}>
            {hasImage && onImageStyleUpdate && (
              <DraggableResizableImage
                src={resume.personalInfo.profileImage}
                onUpdate={onImageStyleUpdate}
                style={resume.personalInfo.profileImageStyle || {}}
                isEditing={isEditing}
              />
            )}
            <div className="name">{resume.personalInfo.fullName || 'Your Name'}</div>
            <div className="title">{resume.personalInfo.title || 'Your Title'}</div>
            <div className="contact-info">
              {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
              {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
              {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
            </div>
          </div>
        );
      
      case 'summary':
        return resume.summary && resume.summary.trim() && (
          <div className="section">
            <EditableSectionTitle
              sectionId="summary"
              title={resume.sectionTitles?.summary}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('summary', newTitle)}
              defaultTitle="Professional Summary"
            />
            <div className="section-content">{resume.summary}</div>
          </div>
        );
      
      case 'bio':
        return resume.bio && resume.bio.trim() && (
          <div className="section">
            <EditableSectionTitle
              sectionId="bio"
              title={resume.sectionTitles?.bio}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('bio', newTitle)}
              defaultTitle="About Me"
            />
            <div className="section-content">{resume.bio}</div>
          </div>
        );
      
      case 'experience':
        return resume.experience && resume.experience.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="experience"
              title={resume.sectionTitles?.experience}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('experience', newTitle)}
              defaultTitle="Professional Experience"
            />
            <div className="section-content">
              {resume.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="item-header">
                    <div className="item-title">{exp.role}</div>
                    <div className="item-date">{exp.startDate} - {exp.endDate}</div>
                  </div>
                  <div className="item-company">{exp.company}</div>
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="bullet-list">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'education':
        return resume.education && resume.education.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="education"
              title={resume.sectionTitles?.education}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('education', newTitle)}
              defaultTitle="Education"
            />
            <div className="section-content">
              {resume.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="item-header">
                    <div className="item-title">{edu.degree}</div>
                    <div className="item-date">{edu.startDate} - {edu.endDate}</div>
                  </div>
                  <div className="item-company">{edu.institution}</div>
                  {edu.fieldOfStudy && (
                    <div className="section-content">{edu.fieldOfStudy}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'projects':
        return resume.projects && resume.projects.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="projects"
              title={resume.sectionTitles?.projects}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('projects', newTitle)}
              defaultTitle="Projects"
            />
            <div className="section-content">
              {resume.projects.map((project, index) => (
                <div key={index} className="experience-item">
                  <div className="item-title">{project.name}</div>
                  {project.description && (
                    <div className="section-content">{project.description}</div>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="skills-container">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="skill-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'skills':
        return resume.skills && resume.skills.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="skills"
              title={resume.sectionTitles?.skills}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('skills', newTitle)}
              defaultTitle="Skills"
            />
            <div className="section-content">
              <div className="skills-container">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'achievements':
        return resume.achievements && resume.achievements.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="achievements"
              title={resume.sectionTitles?.achievements}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('achievements', newTitle)}
              defaultTitle="Key Achievements"
            />
            <div className="section-content">
              <ul className="bullet-list">
                {resume.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      
      case 'certificates':
        return resume.certificates && resume.certificates.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="certificates"
              title={resume.sectionTitles?.certificates}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('certificates', newTitle)}
              defaultTitle="Certifications"
            />
            <div className="section-content">
              {resume.certificates.map((cert, index) => (
                <div key={index} className="education-item">
                  <div className="item-title">{cert.name}</div>
                  <div className="item-company">{cert.issuer} {cert.issueDate && `(${cert.issueDate})`}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'languages':
        return resume.languages && resume.languages.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="languages"
              title={resume.sectionTitles?.languages}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('languages', newTitle)}
              defaultTitle="Languages"
            />
            <div className="section-content">
              {resume.languages.map((lang, index) => (
                <div key={index} className="item-header">
                  <div className="item-title">{lang.name}</div>
                  <div className="item-date">{lang.proficiency}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'hobbies':
        return resume.hobbies && resume.hobbies.length > 0 && (
          <div className="section">
            <EditableSectionTitle
              sectionId="hobbies"
              title={resume.sectionTitles?.hobbies}
              isEditing={isEditing}
              onUpdate={(newTitle) => onSectionTitleUpdate && onSectionTitleUpdate('hobbies', newTitle)}
              defaultTitle="Interests & Hobbies"
            />
            <div className="section-content">
              <div className="skills-container">
                {resume.hobbies.map((hobby, index) => (
                  <span key={index} className="skill-tag">{hobby}</span>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        // Check if it's a custom section
        if (sectionId.startsWith('custom_')) {
          const customSection = resume.customSections?.find(s => s.id === sectionId);
          if (customSection) {
            return (
              <div className="section">
                <EditableSectionTitle
                  sectionId={sectionId}
                  title={customSection.title}
                  isEditing={isEditing}
                  onUpdate={(newTitle) => {
                    // Call the parent handler to update custom section title
                    if (onSectionTitleUpdate) {
                      onSectionTitleUpdate(sectionId, newTitle);
                    }
                  }}
                  defaultTitle={customSection.title || "Custom Section"}
                />
                <div className="section-content">
                  {customSection.contentType === 'list' ? (
                    <ul className="bullet-list">
                      {customSection.items?.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>{customSection.content}</div>
                  )}
                </div>
              </div>
            );
          }
        }
        return null;
    }
  };

  const visibleSections = resume.sectionOrder.filter(sectionId => {
    // Include custom sections
    if (sectionId.startsWith('custom_')) {
      return resume.customSections?.some(s => s.id === sectionId);
    }
    const content = getSectionContent(sectionId);
    return content !== null;
  });

  // Get estimated height for a section based on its content
  const getSectionHeight = (sectionId) => {
    switch (sectionId) {
      case 'personalInfo':
        return 120;
      case 'summary':
        return resume.summary ? Math.max(80, (resume.summary.length / 100) * 20) : 0;
      case 'bio':
        return resume.bio ? Math.max(80, (resume.bio.length / 100) * 20) : 0;
      case 'experience':
        // More conservative estimate: 140px per experience (includes margins, padding, achievements)
        return resume.experience ? resume.experience.length * 140 : 0;
      case 'education':
        return resume.education ? resume.education.length * 80 : 0;
      case 'projects':
        // More conservative estimate: 120px per project (includes margins, padding, description, tags)
        return resume.projects ? resume.projects.length * 120 : 0;
      case 'skills':
        return resume.skills ? Math.max(60, Math.ceil(resume.skills.length / 8) * 40) : 0;
      case 'achievements':
        return resume.achievements ? resume.achievements.length * 30 : 0;
      case 'certificates':
        return resume.certificates ? resume.certificates.length * 60 : 0;
      case 'languages':
        return resume.languages ? resume.languages.length * 40 : 0;
      case 'hobbies':
        return resume.hobbies ? Math.max(60, Math.ceil(resume.hobbies.length / 8) * 40) : 0;
      default:
        // Check if it's a custom section
        if (sectionId.startsWith('custom_')) {
          const customSection = resume.customSections?.find(s => s.id === sectionId);
          if (customSection) {
            if (customSection.contentType === 'list') {
              return customSection.items ? customSection.items.length * 30 + 60 : 100;
            } else {
              return customSection.content ? Math.max(80, (customSection.content.length / 100) * 20) : 100;
            }
          }
        }
        return 100;
    }
  };

  // Split content into pages based on estimated heights
  // Ensures sections never break across pages - if a section doesn't fit, it moves entirely to next page
  const splitIntoPages = (sections) => {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    const A4_CONTENT_HEIGHT = 1123 - 80; // A4 height minus padding (40px top + 40px bottom)
    const SAFE_MARGIN = 60; // Extra margin to ensure sections don't get cut off (increased for safety)
    const MAX_PAGE_HEIGHT = A4_CONTENT_HEIGHT - SAFE_MARGIN;

    sections.forEach((sectionId) => {
      // Get section height and add extra buffer for margins/padding
      let sectionHeight = getSectionHeight(sectionId);
      // Add buffer for section margins (32px bottom + 20px padding = ~52px, but we'll add 40px to be safe)
      sectionHeight += 40;
      
      // Check if this section alone exceeds page height (shouldn't happen, but handle it)
      if (sectionHeight > MAX_PAGE_HEIGHT) {
        // If current page has content, save it first
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
        }
        // Put the oversized section on its own page
        pages.push([sectionId]);
        currentPage = [];
        currentHeight = 0;
      }
      // If adding this section would exceed page height, start new page
      else if (currentHeight + sectionHeight > MAX_PAGE_HEIGHT && currentPage.length > 0) {
        // Save current page and start new one with this section
        pages.push([...currentPage]);
        currentPage = [sectionId];
        currentHeight = sectionHeight;
      } else {
        // Section fits on current page
        currentPage.push(sectionId);
        currentHeight += sectionHeight;
      }
    });

    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // If no pages, return at least one empty page
    return pages.length > 0 ? pages : [[]];
  };

  const pages = splitIntoPages(visibleSections);
  const layoutType = template?.layoutType || 'single-column';
  const isSidebarLayout = layoutType === 'sidebar';
  const isTwoColumn = layoutType === 'two-column';

  // Get sidebar sections (for sidebar layout)
  const sidebarSections = ['personalInfo', 'skills', 'languages', 'certificates'];
  const mainSections = visibleSections.filter(s => !isSidebarLayout || !sidebarSections.includes(s));
  const sidebarContent = isSidebarLayout ? visibleSections.filter(s => sidebarSections.includes(s)) : [];

  return (
    <>
      <style>{templateCss}</style>
      <style>{`
        .section {
          margin-bottom: ${typography.sectionSpacing} !important;
          padding-bottom: 20px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          clear: both;
          position: relative;
          display: block;
        }
        .section:last-child {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
        .section-title {
          margin-bottom: 16px !important;
          padding-bottom: 8px !important;
          margin-top: 0 !important;
          display: block !important;
          clear: both !important;
        }
        .section-title-editable {
          margin-bottom: 16px !important;
          padding-bottom: 8px !important;
          margin-top: 0 !important;
          display: block !important;
          clear: both !important;
          width: 100% !important;
        }
        .section-content {
          margin-top: 12px !important;
          margin-bottom: 8px !important;
          clear: both !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          color: ${templateColors.text} !important;
          font-size: ${typography.fontSize} !important;
          line-height: ${typography.fontSpacing} !important;
        }
        .experience-item, .education-item {
          margin-bottom: 20px !important;
          padding-bottom: 16px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          clear: both;
          display: block;
        }
        .experience-item:last-child, .education-item:last-child {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
        .header-section {
          margin-bottom: 32px !important;
          padding-bottom: 20px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          clear: both;
          display: block;
        }
        .skills-container {
          margin-top: 12px !important;
          margin-bottom: 12px !important;
          clear: both;
        }
        .bullet-list {
          margin-top: 12px !important;
          margin-bottom: 12px !important;
          padding-left: 20px !important;
          clear: both;
        }
        .bullet-list li {
          margin-bottom: 8px !important;
          line-height: ${typography.fontSpacing} !important;
          color: ${templateColors.text} !important;
          font-size: ${typography.fontSize} !important;
        }
        .item-header {
          margin-bottom: 8px !important;
          clear: both;
        }
        .item-title {
          margin-bottom: 4px !important;
          clear: both;
        }
        .item-company {
          margin-top: 4px !important;
          margin-bottom: 8px !important;
          clear: both;
          color: ${templateColors.text} !important;
          font-size: ${typography.fontSize} !important;
          line-height: ${typography.fontSpacing} !important;
        }
        .resume-container > * {
          clear: both !important;
        }
        .resume-container .section + .section {
          margin-top: calc(${typography.sectionSpacing} * 0.75) !important;
        }
        /* Ensure SortableSection wrapper also prevents page breaks */
        .group {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
        }
        /* Prevent orphans and widows - keep at least 2 lines together */
        .section-content {
          orphans: 3 !important;
          widows: 3 !important;
        }
        /* Ensure all items within a section stay together */
        .section > .section-content > * {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        /* Apply text color to general text elements */
        .item-date {
          color: ${templateColors.text} !important;
          font-size: ${typography.fontSize} !important;
          line-height: ${typography.fontSpacing} !important;
        }
        .contact-info {
          color: ${templateColors.text} !important;
          font-size: ${typography.fontSize} !important;
          line-height: ${typography.fontSpacing} !important;
        }
        .section-content > div:not(.item-title):not(.item-company):not(.item-date) {
          color: ${templateColors.text} !important;
          font-size: ${typography.fontSize} !important;
          line-height: ${typography.fontSpacing} !important;
        }
      `}</style>
      <div className="flex flex-col items-center" style={{ padding: '20px 0' }}>
        {pages.map((pageSections, pageIndex) => (
          <A4Page key={pageIndex} pageNumber={pageIndex + 1} totalPages={pages.length}>
            <div className={`resume-container ${layoutType}`}>
              {isSidebarLayout && (
                <div className="sidebar">
                  {sidebarContent.map((sectionId) => (
                    <SortableSection
                      key={sectionId}
                      id={sectionId}
                      isEditing={isEditing}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onColorChange={onColorChange}
                    >
                      {getSectionContent(sectionId)}
                    </SortableSection>
                  ))}
                </div>
              )}
              <div className={isSidebarLayout ? "main-content" : isTwoColumn ? "left-column" : ""}>
                {pageSections
                  .filter(s => !isSidebarLayout || !sidebarSections.includes(s))
                  .map((sectionId) => (
                    <SortableSection
                      key={sectionId}
                      id={sectionId}
                      isEditing={isEditing}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onColorChange={onColorChange}
                    >
                      {getSectionContent(sectionId)}
                    </SortableSection>
                  ))}
              </div>
              {isTwoColumn && !isSidebarLayout && (
                <div className="right-column">
                  {/* Right column content can be added here if needed */}
                </div>
              )}
            </div>
          </A4Page>
        ))}
      </div>
    </>
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
  const [colorPickerSection, setColorPickerSection] = useState(null);
  const [sectionTemplates, setSectionTemplates] = useState([]);
  const [dataEntryMode, setDataEntryMode] = useState(null); // null, 'manual', or 'upload'
  const [uploading, setUploading] = useState(false);
  const resumeDataRef = useRef(null); // Store resume data when changing templates

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { user } = useAuth();
  const studentId = user?.id || user?.googleId || user?.email || "demo-student-1";

  useEffect(() => {
    axios.get(`${api.baseURL}/resume-templates`).then((res) => setTemplates(res.data));
    // Fetch pre-made section templates
    const sectionTemplatesUrl = api.baseURL 
      ? `${api.baseURL}/admin/section-templates`
      : '/api/admin/section-templates';
    axios.get(sectionTemplatesUrl)
      .then((res) => {
        console.log("Section templates loaded:", res.data);
        setSectionTemplates(res.data || []);
      })
      .catch(err => {
        console.error("Error fetching section templates:", err);
        setSectionTemplates([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) {
      setDataEntryMode(null);
      return;
    }
    // Only create empty resume if manual mode is selected and resume doesn't exist
    if (dataEntryMode === 'manual' && !resume) {
      setResume(emptyResume(studentId, selectedTemplateId));
    }
  }, [selectedTemplateId, dataEntryMode]);

  // Debug: Log when resume state changes
  useEffect(() => {
    console.log("Resume state changed:", {
      hasResume: !!resume,
      selectedTemplateId,
      dataEntryMode,
      personalInfo: resume?.personalInfo,
      experienceCount: resume?.experience?.length || 0
    });
  }, [resume, selectedTemplateId, dataEntryMode]);

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

  const handleChangeTemplate = async () => {
    // Save resume automatically if it exists and has data
    if (resume) {
      // Check if resume has been edited (has data beyond just templateId)
      const hasData = resume.personalInfo?.fullName || 
                     resume.experience?.length > 0 || 
                     resume.education?.length > 0 || 
                     resume.projects?.length > 0 ||
                     resume.skills?.length > 0 ||
                     resume.summary ||
                     resume.bio;
      
      if (hasData) {
        // Save the resume before changing template
        setSaving(true);
        try {
          if (resume.id) {
            const { data } = await axios.put(`${api.baseURL}/resumes/${resume.id}`, resume);
            // Store the saved resume data
            resumeDataRef.current = { ...data };
          } else {
            const { data } = await axios.post(`${api.baseURL}/resumes`, resume);
            // Store the saved resume data
            resumeDataRef.current = { ...data };
          }
        } catch (error) {
          console.error("Error saving resume before template change:", error);
          // Still store the current resume data even if save fails
          resumeDataRef.current = { ...resume };
        } finally {
          setSaving(false);
        }
      } else {
        // Store resume data even if it's empty (to preserve templateId)
        resumeDataRef.current = { ...resume };
      }
    }
    
    // Open template selection page
    setSelectedTemplateId("");
    setDataEntryMode(null);
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
    if (!resume?.id) {
      alert('Please save your resume first before requesting a review.');
      return;
    }
    
    try {
      const apiPrefix = api.baseURL ? '' : '/api';
      const { data } = await axios.post(
        `${api.baseURL}${apiPrefix}/reviews`,
        { 
          resumeId: resume.id, 
          studentId: resume.studentId || studentId,
          type 
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (data && data.id) {
        alert(`Mentor review requested successfully! Your request has been submitted and will be reviewed by a mentor.`);
        setFeedback(`Review requested (${type}). Status: ${data.status}`);
      } else {
        alert('Review request submitted, but did not receive confirmation. Please check your requests.');
        setFeedback(`Review requested (${type})`);
      }
    } catch (error) {
      console.error('Error requesting review:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to request review';
      alert(`Failed to request review: ${errorMessage}`);
      setFeedback('Error requesting review. Please try again.');
    }
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
    setResume((prev) => {
      const updatedResume = {
        ...prev,
        sectionOrder: prev.sectionOrder.filter(id => id !== sectionId)
      };
      // If it's a custom section, also remove it from customSections
      if (sectionId.startsWith('custom_')) {
        updatedResume.customSections = (prev.customSections || []).filter(s => s.id !== sectionId);
      }
      return updatedResume;
    });
    if (editingSection === sectionId) {
      setEditingSection(null);
    }
  };

  const handleColorChange = (sectionId) => {
    setColorPickerSection(sectionId);
    setEditingSection(sectionId);
    setShowColorPicker(true);
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

  const updateTypography = (settingType, value) => {
    setResume((prev) => ({
      ...prev,
      typography: {
        ...prev.typography || { fontSize: '12px', fontSpacing: '1.6', sectionSpacing: '32px' },
        [settingType]: value
      }
    }));
  };

  const renderSectionEditor = () => {
    if (!editingSection) return null;
    const currentTemplate = templates.find(t => t.id === selectedTemplateId);
    const templateSupportsImage = currentTemplate?.hasProfileImage === true;

    switch (editingSection) {
      case 'personalInfo':
        const handleImageUploadInEditor = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              onChange("personalInfo.profileImage", reader.result);
            };
            reader.readAsDataURL(file);
          }
        };
        return (
          <Card>
            <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {templateSupportsImage && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {resume.personalInfo?.profileImage && (
                      <img 
                        src={resume.personalInfo.profileImage} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUploadInEditor}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" className="text-xs" type="button">
                        {resume.personalInfo?.profileImage ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </label>
                  </div>
                  {resume.personalInfo?.profileImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onChange("personalInfo.profileImage", "")}
                      className="text-xs"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Full name" value={resume.personalInfo?.fullName || ""} onChange={(e) => onChange("personalInfo.fullName", e.target.value)} />
                <Input placeholder="Title" value={resume.personalInfo?.title || ""} onChange={(e) => onChange("personalInfo.title", e.target.value)} />
                <Input placeholder="Email" value={resume.personalInfo?.email || ""} onChange={(e) => onChange("personalInfo.email", e.target.value)} />
                <Input placeholder="Phone" value={resume.personalInfo?.phone || ""} onChange={(e) => onChange("personalInfo.phone", e.target.value)} />
                <Input placeholder="Location" value={resume.personalInfo?.location || ""} onChange={(e) => onChange("personalInfo.location", e.target.value)} />
              </div>
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
        // Check if it's a custom section
        if (editingSection.startsWith('custom_')) {
          const customSection = resume.customSections?.find(s => s.id === editingSection);
          if (customSection) {
            return (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Section Title</label>
                    <Input
                      value={customSection.title || ""}
                      onChange={(e) => {
                        const updatedSections = (resume.customSections || []).map(s =>
                          s.id === editingSection ? { ...s, title: e.target.value } : s
                        );
                        onChange("customSections", updatedSections);
                      }}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Content Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded"
                      value={customSection.contentType || "text"}
                      onChange={(e) => {
                        const updatedSections = (resume.customSections || []).map(s =>
                          s.id === editingSection ? { ...s, contentType: e.target.value } : s
                        );
                        onChange("customSections", updatedSections);
                      }}
                    >
                      <option value="text">Text/Paragraph</option>
                      <option value="list">Bullet List</option>
                    </select>
                  </div>
                  {customSection.contentType === "list" ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2">List Items (one per line)</label>
                      <Textarea
                        rows={6}
                        value={(customSection.items || []).join("\n")}
                        onChange={(e) => {
                          const items = e.target.value.split("\n").filter(Boolean);
                          const updatedSections = (resume.customSections || []).map(s =>
                            s.id === editingSection ? { ...s, items } : s
                          );
                          onChange("customSections", updatedSections);
                        }}
                        placeholder="Enter list items, one per line"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Content</label>
                      <Textarea
                        rows={6}
                        value={customSection.content || ""}
                        onChange={(e) => {
                          const updatedSections = (resume.customSections || []).map(s =>
                            s.id === editingSection ? { ...s, content: e.target.value } : s
                          );
                          onChange("customSections", updatedSections);
                        }}
                      placeholder="Enter section content"
                    />
                  </div>
                  )}
                  
                  {/* Section Template Buttons - Always show this section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-semibold mb-3">Quick Add Templates</label>
                    {sectionTemplates.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                        {sectionTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Determine if content should be list or text based on newlines
                              const hasBullets = template.content.includes('\n-') || template.content.startsWith('-');
                              const contentType = hasBullets ? 'list' : 'text';
                              const items = hasBullets ? template.content.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim()) : [];
                              
                              const updatedSections = (resume.customSections || []).map(s =>
                                s.id === editingSection ? {
                                  ...s,
                                  title: template.title,
                                  contentType: contentType,
                                  content: contentType === 'text' ? template.content : '',
                                  items: contentType === 'list' ? items : []
                                } : s
                              );
                              onChange("customSections", updatedSections);
                            }}
                            className="text-left justify-start h-auto py-2 px-3 hover:bg-blue-50"
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-xs">{template.title}</span>
                              <span className="text-xs text-gray-500 mt-1 line-clamp-1">{template.content.substring(0, 50)}...</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 py-2">Loading templates...</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }
        }
        return null;
    }
  };

  // Sidebar content for editor
  const renderSidebar = () => {
    if (!selectedTemplateId || !resume) return null;

    const currentTemplate = templates.find(t => t.id === selectedTemplateId);
    const supportsImage = currentTemplate?.hasProfileImage === true;

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange("personalInfo.profileImage", reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const availableSections = [
      { id: 'personalInfo', label: 'Personal Info', icon: '👤', color: 'bg-blue-100 hover:bg-blue-200' },
      { id: 'summary', label: 'Summary', icon: '📝', color: 'bg-blue-100 hover:bg-blue-200' },
      { id: 'bio', label: 'Bio', icon: '👤', color: 'bg-purple-100 hover:bg-purple-200' },
      { id: 'experience', label: 'Experience', icon: '💼', color: 'bg-green-100 hover:bg-green-200' },
      { id: 'education', label: 'Education', icon: '🎓', color: 'bg-yellow-100 hover:bg-yellow-200' },
      { id: 'projects', label: 'Projects', icon: '🚀', color: 'bg-pink-100 hover:bg-pink-200' },
      { id: 'skills', label: 'Skills', icon: '⚡', color: 'bg-orange-100 hover:bg-orange-200' },
      { id: 'achievements', label: 'Achievements', icon: '🏆', color: 'bg-indigo-100 hover:bg-indigo-200' },
      { id: 'certificates', label: 'Certificates', icon: '📜', color: 'bg-teal-100 hover:bg-teal-200' },
      { id: 'languages', label: 'Languages', icon: '🌍', color: 'bg-cyan-100 hover:bg-cyan-200' },
      { id: 'hobbies', label: 'Hobbies', icon: '🎯', color: 'bg-rose-100 hover:bg-rose-200' }
    ];

    return (
      <div className="h-full overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Edit3 className="w-5 h-5 text-purple-600" />
            Section Editor
          </h2>
        </div>

        {/* Add Profile Image Button (for templates that support it) */}
        {supportsImage && (
          <Card className="mb-4 border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                Profile Image
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-3">
                {resume.personalInfo?.profileImage ? (
                  <div className="space-y-2">
                    <img 
                      src={resume.personalInfo.profileImage} 
                      alt="Profile" 
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button variant="outline" size="sm" className="w-full text-xs" type="button">
                          Change Image
                        </Button>
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChange("personalInfo.profileImage", "")}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" className="w-full text-xs" type="button">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Upload Profile Image
                    </Button>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Custom Section Button - Prominent */}
        <Button
          onClick={() => {
            const newSectionId = `custom_${Date.now()}`;
            const newCustomSection = {
              id: newSectionId,
              title: "New Section",
              contentType: "text",
              content: "",
              items: []
            };
            setResume((prev) => ({
              ...prev,
              customSections: [...(prev.customSections || []), newCustomSection],
              sectionOrder: [...(prev.sectionOrder || []), newSectionId]
            }));
            setEditingSection(newSectionId);
          }}
          className="w-full mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Custom Section
        </Button>

        {/* Add Section Button */}
        <Card className="mb-4 border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 p-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4 text-blue-600" />
              Add Section
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-1 gap-2">
              {availableSections.map(section => {
                const sectionOrder = resume.sectionOrder || [];
                const isAdded = sectionOrder.includes(section.id);
                return (
                  <Button
                    key={section.id}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Add section to sectionOrder if not already added
                      if (!isAdded) {
                        setResume((prev) => {
                          const currentSectionOrder = prev.sectionOrder || [];
                          const updatedResume = {
                            ...prev,
                            sectionOrder: [...currentSectionOrder, section.id]
                          };
                          // Initialize empty data for the section if it doesn't exist
                          if (section.id === 'experience' && (!prev.experience || prev.experience.length === 0)) {
                            updatedResume.experience = [{ role: "", company: "", startDate: "", endDate: "", achievements: [] }];
                          } else if (section.id === 'education' && (!prev.education || prev.education.length === 0)) {
                            updatedResume.education = [{ degree: "", institution: "", fieldOfStudy: "", startDate: "", endDate: "" }];
                          } else if (section.id === 'projects' && (!prev.projects || prev.projects.length === 0)) {
                            updatedResume.projects = [{ name: "", description: "", link: "", technologies: [], startDate: "", endDate: "" }];
                          } else if (section.id === 'certificates' && (!prev.certificates || prev.certificates.length === 0)) {
                            updatedResume.certificates = [{ name: "", issuer: "", issueDate: "" }];
                          } else if (section.id === 'languages' && (!prev.languages || prev.languages.length === 0)) {
                            updatedResume.languages = [{ name: "", proficiency: "" }];
                          } else if (section.id === 'summary' && !prev.summary) {
                            updatedResume.summary = "";
                          } else if (section.id === 'bio' && !prev.bio) {
                            updatedResume.bio = "";
                          } else if (section.id === 'skills' && (!prev.skills || prev.skills.length === 0)) {
                            updatedResume.skills = [];
                          } else if (section.id === 'achievements' && (!prev.achievements || prev.achievements.length === 0)) {
                            updatedResume.achievements = [];
                          } else if (section.id === 'hobbies' && (!prev.hobbies || prev.hobbies.length === 0)) {
                            updatedResume.hobbies = [];
                          } else if (section.id === 'personalInfo' && !prev.personalInfo) {
                            updatedResume.personalInfo = { fullName: "", email: "", phone: "", location: "", title: "", profileImage: "", profileImageStyle: {} };
                          }
                          return updatedResume;
                        });
                      }
                      // Always set editing section
                      setEditingSection(section.id);
                    }}
                    className={`flex items-center justify-between transition-all ${section.color} border-0 text-xs ${isAdded ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{section.icon}</span>
                      <span className="font-medium">{section.label}</span>
                    </div>
                    {isAdded && (
                      <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">Added</span>
                    )}
                  </Button>
                );
              })}
              
              {/* Pre-made Sections from Database */}
              {sectionTemplates.filter(template => template.isActive).map(template => {
                const sectionOrder = resume.sectionOrder || [];
                const customSections = resume.customSections || [];
                const templateSectionId = `template_${template.id}`;
                const isAdded = customSections.some(s => s.id === templateSectionId);
                
                return (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Add pre-made section as custom section if not already added
                      if (!isAdded) {
                        const newSectionId = templateSectionId;
                        const newCustomSection = {
                          id: newSectionId,
                          title: template.title,
                          contentType: template.contentType || 'text',
                          content: template.content || '',
                          items: template.items || []
                        };
                        setResume((prev) => ({
                          ...prev,
                          customSections: [...(prev.customSections || []), newCustomSection],
                          sectionOrder: [...(prev.sectionOrder || []), newSectionId]
                        }));
                        setEditingSection(newSectionId);
                      } else {
                        // If already added, just edit it
                        setEditingSection(templateSectionId);
                      }
                    }}
                    className={`flex items-center justify-between transition-all ${template.color || 'bg-gray-100 hover:bg-gray-200'} border-0 text-xs ${isAdded ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{template.icon || '📄'}</span>
                      <span className="font-medium">{template.title}</span>
                    </div>
                    {isAdded && (
                      <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">Added</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Typography & Spacing Controls */}
        <Card className="mb-4 border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-green-600" />
              Typography & Spacing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            {/* Font Size */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Font Size</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentSize = parseInt(resume.typography?.fontSize || '12');
                    if (currentSize > 8) {
                      updateTypography('fontSize', `${currentSize - 1}px`);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={parseInt(resume.typography?.fontSize || '12')}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 12;
                    if (value >= 8 && value <= 20) {
                      updateTypography('fontSize', `${value}px`);
                    }
                  }}
                  min="8"
                  max="20"
                  className="text-center font-mono text-xs h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentSize = parseInt(resume.typography?.fontSize || '12');
                    if (currentSize < 20) {
                      updateTypography('fontSize', `${currentSize + 1}px`);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>

            {/* Font Spacing (Line Height) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Font Spacing (Line Height)</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentSpacing = parseFloat(resume.typography?.fontSpacing || '1.6');
                    if (currentSpacing > 1.0) {
                      updateTypography('fontSpacing', (currentSpacing - 0.1).toFixed(1));
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <Input
                  type="number"
                  step="0.1"
                  value={parseFloat(resume.typography?.fontSpacing || '1.6')}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 1.6;
                    if (value >= 1.0 && value <= 2.5) {
                      updateTypography('fontSpacing', value.toFixed(1));
                    }
                  }}
                  min="1.0"
                  max="2.5"
                  className="text-center font-mono text-xs h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentSpacing = parseFloat(resume.typography?.fontSpacing || '1.6');
                    if (currentSpacing < 2.5) {
                      updateTypography('fontSpacing', (currentSpacing + 0.1).toFixed(1));
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Section Spacing */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Section Spacing</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentSpacing = parseInt(resume.typography?.sectionSpacing || '32');
                    if (currentSpacing > 16) {
                      updateTypography('sectionSpacing', `${currentSpacing - 4}px`);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={parseInt(resume.typography?.sectionSpacing || '32')}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 32;
                    if (value >= 16 && value <= 80) {
                      updateTypography('sectionSpacing', `${value}px`);
                    }
                  }}
                  min="16"
                  max="80"
                  className="text-center font-mono text-xs h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentSpacing = parseInt(resume.typography?.sectionSpacing || '32');
                    if (currentSpacing < 80) {
                      updateTypography('sectionSpacing', `${currentSpacing + 4}px`);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Editor */}
        {editingSection ? (
          <div className="space-y-4">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    {editingSection.charAt(0).toUpperCase() + editingSection.slice(1).replace(/([A-Z])/g, ' $1')}
                  </CardTitle>
                  <Button 
                    onClick={() => {
                      setEditingSection(null);
                      setShowColorPicker(false);
                      setColorPickerSection(null);
                    }} 
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {showColorPicker && colorPickerSection === editingSection ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={resume.colors.primary}
                          onChange={(e) => updateColor('primary', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={resume.colors.primary}
                          onChange={(e) => updateColor('primary', e.target.value)}
                          className="font-mono text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={resume.colors.secondary}
                          onChange={(e) => updateColor('secondary', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={resume.colors.secondary}
                          onChange={(e) => updateColor('secondary', e.target.value)}
                          className="font-mono text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={resume.colors.accent}
                          onChange={(e) => updateColor('accent', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={resume.colors.accent}
                          onChange={(e) => updateColor('accent', e.target.value)}
                          className="font-mono text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={resume.colors.text || '#1f2937'}
                          onChange={(e) => updateColor('text', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={resume.colors.text || '#1f2937'}
                          onChange={(e) => updateColor('text', e.target.value)}
                          className="font-mono text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowColorPicker(false);
                          setColorPickerSection(null);
                        }}
                        className="flex-1 text-xs"
                      >
                        Done
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowColorPicker(false);
                          setColorPickerSection(null);
                        }}
                        className="flex-1 text-xs"
                      >
                        Edit Text
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderSectionEditor()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <Edit3 className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">No Section Selected</h3>
                <p className="text-gray-500 text-xs">
                  Click on a section in the preview or add a new section above to start editing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout sidebar={renderSidebar()}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Resume Builder
        </h1>
        <p className="text-gray-600">Create a professional resume that stands out</p>
      </div>

      {/* Data Entry Mode Selection - shown after template selection */}
      {selectedTemplateId && !dataEntryMode && (
        <div className="min-h-screen bg-gradient-to-br from-violet-400 via-purple-400 via-pink-400 to-orange-400 py-12 relative overflow-hidden flex items-center justify-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 mb-6 shadow-2xl">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
                Choose Your Data Entry Method
              </h2>
              <p className="text-white/90 text-xl max-w-2xl mx-auto font-semibold drop-shadow-md">
                Select how you want to populate your resume data
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Manual Data Filling Option */}
              <div
                onClick={() => setDataEntryMode('manual')}
                className="group relative cursor-pointer"
              >
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden border-4 border-blue-400 transform hover:-translate-y-4 hover:scale-105 p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                      <Edit3 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white drop-shadow-lg mb-4">
                      Manual Data Filling
                    </h3>
                    <p className="text-white/90 text-base mb-6 font-medium">
                      Fill in your resume information manually step by step. Perfect for creating a new resume from scratch.
                    </p>
                    <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                      <span className="text-sm font-bold">Start Manual Entry</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-500 -z-10"></div>
              </div>

              {/* Upload Existing Resume Option */}
              <div
                onClick={() => setDataEntryMode('upload')}
                className="group relative cursor-pointer"
              >
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden border-4 border-purple-400 transform hover:-translate-y-4 hover:scale-105 p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                      <Download className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white drop-shadow-lg mb-4">
                      Upload Existing Resume
                    </h3>
                    <p className="text-white/90 text-base mb-6 font-medium">
                      Upload your existing resume (PDF or DOCX) and we'll automatically extract and fill in your information.
                    </p>
                    <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                      <span className="text-sm font-bold">Upload Resume</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-500 -z-10"></div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => {
                  setSelectedTemplateId("");
                  setDataEntryMode(null);
                }}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
            </div>
          </div>
          
          {/* Add animation keyframes via style tag */}
          <style>{`
            @keyframes blob {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}</style>
        </div>
      )}

      {/* File Upload Component - shown when upload mode is selected and no resume yet */}
      {selectedTemplateId && dataEntryMode === 'upload' && !resume && !uploading && (
        <ResumeUploadComponent
          templateId={selectedTemplateId}
          studentId={studentId}
          onResumeParsed={(parsedResume) => {
            console.log("Setting parsed resume in state:", parsedResume);
            console.log("Resume has personalInfo:", parsedResume.personalInfo);
            console.log("Resume has experience:", parsedResume.experience?.length || 0);
            setResume(parsedResume);
            setDataEntryMode('manual'); // Switch to manual mode to show editor
            console.log("Resume state should be updated, dataEntryMode set to:", 'manual');
          }}
          onCancel={() => {
            setDataEntryMode(null);
          }}
          uploading={uploading}
          setUploading={setUploading}
        />
      )}

      {/* Template gallery */}
      {!selectedTemplateId && (
        <div className="min-h-screen bg-gradient-to-br from-violet-400 via-purple-400 via-pink-400 to-orange-400 py-12 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-12 px-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
                Choose Your Resume Template
              </h2>
              <p className="text-white/90 text-xl max-w-2xl mx-auto font-semibold drop-shadow-md">
                Select a professional template that matches your style. Hover over any template to preview it.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 max-w-7xl mx-auto">
              {templates.map((t, index) => {
                // Handle thumbnail URL - encode spaces and special characters
                let thumbnailPath = t.thumbnailUrl || t.previewUrl;
                if (thumbnailPath && !thumbnailPath.startsWith('http') && !thumbnailPath.startsWith('data:')) {
                  // Encode the path properly, but keep the structure
                  const parts = thumbnailPath.split('/');
                  const fileName = parts[parts.length - 1];
                  const dirPath = parts.slice(0, -1).join('/');
                  // Encode only the filename part to handle spaces
                  thumbnailPath = dirPath + '/' + encodeURIComponent(fileName);
                }
                // Vibrant color schemes for each card
                const cardColors = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', accent: 'bg-purple-500' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', accent: 'bg-blue-500' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', accent: 'bg-orange-500' },
                  { bg: 'from-green-500 to-emerald-500', border: 'border-green-400', accent: 'bg-green-500' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', accent: 'bg-indigo-500' },
                  { bg: 'from-pink-500 to-rose-500', border: 'border-pink-400', accent: 'bg-pink-500' },
                  { bg: 'from-yellow-500 to-orange-500', border: 'border-yellow-400', accent: 'bg-yellow-500' },
                ];
                const colors = cardColors[index % cardColors.length];
                
                return (
                  <div
                    key={t.id}
                    className="group relative cursor-pointer"
                    onClick={() => {
                      // If there's stored resume data, populate new template with it
                      if (resumeDataRef.current) {
                        const storedResume = resumeDataRef.current;
                        // Create new resume with stored data but update templateId
                        // Keep the id so it updates the existing resume when saved
                        const newResume = {
                          ...storedResume,
                          templateId: t.id
                        };
                        setResume(newResume);
                        setDataEntryMode('manual');
                        resumeDataRef.current = null; // Clear the ref after using it
                      }
                      setSelectedTemplateId(t.id);
                    }}
                  >
                    {/* Main Card Container - Colorful */}
                    <div className={`relative bg-gradient-to-br ${colors.bg} rounded-3xl shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden border-4 ${colors.border} transform hover:-translate-y-4 hover:scale-105`}>
                      {/* Image Card Wrapper */}
                      <div className="relative p-5 bg-white/20 backdrop-blur-sm">
                        <Card className="overflow-hidden border-4 border-white/50 shadow-xl bg-white rounded-xl">
                          <div className="relative overflow-hidden bg-white" style={{ aspectRatio: '3/4', height: '280px' }}>
                            <img 
                              src={thumbnailPath} 
                              alt={t.name}
                              className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                // Try previewUrl if thumbnail fails
                                if (t.previewUrl && e.target.src !== t.previewUrl) {
                                  e.target.src = t.previewUrl;
                                } else {
                                  // If both fail, hide the image to prevent repeated 404s
                                  e.target.style.display = 'none';
                                }
                              }}
                              loading="lazy"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-start justify-end p-4">
                              <div className="bg-white rounded-full px-4 py-2 shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <Eye className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-bold text-purple-600">Preview</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      {/* Template Details Below Image - Colorful */}
                      <div className="p-6 bg-white/10 backdrop-blur-md">
                        {/* Template Name */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-2 h-8 rounded-full ${colors.accent} shadow-lg`}></div>
                          <h3 className="text-xl font-extrabold text-white drop-shadow-lg">
                            {t.name}
                          </h3>
                        </div>
                        
                        {/* Description */}
                        {t.description && (
                          <p className="text-sm text-white/90 mb-4 font-medium overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {t.description}
                          </p>
                        )}
                        
                        {/* Category Badge */}
                        {t.category && (
                          <div className="flex items-center gap-2 mb-5">
                            <span className={`px-4 py-2 rounded-full text-xs font-bold ${colors.accent} text-white shadow-lg`}>
                              {t.category.toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Action Button */}
                        <div className="flex items-center justify-between pt-4 border-t-2 border-white/30">
                          <div className="flex items-center gap-2 text-white/80">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-semibold">Click to Select</span>
                          </div>
                          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${colors.accent} text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110`}>
                            <span className="text-sm font-bold">Use Template</span>
                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>
                    </div>
                    
                    {/* Enhanced Colorful Glow effect */}
                    <div className={`absolute -inset-2 bg-gradient-to-r ${colors.bg} rounded-3xl opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-500 -z-10`}></div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Add animation keyframes via style tag */}
          <style>{`
            @keyframes blob {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}</style>
        </div>
      )}

      {/* Editor */}
      {selectedTemplateId && resume && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={handleChangeTemplate} 
                variant="ghost" 
                className="gap-2"
                disabled={saving}
              >
                <ArrowLeft className="w-4 h-4" />
                {saving ? "Saving..." : "Change Template"}
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Button 
                onClick={save} 
                disabled={saving}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Resume
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant={isEditing ? "default" : "outline"}
                className="gap-2"
              >
                {isEditing ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Exit Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Edit Mode
                  </>
                )}
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Button 
                onClick={previewHtml} 
                disabled={!resume?.id}
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview HTML
              </Button>
              <Button 
                onClick={downloadPdf} 
                disabled={!resume?.id}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Button 
                onClick={() => requestReview("AI")} 
                disabled={!resume?.id}
                variant="outline"
                className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="w-4 h-4" />
                AI Review
              </Button>
              <Button 
                onClick={() => requestReview("HUMAN")} 
                disabled={!resume?.id}
                variant="outline"
                className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mentor Review
              </Button>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Resume Preview (A4 Size)
              </h2>
              {isEditing && (
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  Edit Mode Active
                </span>
              )}
            </div>
            <div className="flex justify-center bg-gray-100 p-4 rounded-lg overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="flex flex-col items-center">
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
                      onColorChange={handleColorChange}
                      colors={resume.colors}
                      onImageStyleUpdate={(style) => onChange("personalInfo.profileImageStyle", style)}
                      onSectionTitleUpdate={(sectionId, newTitle) => {
                        // Handle custom sections differently
                        if (sectionId.startsWith('custom_')) {
                          const updatedSections = (resume.customSections || []).map(s =>
                            s.id === sectionId ? { ...s, title: newTitle } : s
                          );
                          onChange("customSections", updatedSections);
                        } else {
                          const currentTitles = resume.sectionTitles || {};
                          onChange("sectionTitles", {
                            ...currentTitles,
                            [sectionId]: newTitle
                          });
                        }
                      }}
                    />
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`mt-4 p-4 rounded-lg border-2 shadow-sm ${
              feedback.includes('Error') || feedback.includes('Failed') 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                {feedback.includes('Error') || feedback.includes('Failed') ? (
                  <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h3 className={`font-semibold mb-1 ${
                    feedback.includes('Error') || feedback.includes('Failed') 
                      ? 'text-red-800' 
                      : 'text-green-800'
                  }`}>
                    {feedback.includes('Error') || feedback.includes('Failed') ? 'Error' : 'Success'}
                  </h3>
                  <p className={`text-sm ${
                    feedback.includes('Error') || feedback.includes('Failed') 
                      ? 'text-red-700' 
                      : 'text-green-700'
                  }`}>
                    {feedback}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResumeBuilder;