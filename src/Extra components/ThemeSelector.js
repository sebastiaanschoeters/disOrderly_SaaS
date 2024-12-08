import React from 'react';
import { Select, Switch } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import themes from './themes';

const ThemeSelector = ({ theme, isDarkMode, handleThemeChange, handleThemeToggle }) => {
    const themeOptions = Object.keys(themes)
        .filter((key) => !key.endsWith('_donker')) // Exclude dark themes
        .map((themeKey) => ({
            value: themeKey,
            label: themeKey.charAt(0).toUpperCase() + themeKey.slice(1), // Capitalize first letter
        }));

    return (
        <p style={{display: 'flex', alignItems: 'center', gap: '2%'}}>
            <strong style={{width: '15%', minWidth: '100px'}}>
                <BgColorsOutlined/> Kies een kleur:
            </strong>
            <div style={{display: 'flex', flexGrow: 1, alignItems: 'center'}}>
                <Select
                    style={{flexGrow: 1, marginRight: '10px'}}
                    placeholder="Selecteer een kleur"
                    options={themeOptions} // Use the dynamically generated options
                    value={theme} // Selected theme value
                    onChange={handleThemeChange} // Trigger theme change
                />
                <Switch
                    checked={isDarkMode}
                    onChange={handleThemeToggle} // Trigger dark mode toggle
                    checkedChildren={<span>Donker</span>}
                    unCheckedChildren={<span>Licht</span>}
                    style={{marginLeft: 'auto'}}
                />
            </div>
        </p>
    );
};

export default ThemeSelector;
