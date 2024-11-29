import React, {useState} from "react";
import {Button, Modal} from "antd";
import ProfileCard from '../Profile Pages/ProfilePage'
import ContactsOverview from "./ClientContacts";

const ClientDetailsModal = ({ visible, onClose, clientData }) => {
    const [isViewingContactList, setIsViewingContactList] = useState(false);

    if (!clientData) return null; // Guard for no data
    console.log(clientData)

    const handleToggleView = () =>{
        setIsViewingContactList((prevState) => !prevState);
    }

    const renderContentByAccessLevel = (accessLevel) => {
        switch (accessLevel) {
            case "Volledige toegang":
                return <p>You have full access to all features and data.</p>;
            case "Gesprekken":
                return <p>You have access to conversations.</p>;
            case "Contacten":
                return (
                    <>
                        <Button
                            type="primary"
                            onClick={handleToggleView}
                            style={{ marginBottom: '20px' }}
                        >
                            {isViewingContactList ? "Bekijk Profiel" : "Bekijk Contacten"}
                        </Button>
                        {isViewingContactList ? (
                            <>
                                <ContactsOverview id={clientData.id} />
                            </>
                        ) : (
                            <>
                                <ProfileCard user_id={clientData.id} viewedByCareteaker={true} />
                            </>
                        )}

                    </>
                );
            case "Publiek Profiel":
                return <ProfileCard user_id={clientData.id} viewedByCareteaker={true} />;
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
                <h2>{clientData.client_info.name || "Client Information"}</h2>
                {renderContentByAccessLevel(clientData.access_level)}
            </div>
        </Modal>
    );
};

export default ClientDetailsModal;
