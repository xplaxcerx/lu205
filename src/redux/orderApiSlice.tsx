    import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
    
export interface OrderResponse {
    id: number,          
    userId: number,      
    totalPrice: number,  
    deliveryRoom: string | null,  
    OrderItems: {        
        id: number,
        orderId: number,
        productId: number,
        quantity: number,
        price: number,
        Product: {
            id: number,
            title: string,
            imageUrl: string,
            price: number,
            size: number,
            unit: string,
        };
    }[];
    createdAt: string;
    updatedAt: string;
}

interface EditRoom {
    message: string,
    order: {
        id: number,
        deliveryRoom: string,
        status: string
    }
}

export const orderApiSlice = createApi({
    reducerPath: 'orderApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: import.meta.env.MODE === 'production' 
            ? import.meta.env.VITE_PRODUCTION_API_URL 
            : import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Order', 'Cart'],
    endpoints: (builder) => ({
        createOrder: builder.mutation<OrderResponse, { deliveryRoom?: string | null; needsDelivery?: boolean } | void>({
            query: (params) => ({
                url: '/orders',
                method: 'POST',
                body: params || {}
            }),
            invalidatesTags: ['Order', 'Cart']
        }),
        orderEditRoom: builder.mutation<EditRoom, { room: string, orderId: number}> ({
            query: ({room, orderId}) => ({
                url: `/orders/${orderId}/delivery-room`,
                method: 'PATCH',
                body: {
                    room
                }
            }),
            invalidatesTags: ['Order', 'Cart']
        }),
        getOrder: builder.query<OrderResponse, { id: number | undefined}> ({
            query: ({ id }) => `/orders/${id}`,
            providesTags: ['Order']
        }),
        getAllOrder: builder.query<OrderResponse[], void> ({
            query: () => `/orders`,
            providesTags: ['Order']
        }),
        
    }),
    
    
})

export const {
    useCreateOrderMutation,
    useOrderEditRoomMutation,
    useGetOrderQuery,
    useGetAllOrderQuery,
} = orderApiSlice;