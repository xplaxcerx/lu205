import { useGetAllOrderQuery } from "../../redux/orderApiSlice";

export const MyOrders = () => {
    const { data: orders } = useGetAllOrderQuery();
    return (
        <div>
            <h1>Мои Заказы</h1>
            {orders?.map((order) => (
                <div key={order.id}>
                    <p>Номер Заказа: {order.id}</p>
                    <p>Сумма: {order.totalPrice}</p>
                </div>
            ))}
        </div>
    );
};


