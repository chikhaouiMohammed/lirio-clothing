import React, { useEffect, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai'; 
import NavBar from '../components/Header/NavBar';
import Footer from '../components/Footer/Footer';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(storedItems);
  }, []);

  // Function to increment quantity
  const incrementQuantity = (id) => {
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  // Function to decrement quantity
  const decrementQuantity = (id) => {
    const updatedItems = cartItems.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  // Function to remove an item
  const removeItem = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  return (
    <div className="text-darkGray font-poppins">
      <NavBar />
      <div className="container mx-auto px-4 md:px-20 py-7">
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl md:text-5xl mb-4 md:mb-0">Your Cart</h2>
          <Link to="/" className="underline text-sm md:text-lg">
            Continue Shopping
          </Link>
        </div>
  
        {/* Table Headers */}
        <div className="hidden md:grid grid-cols-3 gap-4 py-4 border-b border-gray-300">
          <div>Product</div>
          <div>Quantity</div>
          <div>Total</div>
        </div>
  
        {/* Products Table */}
        <div className="w-full space-y-4 md:space-y-0">
          {cartItems.map(item => (
            <div key={item.id} className="flex flex-col md:flex-row justify-between items-center py-4 border-b">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg" />
                <h3 className="text-lg md:text-xl">{item.name}</h3>
              </div>
              <div className="flex items-center gap-2 border-darkGray mb-4 md:mb-0">
                <button onClick={() => decrementQuantity(item.id)} className="text-lg md:text-xl">-</button>
                <span className="text-lg md:text-xl">{item.quantity}</span>
                <button onClick={() => incrementQuantity(item.id)} className="text-lg md:text-xl">+</button>
              </div>
              <div className="text-lg md:text-xl">{(item.price * item.quantity).toFixed(2)} DZA</div>
              <button onClick={() => removeItem(item.id)} className="text-red-600 mt-4 md:mt-0">
                <AiOutlineDelete size={24} />
              </button>
            </div>
          ))}
        </div>
  
        <div className="w-full flex justify-end py-24">
          <div className="flex flex-col items-start gap-5">
            <h3 className="text-xl md:text-2xl">Estimated total: DA {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)} DZD</h3>
            <p className="text-sm md:text-base">Taxes and shipping calculated at checkout.</p>
            <Link
              to='/checkout'
              className="bg-gold/80 transition-all duration-200 hover:bg-gold hover:scale-105 px-12 py-3 md:px-32 rounded-md text-lg md:text-xl"
            >
              Check out
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
  
};

export default Cart;
