import {getName, getPfp, getTheme} from "../Api/Utils";

export const storeUserSession = async (userId, userType, setIsTransitioning, navigate) => {
    let theme = [];
    let name = "";
    let pfp = "";
    if (userType === 'caretaker') {
        theme = await getTheme(userId, {caretaker:true});
        name = await getName(userId, {caretaker:true});
        pfp = await getPfp(userId, {caretaker:true});
    } else {
        theme = await getTheme(userId);
        name = await getName(userId);
        pfp = await getPfp(userId);
    }

    localStorage.setItem('user_id', userId);
    localStorage.setItem('userType', userType);
    localStorage.setItem('theme', theme);
    localStorage.setItem('name', name);
    localStorage.setItem('profile_picture', pfp);

    console.log('Fetched and stored user_id:', userId);
    console.log('Fetched and stored userType:', userType);
    console.log('Fetched and stored theme:', theme);
    console.log('Fetched and stored name:', name);
    console.log('Fetched and stored pfp:', pfp);

    setIsTransitioning(true);

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
