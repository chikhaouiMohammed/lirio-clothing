import { useState, useEffect } from 'react';
import NavBar from "../components/Header/NavBar";
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../Data/firebase';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import BeatLoader from 'react-spinners/BeatLoader';

const Checkout = () => {
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const toggleOrderSummary = () => {
    setShowOrderSummary(!showOrderSummary);
  };

  useEffect(() => {
    if (location.state?.buyNowItem) {
      setCartItems([location.state.buyNowItem]);
    } else {
      const storedItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartItems(storedItems);
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    if (!emailPattern.test(contactInfo.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!phonePattern.test(contactInfo.phone)) {
      newErrors.phone = 'Invalid phone number. Must be 10 digits.';
    }
    
    if (!deliveryInfo.firstName || !deliveryInfo.lastName || !deliveryInfo.address || !deliveryInfo.city) {
      newErrors.delivery = 'Please fill in all required delivery fields.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the form before proceeding
    if (!validateForm()) return;
  
    setIsLoading(true); // Show the loader while processing
  
    try {
      // Loop through each cart item to update the stock in Firestore
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id); // Get the reference to the product document
        const productDoc = await getDoc(productRef); // Fetch the product document from Firestore
  
        if (productDoc.exists()) {
          const productData = productDoc.data(); // Get the product data
  
          // Find the selected color
          const updatedColors = productData.productColors.map((color) => {
            if (color.colorName === item.selectedColor) {
              // Find the selected size and reduce its stock
              const updatedSizes = { ...color.sizes };
              if (updatedSizes[item.selectedSize]) {
                updatedSizes[item.selectedSize] -= item.quantity;
              }
              return {
                ...color,
                sizes: updatedSizes,
              };
            }
            return color;
          });
  
          // Calculate the new totalStock
          const newTotalStock = productData.totalStock - item.quantity;
  
          // Update the product stock in Firestore
          await updateDoc(productRef, {
            productColors: updatedColors,
            totalStock: newTotalStock,
          });
  
          console.log(`Stock updated for ${item.name} (${item.selectedColor}, ${item.selectedSize})`);
        } else {
          console.error(`Product with ID ${item.id} not found in Firestore`);
        }
      }
  
      // Order has been successfully placed
      toast.success('Order placed successfully!');
      onOrderPlaced(); // Call the function to handle post-order actions, such as clearing the cart
      navigate('/order-confirmation'); // Redirect to a thank-you page
    } catch (error) {
      console.error("Error updating stock: ", error);
      toast.error('Something went wrong while placing the order. Please try again.');
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };
  

  const onOrderPlaced = async () => {
    // Clear the cart from local storage or state
    localStorage.removeItem('cartItems');
    setCartItems([]);
    
    // Optionally, save the order to Firestore in an 'orders' collection
    const orderData = {
      contactInfo,
      deliveryInfo,
      cartItems,
      totalAmount: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
      orderDate: new Date(),
      status: 'Pending',  // You can add more fields like status if needed
    };
  
    try {
      await addDoc(collection(db, 'orders'), orderData);
      console.log('Order saved successfully');
  
      // Navigate to the order confirmation page and pass the order data
      navigate('/order-confirmation', { state: { order: orderData } });
    } catch (error) {
      console.error('Error saving order: ', error);
    }
  };
  
  return (
    isLoading ? (
      <div className="w-full h-screen flex justify-center items-center">
        <BeatLoader size={20} color="#D7CDCC" />
      </div>
    ) : (
      <div className="font-poppins text-darkGray">
        <NavBar />

        <div className="container mx-auto lg:px-20 px-7 flex flex-col lg:flex-row gap-5 justify-center items-start border-gray-300 border-t-[1px] py-10 lg:flex-nowrap">
          <div className="w-full order-2 lg:order-1 lg:w-2/3">
            <form onSubmit={handleFormSubmit} className="w-full">
              <div>
                <h3 className="text-xl font-semibold mb-4">Contact</h3>
                <input
                  type="text"
                  required
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className={`p-3 border rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Email"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                <input
                  type="text"
                  required
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className={`p-3 border rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500 mt-3 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="mt-5">
                <h3 className="text-xl font-semibold mb-4">Delivery</h3>
                <div className="w-full flex justify-center items-center gap-2">
                  <input
                    type="text"
                    required
                    value={deliveryInfo.firstName || ''}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, firstName: e.target.value })}
                    className="p-3 border rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    required
                    value={deliveryInfo.lastName || ''}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, lastName: e.target.value })}
                    className="p-3 border rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500"
                    placeholder="Last Name"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={deliveryInfo.address || ''}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                  className={`p-3 border mt-3 rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500 ${errors.delivery ? 'border-red-500' : ''}`}
                  placeholder="Address"
                />
                <input
                  type="text"
                  value={deliveryInfo.apartment || ''}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, apartment: e.target.value })}
                  className="p-3 border mt-3 rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500"
                  placeholder="Apartment, suite, etc. (optional)"
                />
                <div className="w-full flex mt-3 justify-center items-center gap-2">
                  <input
                    type="text"
                    value={deliveryInfo.postalCode || ''}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, postalCode: e.target.value })}
                    className="p-3 border rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500"
                    placeholder="Postal code (optional)"
                  />
                  <input
                    type="text"
                    value={deliveryInfo.city || ''}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                    className={`p-3 border rounded-md focus:outline-none w-full border-gray-300 placeholder:font-roboto placeholder:text-sm focus:border-blue-500 ${errors.delivery ? 'border-red-500' : ''}`}
                    placeholder="City"
                  />
                </div>
                {errors.delivery && <p className="text-red-500 text-sm mt-2">{errors.delivery}</p>}
              </div>

              <h3 className="text-xl font-semibold my-4">Shipping method</h3>
              <div className="flex justify-between border-darkGray border-[0.5px] font-roboto items-center w-full rounded-md py-6 px-3 mt-7 bg-lightBeige/40">
                <h4 className="font-normal">Standard</h4>
                <span className="font-semibold">FREE</span>
              </div>

              <button type="submit" className="bg-gold/80 transition-all duration-300 hover:bg-gold mt-10 text-white px-6 py-3 rounded-md w-full">
                Complete Order
              </button>
            </form>
          </div>

          <div className="w-full order-1 lg:order-2 lg:w-1/3 bg-lightGray px-5 py-7 rounded-lg border border-gray-300">
            <div className="flex justify-between items-center cursor-pointer mb-4" onClick={toggleOrderSummary}>
              <h3 className="text-xl font-semibold">Order Summary</h3>
              <span>{showOrderSummary ? 'Hide' : 'Show'}</span>
            </div>

            {showOrderSummary && (
              <div className="transition-all duration-300 ease-in-out">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-300">
                    <div className='flex justify-center items-center gap-3'>
                      <div className='relative w-[74px] h-[74px] flex justify-center items-center bg-darkGray/15 rounded-md'>
                        <div className='w-5 flex justify-center items-center h-5 bg-darkGray/70 rounded-full absolute -top-[10px] z-20 -right-[10px] text-white text-xs'>
                          {item.quantity}
                        </div>
                        <img src={item.image} className='w-full h-full rounded-md' alt={item.name} />
                      </div>
                      <div>
                        <h3 className='text-lg'>{item.name}</h3>
                        <h5 className='text-sm text-darkGray/50'>{item.selectedColor} / {item.selectedSize}</h5>
                      </div>
                    </div>
                    <div className='font-montserrat'>{(item.price * item.quantity).toFixed(2)} DZD</div>
                  </div>
                ))}

                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <p className="font-normal">Shipping</p>
                  <span>FREE</span>
                </div>

                <div className="flex justify-between items-center py-2 font-semibold">
                  <p>Total</p>
                  <span>
                    {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)} DZD
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Checkout;
