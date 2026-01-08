export function jwtDecode(token) {
    if (!token) {
        return undefined; 
    }
    let parts = token.split("."); 
    if (parts.length !== 3) {
        return undefined;
    }
    const [, identifyingInformation,] = parts; // Дістаємо дані про ідентифікацію (друга частина токена)
    try {
        return JSON.parse(atob(identifyingInformation)); // Декодуємо дані про ідентифікацію з Base64 та парсим JSON
    } catch (error) {
        return undefined;
    }
};
