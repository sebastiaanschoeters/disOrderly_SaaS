import {Breadcrumb} from "antd";
import {useNavigate, useLocation} from "react-router-dom";

const BreadcrumbComponent = () => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(Boolean);
    console.log(pathnames);
    const navigate = useNavigate();

    const handleBreadcrumbClick = (to) => {
        navigate(to); // Navigate to the clicked breadcrumb's path
    };

    return (
        <Breadcrumb style={{position: "relative", left: 0, top: 0, fontSize: '2rem', marginBottom: 16, width: '100%' }}>
            <Breadcrumb.Item>
                <span onClick={() => handleBreadcrumbClick("/home")}>home</span>
            </Breadcrumb.Item>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                return (
                    <Breadcrumb.Item key={to}>
                        {index + 1 === pathnames.length ? (
                            value // Last item, no link
                        ) : (
                            <span onClick={() => handleBreadcrumbClick(to)}>{value}</span>
                        )}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
};
export default BreadcrumbComponent;