import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabaseSchema = process.env.REACT_APP_SUPABASE_SCHEMA;
const supabase = createClient(supabaseUrl, supabaseKey, {db: {schema: supabaseSchema}});

export const requests = async (userId, file, bucketName) => {
    try {
        const fileName = `${userId}-profilePicture`;
        const { data: existingFiles, error: listError } = await supabase.storage
            .from(bucketName)
            .list('', { search: userId });

        if (listError) {
            console.error('Error checking existing files:', listError);
        } else {
            const existingFile = existingFiles.find(item => item.name.startsWith(userId));
            if (existingFile) {
                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove([existingFile.name]);
                if (deleteError) {
                    throw deleteError;
                }
            }
        }
        const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, { upsert: true });
        if (uploadError) {
            throw uploadError;
        }

        const { data: fileData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
        if (urlError) {
            throw urlError;
        }

        const imageUrl = fileData.publicUrl;
        const imageUrlWithCacheBuster = `${imageUrl}?t=${new Date().getTime()}`;

        return imageUrlWithCacheBuster;

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw error;
    }
};

export const fetchPendingRequestsData = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('Notifications')
            .select('recipient_id, details')
            .eq('requester_id', userId)
            .eq('type', 'ACCESS_LEVEL_CHANGE');

        if (error) throw error;

        return data.reduce((acc, request) => {
            acc[request.recipient_id] = request.details.requested_access_level;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching pending requests:', error.message);
        return {};
    }
};
