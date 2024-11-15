// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ActivationPage from './different pages/ActivationPage';
import LoginPage from './different pages/LoginPage';
import HomePage from './different pages/HomePage';
import themes from './themes';
import ProfilePage from "./different pages/ProfilePage";
import EditableProfilePage from "./different pages/EditableProfilePage";
import PersonalProfilePage from "./different pages/PersonalProfilePage"; // Import themes
import ChatOverviewPage from './different pages/ChatOverviewPage'; // Import your Chat Overview Page
import ChatPage from './different pages/ChatPage';
import ChatSuggestionPage from './different pages/ChatSuggestionPage'; // Import your Chat Page
import Search from "./different pages/Search";

import SupabaseTestPage from "./different pages/SupabaseTestPage";
import CaretakerProfilePage from "./different pages/CaretakerProfilePage";
import AdminPage from "./different pages/AdminPage";

const App = () => {
    return (
        <Router>
            {/* Route definitions */}
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/" element={<ActivationPage />} />
                <Route path="/search" element={<Search />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/activate" element={<ActivationPage />} />
                <Route path="/activate/:activationCodeLink" element={<ActivationPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profileEdit" element={<EditableProfilePage />} />
                <Route path="/profilePersonal" element={<PersonalProfilePage />} />
                <Route path="/chatOverview" element={<ChatOverviewPage />} />
                <Route path="/chat/:name" element={<ChatPage />} />
                <Route path="/chatSuggestion/:name" element={<ChatSuggestionPage />} />
                <Route path="/supabase" element={<SupabaseTestPage />} />
                <Route path="/profileCaretaker" element={<CaretakerProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </Router>
    );
};

export default App;

