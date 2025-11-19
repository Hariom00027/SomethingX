import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Lock, Clock, ArrowLeft } from 'lucide-react';

const SkillTest = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { roleName, skillName } = useParams();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [questionFeedback, setQuestionFeedback] = useState({});
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Disable copy/paste and right-click
  useEffect(() => {
    if (!testStarted) return;

    const handleCopy = (e) => {
      e.preventDefault();
      alert('Copying is disabled during the test.');
      return false;
    };

    const handlePaste = (e) => {
      e.preventDefault();
      alert('Pasting is disabled during the test.');
      return false;
    };

    const handleCut = (e) => {
      e.preventDefault();
      alert('Cutting is disabled during the test.');
      return false;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Prevent navigation away
    const handleBeforeUnload = (e) => {
      if (!testCompleted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testStarted, testCompleted]);

  // Timer for test (optional - 30 minutes max)
  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const maxTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, maxTime - elapsed);
      
      if (remaining === 0) {
        handleSubmitTest();
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testStarted, testCompleted]);

  useEffect(() => {
    if (authLoading || !user?.id || !roleName || !skillName) return;

    const fetchTest = async () => {
      setLoading(true);
      setError(null);
      try {
        const decodedRoleName = decodeURIComponent(roleName);
        const decodedSkillName = decodeURIComponent(skillName);

        // Check for in-progress test
        try {
          const response = await axios.get(
            `http://localhost:8080/api/skill-test/in-progress?studentId=${user.id}&roleName=${encodeURIComponent(decodedRoleName)}&skillName=${encodeURIComponent(decodedSkillName)}`
          );
          setTest(response.data);
          setAnswers(response.data.answers || {});
          setTestStarted(true);
        } catch (err) {
          // No in-progress test, start a new one
          const startResponse = await axios.post(
            `http://localhost:8080/api/skill-test/start?studentId=${user.id}&roleName=${encodeURIComponent(decodedRoleName)}&skillName=${encodeURIComponent(decodedSkillName)}`
          );
          setTest(startResponse.data);
          setTestStarted(true);
        }
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err.response?.data || err.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [authLoading, user?.id, roleName, skillName]);

  const handleAnswerSelect = async (questionNumber, answer) => {
    if (testCompleted) return;
    // Reset feedback if re-answering
    setQuestionFeedback((prev) => {
      const next = { ...prev };
      if (next[questionNumber]) {
        delete next[questionNumber];
      }
      return next;
    });

    const newAnswers = { ...answers, [questionNumber]: answer };
    setAnswers(newAnswers);

    // Auto-save answer
    try {
      await axios.post(
        `http://localhost:8080/api/skill-test/${test.id}/answer`,
        { questionNumber, answer }
      );
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  };

  const handleQuestionSubmit = (questionNumber) => {
    if (testCompleted) return;
    if (!answers[questionNumber]) {
      alert('Please select an answer before submitting.');
      return;
    }

    const question = test.questions.find((q) => q.questionNumber === questionNumber);
    if (!question) return;

    const isCorrect = question.correctAnswer
      ? answers[questionNumber]?.trim() === question.correctAnswer.trim()
      : false;

    setQuestionFeedback((prev) => ({
      ...prev,
      [questionNumber]: {
        submitted: true,
        isCorrect,
      },
    }));
  };

  const handleSubmitTest = async () => {
    if (testCompleted || submitting) return;

    if (Object.keys(answers).length < test.questions.length) {
      if (!confirm(`You have only answered ${Object.keys(answers).length} out of ${test.questions.length} questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/skill-test/${test.id}/submit`
      );
      setResult(response.data);
      setTestCompleted(true);
      setTest(response.data);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      setError(err.response?.data || err.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (testStarted && !testCompleted) {
      if (!confirm('Are you sure you want to leave? Your progress will be saved, but you will need to resume the test later.')) {
        return;
      }
    }
    navigate(-1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  // Show results if test is completed
  if (testCompleted && result) {
    const passed = result.passed;
    const score = result.score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
              
              <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? 'Congratulations!' : 'Test Not Passed'}
              </h2>
              
              <p className="text-xl font-semibold text-gray-700 mb-4">
                Your Score: {score}%
              </p>
              
              <p className="text-gray-600 mb-6">
                {passed 
                  ? `You passed the test! Your skill "${decodeURIComponent(skillName)}" has been marked as completed.`
                  : `You scored ${score}%. You need at least 80% to pass. Please review the material and try again.`
                }
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Go Back
                </button>
                {!passed && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Retake Test
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const totalQuestions = test.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 py-8 px-4">
      {/* Security Notice */}
      <div className="max-w-4xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-yellow-200 shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>Secure Test Mode:</strong> Copy, paste, and right-click are disabled. Navigation away from this page will end your test.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-white/90 backdrop-blur border-blue-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Skill Test: {decodeURIComponent(skillName)}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Role: {decodeURIComponent(roleName)}</p>
              </div>
              {timeRemaining && (
                <div className="flex items-center gap-2 text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full shadow-inner">
                  <Clock className="h-5 w-5" />
                  {timeRemaining}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
              <p className="text-sm text-gray-600">
                Answered: {answeredCount} / {totalQuestions}
              </p>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6 border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-slate-900 flex items-center gap-2">
              <span className="text-blue-500">{question.questionNumber}.</span> {question.questionText}
            </h3>
            
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const selected = answers[question.questionNumber] === option;
                const feedback = questionFeedback[question.questionNumber];
                const isSubmitted = feedback?.submitted;
                const isCorrectAnswer = question.correctAnswer
                  ? option.trim() === question.correctAnswer.trim()
                  : false;
                let optionClasses =
                  'w-full text-left p-4 rounded-lg border-2 transition-all bg-white shadow-sm';

                if (isSubmitted) {
                  if (isCorrectAnswer) {
                    optionClasses += ' border-green-500 bg-green-50 text-green-900';
                  } else if (selected) {
                    optionClasses += ' border-red-500 bg-red-50 text-red-900';
                  } else {
                    optionClasses += ' border-gray-200 text-slate-700';
                  }
                } else if (selected) {
                  optionClasses += ' border-blue-600 bg-blue-50';
                } else {
                  optionClasses += ' border-gray-200 hover:border-blue-300 hover:bg-blue-50/50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(question.questionNumber, option)}
                    className={optionClasses}
                  >
                    <span className="font-semibold text-slate-900">{String.fromCharCode(65 + index)}. </span>
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                {questionFeedback[question.questionNumber]?.submitted && (
                  <p
                    className={`text-sm font-semibold ${
                      questionFeedback[question.questionNumber].isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {questionFeedback[question.questionNumber].isCorrect
                      ? 'Great job! That is correct.'
                      : 'Not quite. Review and try another question.'}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleQuestionSubmit(question.questionNumber)}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition"
                type="button"
              >
                Check Answer
              </button>
            </div>

            <div className="text-xs text-gray-500 text-right mt-4 italic">
              Correct answer: <span className="font-semibold text-green-600">{question.correctAnswer || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 shadow"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Test'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation Grid */}
        <Card className="mt-6 border-0 shadow-xl bg-white/90">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Question Navigation:</p>
            <div className="grid grid-cols-10 gap-2">
              {test.questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`p-2 rounded text-sm font-semibold transition ${
                    currentQuestion === index
                      ? 'bg-blue-600 text-white shadow'
                      : questionFeedback[q.questionNumber]?.submitted
                      ? questionFeedback[q.questionNumber].isCorrect
                        ? 'bg-green-500/80 text-white shadow'
                        : 'bg-red-500/80 text-white shadow'
                      : answers[q.questionNumber]
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                  }`}
                  type="button"
                >
                  {q.questionNumber}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillTest;

