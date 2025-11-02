import styles from './styles.module.scss'
import { OrderResponse } from '../../redux/orderApiSlice';
import React from 'react';

type Order = {
    orderResponse: OrderResponse | null,
}

export const Order: React.FC<Order> = ({ orderResponse }) => {
    return (
        <div className={styles.order}>
            <div className={styles.container}>
                <div className={styles.infoForClient}>
                <div className={styles.infoText}>
                    <h2 className={styles.thanks}>Спасибо за заказ!</h2>
                    <p>Мы скоро свяжемся с вами</p>
                </div>
                <p>Наши контакты:</p>
                <div className={styles.connection}>
                    <a href="https://t.me/tg_dodopizza" className={styles.linkTG}>Сосед 1</a>
                    <a href="https://t.me/Minimixrey" className={styles.linkTG}>Сосед 2</a>
                </div>
                <p>Оплата:</p>
                <div className={styles.pay}>
                    <a href="tel: +7 (922) 775-90-02">+7 (922) 775-90-02</a>
                    <span>СберБанк</span>
                </div>
                </div>
                <div className={styles.orderBlock}>
                <h2>Заказ:</h2>
                {orderResponse?.OrderItems.map((obj) => (
                    <div key={obj.id}className={styles.items}>
                    <h2 className={styles.title}>{obj.Product.title}</h2>
                    <div className={styles.a}>
                    <p className={styles.quantity}>{obj.quantity}</p>
                    <p className={styles.totalPrice}>{obj.quantity * obj.Product.price}₽</p>
                    </div>
                    
                </div>
                ))}
                
                <h3 className={styles.orderTotalPrice}>Итого: {orderResponse?.totalPrice}₽</h3>
                </div>


            </div>


        </div>
    );


}