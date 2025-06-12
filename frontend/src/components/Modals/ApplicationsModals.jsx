import React from "react";

const ApplicationModal = ({ isOpen, onClose, applications, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative border border-blue-100">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold transition"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-extrabold mb-6 text-blue-700 tracking-tight text-center">
          Applications
        </h2>
        {loading ? (
          <div className="text-center py-12 text-lg font-medium text-blue-600">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : applications.length === 0 ? (
          <div className="text-gray-400 text-center text-lg">No applications yet.</div>
        ) : (
          <ul className="space-y-6 max-h-[32rem] overflow-y-auto pr-2">
            {applications.map((app) => (
              <li key={app._id} className="border-b pb-4 last:border-b-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xl font-semibold text-gray-900">
                      {app.name}
                      <span className="ml-2 text-base font-normal text-gray-500">
                        ({app.email})
                      </span>
                    </div>
                    <div className="mt-1 text-blue-700 font-medium text-sm">
                      Expertise: <span className="font-semibold">{app.areaOfExpertise}</span>
                    </div>
                    <div className="mt-1 text-gray-700 text-sm">
                      Skills:{" "}
                      <span className="font-semibold">
                        {Array.isArray(app.skills)
                          ? app.skills.join(", ")
                          : app.skills
                          ? app.skills
                          : "N/A"}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-700 text-sm">
                      Availability:{" "}
                      <span className="font-semibold">{app.availability}</span>
                    </div>
                  </div>
                  {app.github && (
                    <a
                      href={app.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 md:mt-0 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md font-medium hover:bg-blue-100 transition text-sm"
                    >
                      GitHub Profile
                    </a>
                  )}
                </div>
                <div className="mt-3 text-gray-800 text-base leading-relaxed">
                  {app.description}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal;
