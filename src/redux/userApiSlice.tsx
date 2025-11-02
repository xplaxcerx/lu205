import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface UserData {
    id: number,
    login: string,
    room: string,
    telegram: string | null,
    role: string
}
interface AuthorazeResponse {
    token: string,
    user: {
        id: number,
        login: string,
        room: string,
    }
}
    
interface RegistInputData {
    login: string,
    password: string,
    room: string,
    telegram?: string,
}

export interface SignInInputData {
    login: string,
    password: string,
}

export const userApiSlice = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${import.meta.env.MODE === 'production' 
            ? import.meta.env.VITE_PRODUCTION_API_URL 
            : import.meta.env.VITE_API_URL}/users`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers;
        }
     }),
    
    tagTypes: ['Auth', 'User', 'Products', 'Cart'],
    endpoints: (builder) => ({
        logout: builder.mutation<void, void>({
            queryFn: () => {
                localStorage.removeItem('token');
                return { data: undefined };
            },
            invalidatesTags: ['Auth']
        }),
        registr: builder.mutation<AuthorazeResponse, RegistInputData> ({
            query: ({ login, password, room, telegram }) => ({
                url: '/register',
                method: 'POST',
                body: {
                    login: login,
                    password: password,
                    room: room,
                    telegram: telegram
                }
            }), 
            onQueryStarted: () => {
                
            },
            invalidatesTags: ['Auth']
        }),
        autorize: builder.mutation<AuthorazeResponse, SignInInputData> ({
            query: ({ login, password }) => ({
                url: '/login',
                method: 'POST',
                body: {
                    login: login,
                    password: password
                }
            }),
            invalidatesTags: ['Auth', 'Cart', 'Products']
        }),
        getCurrentUser: builder.query<UserData, void> ({
            query: () => ({
                url: '/me',
                method: 'GET'
            }),
            providesTags: ['User']
        }),
        editUserRoom: builder.mutation<UserData, {room: string}> ({
            query: ({ room }) => ({
                url: '/room',
                method: 'PUT',
                body: {
                    room
                }
            }),
            invalidatesTags: ['User']
        }),
        editUserTelegram: builder.mutation<UserData, {telegram: string}> ({
            query: ({ telegram }) => ({
                url: '/telegram',
                method: 'PUT',
                body: {
                    telegram
                }
            }),
            invalidatesTags: ['User']
        }),
        signOut: builder.mutation<void, void>({
            queryFn: () => {
                localStorage.removeItem('token');
                return { data: undefined };
            },
            invalidatesTags: ['Auth', 'User', 'Cart'],
        })
    })
});


export const {
    useRegistrMutation,
    useLogoutMutation,
    useAutorizeMutation,
    useGetCurrentUserQuery,
    useEditUserRoomMutation,
    useEditUserTelegramMutation,
    useSignOutMutation,
} = userApiSlice;