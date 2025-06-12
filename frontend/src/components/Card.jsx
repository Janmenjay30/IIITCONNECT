import React from "react";
import { Link } from "react-router-dom";

// Replace these with your actual Badge and ApplicationIcon components if you have them
const Badge = ({ children, className }) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${className}`}>
    {children}
  </span>
);

const ApplicationIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="inline-block">
    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Card = ({ project, onViewApplications }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="p-6">
        {/* Title & Description */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{project.title}</h3>
          <p
            className="text-gray-600 mb-4 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {project.description}
          </p>
        </div>
        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag, idx) => (
              <Badge key={idx} className="bg-blue-50 text-blue-700 border border-blue-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {/* Roles */}
        {project.requiredRoles && project.requiredRoles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Roles Needed:</h4>
            <div className="flex flex-wrap gap-2">
              {project.requiredRoles.map((role, idx) => (
                <Badge key={idx} className="bg-indigo-100 text-indigo-800">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            tabIndex={0}
            aria-label="View Applications"
            onClick={() => onViewApplications(project._id)}
            className="
              relative inline-flex items-center gap-2 px-5 py-2.5
              bg-gradient-to-r from-blue-600 to-blue-800
              hover:from-blue-700 hover:to-blue-900
              text-white font-semibold rounded-lg shadow
              transition-transform duration-150 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-400
              active:scale-95 cursor-pointer
            "
            style={{ minWidth: 120 }}
          >
            <ApplicationIcon />
            <span>Applications</span>
            <span className="inline-flex items-center justify-center w-6 h-6 ml-1 text-xs font-semibold bg-blue-900 text-white rounded-full">
              {project.applications ? project.applications.length : 0}
            </span>
          </button>
          <Link
            to={`/projects/${project._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
