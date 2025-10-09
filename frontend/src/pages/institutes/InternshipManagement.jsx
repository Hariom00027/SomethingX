import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const InternshipManagement = () => {
  // Mock data
  const internships = [
    { id: 1, title: "Frontend Internship", company: "TechCorp", students: 5 },
    { id: 2, title: "Backend Internship", company: "Innovate Inc.", students: 3 },
  ];

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Internship Management</h1>
        <Button>Create Internship</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Students Enrolled</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {internships.map((internship) => (
            <TableRow key={internship.id}>
              <TableCell>{internship.title}</TableCell>
              <TableCell>{internship.company}</TableCell>
              <TableCell>{internship.students}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm" className="ml-2">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardLayout>
  );
};

export default InternshipManagement;
