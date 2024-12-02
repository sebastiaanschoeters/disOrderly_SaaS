import { useState, useEffect } from 'react';
import themes from "../Extra components/themes";

const useTheme = (initialThemeName = 'blauw', initialDarkModeFlag = false) => {
    const [themeColors, setThemeColors] = useState(
        initialDarkModeFlag ? themes[`${initialThemeName}_donker`] || themes.blauw_donker : themes[initialThemeName] || themes.blauw
    );
    const [themeName, setThemeName] = useState(initialThemeName);
    const [darkModeFlag, setDarkModeFlag] = useState(initialDarkModeFlag);

    useEffect(() => {
        if (darkModeFlag) {
            setThemeColors(themes[`${themeName}_donker`] || themes.blauw_donker);
        } else {
            setThemeColors(themes[themeName] || themes.blauw);
        }
    }, [themeName, darkModeFlag]);

    return {
        themeColors,
        themeName,
        darkModeFlag,
        setThemeName,
        setDarkModeFlag,
    };
};

export default useTheme;
