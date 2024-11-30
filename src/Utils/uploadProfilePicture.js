import {createClient} from "@supabase/supabase-js";
const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

export const uploadProfilePicture = async (userId, file, bucketName) => {
    try {
        const fileName = `${userId}-profilePicture`;

        // Check if the file already exists and remove it before upload
        const { data: existingFiles, error: listError } = await supabase.storage
            .from(bucketName)
            .list('', { search: userId });

        if (listError) {
            console.error('Error checking existing files:', listError);
        } else {
            const existingFile = existingFiles.find(item => item.name.startsWith(userId));
            if (existingFile) {
                // Remove the existing file if it exists
                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove([existingFile.name]);
                if (deleteError) {
                    throw deleteError;
                }
            }
        }

        // Upload the new file
        const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, { upsert: true }); // upsert ensures replacement if file exists
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
        throw error; // Re-throw to be handled by caller
    }
};
