import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-gray-100 p-4 flex justify-between items-center border-b">
      <Link to="/" className="text-2xl font-bold text-blue-600">CareerConnect 360</Link>
      
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Students</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link to="/students/career-blueprint">Career Blueprint</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/students/resume-builder">Resume Builder</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/students/career-counselling">Career Counselling</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/students/apply-jobs">Apply to Jobs</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/students/courses">Courses</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Institutes</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link to="/institutes/internship-management">Internship Management</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/institutes/expert-sessions">Expert Sessions</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/institutes/workshops">Workshops</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Industry</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link to="/industry/resume-access">Resume Access</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/industry/post-jobs">Post Jobs & Hackathons</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/industry/ai-interview">AI Technical Interview</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <img
                  src={user?.picture || '/default-avatar.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
