import { Link } from 'react-router';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
import { useAddToCartMutation, useGetCartQuery, useGetFavoriteQuery, useGetProductsQuery, useRemoveAllFavoriteMutation, useRemoveFromCartMutation, useRemoveFromFavoriteMutation } from '../../redux/apiSlice';
import { FavoriteEmpty } from './FavoriteEmprty';
import { ClockCircleOutlined, CheckOutlined } from '@ant-design/icons'
import styles from './styles.module.scss';

export const Favorite = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    const { data: favoriteItem, isLoading } = useGetFavoriteQuery(undefined, { skip: !isAuthenticated });
    const [removeFromFavorite, { isLoading: isLoadingRemoveItem }] = useRemoveFromFavoriteMutation();
    const [addToCart, { isLoading: isLoadingAddToCart }] = useAddToCartMutation();
    const [removeAllFavorite, { isLoading: isLoadingRemove}] = useRemoveAllFavoriteMutation();
    const [removeFromCart] = useRemoveFromCartMutation();
    const { data: cartItem } = useGetCartQuery(undefined, { skip: !isAuthenticated });
    const { data: Product } = useGetProductsQuery({categoryId: 0, search: ''});
    const onClickDelelte = (productId: number) => (
        removeFromFavorite(productId)
    );
    const addToCartBtn = (productId: number) => {
        addToCart({
            productId, 
            quantity: 1
        })
    };
    const onClickDeleteFromCart = (productId:number) => (
        removeFromCart(productId)
    );
    
    if (!isAuthenticated) {
        return <div className={styles.unAuth}>
            <h3>Похоже, Вы ещё не авторизованы</h3>
            <Link to='/authorization'>
            <p>Авторизация</p>
            </Link>
        </div>
    }
    return (
        isLoading ? 
            <div className={styles.loadingWindow}>
            <Flex align="center" gap="middle">
            <Spin indicator={<LoadingOutlined style={{fontSize: 65}}spin />} size="large"  className={styles.spinner}/>
            </Flex> 
            </div> 
            :  
        <>
        {favoriteItem?.Products?.length === 0 ? 
        <FavoriteEmpty /> 
        :
        (<div className={styles.cart}>
            {isLoadingRemove ? 
            <div className={styles.loadingRemove}>
                <Spin indicator={<LoadingOutlined spin style={{ fontSize: 17.55}}/>}  size="large"/>
            </div> 
             :
            <button className={styles.clearCartButton} onClick={() => removeAllFavorite()}>Очистить избранное</button>
            }
            <div className={styles.items}> 

                {favoriteItem?.Products.map((obj) => (
                
                <div key={obj.id} className={styles.item}>

                <div className={styles.itemimg}>

                    <img src={obj.imageUrl} alt="items-img" />
                </div>
                <div className={styles.productInfo}>
                    <h2 className={styles.title}>{obj.title}, <span className={styles.sizeItem}>{obj.size}{obj.unit}</span></h2>
                    <p className={styles.pricetext}>Цена за 1 шт:</p>
                    <p className={styles.price}>{obj.price} ₽</p>
                </div>
                <div className={styles.likedCart}>
                    {isLoadingRemoveItem 
                    ?
                    <div className={styles.loadingRemoveItem}>
                        <Spin indicator={<LoadingOutlined spin style={{ fontSize: 19}}/>}  size="large"/>
                    </div>  
                    :
                    <img className={styles.liked} src='/img/liked.svg'onClick={() => onClickDelelte(obj.id)}/>
                    }
                    {isLoadingAddToCart 
                    ?
                    <div className={styles.addCartButton}>
                        <Spin indicator={<LoadingOutlined spin style={{ fontSize: 19}}/>}  size="large"/>
                    </div>  
                    :
                    cartItem?.Products.some(item => item.id === obj.id) ?
                    <div className={styles.addToCart}>
                        <CheckOutlined style={{ fontSize: 23}} onClick={() => onClickDeleteFromCart(obj.id)}/>
                    </div>
                    :
                    Product?.find(item => item.id === obj.id)?.inStock === 0 
                    ?
                    <div className={styles.inStockNull}>
                        <ClockCircleOutlined style={{ fontSize: 23 }}/>
                    </div>
                    :
                    <img className={styles.addCartButton} src="/img/add-cart.svg" alt="plus" onClick={() => addToCartBtn(obj.id)}/>
                    }
                </div>
            </div>
            ))}
        </div>
        </div>)
        }
        </>
    );
};
