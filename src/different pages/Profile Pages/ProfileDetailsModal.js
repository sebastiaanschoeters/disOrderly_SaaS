import React from "react";
import { Modal } from "antd";
import ProfileCard from './ProfilePage'

const ProfileDetailsModal = ({ visible, onClose, clientData }) => {
    if (!clientData) return null; // Guard for no data
    console.log(clientData)
    return (
        <Modal
            title="Profiel informatie "
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
                <ProfileCard user_id={clientData.id} viewedByCareteaker={false}/>
            </div>
        </Modal>
    );
};

export default ProfileDetailsModal;
