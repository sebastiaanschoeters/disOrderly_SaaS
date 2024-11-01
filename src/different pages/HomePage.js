import React, { useEffect } from 'react';
import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/Ant design overide.css'

const HomePage = () => {
return (

    <div className="container--0-" data-testid="HomePage">
        <svg
            width="960"
            height="520"
            viewBox="0 0 960 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="960" height="520" fill="#90E0EF"></rect>
        </svg>
        <h1> "Hello" </h1>
        <div className="container-0-1-1">
            <div className="container-1-2-0">
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="200" height="200" rx="15.5" fill="#00B4D8"></rect>
                </svg
                >
                <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAQAAABpN6lAAAAJw0lEQVR42u2dXYxV1RXHf+fsMzgzQpRQxpBKMUFBoE21tA+lkSbwoFBBNFrKR21TQqU8FwMxQh+MDwgSEgvtg8ZYQEKsLUz9SJuCZIyh+FBQq2bUFsLADB2+lIw492Ouyc7OSuasey8ZZvbZM8xZOzmcc+cMa63/+tz7nrOHnHLKKaeccsopp5xyyimnnHLyQhExCYYI0GTkZ9chxRj6UwNNjGUcY2nmBiJ1d3Q9qj6BuaxhC/to40M6OM8lLtDFJxyllR2sYxG3yf0RhpFJSoEm5vEUh7hA5arjCu/xR5YzSQIjHtnKz+U5/kdFRpECRUqU7ehz/5Yo2c/75L5L/JUV3ARAPMJAcMqP4zHeder0UbBK91kV7bHfkM8tJAVK7vMOnmE6wIjJCs5WY1nHSadaEVG8jutrKIoOhq94gRkC7Iiw/Srn9EVKzqq1Va8PQ5mive5lOxNdIR3mtp9Nm1O+rNx9oMOB50DoYpWAPGxtv5GyU75Sy/LX6AsFe/U3bh2eECTAZN5ytr9qonN5v+iGS4/y86oguHA4x2IAouHm/PPopkIhpYSO6GIdryiqhFndD34nXAlPERGwiopVv6JFl5xeRpodTnGE19nHbvayn8O084X8Xl+1/CFXJXvcrSAIqv56KlY0EVm7rh3dHGADC5hCY8qFG5jIHNbwPO3u3hIlBYI9d0nxHzQCcXgAYJNzbxEWrfxl9vIwEzR8KpbHMIfNfCYgVNL/r4RCG02hIYid9cuivrKU7eY2MkVUToiJak2VRZ1mlvGOywsKWgm3Q5iQECTAKrG+sr213kWe4GZkijvA+eMSjjkQKpqDheDVcBXBAPOtOEp9EfllJl9zH28cGL+lB11aJRDYCsRhnH8y3ZL6dIReYKnzk2hQIMN03lZh5jhZ7r8M1Rodtm6ohLLWP8KUIZrGJgA8i64zNtBsUZ2VtRcYYKOor22yFwMkQ8gNVmsIJNiOEmXt/rOlW9Pq/17EHtrllSX0CQTpZLgx6zBoc9iLKHYURf3YS81ZJEk3HQaF7MLAuOJXrGqJlz2WpQRYKdzSYdCaTTmMgHGc0HZwqS8GYq/gbxLwhbvrRBYAJgv7r7MiaDc8z5QsRGC/5m8zQ1tW9j9pFe5nASvAUiDJIAG3cAYLuZLgJ4Dxbf81Fn9divZklIQS4KfW5lqGN7LIA++qUlS2Pf/kbABwXA7oNGyPdwOxT8Y/tmw09k8ACWQGwHfTLZErwlsA4zMAnusfAC4WO7gZiDLtRF+sKsl/acIjNdv1/rLCPes+LAa+R6VqMbwXMN4WPtMBYM8u861M7Y/j9poLPztkFrrNFwAGeAq37iuj6Lq/OMBqxDJVC0pUOO5TlrewFSDldA8DJsBa5Hi6VEBW6GUaEPlgOIGLwkYKIN1MAKIgSzJ70kFgzbMSMD7YzbVM0gGwP4j6kACrsUGQygKbfQCQSA8o7FwF2AAkgRbkv20lSEvU6ivpbKFCQX3tsSDgwnQjdl6SCsqPafCD9z7lARWuMAWICEVvqiCo8LmvrNSGMJPO6xSNhCID7FReaVeHfADQwIdOaTtcQTwS0PoJ8GT/zsSdzfURlk10oAF4DYICsDYdlvb8fh91YCznEQCkCO4DooAh8Gg6B1gJH/EBwDguobuA3YEBWE6FsgLgZ3484CLaA/YGBmBlVQ9Y6gOAZtd56z6QgACsrgrAAz4AuIFP0EnwcOAk+Hi6CtjzeT6qQMRRdB/QTkNQD9iK7gNKvlYGW9Fd1xdMDJYFIuAVdHfaw6Shl8kAO9Bo9zEn4FzA8AF6LnCSRj/xtq7qbHBNwNngZHqQ0izrAQd9xdsiyyLdCTwfyAMM8FD/LsB56A7A+MD7Nq6gV4TaGRMsBW6zKqd9cq0vnzS81z/iHBg/CuQDCf+x8qQfo/y+H3li4A8qDRZlCSpbioF7rARpjzxBk++FaP1tTDMZk1SlospJL/nyxwiYZCdE+ovx5YDJuALcwrl0AFhZVgDGH9u/YHFONcTvBGiCN1hJ0gFwnhYg8ud2K6zK2gceBEymX4qcTtvfGmaX74R8E3ZdSD2echyTqf2f1s8HWDju82sIAzxT4wmRdUCSUf6fRS9SARAz8G8i/8yn8VXVB1a/ZHpmYXBQ299e/xow/iF4Ic3eXb8NQOTd/dfXeErtU5qzccAZaQcUCJ4FjGf15zue2gBrsvFAA2ynQkE9J1x2Tph4VH8q57DxrtLwMUx2RWgiXdWf2XUFMfGkfgvt4v7ifQ76hdkVYgP8SmpB2hJ9LAaMF/Xf14/ou0/+BMTZtqKt6TAQCCr8HIB4iJ2/3XHUoHfq/s9/Kvwm3WJzDcEmEXwoeMF8zin1hSdLAJP9bGwxVgAFQdkeD9Ay6JdmIhJwhU9iX03Ht0OIRRl5dF1D4ATrZKm7Mx6E8jP5Z/X3UqXyfMTtQEIQ2qUd050V7fEAdzl1DNGAd54Zz9P01n4fXYA5xdQAEDiF/u4gqPXqZJkXmS2KJXVhiDASyy2s57RAqdRPtWCnwnhBDDTSJkuTVV9ztuN1ljE+tWtUgrEjvYNUwj3soLvuXgT6HdKOcBA0cQiBoA4IZ9nDar5DI9XJcCsPsY0PqFR9a1h6TnfUENwRCgLDn200VhHYjSIlUeskb7KTJ1nLoyxnJat5nK28wvv06B0ENKACzLCCALYi8Vpr/wiBofYoU6i3h4R8N1mqAcFppoWD4BdcsWKU6+8gYpNjQfaTKsmVVVyprjfQ2M5HSFeg0uGZMBBEbqXmXzVTl1ZHxtXvlgDr4kFgKqcs1LUgmB4AAscyYiO9rgRWUWuQ2ynt4hZgzDCFQEJhFgdcPBdFhWvfRKnklD/OQulAk6tC0MmdASAQAeE+2pBiJsoM2O5ujeFTfoMBYiIQb7udjmEJgYi5kDfok9xeQiK+vuKpenGMx2gGgZYBQDAjFASIsHexhc+Qvl2yvRpSHYpy93l2sYAIrTwCwR2crlMRukJCgLS3TdzLNo7Rqyxexg5V8U/wEitpSYE5AiGAGCNn01jBZlr5mM8pqDldDyc5yE7W8gOa1G/Xg2AaZ+pAcJaZQEJQMhgQamACs5jL/TzCMpbyAPO4m0k01thXdvAQzAIMoUkmu/WhSogRGiII/s9MIGbYUEREjJERExMNsgWbTqdAoOcIJ7J9njFMF3pnTQh61WvV1y0EXRqCAE+zBYRghkCg33AeD0SjDgLxgE5uZBRQAszkrDTI/fedi0YXBL3Yrbtd0/VDIIbRA8EJKshgFRAzasgA32AL7Vymk1eZA0SMHhJrj2E8N8r1KKMII2cxo5ai/A+75JRTTjnllFNOOeWUU0451aWvAdcS8VcfxjyVAAAAAElFTkSuQmCC"
                />
                <div className="text-2-3-2">Zoeken</div>
            </div>
        </div>
        <div className="container-0-1-2">
            <div className="container-1-2-0">
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="200" height="200" rx="15.5" fill="#00B4D8"></rect>
                </svg
                >
                <img
                    src="data:image/png;base64,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"
                />
                <div className="text-2-3-2">Profiel</div>
            </div>
        </div>
        <div className="container-0-1-3">
            <div className="container-1-2-0">
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="200" height="200" rx="15.5" fill="#00B4D8"></rect>
                </svg
                >
                <img
                    src="data:image/png;base64,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"
                />
                <div className="text-2-3-2">Chats</div>
            </div>
        </div>
        <div className="container-0-1-4">
            <div className="container-1-2-0">
                <svg
                    width="750"
                    height="62"
                    viewBox="0 0 750 62"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="750" height="61.0169" rx="15.5" fill="#00B4D8"></rect>
                </svg>
                <div className="text-2-3-1">Uitloggen</div>
            </div>
        </div>
    </div>
);
};

export default HomePage;