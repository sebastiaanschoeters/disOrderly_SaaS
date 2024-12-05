export const calculateSlidesToShow = (imageCount) => {
    const width = window.innerWidth;
    let slides = 5.5;

    if (width < 700) slides = 1;
    else if (width < 950) slides = 1.5;
    else if (width < 1500) slides = 2.5;
    else if (width < 2000) slides = 3.5;
    else if (width < 3000) slides = 4.5;

    return Math.min(slides, imageCount);
};

export const calculateAge = (birthdate) => {
    if (!birthdate) return 'Onbekend';
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
};