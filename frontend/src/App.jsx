import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./components/Homepage";
import ProjectDetails from "./components/ProjectDetails";
import YourProjects from "./components/YourProjects";
import Profile from "./components/Profile";
import ChatPage from "./components/ChatPage";
import LoginPage from "./components/Login";
import CreateProjectPage from "./components/CreateProjectPage";
import RegisterPage from "./components/Register";
import ShowUser from "./testing/ShowUser";
import { Toaster } from "react-hot-toast";
import TeamManagementPage from "./components/TeamManagementPage";
import MyTeamsDashboard from "./components/MyTeamsDashboard";
import ChatHub from "./components/ChatHub"; // Import ChatHub component
import ChatContainer from "./components/ChatContainer";


const App = () => {
  return (
    <Router>
      <Layout>
        <Toaster />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/your-projects" element={<YourProjects />} />
          <Route path="/profile" element={<Profile />} />
        
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/showUser" element={<ShowUser/>}/>
          <Route path="/projects/:projectId/team" element={<TeamManagementPage />} />
          <Route path="/my-teams" element={<MyTeamsDashboard />} />
          <Route path="/chat" element={<ChatHub />} />
          <Route path="/chat-room" element={<ChatPage />} />
          <Route path="/chat" element={<ChatContainer />} />
        </Routes>



        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </Layout>
    </Router>
  );
};

export default App;