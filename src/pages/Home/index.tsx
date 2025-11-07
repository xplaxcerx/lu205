import { Search } from "../../components/Search/index";
import { Product } from "../../components/Product";
import { Categories } from "../../components/Categories/index";
import {  useAppSelector } from "../../redux/hooks";
import styles from './styles.module.scss';
import { useGetProductsQuery } from "../../redux/apiSlice";
import { Skeleton } from "../../components/Product/Skeleton";

export const Home = () => {
    const { categoryID, selectedCategoryName, searchValue } = useAppSelector((state) => state.filter);
    const { data: products, isLoading } = useGetProductsQuery({
        categoryId: categoryID, 
        categoryName: selectedCategoryName,
        search: searchValue
    });
    const skeleton = [...Array(15)].map((_, index) => <Skeleton key={index}/>)
    return (
        <div className={styles.containerHome}>
            <div className="content">
                <Search/>
                <Categories/>
                {isLoading ? <div className={styles.items}>
                    {skeleton}
                </div> :
                <div className={styles.items}>
                    {products?.map((obj:any) => 
                        <Product
                        key={obj.id}
                        {...obj}
                        details={obj.type === 'food' ? `${obj.weight}` : `${obj.volume}`}
                        products={products}
                        />
                    )}
                    
                </div>
                }
            </div>
        </div>
    );
};