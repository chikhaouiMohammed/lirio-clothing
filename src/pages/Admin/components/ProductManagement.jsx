import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../Data/firebase'; // Adjust path as needed
import productImage from '../../../images/product/56021EB6-FDB5-4C21-894D-2F92210C9D4D.webp'; // Placeholder

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (e) {
        console.error('Error fetching products:', e);
      }
    };

    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = querySnapshot.docs.map(doc => doc.data().name); // Adjust based on your data structure
        setCategories(categoriesData);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const filterProducts = () => {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = products.filter(product => {
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        const productName = product.productName ? product.productName.toLowerCase() : ''; // Safeguard against undefined
        const matchesSearchQuery = productName.includes(lowercasedQuery);
        return matchesCategory && matchesSearchQuery;
      });
      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const calculateTotalStock = (productColors) => {
    if (!productColors || !Array.isArray(productColors)) {
      return 0;
    }
    return productColors.reduce((total, color) => total + (color.stock || 0), 0);
  };

  const handleDelete = async (productId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this product?');
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products.filter(product => product.id !== productId));
        setFilteredProducts(filteredProducts.filter(product => product.id !== productId));
        alert('Product deleted successfully.');
      } catch (e) {
        console.error('Error deleting product:', e);
        alert('Failed to delete product.');
      }
    }
  };

  return (
    <div className="container mx-auto md:px-20 px-5 py-6 text-darkGray">
      <p className='font-bold w-full text-center text-xl md:text-3xl py-5'>Products Management</p>
  
      {/* Categories, Search Bar, and Add New Product Button */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 pb-6">
        {/* Categories Dropdown */}
        <div className="relative w-full md:w-1/4">
          <select
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
  
        {/* Search Bar */}
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute right-3 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" />
          </svg>
        </div>
  
        {/* Add New Product Button */}
        <div className="w-full md:w-1/4 flex justify-end">
          <Link to='/products/add-new-product' className="bg-green-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105">
            Add New Product
          </Link>
        </div>
      </div>
  
      {/* Products List */}
      <div className="flex flex-col justify-center items-center w-full">
        {filteredProducts.length === 0 ? (
          <p>No products available.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="rounded-2xl bg-gray-200 overflow-hidden w-full p-5 flex flex-col md:flex-row justify-between items-center mb-4">
              {/* Image */}
              <div className="w-full md:w-[200px] h-auto flex-shrink-0 mb-4 md:mb-0">
                <img className="w-full h-full object-cover" src={(product.images && product.images[0]) || productImage} alt={product.productName} />
              </div>
              {/* Product Actions and Details */}
              <div className='flex flex-col justify-center items-center gap-5 w-full px-6'>
                {/* Text */}
                <div className='flex flex-col justify-center w-full items-start gap-3'>
                  <h3 className='text-xl md:text-2xl font-semibold'>Name: <span className='font-medium text-lg'>{product.productName}</span></h3>
                  <h4 className='text-xl md:text-2xl font-semibold'>Category: <span className='font-medium text-lg'>{product.category}</span></h4>
                </div>
                {/* Price and Buttons */}
                <div className='flex flex-col md:flex-row justify-between items-center w-full'>
                  {/* Price */}
                  <h2 className='font-montserrat text-xl md:text-2xl font-semibold'>{product.price} DZA</h2>
                  <h2 className='font-montserrat text-xl md:text-2xl font-semibold'>Stock: <span className='font-medium font-montserrat'>{product.totalStock}</span></h2>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className='bg-red-600 px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 text-white mt-4 md:mt-0'
                  >
                    Delete
                  </button>
                  <Link to={`/products/edit-product/${product.id}`} className='bg-blue-950 px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 text-white mt-4 md:mt-0'>
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
  
};

export default ProductManagement;
