import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2, GraduationCap, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

const CareerBlueprint = () => {
  const options = [
    {
      id: 'industry',
      title: 'By Industry',
      description: 'Explore career paths based on various industries and discover roles that match your interests.',
      icon: Building2,
      link: '/students/career-blueprint/industry',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-500'
    },
    {
      id: 'education',
      title: 'By Education',
      description: 'Discover career options aligned with your educational background and specialization.',
      icon: GraduationCap,
      link: '/students/career-blueprint/education',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-500'
    },
    {
      id: 'role',
      title: 'By Role',
      description: 'Find out more about specific job roles, their requirements, and career progression paths.',
      icon: Briefcase,
      link: '/students/career-blueprint/role',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconColor: 'text-green-600',
      hoverBorder: 'hover:border-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Career Blueprint
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plan your career journey with personalized blueprints tailored to your interests, education, or desired role
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Link 
                to={option.link} 
                key={option.id}
                aria-label={`Explore career paths ${option.title.toLowerCase()}`}
                className="group"
              >
                <Card className={`cursor-pointer h-full border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${option.hoverBorder} bg-white overflow-hidden`}>
                  <div className={`h-2 bg-gradient-to-r ${option.gradient}`}></div>
                  <CardHeader className={`bg-gradient-to-br ${option.bgGradient} pb-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-3 rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow`}>
                        <Icon className={`w-6 h-6 ${option.iconColor}`} />
                      </div>
                      <ArrowRight className={`w-5 h-5 ${option.iconColor} opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {option.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {option.description}
                    </p>
                    <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${option.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                      Explore Now
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-lg shadow-md p-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How It Works</h3>
            <p className="text-gray-600 text-sm">
              Choose your preferred exploration method above. Our career blueprint system will guide you through 
              industries, educational paths, or specific roles to help you discover the perfect career match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerBlueprint;
