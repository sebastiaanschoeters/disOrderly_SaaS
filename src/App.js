import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ActivationPage from './different pages/ActivationPage';
import LoginPage from './different pages/LoginPage';
import HomePage from './different pages/HomePage';
import ProfilePage from './different pages/ProfilePage';
import PersonalProfilePage from './different pages/PersonalProfilePage';
import ChatOverviewPage from './different pages/ChatOverviewPage';
import ChatPage from './different pages/ChatPage';
import ChatSuggestionPage from './different pages/ChatSuggestionPage';
import Search from './different pages/Search';
import ProtectedRoute from './Extra components/ProtectedRoute'; // Import the ProtectedRoute component
import AdminPage from "./different pages/AdminPage";
import Hangman from "./different pages/Hangman";
import EditableProfilePage from "./different pages/EditableProfilePage";
import CaretakerProfilePage from "./different pages/CaretakerProfilePage";
import CaretakerEditableProfile from "./different pages/CaretakerEditableProfile";
import ClientOverview from "./different pages/ClientOverview";

const App = () => {
    return (
        <Router>
            {/* Route definitions */}
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/activate" element={<ActivationPage />} />
                <Route path="/activate/:activationCodeLink" element={<ActivationPage />} />
                <Route path="/hangman" element={<Hangman />} />
                <Route path="/caretakerProfile" element={<CaretakerProfilePage />} />
                <Route path="/caretakerProfileEdit" element={<CaretakerEditableProfile />} />
                <Route path="/clientOverview" element={<ClientOverview />} />

                {/* Protected routes */}
                <Route
                    path="/search"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <Search />
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
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profileEdit"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <EditableProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profilePersonal"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <PersonalProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatOverview"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <ChatOverviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatSuggestion"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <ChatSuggestionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
