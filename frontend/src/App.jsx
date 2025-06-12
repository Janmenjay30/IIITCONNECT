import { Toaster } from "react-hot-toast"; // Import Toaster from react-hot-toast
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CreateProjectPage from "./components/CreateProjectPage";
import HomePage from "./components/Homepage";
import LoginPage from "./components/Login";
import Profile from "./components/Profile";
import ProjectDetails from "./components/ProjectDetails";
import RegisterPage from "./components/Register";
import YourProjects from "./components/YourProjects"
import ChatPage from "./components/ChatPage";

function App() {
  return (
    <>
      
      <Toaster 
        position="top-right" // Optional: Set default position for toasts
        toastOptions={{
          duration: 3000, // Optional: Set default duration for toasts
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/your-projects" element={<YourProjects/>}/>
          <Route path="/chat" element={<ChatPage/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
