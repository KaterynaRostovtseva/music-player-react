export function jwtDecode(token) {
    if (!token) {
        return undefined; // Перевіряємо, чи передано токен
    }
    let parts = token.split("."); // Розбиваємо токен на три частини (заголовок, дані про ідентифікацію, підпис)
    if (parts.length !== 3) { // Перевіряємо, що є три частини
        return undefined;
    }
    const [, identifyingInformation,] = parts; // Дістаємо дані про ідентифікацію (друга частина токена)
    try {
        return JSON.parse(atob(identifyingInformation)); // Декодуємо дані про ідентифікацію з Base64 та парсим JSON
    } catch (error) {
        return undefined;
    }
};
