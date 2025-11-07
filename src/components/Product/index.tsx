import { ClockCircleOutlined, CheckOutlined } from '@ant-design/icons'
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
import { useAddOnFavoriteMutation, useAddToCartMutation, useGetCartQuery, useGetFavoriteQuery, useRemoveFromCartMutation, useRemoveFromFavoriteMutation } from '../../redux/apiSlice';
import styles from './styles.module.scss';
type CartItemProps = {
    id: number,
    title: string,
    price: number,
    imageUrl: string,
    size: number,
    unit: string,
    inStock: number,
}


export const Product: React.FC<CartItemProps> = ({ id, title, price, imageUrl, size, unit, inStock}) => {
    const isAuthenticated = !!localStorage.getItem('token');
    const [addToCart, { isLoading: isLoadingAddCart }] = useAddToCartMutation();
    const [removeFromCart, { isLoading: isLoadingRemoveCart }] = useRemoveFromCartMutation();
    const [removeFromFavorite, { isLoading: isLoadingRemoveFavorite}] = useRemoveFromFavoriteMutation();
    const [addToFavorite, { isLoading: isLoadingAddFavorite}] = useAddOnFavoriteMutation();
    
    const { data: favorites } = useGetFavoriteQuery(undefined, { skip: !isAuthenticated });
    const { data: cartItem } = useGetCartQuery(undefined, { skip: !isAuthenticated });
    const addToCartBtn = (productId: number) => {
        if (!localStorage.getItem('token')) {
            alert('Сначала авторизируйтесь');
        }
        else{
            addToCart({
                productId, 
                quantity: 1,
            })
        }
        
       
    };
    const onClickUnFavorite = (productId: number) => {
        addToFavorite({ productId })
    };  

    const onClickFavorite = (productId: number) => {
        removeFromFavorite(productId)
    }

    const checkInFavorite = (productId: number) => {
        return favorites?.Products?.some((product) => product.id === productId) ?? false;
    };
    const checkInCart = (productId: number) => {
        return cartItem?.Products?.some((product) => product.id === productId) ?? false;
    };
    const onClickDelelte = (productId:number) => (
        removeFromCart(productId)
    );
    return (
            
            <div className={styles.item}>
                {isLoadingAddFavorite || isLoadingRemoveFavorite 
                ?
                <div className={styles.loadingWindow}>
                <Flex align="center" gap="middle">
                <Spin indicator={<LoadingOutlined style={{fontSize: 25}}spin />} size="large"  className={styles.loadingInFavorites}/>
                </Flex> 
                </div> 
                : 
                checkInFavorite(id) ?  
                <img className={styles.favorite} src="/img/liked.svg" alt="liked" width={15} height={15} onClick={() => onClickFavorite(id)} /> 
                : 
                <img className={styles.favorite} src="/img/unLiked.svg" alt="unLiked" width={15} height={15} onClick={() => onClickUnFavorite(id)} />
                }
                <div className={styles.itemimg}>
                    <img src={imageUrl} alt="items-img" />
                </div>
                <h2 className={styles.title}>{title}</h2>   
                <p className={styles.pricetext}>Цена за 1 шт:</p>
                <p className={styles.price}>{Math.round(price)} ₽</p>
                <div className={styles.sizeItem}>
                    <p>{size}{unit}</p>
                </div>
                <div className={styles.instockBlock}>
                    <p>Наличие: </p>
                    <h2>{inStock > 0 ? inStock : "Товар закончился"}</h2>
                </div>
                {isLoadingAddCart || isLoadingRemoveCart  
                ? 
                <div className={styles.loadingWindow}>
                    <Flex align="center" gap="middle">
                    <Spin indicator={<LoadingOutlined style={{fontSize: 25}}spin />} size="large"  className={styles.loadingInCart}/>
                </Flex> 
                </div> 
                : 
                checkInCart(id) 
                ? 
                <CheckOutlined style={{fontSize: 21}}className={styles.itemAddedInCart} onClick={() => onClickDelelte(id)}/> 
                : 
                inStock !== 0 
                ? 
                <img className={styles.addCartButton} src="/img/add-cart.svg" alt="plus" onClick={() => addToCartBtn(id)}/>
                
                
                :
                <ClockCircleOutlined style={{fontSize: 23}} className={styles.inStockNull}/>
                }
            </div>
    );
};