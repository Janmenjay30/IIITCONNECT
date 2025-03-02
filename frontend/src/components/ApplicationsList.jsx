import React from 'react'

function ApplicationsList() {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Project Applications</h3>
                    <div className="mt-2 px-7 py-3">
                        {applications.length === 0 ? (
                            <p>No applications yet</p>
                        ) : (
                            applications.map((app) => (
                                <div key={app._id} className="border-b py-2">
                                    <p className="font-bold">{app.name}</p>
                                    <p>{app.email}</p>
                                    <p>Expertise: {app.areaOfExpertise}</p>
                                    <p>Skills: {app.skills}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="items-center px-4 py-3">
                        <button
                            onClick={() => setShowApplications(false)}
                            className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default ApplicationsList
