import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const AiInterview = () => {
  const [question, setQuestion] = useState("Tell me about a time you faced a challenge.");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const submitAnswer = () => {
    // Mock AI feedback
    setFeedback("Good answer, but you could have been more specific about the outcome.");
  };

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <h1 className="text-2xl font-bold mb-4">AI Technical Interview</h1>
      <div className="mb-4">
        <h3 className="font-semibold">Question:</h3>
        <p>{question}</p>
      </div>
      <Textarea
        placeholder="Your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="mb-4"
      />
      <Button onClick={submitAnswer}>Submit Answer</Button>
      {feedback && (
        <div className="mt-4 p-4 bg-green-100 rounded-md">
          <h3 className="font-semibold">Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AiInterview;
