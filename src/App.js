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

const App = () => {
    return (
        <Router>
            {/* Route definitions */}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/activate" element={<ActivationPage />} />
                <Route path="/activate/:activationCode" element={<ActivationPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profileEdit" element={<EditableProfilePage />} />
                <Route path="/profilePersonal" element={<PersonalProfilePage />} />
            </Routes>
        </Router>
    );
};

export default App;

