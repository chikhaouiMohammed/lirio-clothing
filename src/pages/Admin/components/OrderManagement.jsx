import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../Data/firebase';

const OrderManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersList = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
        setAllOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    fetchOrders();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterOrders(query, selectedStatus);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    filterOrders(searchQuery, status);
  };

  // Filter orders based on search query and status
  const filterOrders = (query, status) => {
    let filteredOrders = allOrders;

    if (query) {
      filteredOrders = filteredOrders.filter(
        order => 
          order.phone.toLowerCase().includes(query) || 
          order.email.toLowerCase().includes(query)
      );
    }

    if (status && status !== 'All') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    setOrders(filteredOrders);
  };

  const formatDateTime = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString(); // Formats date and time
    }
    return 'N/A';
  };

  return (
    <div className="container mx-auto md:px-20 px-10 py-6 text-darkGray">
      <p className='font-bold w-full text-center text-xl md:text-3xl py-5'>Order Management</p>

      {/* Search Bar */}
      <div className="w-full mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
          placeholder="Search by phone or email..."
        />
      </div>

      {/* Status Dropdown */}
      <div className="w-full mb-6">
        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Shipped">Shipped</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="flex flex-col justify-center items-center w-full">
        {orders.map(order => (
          <div key={order.id} className="rounded-2xl bg-gray-200 overflow-hidden w-full p-5 mb-4 flex flex-wrap md:flex-nowrap justify-between items-center">
            {/* Order Details */}
            <div className='flex flex-col justify-center items-start gap-2'>
              <h3 className='text-xl font-semibold'>Order ID: <span className='font-medium'>{order.id}</span></h3>
              <h4 className='text-lg font-semibold'>Date: <span className='font-medium'>{formatDateTime(order.orderDate)}</span></h4>
              <h4 className='text-lg font-semibold'>Total: <span className='font-medium'>{order.totalAmount}</span></h4>
              <h4 className='text-lg font-semibold'>Status: <span className='font-medium'>{order.status}</span></h4>
              <h4 className='text-lg font-semibold'>Phone: <span className='font-medium'>{order.contactInfo.email || order.contactInfo.phone}</span></h4>
              <h4 className='text-lg font-semibold'>Email: <span className='font-medium'>{order.email}</span></h4>
            </div>
            {/* View Details Button */}
            <Link to={`/orders/${order.id}`} className='bg-blue-950 px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 text-white'>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderManagement;
