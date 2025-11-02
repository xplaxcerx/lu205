import React from "react";
import { useNavigate } from "react-router";
import { useEditUserRoomMutation, useEditUserTelegramMutation, useGetCurrentUserQuery, useSignOutMutation } from "../../redux/userApiSlice";
import { useGetAllOrderQuery } from "../../redux/orderApiSlice";
import styles from './styles.module.scss';
import { useGetCartQuery } from "../../redux/apiSlice";
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
export const User = () => {
    const { data: user, isLoading } = useGetCurrentUserQuery(undefined, {skip: !localStorage.getItem("token")});
    const [editRoom] = useEditUserRoomMutation();
    const [editTelegram] = useEditUserTelegramMutation();
    const { refetch: refetchCart } = useGetCartQuery();
    const { data: orders } = useGetAllOrderQuery();
    const [clickEditRoom, setClickEditRoom] = React.useState(false);
    const [clickEditTelegram, setClickEditTelegram] = React.useState(false);
    const [inputRoom, setInputRoom] = React.useState('');
    const [inputTelegram, setInputTelegram] = React.useState('');
    const navigate = useNavigate();
    
    React.useEffect(() => {
        if (user?.telegram) {
            const telegramValue = user.telegram.replace(/^@/, '');
            setInputTelegram(telegramValue);
        } else {
            setInputTelegram('');
        }
    }, [user?.telegram]);

    React.useEffect(() => {
        if (user?.room) {
            setInputRoom(user.room);
        } else {
            setInputRoom('');
        }
    }, [user?.room]);

    const onChangeRoom = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputRoom(e.target.value);
    }

    const onChangeTelegram = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputTelegram(e.target.value);
    }
    
    const [signOut] = useSignOutMutation();
    
    const onClickSaveRoom = async () => {
        if(clickEditRoom) {
            await editRoom({
                room: inputRoom
            });
        }
        setClickEditRoom(false);
    }

    const onClickSaveTelegram = async () => {
        if(clickEditTelegram) {
            await editTelegram({
                telegram: inputTelegram
            });
        }
        setClickEditTelegram(false);
    }
    console.log(orders);
    console.log()
    const onClickExit = async() => {
        await signOut();
        navigate('/authorization');
        refetchCart();
    }
    return (
        <div className={styles.container}>
            
            {isLoading ? 
                <div className={styles.loadingWindow}>
                <Flex align="center" gap="middle">
                <Spin indicator={<LoadingOutlined style={{fontSize: 65}}spin />} size="large"  className={styles.spinner}/>
                </Flex> 
                </div> 
                :  
            <div className={styles.content}>
            <h1>Профиль</h1>
            <div className={styles.dataBlock}>
                <p>{user?.login}</p>
                <div className={styles.roomSetting}>
                    {clickEditRoom ?
                    <> 
                        <input type='text' placeholder="Ваша Комната..." value={inputRoom} onChange={(e) => onChangeRoom(e)}></input>
                        <img className={styles.checkMark} src="/img/check-mark.svg" alt="check-mark" width={17} height={17} onClick={onClickSaveRoom}/>
                    </>
                    : 
                    <>
                        <p> Ваша Комната: {user?.room || 'Не указана'}</p>
                        <img className={styles.settingButton}src="/img/edit-button.svg" alt="edit" width={17} height={17} onClick={() => setClickEditRoom(true)}/>
                    </>
                    }
                </div>
                <div className={styles.roomSetting}>
                    {clickEditTelegram ?
                    <> 
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <span>@</span>
                            <input type='text' placeholder="username" value={inputTelegram} onChange={(e) => onChangeTelegram(e)} style={{flex: 1}}></input>
                        </div>
                        <img className={styles.checkMark} src="/img/check-mark.svg" alt="check-mark" width={17} height={17} onClick={onClickSaveTelegram}/>
                    </>
                    : 
                    <>
                        <p>Ваш Телеграмм: {user?.telegram ? user.telegram : 'Не указан'}</p>
                        <img className={styles.settingButton}src="/img/edit-button.svg" alt="edit" width={17} height={17} onClick={() => setClickEditTelegram(true)}/>
                    </>
                    }
                </div>
                
                <button className={styles.exitBtn} onClick={onClickExit} >Выйти</button>
                
            </div>
            </div> 
            }
        </div>
    );
}