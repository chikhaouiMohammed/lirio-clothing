import { Link, useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const { order } = location.state || {}; // Retrieve the order details from location state

  if (!order) {
    return <p className="text-center text-lg text-gray-600">Order details not found.</p>;
  }

  return (
    <div className="container mx-auto px-6 py-12 text-darkGray">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-primary mb-4">Thank You for Your Order!</h1>
        <p className="text-lg text-gray-600">Your order has been placed successfully.</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-secondary mb-6 border-b pb-4">Order Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm font-semibold text-gray-500">Order ID</p>
            <p className="text-lg font-bold">{order.id}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Amount</p>
            <p className="text-lg font-bold">{order.totalAmount} DZD</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Status</p>
            <p className="text-lg font-bold">{order.status}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Contact Info</p>
            <p className="text-lg font-bold">{order.contactInfo.email || order.contactInfo.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-gray-500">Delivery Address</p>
            <p className="text-lg font-bold">
              {order.deliveryInfo.address}, {order.deliveryInfo.city}
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-secondary mb-4">Items</h3>
        <ul className="space-y-3 border-t pt-4">
          {order.cartItems.map(item => (
            <li key={item.id} className="flex justify-between items-center">
              <div className="text-lg font-medium">{item.name}</div>
              <div className="text-lg font-medium">
                {item.quantity} x {item.price.toFixed(2)} DZD
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center mt-12">
        <Link to='/' className="bg-primary bg-gold/80 hover:bg-gold hover:scale-105 text-white py-3 px-6 rounded-full shadow-md hover:bg-primary-dark transition-all duration-300">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
