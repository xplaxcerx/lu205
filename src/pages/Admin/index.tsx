import { Link } from 'react-router';
import styles from './styles.module.scss';

export const Admin = () => {
    return (
        <div className={styles.adminPanel}>
            <div className={styles.containerAdminPanel}>
            <h1>Админ Панель</h1>
            <div className={styles.config}>
            <Link to='/adminAddProduct'>
                <p>Добавить Продукт</p>
            </Link>
            <Link to='/adminEditProduct'>
                <p>Изменение Продуктов</p>
            </Link>
        </div>
        </div>
        </div>
    );
}