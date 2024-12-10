import React from 'react';
import { Result, Button } from 'antd';

const NotFoundPage = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f7f7f7' }}>
            <Result
                status="404"
                title="404"
                subTitle="Sorry, de pagina die je zoekt bestaat niet (meer)."
                extra={<Button type="primary" href="/">Login</Button>}
            />
        </div>
    );
};

export default NotFoundPage;
