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
import SupabaseTestPage from './different pages/SupabaseTestPage';
import ProtectedRoute from './different pages/ProtectedRoute'; // Import the ProtectedRoute component
import AdminPage from "./different pages/AdminPage";
import Hangman from "./different pages/Hangman";

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

                {/* Protected routes */}
                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <Search />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profileEdit"
                    element={
                        <ProtectedRoute>
                            <EditableProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profilePersonal"
                    element={
                        <ProtectedRoute>
                            <PersonalProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatOverview"
                    element={
                        <ProtectedRoute>
                            <ChatOverviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat/:chatroomId"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatSuggestion/:chatroomId"
                    element={
                        <ProtectedRoute>
                            <ChatSuggestionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/supabase"
                    element={
                        <ProtectedRoute>
                            <SupabaseTestPage />
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
