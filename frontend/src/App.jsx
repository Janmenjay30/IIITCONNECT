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
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/showUser" element={<ShowUser/>}/>
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;