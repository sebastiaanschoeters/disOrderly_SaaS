import {getName, getPfp, getTheme} from "../Api/Utils";

export const storeUserSession = async (userId, userType, setIsTransitioning, navigate) => {
    const theme = await getTheme(userId);
    const name = await getName(userId);
    const pfp = await getPfp(userId);

    // Store data in localStorage
    // localStorage.setItem('sessionToken', 'fake-session-token');
    // localStorage.setItem('userEmail', email); // Email can be passed dynamically
    localStorage.setItem('user_id', userId);
    localStorage.setItem('userType', userType);
    localStorage.setItem('theme', theme);
    localStorage.setItem('name', name);
    localStorage.setItem('profile_picture', pfp);

    // Logging for debugging
    console.log('Fetched and stored user_id:', userId);
    console.log('Fetched and stored userType:', userType);
    console.log('Fetched and stored theme:', theme);
    console.log('Fetched and stored name:', name);
    console.log('Fetched and stored pfp:', pfp);

    // Trigger the transition
    setIsTransitioning(true);

    // Navigate based on userType
    setTimeout(() => {
        if (userType === 'user') {
            navigate('/home');
        } else if (userType === 'caretaker') {
            navigate('/clientOverview');
        } else if (userType === 'admin') {
            navigate('/admin');
        }
    }, 500);
};
