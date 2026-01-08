import { backendUrl } from "../redux/slice/playerSlice"

export const uploadFile = async (fileName, file, fetchUrl, authToken) => {
    const formData = new FormData();
    formData.append(fileName, file);

    const headers = authToken ? { Authorization: 'Bearer ' + authToken } : {};

    try {
        const response = await fetch(`${backendUrl}${fetchUrl}`, {
            method: "POST",
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error("Помилка в uploadFile: " + response.status);
        }

        return await response.json();
    } catch (error) {
        throw new Error("Помилка в uploadFile: " + error.message);
    }
};
