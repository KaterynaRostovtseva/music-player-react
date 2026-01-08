import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import Basic from '../Dropzone/Basic';
import { useNavigate } from 'react-router-dom';
import { useSetUserNickMutation, useSetAvatarMutation, useGetUserByIdQuery, usePasswordChangeMutation } from '../../redux/api';
import { setAboutMe } from "../../redux/slice/authSlice";


const PageProfileEditing = () => {

    const stateAuth = useSelector((state) => state.persistedReducer.auth);
    const userId = useSelector(state => state.persistedReducer.auth?.payload?.sub?.id);
    const user = stateAuth.aboutMe || {};
    const [showNikInput, setShowNikInput] = useState(false);
    const [showAvatarInput, setShowAvatarInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newNick, setNewNick] = useState(user.nick || '');
    const [newAvatar, setNewAvatar] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [avatarMutation] = useSetAvatarMutation();
    const [setPasswordChangeMutation] = usePasswordChangeMutation();
    const [setUserNickMutation] = useSetUserNickMutation();
    const { data, isLoading, refetch } = useGetUserByIdQuery({ _id: userId });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && data) {
            dispatch(setAboutMe(data.UserFindOne));
        }
    }, [data, isLoading, dispatch]);

    const saveNick = async () => {
        await setUserNickMutation({ _id: userId, nick: newNick });
        setNewNick(newNick)
        setShowNikInput(false);
    }

    const getNewAvatar = (result) => {
        setNewAvatar(result)
    }

    const saveAvatar = async () => {
        let res = await avatarMutation({ idUser: userId, idImg: newAvatar });
        if (res) {
            await refetch();
        }
        setShowAvatarInput(false);
    }

    const savePassword = async () => {
        let res = await setPasswordChangeMutation({ login: user.login, password: password, newPassword: newPassword });//запит на оновлення пароля
        setNewPassword('');
        setPassword('');
        setShowPasswordInput(false);
    }


    return (
        <Grid item md={10} sx={{ my: 3, mx: 10, boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)' }}>
            <Box sx={{ mx: 4, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h4" sx={{ my: 5, mx: 4, textAlign: 'center' }}>
                    Редагування особистих данних
                </Typography>
                <Box component="form" sx={{ width: '600px' }} >
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: 'row', alignItems: 'baseline' }} >
                        <Grid item xs={4}   >
                            Редагувати аватар:
                        </Grid>
                        {showAvatarInput ?
                            <Grid item xs={6}>
                                <Basic uploadResult={(result) => getNewAvatar(result)}></Basic>
                                <Button variant="contained" sx={{ my: 2, mx: 2 }} onClick={() => saveAvatar()}>Зберегти</Button>
                                <Button variant="contained" sx={{ my: 2, mx: 2 }} onClick={() => setShowAvatarInput(false)}>Скасувати</Button>
                            </Grid>
                            :
                            <Grid item xs={1}>
                                <IconButton onClick={() => setShowAvatarInput(true)} sx={{ p: 0 }}>
                                    <EditIcon />
                                </IconButton>
                            </Grid>
                        }
                    </Grid>
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                        <Grid item xs={4}   >
                            Редагувати нікнейм: {user.nick ? `${user.nick}` : 'Нікнейм не призначений'}
                        </Grid>
                        {showNikInput ?
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Нікнейм"
                                    value={newNick}
                                    onChange={(e) => setNewNick(e.target.value)}
                                />
                                <Button variant="contained" sx={{ my: 2, mx: 2 }} onClick={() => saveNick()}>Зберегти</Button>
                                <Button variant="contained" sx={{ my: 2, mx: 2 }} onClick={() => setShowNikInput(false)}>Скасувати</Button>
                            </Grid>
                            :
                            <Grid item xs={1}>
                                <IconButton onClick={() => setShowNikInput(true)} sx={{ p: 0 }}>
                                    <EditIcon />
                                </IconButton>
                            </Grid>
                        }

                    </Grid>
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: 'row', alignItems: 'baseline' }} >
                        <Grid item xs={4}   >
                            Редагувати пароль:
                        </Grid>
                        {showPasswordInput ?
                            <Grid item xs={6}>
                                <TextField
                                    sx={{ my: 1 }}
                                    required
                                    fullWidth
                                    label="Пароль"
                                    autoComplete="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Новий пароль"
                                    autoComplete="new-password"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button variant="contained" sx={{ my: 2, mx: 2 }} onClick={() => savePassword()}>Зберегти</Button>
                                <Button variant="contained" sx={{ my: 2, mx: 2 }} onClick={() => setShowPasswordInput(false)}>Скасувати</Button>
                            </Grid>
                            :
                            <Grid item xs={1}>
                                <IconButton onClick={() => setShowPasswordInput(true)} sx={{ p: 0 }}>
                                    <EditIcon />
                                </IconButton>
                            </Grid>
                        }
                    </Grid>
                </Box>
                <Grid sx={{ my: 6, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" onClick={() => navigate(-1)}>Вийти</Button>
                </Grid>
            </Box>
        </Grid>
    )
}

export default PageProfileEditing;