import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const CareerCounselling = () => {
  const [advice, setAdvice] = useState([]);

  const getAdvice = () => {
    // Mock career advice
    setAdvice([
      "Focus on building a strong portfolio of projects.",
      "Network with professionals in your desired field.",
      "Practice coding challenges and behavioral questions.",
    ]);
  };

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <h1 className="text-2xl font-bold mb-4">Career Counselling</h1>
      <Textarea placeholder="What are your career goals?" className="mb-4" />
      <Button onClick={getAdvice}>Get Advice</Button>
      {advice.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Here is some advice:</h3>
          <ul className="list-disc pl-5 mt-2">
            {advice.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CareerCounselling;
