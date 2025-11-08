import React from 'react';
import { Modal } from '../../components/Modal';
import { Order } from '../../components/Order/index';
import { useGetCartQuery, useRemoveAllCartMutation, useRemoveFromCartMutation, useUpdateCountProductMutation } from '../../redux/apiSlice';
import { CartEmpty } from './CartEmpty';
import styles from './styles.module.scss';
import { useCreateOrderMutation } from '../../redux/orderApiSlice';
import { OrderResponse } from '../../redux/orderApiSlice';
import { Link } from 'react-router';
import { debounce } from 'lodash';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
import { useGetCurrentUserQuery } from '../../redux/userApiSlice';
import { useForm } from 'react-hook-form';
interface CartQuantityState {
    productId: number;
    quantity: number;
}
type DeliveryFormInput = {
    room: string
}

export const Cart = () => {
    const [isOrderModalOpened, setIsOrderModalOpened] = React.useState(false);
    const [orderResponse, setOrderResponse] = React.useState<OrderResponse | null>(null);
    const isAuthenticated = !!localStorage.getItem('token');
    const { data: cartItem, isLoading: isLoadingCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
    const [removeFromCart, { isLoading: isLoadingRemoveItem }] = useRemoveFromCartMutation();
    const [removeAllCart, { isLoading: isLoadingRemove }] = useRemoveAllCartMutation();
    const [updateCountProduct] = useUpdateCountProductMutation();
    const [createOrder, { isLoading: isLoadingCreateOrder }] = useCreateOrderMutation();
    const [cartQuantity, setCartQuantity] = React.useState<CartQuantityState[]>([]);
    const { data: user } = useGetCurrentUserQuery(undefined, { skip: !isAuthenticated });
    const [isDelivery, setIsDelivery] = React.useState(false);
    const [isRoomApprove, setIsRoomAprove] = React.useState(false);
    const [showRoomForm, setShowRoomForm] = React.useState(false);
    const [savedRoom, setSavedRoom] = React.useState<string | null>(null);
    const { register: registerRoom, handleSubmit: handleSubmitRoom, setValue: setRoomValue } = useForm<DeliveryFormInput>();
    
    React.useEffect(() => {
        if (isDelivery) {
            if (user?.room) {
                setRoomValue('room', user.room);
                setSavedRoom(user.room);
                setIsRoomAprove(true);
                setShowRoomForm(true);
            } else {
                setIsRoomAprove(false);
                setSavedRoom(null);
                setShowRoomForm(true);
            }
        } else {
            setShowRoomForm(false);
        }
    }, [isDelivery, user?.room, setRoomValue]);
    const onClickDelelte = (productId: number) => (
        removeFromCart(productId)
    );
    const updateQuantity = (productId: number, quantity: number, quantityEdit: number) => {
        setCartQuantity(prev => {
            const currentQuantity = prev.find(item => item.productId === productId)?.quantity ?? quantity;
            const newQuantity = currentQuantity + quantityEdit;

            const existingIndex = prev.findIndex(item => item.productId === productId);
            return existingIndex === -1
                ? [...prev, { productId, quantity: newQuantity }]
                : prev.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                );
        });
    }
    const onClickPlus = (productId: number, quantity: number) => {
        updateQuantity(productId, quantity, +1);
    }
    const onClickMinus = async (productId: number, quantity: number) => {
        updateQuantity(productId, quantity, -1);
    }
    React.useEffect(() => {
        if (cartQuantity.length === 0) return;

        const debouncedUpdate = debounce(() => {
            cartQuantity.forEach(item => {
                updateCountProduct({
                    productId: item.productId,
                    quantity: item.quantity
                });
            });
        }, 300);
        debouncedUpdate();
        return () => debouncedUpdate.cancel();
    }, [cartQuantity, updateCountProduct]);
    const onSaveRoom = (data: DeliveryFormInput) => {
        setSavedRoom(data.room);
        setIsRoomAprove(true);
        setShowRoomForm(false);
    }

    const onConfirmRoom = () => {
        setIsRoomAprove(true);
        setShowRoomForm(false);
    }

    const onClickOrder = async () => {
        const room = isDelivery ? (savedRoom || user?.room || null) : null;
        const response = await createOrder({ 
            deliveryRoom: room,
            needsDelivery: isDelivery 
        }).unwrap();
        setOrderResponse(response);
        setIsOrderModalOpened(true);
    }
    const onClickClose = () => {
        setIsOrderModalOpened(false);
        removeAllCart();
    }
    
    if (!isAuthenticated) {
        return <div className={styles.unAuth}>
            <h3>Похоже, Вы ещё не авторизованы</h3>
            <Link to='/authorization'>
                <p>Авторизация</p>
            </Link>
        </div>
    }
    
    return (
        isLoadingCart ?
            <div className={styles.loadingWindow}>
                <Flex align="center" gap="middle">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 65 }} spin />} size="large" className={styles.spinner} />
                </Flex>
            </div>
            :
            isLoadingCreateOrder ? <div className={styles.loadingWindow}>
                <Flex align="center" gap="middle">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 65 }} spin />} size="large" className={styles.spinner} />
                </Flex>
            </div>
                :
                (cartItem?.totalCount === 0) ?
                    <CartEmpty />
                    :
                    (<div className={styles.cart}>

                        {isLoadingRemove ?
                            <div className={styles.loadingRemove}>
                                <Spin indicator={<LoadingOutlined spin style={{ fontSize: 17.55 }} />} size="large" />
                            </div>
                            :
                            <button className={styles.clearCartButton} onClick={() => removeAllCart()}>Очистить корзину</button>
                        }
                        <div className={styles.items}>
                            {cartItem?.Products?.map((obj) => (


                                <div key={obj.id} className={styles.item}>

                                    <div className={styles.itemimg}>
                                        <img src={obj.imageUrl} alt="items-img" />
                                    </div>
                                    <div className={styles.productInfo}>
                                        <h2 className={styles.title}>{obj.title}, <span className={styles.size}>{obj.size}{obj.unit}</span></h2>
                                        <p className={styles.pricetext}>Цена за 1 шт:</p>
                                        <p className={styles.price}>{obj.price} ₽</p>
                                        <p className={styles.totalItemPrice}>{obj.CartItem.quantity} * {obj.price} ₽ = <span >{Math.round(obj.price * obj.CartItem.quantity)}₽</span></p>
                                    </div>


                                    <div className={styles.countItem}>
                                        <button className={styles.plus} onClick={() => onClickPlus(obj.id, obj.CartItem.quantity)} disabled={obj.inStock <= (cartQuantity.find(item => item.productId === obj.id)?.quantity ?? obj.CartItem?.quantity)}>+</button>
                                        <p className={styles.count}>{cartQuantity.find(item => item.productId === obj.id)?.quantity ?? obj.CartItem.quantity}</p>
                                        <button className={styles.minus} onClick={() => onClickMinus(obj.id, obj.CartItem.quantity)} disabled={obj.CartItem.quantity === 1 || cartQuantity.find(item => item.productId === obj.id)?.quantity === 1}>-</button>
                                    </div>
                                    {isLoadingRemoveItem
                                        ?
                                        <div className={styles.loadingRemoveItem}>
                                            <Spin indicator={<LoadingOutlined spin style={{ fontSize: 17.55 }} />} size="large" />
                                        </div>
                                        :
                                        <img className={styles.trash} src='/img/trash.svg' width={17} height={17} onClick={() => onClickDelelte(obj.id)} />
                                    }
                                </div>
                            ))}
                        </div>
                        <div className={styles.deliverySection}>
                            <div className={styles.deliveryQuestion}>
                                <input 
                                    type="checkbox" 
                                    id="deliveryCheckbox"
                                    checked={isDelivery}
                                    onChange={(e) => {
                                        setIsDelivery(e.target.checked);
                                    }}
                                    className={styles.deliveryCheckbox}
                                />
                                <label htmlFor="deliveryCheckbox" className={styles.deliveryLabel}>
                                    Доставка
                                </label>
                                {isDelivery && showRoomForm && (
                                    <img 
                                        src="/img/cross.svg" 
                                        alt="Отменить доставку"
                                        className={styles.clearDelivery}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDelivery(false);
                                            setShowRoomForm(false);
                                        }}
                                        title="Отменить доставку"
                                    />
                                )}
                            </div>
                            {isDelivery && showRoomForm && (
                                <div className={styles.deliveryRoomForm}>
                                    <div className={styles.deliveryRoomSection}>
                                        <h3>📍 Укажите номер комнаты</h3>
                                        {isRoomApprove ? (
                                            <div className={styles.roomApprove}>
                                                <p className={styles.roomValue}>Комната: {savedRoom || user?.room || 'Не указана'}</p>
                                                <p className={styles.activeDelivery} onClick={onConfirmRoom}>Верно</p>
                                                <p onClick={() => {
                                                    setIsRoomAprove(false);
                                                    setShowRoomForm(true);
                                                }}>Изменить</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmitRoom(onSaveRoom)} className={styles.changeRoom}>
                                                <input 
                                                    {...registerRoom('room', {
                                                        required: isDelivery ? 'Это обязательное поле' : false
                                                    })}
                                                    defaultValue={user?.room || ''}
                                                    placeholder="Введите номер комнаты"
                                                />
                                                <button type="submit" className={styles.saveRoomButton}>
                                                    <img src="/img/check-mark.svg" width={15} height={15} alt="" />
                                                </button>
                                                {user?.room && (
                                                    <img src="/img/cross.svg" width={11} height={11} alt="" onClick={() => setIsRoomAprove(true)} />
                                                )}
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.priceAndOrder}>
                            <p className={styles.totalPrice}>Общая сумма: {Math.round(cartItem?.totalPrice ?? 0)}</p>
                            <button 
                                className={styles.buttonOrder} 
                                onClick={onClickOrder}
                                disabled={isDelivery && !isRoomApprove && !savedRoom && !user?.room}
                            >
                                Оформить заказ
                            </button>
                            {isOrderModalOpened && 
                            <Modal
                                onClose={() => onClickClose()}
                                stylesModal={'order'}>
                                <Order
                                    orderResponse={orderResponse}
                                />
                            </Modal>
                            }
                        </div>
                    </div>)

    );
};


