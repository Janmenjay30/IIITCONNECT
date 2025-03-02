import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {toast} from "react-hot-toast";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import API_URL from '../config';

function ProjectDetails() {
    const [project, setProject] = useState({
        requiredRoles: [],
        tags: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { projectId } = useParams();
    const [isPopUp, setIsPopUp] = useState(false);
    const [applicationData, setApplicationData] = useState({
        name: '',
        email: '',
        github: '',
        areaOfExpertise: '',
        description: '',
        skills: '',
        availability: '',
    });
    

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
    
        // console.log('Submitting application data:', applicationData); // Log the data before sending
    
        try {
            const response = await axios.post(`${API_URL}/api/projects/${projectId}/applicants`, applicationData);
            console.log(response.data);
            
            // Clear form fields and close popup
            setApplicationData({
                name: '',
                email: '',
                github: '',
                areaOfExpertise: '',
                description: '',
                skills: '',
                availability: '',
            });
            toast.success("Your application has been submitted successfully!");
            setIsPopUp(false);
            
        } catch (error) {
            console.error('Error submitting application:', error);
        }
    };
    

    const handleChange = (event) => {
        const { name, value } = event.target;
        setApplicationData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
                // console.log("response is ", response);
                setProject(response.data);
            } catch (error) {
                setError("Failed to load project");
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    useEffect(() => {
        if (isPopUp) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [isPopUp]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        

        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 mt-10 bg-white rounded shadow-md">
            <Link
                to="/"
                className="absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                
            </Link>
            <div className="flex flex-col md:flex-row justify-between mb-4">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">{project.title}</h1>
                <p className="text-gray-600">Created by: {project.creator && project.creator.name}</p>
            </div>

            <p className="text-lg mb-4">{project.description}</p>

            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Required Roles:</h2>
                {project.requiredRoles && project.requiredRoles.length > 0 ? (
                    <ul>
                        {project.requiredRoles.map((role, index) => (
                            <li key={index} className="bg-gray-100 p-2 mb-2 rounded">{role}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No roles specified.</p>
                )}
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Tags:</h2>
                {project.tags && project.tags.length > 0 ? (
                    <ul>
                        {project.tags.map((tag, index) => (
                            <li key={index} className="bg-gray-100 p-2 mb-2 rounded">{tag}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No tags specified.</p>
                )}
            </div>

            <div className='flex justify-between items-center'>
                <p className="text-gray-600">Created at: {new Date(project.createdAt).toLocaleString()}</p>
                <button
                    onClick={() => setIsPopUp(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition duration-300"
                >
                    Apply
                </button>
            </div>

            {
    isPopUp && (
        <div className='w-[90vw] h-[90vh] bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg p-8 flex flex-col'>
            <h1 className='text-3xl font-bold mb-4 text-center'>Apply to Contribute to Project</h1>
            <div className='overflow-y-auto max-h-[70vh] px-2'>
            <form onSubmit={handleSubmit} className='flex flex-col'>
    <div className='flex flex-col mb-4'>
        <label className='text-lg font-medium mb-2'>Full Name</label>
        <input 
            type="text" 
            name="name"
            value={applicationData.name} 
            onChange={handleChange} 
            className='border-2 border-gray-400 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-500'
        />
    </div>
    <div className='flex flex-col mb-4'>
        <label className='text-lg font-medium mb-2'>Email</label>
        <input 
            type="email" 
            name="email"
            value={applicationData.email} 
            onChange={handleChange} 
            className='border-2 border-gray-400 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-500'
        />
    </div>
    <div className='flex flex-col mb-4'>
        <label className='text-lg font-medium mb-2'>GitHub Profile (if applicable)</label>
        <input 
            type="text" 
            name="github"
            value={applicationData.github} 
            onChange={handleChange} 
            className='border-2 border-gray-400 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-500'
        />
    </div>
    <div className='flex flex-col mb-4'>
        <label className='text-lg font-medium mb-2'>Area of Expertise</label>
        <input 
            type="text" 
            name="areaOfExpertise" // Fixed from 'expertise' to 'areaOfExpertise'
            value={applicationData.areaOfExpertise} 
            onChange={handleChange} 
            className='border-2 border-gray-400 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-500'
        />
    </div>
    <div className='flex flex-col mb-4'>
        <label className='text-lg font-medium mb-2'>Brief Description</label>
        <textarea 
            name="description"
            value={applicationData.description} 
            onChange={handleChange} 
            rows={4} 
            className='border-2 border-gray-400 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-500'
        />
    </div>
    <div className='flex flex-col mb-4'>
        <label className='text-lg font-medium mb-2'>Relevant Skills</label>
        <input 
            type="text" 
            name="skills"
            value={applicationData.skills} 
            onChange={handleChange} 
            className='border-2 border-gray-400 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-500'
        />
    </div>
    <div className='flex flex-col mb-4'>
        <label className='text-lg font-medium mb-2'>Availability (hours per week)</label>
        <input 
            type="number" 
            name="availability"
            value={applicationData.availability} 
            onChange={handleChange} 
            className='border-2 border-gray-400 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-500'
        />
    </div>
    <button type="submit" className='bg-blue-500 text-white font-bold p-2 rounded-lg w-full mb-2'>
        Submit Application
    </button>
</form>

            </div>
            <button onClick={() => setIsPopUp(false)} className='text-red-500 font-bold mt-4 self-center'>Close</button>
        </div>
    )
}

        </div>
    );
}

export default ProjectDetails;
