import styles from './styles.module.scss';
import { Search } from '../AdminSearch';
import { useAppSelector } from '../../redux/hooks';
import { useDeleteProductMutation, useGetProductsQuery, useUpdateInStockMutation } from '../../redux/apiSlice';
import React from 'react';
import { AdminEditColumnProduct } from '../AdminEditColumnProduct';
import { Modal } from '../Modal';
import { useForm } from 'react-hook-form';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
type Product = {
        id: number;
        title: string;
        price: number;
        imageUrl: string;
        category: string;
        size: number;
        unit: string;
        type: string;
        inStock: number;
}
type FormInput = {
    inStock: number;
}
export const EditProduct = () => {
    const [product, setProduct] = React.useState<Product | null >(null);
    const [editProductId, setEditProductId] = React.useState<number>(0);
    const [isEditQuantity, setIsEditQuantity] = React.useState(false);
    const [removeProduct] = useDeleteProductMutation();
    const onClickDelete = (id:number) => { 
        removeProduct({id});
    };
    const { adminCategoryID, adminSelectedCategoryName, adminSearchValue } = useAppSelector(state => state.filter)
    const { data: products, isLoading } = useGetProductsQuery({ 
        categoryId: adminCategoryID, 
        categoryName: adminSelectedCategoryName,
        search: adminSearchValue 
    });
    const [updateCountProduct] = useUpdateInStockMutation();
    const onClickUpdate = async (data: FormInput) => {
        await updateCountProduct({
            amount: data.inStock,
            id: editProductId
        })
        setEditProductId(0);
        setIsEditQuantity(false);
    }
    const {
        register,
        handleSubmit,
    } = useForm<FormInput>();
    const onClickInStock = (id: number) => {
        setIsEditQuantity(true);
        setEditProductId(id);
    }
    return (
        isLoading ? 
            <div className={styles.loadingWindow}>
            <Flex align="center" gap="middle">
            <Spin indicator={<LoadingOutlined style={{fontSize: 65}}spin />} size="large"  className={styles.spinner}/>
            </Flex> 
            </div> 
            :  
        (<div className={styles.cart}>
            <Search/>
            <div className={styles.items}>
                {products?.map((obj) => (
                <div key={obj.id} className={styles.item}>
                <div className={styles.itemimg}>
                    <img src={obj.imageUrl} alt="items-img" />
                </div>
                <div className={styles.productInfo}>
                <h2 className={styles.title}>{obj.title}, <span className={styles.size}>{obj.size}{obj.unit}</span></h2>
                <div className={styles.countPrice}>
                <p className={styles.pricetext}>Цена за 1 шт:</p>

                <form onSubmit={handleSubmit(onClickUpdate)}>
                
                <div className={styles.countItem}>
                    
                    {isEditQuantity && editProductId === obj.id ? 
                        <div className={styles.editCountItem}>
                        <input type='number'{
                            ...register('inStock', {
                                valueAsNumber: true
                            })
                        }>
                        </input> 
                        <div className={styles.acceptChange}></div>
                        <button>
                        ✓
                        </button>
                        
                        <p onClick={() => setIsEditQuantity(false)}>×</p>
                        </div>
                        :
                        <p className={styles.count} onClick={() => onClickInStock(obj.id)}>{obj.inStock}</p>
                    }
                </div>
                </form>
                    </div>
                    <p className={styles.price}>{obj.price} ₽</p>
                </div>

                <img className={styles.editBtn} src="/img/edit-button.svg" alt="" onClick={() => setProduct(obj)}/>

                <img className={styles.trash} src='/img/trash.svg' onClick={() => onClickDelete(obj.id)}/>
                
            </div>   
            ))}
            </div>
            
            {product && <Modal 
                    onClose={() => setProduct(null)}
                    stylesModal={'editProduct'}>
                    <AdminEditColumnProduct
                    {...product}
                    />
                </Modal>
            }
        </div>)
    );
}

