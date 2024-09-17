import { useState, useEffect } from 'react';
import logo from '../../images/logo.jpg';
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoSearchOutline } from 'react-icons/io5';
import { AiOutlineClose } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Data/firebase'; // Import Firestore

const NavBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products

  const toggleSearch = () => {
    setIsSearchOpen(prevState => !prevState);
    setSearchQuery('');
    setSearchResults([]); // Clear results when closing search
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(productsRef);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllProducts(products);
      } catch (error) {
        console.error("Error fetching all products: ", error);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartItemCount(totalItems);
  }, []);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const filterProducts = (queryText) => {
    if (!queryText.trim()) {
      setSearchResults([]);
      return;
    }

    const queryLowerCase = queryText.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
      product.productName.toLowerCase().includes(queryLowerCase)
    );

    setSearchResults(filteredProducts);
  };

  const handleSearchChange = (e) => {
    const queryText = e.target.value;
    setSearchQuery(queryText);
    debounce(() => filterProducts(queryText), 300)();
  };

  return (
    <>
      <nav className="container px-20 pt-5 mx-auto w-full flex justify-between items-center text-darkGray">
        <Link to='/' className='md:w-[150px] md:h-[90px] w-[100px] h-[65px] cursor-pointer'>
          <img className='w-full h-full' src={logo} alt="Logo" />
        </Link>
        <div className='flex justify-center items-center gap-5'>
          <div 
            className='cursor-pointer hover:scale-105 transition-all duration-200'
            onClick={toggleSearch}
          >
            <IoSearchOutline style={{ width: '1.7rem', height: '1.7rem' }} />
          </div>
          <div className='relative'>
            <Link to='/my-cart' className='hover:scale-105 transition-all duration-200'>
              <HiOutlineShoppingBag style={{ width: '1.7rem', height: '1.7rem' }} />
            </Link>
            {cartItemCount > 0 && (
              <div className="absolute bottom-[-6px] right-[-4px] bg-gold text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartItemCount}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div 
        className={`fixed z-20 top-0 left-0 h-screen w-full bg-white shadow-lg transition-transform duration-300 ${isSearchOpen ? 'transform translate-y-0' : 'transform -translate-y-full'}`}
      >
        <div className="container mx-auto px-4 py-6 flex justify-center gap-10 items-center relative">
          <input 
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button 
            className=" text-gray-500 hover:text-gray-700 transition-all duration-300"
            onClick={toggleSearch}
          >
            <AiOutlineClose style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
        </div>

        <div className="container mx-auto h-[75%] px-4 pb-6 overflow-y-auto"> {/* Added scrollable container */}
          {searchResults.length > 0 ? (
            <ul className="bg-white border border-gray-300 rounded-lg shadow-md">
              {searchResults.map((product) => (
                <li key={product.id} className="p-4 hover:bg-gray-100 cursor-pointer flex items-center gap-4">
                  <Link to={`/product/${product.id}`} className="flex items-center gap-4 w-full">
                    <img src={product.images[0]} alt={product.productName} className="w-28 h-32 object-cover rounded-md" />
                    <div>
                      <span className="block font-semibold">{product.productName}</span>
                      <span className="block text-gray-500">${product.finalPrice.toFixed(2)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : searchQuery ? (
            <div className="text-center text-gray-500">No products found</div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default NavBar;
