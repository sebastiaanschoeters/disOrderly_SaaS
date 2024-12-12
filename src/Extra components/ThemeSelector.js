import React from 'react';
import { Select, Switch } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import themes from './themes';

const ThemeSelector = ({ theme, isDarkMode, handleThemeChange, handleThemeToggle }) => {
    const themeOptions = Object.keys(themes)
        .filter((key) => !key.endsWith('_donker'))
        .map((themeKey) => ({
            value: themeKey,
            label: themeKey.charAt(0).toUpperCase() + themeKey.slice(1),
        }));

    return (
        <p style={{width: '100%'}}>
            <strong style={{display: 'block', marginBottom: '10px'}}>
                <BgColorsOutlined/> Kies een kleur
            </strong>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Select
                    style={{flexGrow: 1}}
                    placeholder="Selecteer een kleur"
                    options={themeOptions}
                    value={theme} $
                    onChange={handleThemeChange}
                    dropdownRender={(menu) => (
                        <div
                            onWheel={(e) => e.stopPropagation()}
                            style={{maxHeight: 300}}
                        >
                            {menu}
                        </div>
                    )}
                />
                <Switch
                    checked={isDarkMode}
                    onChange={handleThemeToggle}
                    checkedChildren={<span>Donker</span>}
                    unCheckedChildren={<span>Licht</span>}
                    style={{marginLeft: 'auto'}}
                />
            </div>
        </p>

    );
};

export default ThemeSelector;
