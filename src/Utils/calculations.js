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