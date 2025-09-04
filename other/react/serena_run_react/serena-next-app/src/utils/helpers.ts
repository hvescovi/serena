export const generateRandomSpaces = (count: number): string => {
    return "&nbsp; ".repeat(count);
};

export const getRandomNumber = (max: number): number => {
    return Math.floor(Math.random() * max);
};