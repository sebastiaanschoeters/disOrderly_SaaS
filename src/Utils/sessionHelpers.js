import {getName, getPfp, getTheme, getThemeCaretaker} from "../Api/Utils";

export const storeUserSession = async (userId, userType, setIsTransitioning, navigate) => {
    let theme = await getTheme(userId);

    if (userType === 'caretaker') {
        theme = await getThemeCaretaker(userId); // Fetch again if there's specific logic for caretakers
    }
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
        } else if (userType === 'responsible') {
            navigate('/organisationDashboard');
        }
    }, 500);
};
