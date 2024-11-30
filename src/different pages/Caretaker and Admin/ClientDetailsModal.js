import React, { useState } from "react";
import { Button, Modal } from "antd";
import ProfileCard from '../Profile Pages/ProfilePage';
import ContactsOverview from "./ClientContacts";
import {createClient} from "@supabase/supabase-js";
import {useNavigate} from "react-router-dom";
import {getName, getPfp, getTheme, getUserEmailById} from "../../Api/apiUtils";

const ClientDetailsModal = ({ visible, onClose, clientData }) => {
    const [isViewingContactList, setIsViewingContactList] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");
    const navigate = useNavigate();

    if (!clientData) return null; // Guard for no data
    console.log(clientData);

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


        // Save user session to localStorage
        localStorage.setItem('sessionToken', LoginResponse.token);
        localStorage.setItem('userEmail', LoginResponse.user.email);

        const theme = await getTheme(clientId);
        const name = await getName(clientId);
        const pfp = await getPfp(clientId);
        localStorage.setItem('userType', 'user');

        if (clientId) {
            localStorage.setItem('user_id', clientId);
            console.log('Fetched and stored user_id:', clientId);
        } else {
            console.error('Failed to fetch user_id');
        }

        if (theme) {
            localStorage.setItem('theme', theme);
            console.log('Fetched and stored theme:', theme);
        } else {
            console.error('Failed to fetch theme',);
        }

        if (name) {
            localStorage.setItem('name', name);
            console.log('Fetched and stored name:', name);
        } else {
            console.error('Failed to fetch name',);
        }

        if (pfp) {
            localStorage.setItem('profile_picture', pfp);
            console.log('Fetched and stored pfp:', pfp);
        } else {
            console.error('Failed to fetch pfp',);
        }

        setIsTransitioning(true);
        setTimeout(() => navigate('/home'), 500);

    }


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
                            <ContactsOverview id={clientData.id}/>
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
            case "Publiek Profiel":
                return (
                    <>
                        <h2 style={{marginRight: '10px'}}>{clientData.client_info.name || "Client Information"}</h2>
                        <ProfileCard user_id={clientData.id} viewedByCareteaker={true}/>
                    </>
                );
            default:
                return <p>Access level information is not available.</p>;
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
