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
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Get student ID from user or use a placeholder
      const studentId = user?.id || user?.email || 'demo-student-1';
      const apiPrefix = api.baseURL ? '' : '/api';
      const response = await axios.get(`${api.baseURL}${apiPrefix}/reviews/student/${studentId}`);
      
      // Filter for completed mentor reviews
      const completedReviews = response.data.filter(
        review => review.type === 'HUMAN' && review.status === 'COMPLETED'
      );
      setNotifications(completedReviews);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
          onClick={() => setShowModal(true)}
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

