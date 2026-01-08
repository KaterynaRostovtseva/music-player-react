export function jwtDecode(token) {
    if (!token) {
        return undefined; 
    }
    let parts = token.split("."); 
    if (parts.length !== 3) {
        return undefined;
    }
    const [, identifyingInformation,] = parts;
    try {
        return JSON.parse(atob(identifyingInformation)); 
    } catch (error) {
        return undefined;
    }
};
