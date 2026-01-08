import React, { useEffect, useState } from 'react';
import {useDropzone} from 'react-dropzone';
import './dropzone.css';
import {uploadFile} from "../uploadFile";
import { useSelector, useDispatch } from "react-redux";
import { useGetUserByIdQuery} from '../../redux/api';
import { setAboutMe } from "../../redux/slice/authSlice";

const Basic = ({ uploadResult, prop }) => {

    const stateAuth = useSelector((state) => state.persistedReducer.auth);
    const id = stateAuth.payload.sub.id;
    const dispatch = useDispatch();
    const { data, isLoading } = useGetUserByIdQuery({ _id: id });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoading && data) {
            dispatch(setAboutMe(data.UserFindOne));
        }
        if(prop) {
            setFiles([]);
        }
    }, [data, isLoading, dispatch, prop]);
    
    const handleDrop = async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            try {
                if (file.type.startsWith('image/')) {
                    const result = await uploadFile('photo', file, 'upload', stateAuth.token);
                    if (result) {
                        uploadResult(result._id);
                        setFiles([...files, file]);
                    }
                } else if (file.type.startsWith('audio/')) {
                    const res = await uploadFile('track', file, 'track', stateAuth.token);
                    if (res) {
                        uploadResult(res._id, res.url);
                       setFiles([...files, { id: res._id, url: res.url }]);
                    }
                } else {
                    console.log(`Непідтримуваний тип файлу: ${file.type}`);
                }
            } catch (error) {
                console.error(error);
                setError('При загрузке файла произошла ошибка');
            }
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/svg+xml': ['.svg'],
            'audio/mpeg': ['.mp3'],
            'audio/wav': ['.wav'],
            'audio/webm': ['.webm'],
            'audio/flac': ['.flac'],
            'audio/x-m4a': ['.m4a'],
        },
    });

    return (
        <section className="container">
            <div {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <p>Перетягніть файли сюди або натисніть, щоб завантажити</p>
            </div>
            <aside>
                <h4>Загружені файли</h4>
                {files.map((file, index) => (
                    <li key={index}>
                        {file.name}{file.url}
                    </li>
                ))}
            </aside>
        </section>
    )
}

export default Basic;