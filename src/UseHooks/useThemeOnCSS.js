import { useEffect } from 'react';

const useThemeOnCSS = (themeColors) => {
    useEffect(() => {
        const applyThemeToCSS = (themeColors) => {
            const root = document.documentElement;
            Object.entries(themeColors).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value);
            });
        };

        applyThemeToCSS(themeColors);
    }, [themeColors]);
};

export default useThemeOnCSS;
