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
  
      {/* Products Table */}
      <div className="overflow-x-auto w-full rounded-lg">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Image</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Category</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Price</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Stock</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-5">No products available.</td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-200">
                  <td className="p-3">
                    <img src={(product.images && product.images[0]) || productImage} alt={product.productName} className="w-16 h-16 object-cover rounded-lg" />
                  </td>
                  <td className="p-3 text-gray-800">{product.productName}</td>
                  <td className="p-3 text-gray-800">{product.category}</td>
                  <td className="p-3 text-gray-800">{product.price} DZA</td>
                  <td className="p-3 text-gray-800">{product.totalStock}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 px-4 py-2 rounded-xl text-white transition-all duration-300 hover:scale-105"
                    >
                      Delete
                    </button>
                    <Link to={`/products/edit-product/${product.id}`} className="bg-blue-950 px-4 py-2 rounded-xl text-white transition-all duration-300 hover:scale-105">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  
};

export default ProductManagement;
