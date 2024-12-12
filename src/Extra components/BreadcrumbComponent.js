import {Breadcrumb} from "antd";
import {useNavigate, useLocation} from "react-router-dom";

const routeLabels = {
    "/mensen_ontdekken": "mensen ontdekken",
    "/clienten_overzicht": "clienten overzicht",
    "/begeleider_profiel": "profiel",
    "/gebruiker_profiel": "profiel",
    "/persoonlijke_instellingen": "persoonlijke instellingen",
    "/chat_overzicht": "chats overzicht",
    "/chat_overzicht/chat": "chat",
    "/chat_overzicht/nieuwe_chat": "nieuwe chat",
};


const BreadcrumbComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const pathnames = location.pathname.split("/").filter(Boolean);

    const formatLabel = (path) =>
        routeLabels[path] || path.replace(/_/g, " ");

    const handleBreadcrumbClick = (to) => {
        navigate(to);
    };

    return (
        <Breadcrumb style={{position: "relative", left: 40, top: 0, fontSize: '1.5rem' , marginBottom: 16, width: '100vw', marginTop: 16 }}>
            <Breadcrumb.Item>
                <span onClick={() => handleBreadcrumbClick("/home")} style={{cursor: 'pointer'}}>home</span>
            </Breadcrumb.Item>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const label = formatLabel(to);

                return (
                    <Breadcrumb.Item key={to}>
                        {index + 1 === pathnames.length ? (
                            label // Last item, no link
                        ) : (
                            <span onClick={() => handleBreadcrumbClick(to)} style={{cursor: 'pointer'}}>{label}</span>
                        )}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
};
export default BreadcrumbComponent;