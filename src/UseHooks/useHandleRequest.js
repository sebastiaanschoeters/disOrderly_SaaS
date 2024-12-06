import { message } from 'antd';
import {createClient} from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const useHandleRequest = (onSuccess = () => {}, onError = () => {}) => {
    const handleRequest = async (notification, action, acceptedByCaretaker) => {
        console.log(notification)
        console.log(action)
        let idToUpdate
        if (acceptedByCaretaker) {
            idToUpdate = notification.requester_id
        } else{
            idToUpdate = notification.recipient_id
        }
        try {
            // Update user access level if action is "accept"
            if (action === 'accept') {
                const { error: accessLevelError } = await supabase
                    .from('User')
                    .update( {access_level: notification.details.requested_access_level})
                    .eq('id', idToUpdate);

                console.log(notification.details.requested_access_level)
                console.log(idToUpdate)

                if (accessLevelError) throw accessLevelError;
            }

            // Delete the notification
            const { error: deleteError } = await supabase
                .from('Notifications')
                .delete()
                .eq('id', notification.id);

            if (deleteError) throw deleteError;

            // Call the success callback (e.g., update state)
            onSuccess(notification, action);

            // Show a success message
            const successMessage =
                action === 'accept'
                    ? `Wijziging van ${notification.requesterName} geaccepteerd!`
                    : `Wijziging van ${notification.requesterName} geweigerd!`;
            message.success(successMessage);
        } catch (error) {
            // Call the error callback (if needed)
            onError(notification, action, error);

            // Show an error message
            const errorMessage =
                action === 'accept'
                    ? "Fout bij het accepteren van de wijziging: "
                    : "Fout bij het weigeren van de wijziging: ";
            message.error(errorMessage + error.message);
        }
    };

    return { handleRequest };
};

export default useHandleRequest;
