import React from 'react';
import { useForm } from 'react-hook-form';
import { useAddCategoryMutation, useGetCategoriesQuery } from '../../redux/apiSlice';
import styles from './styles.module.scss';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';

type CategoryFormInput = {
    category: string;
}

interface AddCategoryProps {
    onClose: () => void;
}

export const AddCategory: React.FC<AddCategoryProps> = ({ onClose }) => {
    const [addCategory, { isLoading }] = useAddCategoryMutation();
    const { refetch } = useGetCategoriesQuery();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormInput>();

    const onSubmit = async (data: CategoryFormInput) => {
        try {
            await addCategory({ category: data.category }).unwrap();
            await refetch();
            reset();
            onClose();
        } catch (error: any) {
            console.error('Ошибка при добавлении категории:', error);
            alert(error?.data?.message || 'Не удалось добавить категорию');
        }
    };

    return (
        <div className={styles.addCategoryForm}>
            <h2>Добавить новую категорию</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    {...register('category', {
                        required: 'Название категории обязательно',
                        minLength: {
                            value: 2,
                            message: 'Название должно содержать минимум 2 символа'
                        }
                    })}
                    type="text"
                    placeholder="Введите название категории"
                    className={styles.categoryInput}
                />
                {errors.category && (
                    <p className={styles.error}>{errors.category.message}</p>
                )}
                <div className={styles.buttons}>
                    <button type="button" onClick={onClose} className={styles.cancelButton}>
                        Отмена
                    </button>
                    {isLoading ? (
                        <Flex align="center" gap="middle">
                            <Spin indicator={<LoadingOutlined spin />} size="small" />
                        </Flex>
                    ) : (
                        <button type="submit" className={styles.submitButton}>
                            Добавить
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

