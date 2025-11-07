import { Link } from 'react-router';
import styles from './styles.module.scss';
import { useGetCartQuery } from '../../redux/apiSlice';
import { useGetCurrentUserQuery } from '../../redux/userApiSlice';

export const Header = () => {
    
    const { data: user } = useGetCurrentUserQuery();

    const { data: cartItem } = useGetCartQuery();
    
    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                <Link to='/' className={styles.linkHome}>
                <h1 className={styles.title}>Универсам 205</h1>
                </Link>
                
                <div className={styles.headerElem}>
                    {user?.role === 'admin' && localStorage.getItem('token') !== null&& 
                    <Link to='/admin'>
                        <img className={styles.admin} src="/img/adminPanel.svg" alt="" />
                    </Link>
                    }
                    
                    <Link to='/profile'><img className={styles.profile} src="img/profile.svg" alt="profilcde"/></Link>
                    <Link to='/favorite'>
                            <img className={styles.favorite} src="/img/liked.svg" alt=""/>
                    </Link>
                    <Link to='/cart'>
                        <div className={styles.cart}>
                            
                                <img src="/img/cart-logo.svg" alt=""/>
                            {localStorage.getItem('token') !== null && cartItem?.totalPrice !== 0 &&  <p className={styles.totalPrice}>{Math.round(cartItem?.totalPrice ?? 0)}₽</p>}
                           
                        </div>
                        </Link>
                </div>
            </div>
        </div>
    );
};