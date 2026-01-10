import { createSlice} from '@reduxjs/toolkit';
import { jwtDecode } from '../jwtDecode'; 

export const authSlice =  createSlice({
    name: 'auth',
    initialState: {token: null, payload: null, aboutMe: null},
    reducers: {
        logIn(state, {payload:token}){
            const payload = jwtDecode(token)
            if (payload){
                state.payload = payload
                state.token   = token
            }
        },
        logout(state){
            state.payload = null
            state.token   = null
        },
        setAboutMe (state, {payload: aboutMe}) {
            if (!aboutMe) {
                return; // Не обновляем, если payload пустой
            }
            
            // Защита: не перезаписываем аватар, если текущий есть (data URL), а новый undefined или null
            const currentAvatar = state.aboutMe?.avatar?.url;
            const newAvatar = aboutMe?.avatar?.url;
            const hasCurrentAvatar = currentAvatar && 
                                    currentAvatar !== '/avatars/default.png' && 
                                    currentAvatar.startsWith('data:');
            
            // Защита: не перезаписываем никнейм, если текущий есть, а новый undefined или пустой
            const currentNick = state.aboutMe?.nick;
            const newNick = aboutMe?.nick;
            const hasCurrentNick = currentNick && currentNick.trim() !== '';
            
            // Объединяем защищенные поля с новыми данными
            const updatedAboutMe = { ...aboutMe };
            
            // Сохраняем аватар, если текущий есть, а новый отсутствует
            if (hasCurrentAvatar && (!newAvatar || newAvatar === '/avatars/default.png' || !aboutMe?.avatar)) {
                updatedAboutMe.avatar = state.aboutMe.avatar;
            }
            
            // Сохраняем никнейм, если текущий есть, а новый отсутствует
            if (hasCurrentNick && (!newNick || newNick.trim() === '')) {
                updatedAboutMe.nick = state.aboutMe.nick;
            }
            
            state.aboutMe = updatedAboutMe;
        },
    }
})

export const {logIn, logout, setAboutMe} = authSlice.actions
export default authSlice.reducer