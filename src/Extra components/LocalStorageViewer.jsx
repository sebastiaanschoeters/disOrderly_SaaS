import React, { useState, useEffect } from 'react';

const LocalStorageViewer = () => {
    const [localStorageItems, setLocalStorageItems] = useState([]);

    useEffect(() => {
        const items = Object.keys(localStorage).map(key => ({
            key: key,
            value: localStorage.getItem(key)
        }));

        setLocalStorageItems(items);
    }, []);

    return (
        <div style={{
            padding: '20px',
            border: '1px solid black',
            maxHeight: '300px',
            overflowY: 'auto'
        }}>
            <h2>Local Storage Contents</h2>
            {localStorageItems.length === 0 ? (
                <p>No items in localStorage</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Key</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {localStorageItems.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.key}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', wordBreak: 'break-all' }}>
                                {item.value}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LocalStorageViewer;