import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ActivationPage from './different pages/Activation and Login/ActivationPage';
import LoginPage from './different pages/Activation and Login/LoginPage';
import NotFoundPage from './different pages/Activation and Login/NotFoundPage';
import HomePage from './different pages/HomePage'
import PersonalProfilePage from './different pages/Profile Pages/PersonalProfilePage';
import ChatOverviewPage from './different pages/Chats Pages/ChatOverviewPage';
import ChatPage from './different pages/Chats Pages/ChatPage';
import ChatSuggestionPage from './different pages/Chats Pages/ChatSuggestionPage';
import Search from './different pages/Search';
import ProtectedRoute from './Extra components/ProtectedRoute'; // Import the ProtectedRoute component
import {clarity} from "react-microsoft-clarity";
import AdminPage from "./different pages/Caretaker and Admin/AdminPage";
import EditableProfilePage from "./different pages/Profile Pages/EditableProfilePage";
import CaretakerEditableProfile from "./different pages/Caretaker and Admin/CaretakerEditableProfile";
import ClientOverview from "./different pages/Caretaker and Admin/ClientOverview";
import OrganisationDashboard from "./different pages/Caretaker and Admin/OrganisationDashboard";

clarity.init('p658v8svx1');

const App = () => {
    return (
        <Router>
            {/* Route definitions */}
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/activatie" element={<ActivationPage/>}/>
                <Route path="/activatie/:activationCodeLink" element={<ActivationPage />} />

                {/* Protected routes */}
                <Route
                    path="/mensen_ontdekken"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <Search />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clienten_overzicht"
                    element={
                        <ProtectedRoute allowedRoles={["caretaker", "admin"]}>
                            <ClientOverview />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/begeleider_profiel"
                    element={
                        <ProtectedRoute allowedRoles={["caretaker", "admin"]}>
                            <CaretakerEditableProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/gebruiker_profiel"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <EditableProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/persoonlijke_instellingen"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <PersonalProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat_overzicht"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <ChatOverviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat_overzicht/chat"
                    element={
                        <ProtectedRoute allowedRoles={["caretaker", "user"]}>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat_overzicht/nieuwe_chat"
                    element={
                        <ProtectedRoute allowedRoles={["user", "caretaker"]}>
                            <ChatSuggestionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organisatie_dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["responsible"]}>
                            <OrganisationDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all route for invalid paths */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default App;
