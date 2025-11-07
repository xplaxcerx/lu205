import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss'
import { useEditProductMutation, useGetCategoriesQuery, useAddCategoryMutation, useDeleteCategoryMutation } from '../../redux/apiSlice';
import { useNavigate } from "react-router";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
type FormInput = {
    title: string,
    price: number,
    imageUrl: string,
    category: string,
    size: number,
    unit: string,
    type: string,
    inStock: number


}
interface EditColumnProps {
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
export const AdminEditColumnProduct: React.FC<EditColumnProps> = ({ id, title, price, imageUrl, category, size, unit, type, inStock }) => {
    const navigate = useNavigate();
    const [editProduct] = useEditProductMutation();
    const [addCategory, { isLoading: isLoadingAddCategory }] = useAddCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();
    const { data: categories = [], isLoading: isLoadingCategories, refetch: refetchCategories } = useGetCategoriesQuery();
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const {
        register,
        handleSubmit,
        setValue,
        watch,
    } = useForm<FormInput>({
        defaultValues: {
            title: title,
            price: price,
            imageUrl: imageUrl,
            category: category,
            size: size,
            unit: unit,
            type: type,
            inStock: inStock
        }
    });
    
    const selectedCategory = watch('category');
    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Введите название категории');
            return;
        }
        const categoryName = newCategoryName.trim();
        try {
            await addCategory({ category: categoryName }).unwrap();
            await refetchCategories();
            setValue('category', categoryName, { shouldValidate: true });
            setShowNewCategoryInput(false);
            setNewCategoryName('');
        } catch (error: any) {
            console.error('Ошибка при добавлении категории:', error);
            alert(error?.data?.message || 'Не удалось добавить категорию');
        }
    }

    useEffect(() => {
        if (selectedCategory === '__new__') {
            setShowNewCategoryInput(true);
            setIsDropdownOpen(false);
        } else {
            setShowNewCategoryInput(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleDeleteCategory = async (category: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Вы уверены, что хотите удалить категорию "${category}"? Все товары в этой категории будут удалены.`)) {
            return;
        }
        try {
            await deleteCategory({ category }).unwrap();
            await refetchCategories();
            if (selectedCategory === category) {
                setValue('category', '');
            }
        } catch (error: any) {
            console.error('Ошибка при удалении категории:', error);
            alert(error?.data?.message || 'Не удалось удалить категорию');
        }
    };

    const handleSelectCategory = (category: string) => {
        if (category === '__new__') {
            setValue('category', '__new__');
        } else {
            setValue('category', category);
            setIsDropdownOpen(false);
        }
    };

    const onClickEdit = (data: FormInput) => {
        try {
            editProduct({
            id: id,
            title: data.title,
            price: Number(data.price),
            imageUrl: data.imageUrl,
            category: data.category,
            size: Number(data.size),
            unit: data.unit,
            type: data.type,
            inStock: Number(data.inStock)
        }).unwrap();
        navigate('/adminEditProduct')
    }catch(error) {
        console.log(error);
    }
    }
    return (
        <form onSubmit={handleSubmit(onClickEdit)}>
            <div className={styles.containerAdmin}>
            <div className={styles.inputBlock}>
                <input 
                {...register('title', 
                    { 
                        required: 'Это обязательно поле'
                    }
                )}
                type="text" 
                placeholder='Название товара'/>
                 <input 
                {...register('price', 
                    { 
                        required: 'Это обязательно поле'
                    }
                )}
                type="number" 
                placeholder='Стоимость'/> 

                <input 
                {...register('imageUrl', 
                    { 
                        required: 'Это обязательно поле'
                    }
                )}
                type="text" 
                placeholder='Картинка (Ссылка)'/> 
                
                <div className={styles.categoryContainer} ref={dropdownRef}>
                        <div 
                            className={styles.customSelect}
                            onClick={() => !isLoadingCategories && setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <input
                                type="hidden"
                                {...register('category', { 
                                    required: 'Это обязательно поле'
                                })}
                            />
                            <div className={styles.selectDisplay}>
                                {selectedCategory && selectedCategory !== '__new__' 
                                    ? selectedCategory 
                                    : selectedCategory === '__new__' 
                                    ? '+ Добавить новую категорию' 
                                    : 'Выберите категорию'}
                            </div>
                            <span className={styles.selectArrow}>▼</span>
                        </div>
                        {isDropdownOpen && (
                            <div className={styles.dropdown}>
                                {categories.map((categoryItem, index) => (
                                    <div 
                                        key={index} 
                                        className={`${styles.dropdownItem} ${selectedCategory === categoryItem ? styles.selected : ''}`}
                                        onClick={() => handleSelectCategory(categoryItem)}
                                    >
                                        <span>{categoryItem}</span>
                                        <button
                                            type="button"
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDeleteCategory(categoryItem, e)}
                                            title="Удалить категорию"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <div 
                                    className={`${styles.dropdownItem} ${selectedCategory === '__new__' ? styles.selected : ''}`}
                                    onClick={() => handleSelectCategory('__new__')}
                                >
                                    <span>+ Добавить новую категорию</span>
                                </div>
                            </div>
                        )}
                        {showNewCategoryInput && (
                            <div className={styles.newCategoryInput}>
                                <input
                                    type="text"
                                    placeholder="Введите название категории"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className={styles.newCategoryField}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddNewCategory}
                                    disabled={isLoadingAddCategory || !newCategoryName.trim()}
                                    className={styles.addCategoryBtn}
                                >
                                    {isLoadingAddCategory ? (
                                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                                    ) : (
                                        '✓'
                                    )}
                                </button>
                            </div>
                        )}
                    </div> 
                
                <input 
                {...register('size', 
                    { 
                        required: 'Это обязательно поле'
                    }
                )}
                type="text" 
                placeholder='Размер (Цифры)'/> 
                
                <input 
                {...register('unit', 
                    { 
                        required: 'Это обязательно поле'
                    }
                )}
                type="text" 
                placeholder='Единицы измерения'/> 
                
                <input 
                {...register('type', 
                    { 
                        required: 'Это обязательно поле'
                    }
                )}
                type="text" 
                placeholder='Тип товара (Еда/Напиток)'/> 
                <input 
                {...register('inStock', 
                    { 
                        required: 'Это обязательно поле'
                    }
                )}
                type="number" 
                placeholder='Количество'/> 

            </div>
            <button className={styles.addBtn}>Применить изменения</button>
        </div>
            </form>
    );
}