// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ActivationPage from './different pages/ActivationPage';
import LoginPage from './different pages/LoginPage';
import HomePage from './different pages/HomePage';
import themes from './themes';
import ProfilePage from "./different pages/ProfilePage";
import EditableProfilePage from "./different pages/EditableProfilePage";
import PersonalProfilePage from "./different pages/PersonalProfilePage";
import ChatOverviewPage from './different pages/ChatOverviewPage';
import ChatPage from './different pages/ChatPage';
import ChatSuggestionPage from './different pages/ChatSuggestionPage';
import Search from "./different pages/Search";
import Hangman from "./different pages/Hangman";
import SupabaseTestPage from "./different pages/SupabaseTestPage";

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
                <Route path="/chat/:chatroomId" element={<ChatPage />} />
                <Route path="/chatSuggestion/:chatroomId" element={<ChatSuggestionPage />} />
                <Route path="/supabase" element={<SupabaseTestPage />} />
                <Route path="/hangman" element={<Hangman />} />
            </Routes>
        </Router>
    );
};

export default App;

