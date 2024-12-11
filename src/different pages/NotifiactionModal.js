import React, { useState, useEffect } from 'react';
import {Modal, Button, Tooltip} from 'antd';
import { createClient } from '@supabase/supabase-js';
import useHandleRequest from "../UseHooks/useHandleRequest";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


const fetchNotification = async ( userId ) => {
    try {
        const { data: notificationData, error: notificationError } = await supabase
            .from('Notifications')
            .select('*')
            .eq('recipient_id', userId || null);

        if (notificationError) throw notificationError;

        if (notificationData && notificationData.length > 0) {
            const notification = notificationData[0]

            // Fetch the caretaker (requester) name for each notification
            const {data: caretakerData, error: notificationError } = await supabase
                .from('Caretaker')
                .select('name')
                .eq('id', notification.requester_id)

            if (notificationError) throw notificationError

            const {data: accessLevelUser, error} = await supabase
                .from('User')
                .select('access_level')
                .eq('id', userId)
                .single()

            if (error) throw error

            return{
                ...notification,
                requesterName: caretakerData?.[0]?.name || 'Onbekend', // Default to 'Unknown' if not found
                currentAccessLevel: accessLevelUser?.access_level
            };
        } else{
            return null;
        }
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
    }
};

const NotificationModal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setNotification] = useState(null);

    const userId = localStorage.getItem('user_id') || null; // Assuming user_id is stored in localStorage

    useEffect(() => {
        const loadNotification = async () => {
            const notification = await fetchNotification(userId);
            if (notification) {
                setNotification(notification);
                setIsVisible(true);
            }
        };
        loadNotification();
    }, [userId]);

    const { handleRequest } = useHandleRequest(
        (notification, action) => {
            setNotification(null);
            setIsVisible(false);
        }
    )

    const handleAcceptRequest = (notification) => {handleRequest(notification, 'accept', false);};
    const handleDenyRequest = (notification) => {handleRequest(notification, 'deny', false);};


    const tooltips = {
        "Volledige toegang": "Begeleiding heeft volledige toegang en kan alles mee volgen en profiel aanpassen",
        "Gesprekken": "Begeleiding kan enkel gesprekken lezen",
        "Contacten": "Begeleiding kan zien met wie jij contact hebt",
        "Publiek profiel": "Begeleiding kan zien wat jij op je profiel plaatst, net zoals andere gebruikers",
    };

    return (
        <Modal
            title="Belangrijke melding"
            open={isVisible}
            onCancel={() => setIsVisible(false)} // Close modal on cancel
            footer={null} // Remove default footer
            closable={false} // Prevent close button
            maskClosable={false} // Prevent clicking outside to close
            destroyOnClose={false} // Keep modal in DOM when closed
        >
            {notification ? (
                <div>
                    <p>
                        {`${notification.requesterName} heeft een wijziging in toegangsniveau aangevraagd: `}
                        <Tooltip
                            title={
                                tooltips[notification.details?.requested_access_level] || "Geen informatie beschikbaar"
                            }
                        >
                    <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                        {notification.details?.requested_access_level || "Onbekend toegangsniveau"}
                    </span>
                        </Tooltip>
                        {". Het vorige toegangsniveau was "}
                        <Tooltip
                            title={tooltips[notification.currentAccessLevel] || "Geen informatie beschikbaar"}
                        >
                    <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                        {notification.currentAccessLevel || "Onbekend toegangsniveau"}
                    </span>
                        </Tooltip>
                        .
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <Button onClick={() => handleAcceptRequest(notification)} type="default" size="large">
                            Accepteren
                        </Button>
                        <Button onClick={() => handleDenyRequest(notification)} type="default" size="large">
                            Weigeren
                        </Button>
                    </div>
                </div>
            ) : (
                <p>Geen nieuwe meldingen</p> // Display message if no notifications
            )}
        </Modal>
    );
};

export default NotificationModal;
