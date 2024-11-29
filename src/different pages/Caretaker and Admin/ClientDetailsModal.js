import React from "react";
import { Modal } from "antd";
import ProfileCard from '../Profile Pages/ProfilePage'

const ClientDetailsModal = ({ visible, onClose, clientData }) => {
    if (!clientData) return null; // Guard for no data

    const renderContentByAccessLevel = (accessLevel) => {
        switch (accessLevel) {
            case "Volledige toegang":
                return <p>You have full access to all features and data.</p>;
            case "Gesprekken":
                return <p>You have access to conversations.</p>;
            case "Contacten":
                return <p>You have access to contact information.</p>;
            case "Publiek Profiel":
                return <ProfileCard user_id={clientData.id} viewedByCareteaker={true} />;
            default:
                return <p>Access level information is not available.</p>;
        }
    };

    return (
        <Modal
            title="Client Details"
            open={visible}
            onCancel={onClose}
            footer={null}
            width='90%'
            style={{
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div>
                {renderContentByAccessLevel(clientData.access_level)}
            </div>
        </Modal>
    );
};

export default ClientDetailsModal;
