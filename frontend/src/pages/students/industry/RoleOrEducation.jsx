import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Briefcase, GraduationCap, ArrowRight, Building2 } from 'lucide-react';

const RoleOrEducation = () => {
  const { industryName } = useParams();

  const options = [
    {
      id: 'role',
      title: 'Continue by Role',
      description: `Explore various roles within the ${industryName} industry and discover career opportunities.`,
      icon: Briefcase,
      link: `/students/career-blueprint/industry/${industryName}/roles`,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconColor: 'text-green-600',
      hoverBorder: 'hover:border-green-500'
    },
    {
      id: 'education',
      title: 'Continue by Education',
      description: `Explore education paths and qualifications relevant to the ${industryName} industry.`,
      icon: GraduationCap,
      link: `/students/career-blueprint/industry/${industryName}/education`,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Continue your Career Blueprint
          </h1>
          <p className="text-gray-600 text-lg">
            Choose how you'd like to explore the <span className="font-semibold text-gray-800">{industryName}</span> industry
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Link 
                to={option.link} 
                key={option.id}
                aria-label={option.title}
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
      </div>
    </div>
  );
};

export default RoleOrEducation;
