import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ActivationPage from './different pages/Activation and Login/ActivationPage';
import LoginPage from './different pages/Activation and Login/LoginPage';
import HomePage from './different pages/HomePage';
import ProfilePage from './different pages/Profile Pages/ProfilePage';
import PersonalProfilePage from './different pages/Profile Pages/PersonalProfilePage';
import ChatOverviewPage from './different pages/ChatOverviewPage';
import ChatPage from './different pages/ChatPage';
import ChatSuggestionPage from './different pages/ChatSuggestionPage';
import Search from './different pages/Search';
import ProtectedRoute from './Extra components/ProtectedRoute'; // Import the ProtectedRoute component
import {clarity} from "react-microsoft-clarity";

import AdminPage from "./different pages/Caretaker and Admin/AdminPage";
import Hangman from "./different pages/Hangman";
import EditableProfilePage from "./different pages/Profile Pages/EditableProfilePage";
import CaretakerProfilePage from "./different pages/Caretaker and Admin/CaretakerProfilePage";
import CaretakerEditableProfile from "./different pages/Caretaker and Admin/CaretakerEditableProfile";
import ClientOverview from "./different pages/Caretaker and Admin/ClientOverview";

clarity.init('p658v8svx1');


const App = () => {
    return (
        <Router>
            {/* Route definitions */}
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/activate" element={<ActivationPage/>}/>
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
                    path="/clientOverview"
                    element={
                        <ProtectedRoute allowedRoles={["caretaker, admin"]}>
                            <Search />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/caretakerProfile"
                    element={
                        <ProtectedRoute allowedRoles={["caretaker, admin"]}>
                            <Search />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/caretakerProfileEdit"
                    element={
                        <ProtectedRoute allowedRoles={["caretaker, admin"]}>
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
                            <AdminPage />
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
