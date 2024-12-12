import React, { useState } from "react";
import { Button, Modal } from "antd";
import ProfileCard from '../Profile Pages/ProfilePage';
import ContactsOverview from "./ClientContacts";
import {useNavigate} from "react-router-dom";
import {getUserEmailById} from "../../Api/Utils";
import {storeUserSession} from "../../Utils/sessionHelpers";

const ClientDetailsModal = ({ visible, onClose, clientData }) => {
    const [isViewingContactList, setIsViewingContactList] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();

    if (!clientData) return null;

    const handleToggleView = () => {
        setIsViewingContactList((prevState) => !prevState);
    };

    const logInAs = async (clientId) => {
        localStorage.setItem('controlling', true);
        const email = await getUserEmailById(clientId);
        const LoginResponse = {
            token: 'fake-session-token',
            user: { email },
        };
        localStorage.setItem('sessionToken', LoginResponse.token);
        localStorage.setItem('userEmail', LoginResponse.user.email);

        storeUserSession(clientId, 'user', setIsTransitioning, navigate);
    };

    const renderContentByAccessLevel = (accessLevel) => {
        switch (accessLevel) {
            case "Volledige toegang":
                return (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ marginRight: '20px' }}>{clientData.client_info.name || "Client Information"}</h2>
                            <Button
                                type="default"
                                onClick={()=>logInAs(clientData.id)}
                            >
                                Log in als {clientData.client_info.name}
                            </Button>
                        </div>
                        <Button
                            type="primary"
                            onClick={handleToggleView}
                            style={{ marginBottom: '20px' }}
                        >
                            {isViewingContactList ? "Bekijk Profiel" : "Bekijk Contacten"}
                        </Button>
                        {isViewingContactList ? (
                            <ContactsOverview id={clientData.id} />
                        ) : (
                            <ProfileCard user_id={clientData.id} viewedByCareteaker={true} />
                        )}
                    </>
                );
            case "Gesprekken":
                return (
                    <>
                        <h2 style={{marginRight: '10px'}}>{clientData.client_info.name || "Client Information"}</h2>
                        <Button
                            type="primary"
                            onClick={handleToggleView}
                            style={{marginBottom: '20px'}}
                        >
                            {isViewingContactList ? "Bekijk Profiel" : "Bekijk Contacten"}
                        </Button>
                        {isViewingContactList ? (
                            <ContactsOverview id={clientData.id} conversations={true}/>
                        ) : (
                            <ProfileCard user_id={clientData.id} viewedByCareteaker={true}/>
                        )}
                    </>
                );
            case "Contacten":
                return (
                    <>
                        <h2 style={{marginRight: '10px'}}>{clientData.client_info.name || "Client Information"}</h2>
                        <Button
                            type="primary"
                            onClick={handleToggleView}
                            style={{marginBottom: '20px'}}
                        >
                            {isViewingContactList ? "Bekijk Profiel" : "Bekijk Contacten"}
                        </Button>
                        {isViewingContactList ? (
                            <ContactsOverview id={clientData.id}/>
                        ) : (
                            <ProfileCard user_id={clientData.id} viewedByCareteaker={true}/>
                        )}
                    </>
                );
            case "Publiek profiel":
                return (
                    <>
                        <h2 style={{marginRight: '10px'}}>{clientData.client_info.name || "Client Information"}</h2>
                        <ProfileCard user_id={clientData.id} viewedByCareteaker={true}/>
                    </>
                );
            default:
                return <p>Informatie van deze client is niet beschikbaar.</p>;
        }
    };

    return (
        <Modal
            title=""
            open={visible}
            onCancel={onClose}
            footer={null}
            width='90%'
        >
            <div>
                {renderContentByAccessLevel(clientData.access_level)}
            </div>
        </Modal>
    );
};

export default ClientDetailsModal;
