import React, { useState, useEffect } from 'react';
import { Bell, Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import axios from 'axios';
import { api } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const ReviewNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.userType === 'STUDENT') {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Get student ID from user - try multiple possible IDs
      const studentId = user?.id || user?.googleId || user?.email;
      
      if (!studentId) {
        console.log('No student ID available');
        setNotifications([]);
        return;
      }
      
      const apiPrefix = api.baseURL ? '' : '/api';
      console.log('Fetching notifications for student:', studentId);
      console.log('User object:', user);
      
      // Try fetching by studentId
      let response;
      try {
        response = await axios.get(`${api.baseURL}${apiPrefix}/reviews/student/${studentId}`);
      } catch (error) {
        console.error('Error fetching reviews by studentId:', error);
        // Try alternative IDs if main one fails
        const altIds = [user?.googleId, user?.email, user?.id].filter(id => id && id !== studentId);
        for (const altId of altIds) {
          try {
            console.log('Trying alternative student ID:', altId);
            response = await axios.get(`${api.baseURL}${apiPrefix}/reviews/student/${altId}`);
            if (response.data && response.data.length > 0) {
              console.log('Found reviews with alternative ID:', altId);
              break;
            }
          } catch (e) {
            console.log('Alternative ID failed:', altId);
          }
        }
        if (!response) {
          throw error;
        }
      }
      
      console.log('All reviews for student:', response.data);
      
      // Filter for completed mentor reviews
      const completedReviews = (response.data || []).filter(
        review => review && review.type === 'HUMAN' && review.status === 'COMPLETED'
      );
      
      console.log('Completed mentor reviews:', completedReviews);
      
      // If still no reviews, try fetching all resumes for this student and get their reviews
      if (completedReviews.length === 0) {
        try {
          console.log('No reviews found, trying to fetch via resumes...');
          const resumesResponse = await axios.get(`${api.baseURL}${apiPrefix}/resumes/student/${studentId}`);
          console.log('Student resumes:', resumesResponse.data);
          
          if (resumesResponse.data && resumesResponse.data.length > 0) {
            const allReviews = [];
            for (const resume of resumesResponse.data) {
              try {
                const resumeReviewsResponse = await axios.get(`${api.baseURL}${apiPrefix}/reviews/resume/${resume.id}`);
                const resumeReviews = (resumeReviewsResponse.data || []).filter(
                  review => review && review.type === 'HUMAN' && review.status === 'COMPLETED'
                );
                allReviews.push(...resumeReviews);
              } catch (e) {
                console.log('Error fetching reviews for resume:', resume.id, e);
              }
            }
            console.log('Reviews found via resumes:', allReviews);
            if (allReviews.length > 0) {
              completedReviews.push(...allReviews);
            }
          }
        } catch (e) {
          console.log('Error fetching via resumes:', e);
        }
      }
      
      // Sort by reviewedAt (most recent first)
      completedReviews.sort((a, b) => {
        const dateA = a.reviewedAt ? new Date(a.reviewedAt) : new Date(0);
        const dateB = b.reviewedAt ? new Date(b.reviewedAt) : new Date(0);
        return dateB - dateA;
      });
      
      setNotifications(completedReviews);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', error.response?.data);
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (review) => {
    setSelectedReview(review);
    setShowModal(true);
    // Mark as read (you might want to add an endpoint for this)
    // For now, we'll just mark it locally
    setNotifications(prev => 
      prev.map(n => n.id === review.id ? { ...n, read: true } : n)
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (user?.userType !== 'STUDENT') {
    return null;
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            fetchNotifications(); // Refresh when opening modal
            setShowModal(true);
          }}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resume Review Notifications</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNotifications()}
                >
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No resume reviews available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((review) => (
                    <Card
                      key={review.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        !review.read ? 'border-blue-500 border-2' : ''
                      }`}
                      onClick={() => handleNotificationClick(review)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              Resume Review Completed
                            </h3>
                            {review.rating && (
                              <div className="mb-2">
                                {renderStars(review.rating)}
                              </div>
                            )}
                            {review.review && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {review.review}
                              </p>
                            )}
                            {review.reviewedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Reviewed on: {new Date(review.reviewedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {!review.read && (
                            <span className="bg-blue-500 text-white text-xs rounded-full w-2 h-2 ml-2"></span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Review Details</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedReview(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedReview.rating && (
                <div>
                  <h3 className="font-semibold mb-2">Rating</h3>
                  {renderStars(selectedReview.rating)}
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedReview.rating} out of 5 stars
                  </p>
                </div>
              )}

              {selectedReview.review && (
                <div>
                  <h3 className="font-semibold mb-2">Review</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReview.review}
                  </p>
                </div>
              )}

              {selectedReview.suggestions && (
                <div>
                  <h3 className="font-semibold mb-2">Suggestions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReview.suggestions}
                  </p>
                </div>
              )}

              {selectedReview.others && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Comments</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReview.others}
                  </p>
                </div>
              )}

              {selectedReview.reviewedAt && (
                <div className="text-sm text-gray-500 pt-4 border-t">
                  Reviewed on: {new Date(selectedReview.reviewedAt).toLocaleString()}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedReview(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ReviewNotifications;

