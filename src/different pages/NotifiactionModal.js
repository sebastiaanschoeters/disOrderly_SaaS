import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { createClient } from '@supabase/supabase-js';
import useHandleRequest from "../UseHooks/useHandleRequest";

// Supabase client initialization
const supabase = createClient(
    "https://flsogkmerliczcysodjt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q"
);

const fetchNotification = async ( userId ) => {
    try {
        const { data: notificationData, error: notificationError } = await supabase
            .from('Notifications')
            .select('*')
            .eq('recipient_id', userId || null); // Fetch notifications based on user_id
        console.log(notificationData)
        if (notificationError) throw notificationError;

        if (notificationData && notificationData.length > 0) {
            const notification = notificationData[0]

            // Fetch the caretaker (requester) name for each notification
            const {data: caretakerData, error: notificationError } = await supabase
                .from('Caretaker')
                .select('name')
                .eq('id', notification.requester_id)

            if (notificationError) throw notificationError

            console.log(caretakerData)

            return{
                ...notification,
                requesterName: caretakerData?.[0]?.name || 'Onbekend', // Default to 'Unknown' if not found
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

    const handleAcceptRequest = (notification) => handleRequest(notification, 'accept');
    const handleDenyRequest = (notification) => handleRequest(notification, 'deny');

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
                        {`${notification.requesterName} heeft een wijziging in toegangsniveau aangevraagd: ${
                            notification.details?.requested_access_level || 'Onbekend toegangsniveau'
                        }`}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={handleAcceptRequest} type="default" size="large">
                            Accepteren
                        </Button>
                        <Button onClick={handleDenyRequest} type="default" size="large">
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
