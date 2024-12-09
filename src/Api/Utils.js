import {createClient} from "@supabase/supabase-js";
import {message} from "antd";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");

export const getName = async (user_id, options={caretaker: false}) => {
    try {
        let data = {};
        let error = {};
        if (options.caretaker){
            const {data: caretakerData, error: caretakerError} = await supabase
                .from('Caretaker')
                .select('name')
                .eq('id', user_id);
            data = caretakerData;
            error = caretakerError;
        } else {
            const {data: userData, error: userError} = await supabase
                .from('User')
                .select('name')
                .eq('id', user_id);
            data = userData;
            error = userError;
        }

        if (error) {
            console.error('Error fetching user_id:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided user_id.');
            return null;
        }

        console.log('Fetched name:', data[0].name);
        return data[0].name;  // Ensure it's a string
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const getTheme = async (user_id, options={caretaker:false}) => {
    try {
        let data = {};
        let error = {};
        if (options.caretaker){
            const {data: caretakerData, error: caretakerError} = await supabase
                .from('Caretaker')
                .select('theme')
                .eq('id', user_id);
            data = caretakerData;
            error = caretakerError;
        } else {
            const {data: userData, error: userError} = await supabase
                .from('User information')
                .select('theme')
                .eq('user_id', user_id);
            data = userData;
            error = userError;
        }

        console.log(data)

        if (error) {
            console.error('Error fetching user theme:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided user_id.');
            return null;
        }

        return data[0].theme; // Returning the theme directly
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const getPfp = async (user_id, options={caretaker:false}) => {
    try {
        let data = {};
        let error = {};
        if (options.caretaker){
            const {data: caretakerData, error: caretakerError} = await supabase
                .from('Caretaker')
                .select('profile_picture')
                .eq('id', user_id);
            data = caretakerData;
            error = caretakerError;
        } else {
            const {data: userData, error: userError} = await supabase
                .from('User')
                .select('profile_picture')
                .eq('id', user_id);
            data = userData;
            error = userError;
        }

        if (error) {
            console.error('Error fetching pfp:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided email.');
            return null;
        }

        console.log('Fetched pfp:', data[0].profile_picture);
        return data[0].profile_picture; // Ensure it's a string
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const getUserEmailById = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('Credentials')
            .select('email')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching email:', error.message);
            return null;
        }

        if (data.length === 0) {
            console.log('No user found with the provided userid.');
            return null;
        }

        console.log('Fetched dataaaaaa:', data);
        return data;
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export const saveField = async (userId, field, value) => {
    try {
        const { data, error } = await supabase
            .from('User information')
            .update({ [field]: value })
            .eq('user_id', userId);  // Use dynamic userId passed as argument
        if (error) throw error;
        let dutch_field = field
        if (field === 'bio'){
            dutch_field = "biografie"
        } else if (field === 'location'){
            dutch_field = "locatie"
        } else if (field === 'gender'){
            dutch_field = "geslacht"
        } else if (field === 'living_situation'){
            dutch_field = "woonsituatie"
        } else if (field === 'mobility'){
            dutch_field = "mobiliteit"
        } else if (field === 'theme'){
            dutch_field = "thema"
        } else if (field === 'sexuality'){
            dutch_field = "seksualiteit"
        }

        message.success(`${dutch_field} opgeslagen`);
        console.log(`${field} saved successfully with value ${value}`);
    } catch (error) {
        let dutch_field = field
        if (field === 'bio'){
            dutch_field = "biografie"
        } else if (field === 'location'){
            dutch_field = "locatie"
        } else if (field === 'gender'){
            dutch_field = "geslacht"
        } else if (field === 'living_situation'){
            dutch_field = "woonsituatie"
        } else if (field === 'mobility'){
            dutch_field = "mobiliteit"
        } else if (field === 'theme'){
            dutch_field = "thema"
        } else if (field === 'sexuality'){
            dutch_field = "seksualiteit"
        }

        message.error(`probleem bij het opslaan van ${field}`);
        console.error(`Error saving ${dutch_field}:`, error);
    }
};

export const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};