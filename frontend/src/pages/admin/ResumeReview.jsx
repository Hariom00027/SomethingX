import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import axios from 'axios';
import { api } from '../../lib/utils';
import { Star, X, Check, Eye } from 'lucide-react';

const ResumeReview = () => {
  const [resumes, setResumes] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedReviewRequest, setSelectedReviewRequest] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    review: '',
    suggestions: '',
    others: ''
  });
  const [resumeHtml, setResumeHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResumeReviewRequests();
  }, []);

  const fetchResumeReviewRequests = async () => {
    try {
      const apiPrefix = api.baseURL ? '' : '/api';
      // Fetch resumes with mentorReviewRequested=true
      const resumesResponse = await axios.get(`${api.baseURL}${apiPrefix}/resumes/mentor-review-requests`);
      const resumes = resumesResponse.data || [];
      setResumes(resumes);
      console.log('Fetched resumes:', resumes);

      // Fetch all review requests for these resumes (not just pending)
      // We need to get all review requests to match them with resumes
      const allReviewPromises = resumes.map(resume => 
        axios.get(`${api.baseURL}${apiPrefix}/reviews/resume/${resume.id}`).catch(() => null)
      );
      const allReviewResults = await Promise.all(allReviewPromises);
      const allReviews = allReviewResults
        .filter(r => r && r.data && Array.isArray(r.data))
        .flatMap(r => r.data)
        .filter(r => r.type === 'HUMAN');
      
      console.log('Fetched review requests:', allReviews);
      setReviewRequests(allReviews);

      // Also try to get pending reviews separately for status check
      try {
        const pendingResponse = await axios.get(`${api.baseURL}${apiPrefix}/reviews/mentor/pending`);
        console.log('Pending reviews:', pendingResponse.data);
      } catch (e) {
        // Ignore if endpoint doesn't exist
      }
    } catch (error) {
      console.error('Error fetching review requests:', error);
      alert('Failed to load review requests. Please refresh the page.');
    }
  };

  const findReviewRequestForResume = (resumeId) => {
    return reviewRequests.find(req => req.resumeId === resumeId);
  };

  const handleAccept = async (reviewRequest) => {
    if (!reviewRequest || !reviewRequest.id) {
      alert('Invalid review request. Please refresh the page.');
      return;
    }
    
    try {
      const apiPrefix = api.baseURL ? '' : '/api';
      console.log('Accepting review request with ID:', reviewRequest.id);
      console.log('Full review request object:', reviewRequest);
      
      const response = await axios.post(
        `${api.baseURL}${apiPrefix}/reviews/mentor/${reviewRequest.id}/accept`,
        {
          mentorId: 'admin' // In real app, get from auth context
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Accept response:', response);
      
      if (response.data && (response.status === 200 || response.status === 201)) {
        alert('Review request accepted successfully!');
        await fetchResumeReviewRequests();
      } else {
        alert('Unexpected response from server. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error accepting review:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to accept review request';
      alert(`Failed to accept review request: ${errorMessage}`);
    }
  };

  const handleReject = async (reviewRequest) => {
    if (!reviewRequest || !reviewRequest.id) {
      alert('Invalid review request. Please refresh the page.');
      return;
    }
    
    try {
      const apiPrefix = api.baseURL ? '' : '/api';
      const response = await axios.post(
        `${api.baseURL}${apiPrefix}/reviews/mentor/${reviewRequest.id}/reject`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && (response.status === 200 || response.status === 201)) {
        alert('Review request rejected successfully!');
        await fetchResumeReviewRequests();
      } else {
        alert('Unexpected response from server. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to reject review request';
      alert(`Failed to reject review request: ${errorMessage}`);
    }
  };

  const handleStartReview = async (resume) => {
    const reviewRequest = findReviewRequestForResume(resume.id);
    if (!reviewRequest) {
      alert('Review request not found');
      return;
    }

    if (reviewRequest.status !== 'ACCEPTED') {
      alert('Please accept the review request first');
      return;
    }

    setSelectedResume(resume);
    setSelectedReviewRequest(reviewRequest);
    
    // Fetch resume HTML
    try {
      const apiPrefix = api.baseURL ? '' : '/api';
      const response = await axios.get(`${api.baseURL}${apiPrefix}/resumes/${resume.id}/html`);
      setResumeHtml(response.data);
      setShowReviewForm(true);
    } catch (error) {
      console.error('Error fetching resume HTML:', error);
      alert('Failed to load resume');
    }
  };

  const handleStarClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.rating || !reviewForm.review) {
      alert('Please provide a rating and review');
      return;
    }

    setLoading(true);
    try {
      const apiPrefix = api.baseURL ? '' : '/api';
      await axios.post(`${api.baseURL}${apiPrefix}/reviews/mentor/${selectedReviewRequest.id}/submit`, {
        rating: reviewForm.rating,
        review: reviewForm.review,
        suggestions: reviewForm.suggestions,
        others: reviewForm.others
      });
      
      setShowReviewForm(false);
      setSelectedResume(null);
      setSelectedReviewRequest(null);
      setReviewForm({
        rating: 0,
        review: '',
        suggestions: '',
        others: ''
      });
      fetchResumeReviewRequests();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (showReviewForm && selectedResume) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Review Resume</h1>
          <Button onClick={() => {
            setShowReviewForm(false);
            setSelectedResume(null);
            setSelectedReviewRequest(null);
          }} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume HTML View */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded p-4 overflow-auto max-h-[800px]"
                dangerouslySetInnerHTML={{ __html: resumeHtml }}
              />
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle>Review Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {reviewForm.rating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">{reviewForm.rating} out of 5 stars</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review *</label>
                <Textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                  rows={6}
                  placeholder="Write your detailed review here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Suggestions</label>
                <Textarea
                  value={reviewForm.suggestions}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, suggestions: e.target.value }))}
                  rows={4}
                  placeholder="Suggestions for improvement..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Others</label>
                <Textarea
                  value={reviewForm.others}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, others: e.target.value }))}
                  rows={3}
                  placeholder="Additional comments..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitReview} disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedResume(null);
                    setSelectedReviewRequest(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resume Review</h1>
        <Button onClick={fetchResumeReviewRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-lg">No resume review requests at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const reviewRequest = findReviewRequestForResume(resume.id);
            const status = reviewRequest?.status || 'PENDING';
            
            return (
              <Card key={resume.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">
                      {resume.personalInfo?.fullName || 'Unknown Student'}
                    </span>
                    {getStatusBadge(status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Student ID:</strong> {resume.studentId}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {resume.personalInfo?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Title:</strong> {resume.personalInfo?.title || 'N/A'}
                    </p>
                    {reviewRequest?.requestedAt && (
                      <p className="text-xs text-gray-500">
                        Requested: {new Date(reviewRequest.requestedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {status === 'PENDING' && reviewRequest && (
                      <>
                        <Button
                          onClick={() => {
                            console.log('Accepting review request:', reviewRequest);
                            handleAccept(reviewRequest);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => {
                            console.log('Rejecting review request:', reviewRequest);
                            handleReject(reviewRequest);
                          }}
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {status === 'PENDING' && !reviewRequest && (
                      <p className="text-xs text-yellow-600 w-full text-center">
                        Review request not found. Please refresh the page.
                      </p>
                    )}
                    {status === 'ACCEPTED' && (
                      <Button
                        onClick={() => handleStartReview(resume)}
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review Resume
                      </Button>
                    )}
                    {status === 'COMPLETED' && (
                      <p className="text-sm text-green-600 w-full text-center">
                        Review completed
                      </p>
                    )}
                    {status === 'REJECTED' && (
                      <p className="text-sm text-red-600 w-full text-center">
                        Review rejected
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResumeReview;

