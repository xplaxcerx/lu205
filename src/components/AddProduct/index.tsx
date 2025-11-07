import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { useAddProductMutation, useGetCategoriesQuery, useAddCategoryMutation, useDeleteCategoryMutation } from '../../redux/apiSlice';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
type FormInput = {
    id: number,
    title: string,
    price: number,
    imageUrl: string,
    category: string,
    size: number,
    unit: string,
    type: string,
    inStock: number
}

export const AddProduct = () => {
    const [addProduct, { isLoading }] = useAddProductMutation();
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
        // formState: {
        //     errors
        // },
        reset,
        // clearErrors

    } = useForm<FormInput>();
    
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

    const onClickAddBtn = async (data: FormInput) => {
        try {
            await addProduct(data);
            reset();
            setShowNewCategoryInput(false);
            setNewCategoryName('');
        }catch(error) {
            console.log(error);
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
    return (
        <form onSubmit={handleSubmit(onClickAddBtn)}>
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
                    type="text" 
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
                                {categories.map((category, index) => (
                                    <div 
                                        key={index} 
                                        className={`${styles.dropdownItem} ${selectedCategory === category ? styles.selected : ''}`}
                                        onClick={() => handleSelectCategory(category)}
                                    >
                                        <span>{category}</span>
                                        <button
                                            type="button"
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDeleteCategory(category, e)}
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
                    type="text" 
                    placeholder='Количество'/> 

                </div>
                {isLoading 
                ? 
                    <Flex align="center" gap="middle">
                        <Spin indicator={<LoadingOutlined spin />} size="large"  className={styles.spinner}/>
                    </Flex> 
                :  
                    <button className={styles.addBtn}>Добавить</button>
                }
            </div>
        

        </form>
    );
}