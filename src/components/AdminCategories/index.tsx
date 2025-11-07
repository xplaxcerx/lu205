import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { setAdminCategory } from "../../redux/filter/slice";
import { useGetCategoriesQuery } from "../../redux/apiSlice";
import styles from './styles.module.scss';

export const Categories = () => {
    const dispatch = useAppDispatch();
    const { adminCategoryID, adminSelectedCategoryName } = useAppSelector((state: RootState) => state.filter);
    const { data: categories = [], isLoading } = useGetCategoriesQuery();
    
    const allCategories = ['Все', ...categories];
    
    const setCategoryID = (i: number, categoryName: string) => {
        dispatch(setAdminCategory({ id: i, name: categoryName }));
    }
    
    if (isLoading) {
        return <div className={styles.categories}>Загрузка...</div>;
    }
    
    return (
        <div className={styles.categories}>
            {allCategories.map((category, i) => {
                const isActive = i === 0 ? adminCategoryID === 0 : (adminSelectedCategoryName === category || adminCategoryID === i);
                return (
                    <li
                        key={i}
                        className={isActive ? styles.active : ''}
                        onClick={() => setCategoryID(i, category)}>
                        {category}
                    </li>
                );
            })}
        </div>
    );
};