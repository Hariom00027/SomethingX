import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { api } from "@/lib/utils";
import { useEffect, useState } from "react";

const ResumeAccess = () => {
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    axios.get(`${api.baseURL}/resumes`).then((res) => setResumes(res.data));
  }, []);

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <h1 className="text-2xl font-bold mb-4">Resume Access</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>PDF</TableHead>
            <TableHead>Template</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resumes.map((resume) => (
            <TableRow key={resume.id}>
              <TableCell>{resume.studentId}</TableCell>
              <TableCell>
                {resume.id && (
                  <a href={`${api.baseURL}/resumes/${resume.id}/pdf`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Download PDF</a>
                )}
              </TableCell>
              <TableCell>{resume.templateId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardLayout>
  );
};

export default ResumeAccess;
