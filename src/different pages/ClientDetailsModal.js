import React from "react";
import { Modal } from "antd";

const ClientDetailsModal = ({ visible, onClose, clientData }) => {
    if (!clientData) return null; // Guard for no data

    return (
        <Modal
            title="Client Details"
            open={visible}
            onCancel={onClose}
            onOk={onClose}
            footer={null} // Customize footer as needed
        >
            <div>
                <p><strong>Name:</strong> {clientData.client_info.name}</p>
                <p><strong>Access Level:</strong> {clientData.access_level}</p>
                {/* Add more client details here as needed */}
            </div>
        </Modal>
    );
};

export default ClientDetailsModal;
