import { message } from 'antd';
import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
