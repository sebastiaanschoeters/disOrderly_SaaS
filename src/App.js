// App.js
import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
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
        <div style={{padding: '10px'}}>
            <label htmlFor="theme-select">Choose a theme: </label>
            <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
            >
                {Object.keys(themes).map((themeKey) => (
                    <option key={themeKey} value={themeKey}>
                        {themeKey === "default"
                            ? "Standaard"
                            : themeKey.replace(/_/g, ' ').charAt(0).toUpperCase() + themeKey.replace(/_/g, ' ').slice(1)}
                    </option>
                ))}
            </select>

            <LoginPage/>
        </div>
    );
};

export default App;
