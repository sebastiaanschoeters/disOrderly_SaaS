// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ActivationPage from './different pages/ActivationPage';
import LoginPage from './different pages/LoginPage';
import themes from './themes'; // Import themes

const App = () => {
    const [theme, setTheme] = useState('default');

    // Apply the selected theme colors
    useEffect(() => {
        const selectedTheme = themes[theme];
        document.documentElement.style.setProperty('--color1', selectedTheme.color1);
        document.documentElement.style.setProperty('--color2', selectedTheme.color2);
        document.documentElement.style.setProperty('--text-color', selectedTheme.textColor);
    }, [theme]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/activate" element={<ActivationPage />} />
                <Route path="/activate/:activationCode" element={<ActivationPage />} />
            </Routes>
        </Router>
    );
};

export default App;

