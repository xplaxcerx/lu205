import React from 'react';
import styles from './styles.module.scss';
import { useGetCurrentUserQuery, useRegistrMutation } from '../../redux/userApiSlice';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useGetCartQuery } from '../../redux/apiSlice';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
type FormInput = {
    login: string,
    password: string,
    room: string,
    telegram: string
};
export const Registration = () => {
    const [registrData, setRegistrData] = React.useState({
        login: '',
        password: '',
        room: '',
        telegram: ''
    });
    const [errorMessage, setErrorMessage] = React.useState('');
    const navigate = useNavigate();
    const [ registr, { isLoading } ] = useRegistrMutation();
    const { refetch: refetchCart } = useGetCartQuery();
    
    const onInputData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value} = event.target;
        setRegistrData( prev => ({
            ...prev,
            [name]: value
        }));
    }
    const { 
        register,
        handleSubmit,
        formState: {
            errors
        },
        reset,
    } = useForm<FormInput>();
    const { refetch: refetchUser } = useGetCurrentUserQuery();
    const onClickRegistr = async(data: FormInput) => {
        try {
        const result = await registr(data).unwrap();
        localStorage.setItem('token', result.token);
        refetchCart();
        await refetchUser();
        navigate('/user');
        reset();
        }catch(error: any) {
            if(error.data?.message === 'Пользователь с таким логином уже существует') {
                setErrorMessage('Пожалуйста, придумайте другой логин');
            }
            if(error.data?.message === "Логин и пароль обязательны") {
                alert('Логин и пароль обязательны');
            }
            if(error.data?.message === "Телеграмм обязателен для заполнения") {
                setErrorMessage('Телеграмм обязателен для заполнения');
            }
        }
    };
    
    return (
        <form onSubmit={handleSubmit(onClickRegistr)}>
            <div className={styles.auhorization}>
                <div className={styles.auhorizationBlock}>
                    <p className={styles.title}>Регистрация</p>
                    {errorMessage !== '' ? errorMessage : null}

                    <div className={styles.dataBlock}>
                        <div className={styles.inputWrapper}>
                            <input 
                            {...register('login', {
                                required: 'Логин обязателен для заполнения'
                            })}
                            className={styles.inputLogin} 
                            type="text" 
                            placeholder='Логин' 
                            onFocus={() => setErrorMessage('')}
                            />
                            {errors.login && <p className={styles.error}>{errors.login.message}</p>}
                        </div>
                        <div className={styles.inputWrapper}>
                            <input 
                            {...register('password', {
                                required: 'Пароль обязателен для заполнения'
                            })} 
                            className={styles.inputPassword} 
                            type="text" 
                            placeholder='Пароль' 
                            onFocus={() => setErrorMessage('')}
                            />
                            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                        </div>

                        <div className={styles.inputWrapper}>
                            <input 
                            {...register('room')}  
                            className={styles.inputRoom} 
                            type="text" 
                            placeholder='Комната (необязательно)' 
                            value={registrData.room} onChange={onInputData}
                            onFocus={() => setErrorMessage('')}
                            />
                        </div>

                        <div className={styles.telegramWrapper}>
                            <div className={styles.telegramBlock}>
                                <span>@</span>
                                <input 
                            {...register('telegram', {
                                required: 'Телеграмм обязателен для заполнения'
                            })}
                                className={styles.inputTelegram} 
                                type="text" 
                                placeholder='Ваш Телеграмм' 
                                name="telegram"
                                value={registrData.telegram} 
                                onChange={onInputData}
                                onFocus={() => setErrorMessage('')}
                                />
                            </div>
                            {errors.telegram && <p className={styles.error}>{errors.telegram.message}</p>}
                        </div>

                    </div>
                    <div className={styles.registration}>

                        
                    </div>
                    {isLoading ? 
                    <Flex align="center" gap="middle">
                        <Spin indicator={<LoadingOutlined spin />} size="large"  className={styles.spinner}/>
                    </Flex> : 
                    <button type='submit' className={styles.signInBtn}>Зарегистрироваться</button>
                }
                </div>
            </div>
        </form>
    );
};