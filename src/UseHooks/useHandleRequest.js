import { message } from 'antd';
import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabaseSchema = process.env.REACT_APP_SUPABASE_SCHEMA;
const supabase = createClient(supabaseUrl, supabaseKey, {db: {schema: supabaseSchema}});

const useHandleRequest = (onSuccess = () => {}, onError = () => {}) => {
    const handleRequest = async (notification, action, acceptedByCaretaker) => {
        let idToUpdate
        if (acceptedByCaretaker) {
            idToUpdate = notification.requester_id
        } else{
            idToUpdate = notification.recipient_id
        }
        try {
            if (action === 'accept') {
                const { error: accessLevelError } = await supabase
                    .from('User')
                    .update( {access_level: notification.details.requested_access_level})
                    .eq('id', idToUpdate);

                if (accessLevelError) throw accessLevelError;
            }
            const { error: deleteError } = await supabase
                .from('Notifications')
                .delete()
                .eq('id', notification.id);

            if (deleteError) throw deleteError;
            onSuccess(notification, action);

            const successMessage =
                action === 'accept'
                    ? `Wijziging van ${notification.requesterName} geaccepteerd!`
                    : `Wijziging van ${notification.requesterName} geweigerd!`;
            message.success(successMessage);
        } catch (error) {
            onError(notification, action, error);
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
