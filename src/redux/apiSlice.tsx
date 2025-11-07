import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type BaseItem = {
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

type Food = BaseItem &{
    type: 'food',
    weight: number
};

type Drink = BaseItem & {
    type: 'drink',
    volume: number,
};
export type Item = Food | Drink;



export interface CartResponse {
    Products: {
        id: number;
        title: string;
        imageUrl: string;
        price: number;
        size: number,
        unit: string,
        inStock: number,
        CartItem: {
            quantity: number;
        }
        
    }[];
    totalPrice: number,
    totalCount: number,
}

interface FavoriteResponse {
    Products: {
        id: number;
        title: string;
        imageUrl: string;
        price: number;
        size: number,
        unit: number,
        
    }[];
    totalCount: number,
}

interface AddCart {
    productId: number,
    quantity: number,
}

interface ProductInput {
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
interface ProductResponse {

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

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: import.meta.env.MODE === 'production' 
            ? import.meta.env.VITE_PRODUCTION_API_URL 
            : import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if(token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Products', 'Cart', 'Favorites', 'adminProduct', 'Categories'],
    endpoints: (builder) => ({
        getProducts: builder.query<BaseItem[], { categoryId: number, categoryName?: string | null, search?: string}> ({
            query: ({ categoryId, categoryName, search }) => ({
                url: '/products',
                params: {
                ...(categoryId > 0 && categoryName ? {category: categoryName} : {}),
                ...(search ? { search } : {})
                }
            }),
            providesTags: ['Products']
        }),

        getCart: builder.query<CartResponse, void>({
            query: () => ({
                url: '/cart',
            }),
            providesTags: ['Cart'],
            transformResponse: (response: CartResponse) => ({
                ...response,
                totalPrice: response.Products?.reduce(
                    (sum, item) => sum + (item.CartItem.quantity*item.price), 0 
                ),
                totalCount: response.Products?.reduce(
                    (sum, item) => sum + item.CartItem.quantity, 0 
                )
            }),

        }),

        addToCart: builder.mutation<CartResponse, AddCart>({
            query: (body) => ({
                url: '/cart/add',
                method: 'POST',
                body,
            }),
                invalidatesTags: ['Cart']
        }),
        removeFromCart: builder.mutation<CartResponse, number>({
            query: (productId) => ({
                url: `/cart/remove/${productId}`,
                method: 'DELETE',
                
            }),
            invalidatesTags: ['Cart']
        }),
        removeAllCart: builder.mutation<{ message: string }, void> ({
            query: () => ({
                url: '/cart/clear',
                method: 'DELETE',
               
            }),
            invalidatesTags: ['Cart']
        }),
        updateCountProduct: builder.mutation<CartResponse, { productId: number, quantity: number}> ({
            query: ({ productId, quantity }) => ({
                url: `/cart/update/${productId}`,
                method: 'PUT',
                body: { quantity },
                
            }),
            invalidatesTags: ['Cart']
        }),
        getFavorite: builder.query<FavoriteResponse, void> ({
            query: () => ({
                url: '/favorites',
                method: 'GET',  
            }),
            providesTags: ['Favorites'],
        }),
        addOnFavorite: builder.mutation<FavoriteResponse, { productId: number }> ({
            query: (body) => ({
                url: '/favorites/add',
                body,
                method: 'POST',
                
            }),
            invalidatesTags: ['Favorites']
        }),
        removeAllFavorite: builder.mutation<{ message: string }, void> ({
            query: () => ({
                url: '/favorites/clear',
                method: 'DELETE',
                
            }),
            invalidatesTags: ['Favorites']
        }),
        removeFromFavorite: builder.mutation<{ message: string }, number > ({
            query: (productId) => ({
                url: `/favorites/remove/${productId}`,
                method: 'DELETE',
               
            }),
            invalidatesTags: ['Favorites']
        }),
        addProduct: builder.mutation<{ message: string }, ProductInput>({
            query: ({ title, price, imageUrl, category, size, unit, type, inStock}) => ({
                url: '/admin/products',
                method: 'POST',
                body: {
                    title, 
                    price, 
                    imageUrl, 
                    category, 
                    size, 
                    unit, 
                    type,
                    inStock
                }
            }),
            invalidatesTags: ['Products', 'adminProduct']
        }),
        editProduct: builder.mutation<ProductResponse, ProductInput>({

            query: ({ id, ...data}) => {
                return {url: `/admin/products/${id}`,
                method: 'PUT',
                body: {
                    ...data,
                }}
                
            },
            invalidatesTags: ['Products', 'adminProduct']
        }),
        deleteProduct: builder.mutation<{ message: string}, {id: number}>({
            query: ({ id }) => ({
                url: `/admin/products/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Products', 'adminProduct']
        }),
        updateInStock: builder.mutation<{ message: string, inStock: number }, { amount: number, id: number}>({
            query: ({ amount, id }) => ({
                url: `/admin/products/${id}/stock`,
                method: 'PATCH',
                body: {
                    amount
                }
            }),
            invalidatesTags: ['Products', 'adminProduct']
        }),
        getCategories: builder.query<string[], void>({
            query: () => ({
                url: '/categories',
                method: 'GET'
            }),
            providesTags: ['Categories']
        }),
        addCategory: builder.mutation<{ message: string, category: string, tempProductId: number }, { category: string }>({
            query: ({ category }) => ({
                url: '/categories',
                method: 'POST',
                body: { category }
            }),
            invalidatesTags: ['Products', 'adminProduct', 'Categories']
        }),
        deleteCategory: builder.mutation<{ message: string, deletedCount: number }, { category: string }>({
            query: ({ category }) => ({
                url: `/categories/${encodeURIComponent(category)}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Products', 'adminProduct', 'Categories']
        })
        
    })
});

export const {
    useGetProductsQuery,
    useGetCartQuery,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useRemoveAllCartMutation,
    useUpdateCountProductMutation,
    useGetFavoriteQuery,
    useAddOnFavoriteMutation,
    useRemoveAllFavoriteMutation,
    useRemoveFromFavoriteMutation,
    useAddProductMutation,
    useEditProductMutation,
    useDeleteProductMutation,
    useUpdateInStockMutation,
    useGetCategoriesQuery,
    useAddCategoryMutation,
    useDeleteCategoryMutation,
} = apiSlice;
