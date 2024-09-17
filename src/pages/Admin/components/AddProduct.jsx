import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../../../Data/firebase'; // Import storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions
import toast from 'react-hot-toast';
import { BeatLoader, ClipLoader } from 'react-spinners';

const AddProduct = () => {
  // States for form inputs
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]); // Dynamic categories
  const [productColors, setProductColors] = useState([]);
  const [newColor, setNewColor] = useState({ colorCode: '', colorName: '', sizes: {} });
  const [selectedSize, setSelectedSize] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Available sizes for selection
  const [availableSizes, setAvailableSizes] = useState([]);

  useEffect(() => {
    // Fetch categories from Firestore on component mount
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const fetchedCategories = querySnapshot.docs.map(doc => doc.data().name);
        setCategories(fetchedCategories);
      } catch (e) {
        toast.error('Error fetching categories: ', e);
      }
    };
    
    fetchCategories();
  }, []);

  // Add category to Firestore
  const handleAddCategory = async () => {
    if (category && !categories.includes(category)) {
      try {
        await addDoc(collection(db, 'categories'), { name: category });
        setCategories(prev => [...prev, category]);
        setCategory('');
      } catch (e) {
        toast.error('Error adding category: ', e);
      }
    }
  };

  // Add color with size-stock relationship
  const handleAddColor = () => {
    if (newColor.colorCode && newColor.colorName) {
      setProductColors(prev => [...prev, newColor]);
      setNewColor({ colorCode: '', colorName: '', sizes: {} });
      setAvailableSizes([]); // Clear sizes after adding a color
    }
  };

  // Remove color from the list
  const handleRemoveColor = (colorName) => {
    setProductColors(prev => prev.filter(color => color.colorName !== colorName));
  };

  // Add stock for the selected size and color
  const handleAddStockForSize = () => {
    if (selectedSize && stock) {
      setNewColor(prev => ({
        ...prev,
        sizes: { ...prev.sizes, [selectedSize]: stock }
      }));
      setSelectedSize('');
      setStock('');
    }
  };

  // Remove a size from the color before saving
  const handleRemoveSize = (colorName, size) => {
    setProductColors(prev => prev.map(color => {
      if (color.colorName === colorName) {
        const newSizes = { ...color.sizes };
        delete newSizes[size];
        return { ...color, sizes: newSizes };
      }
      return color;
    }));
  };

  // Upload images and return their URLs
  const uploadImages = async () => {
    const imageUrls = [];
    setIsLoading(true);
    try {
      for (const file of images) {
        const storageRef = ref(storage, `products/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }
    } catch (e) {
      console.error("Error uploading images: ", e);
      toast.error("Failed to upload images.");
    }
    setIsLoading(false);
    return imageUrls;
  };

  // Save product to Firestore
  // Save product to Firestore
  const handleSaveProduct = async () => {
    setIsLoading(true);
    try {
      const imageUrls = await uploadImages();
      
      // Calculate the total stock for all sizes
      const totalStock = productColors.reduce((acc, color) => {
        const colorStock = Object.values(color.sizes).reduce((sum, stock) => sum + parseInt(stock, 10), 0);
        return acc + colorStock;
      }, 0);
      
      // Calculate the discount price
      const discountPrice = discount ? price - (price * (discount / 100)) : price;
      
      const product = {
        productName,
        description,
        category,
        productColors,
        images: imageUrls,
        price: parseFloat(price),
        discount: parseFloat(discount),
        finalPrice: parseFloat(discountPrice),
        totalStock: totalStock, // Add totalStock here
      };

      const docRef = await addDoc(collection(db, "products"), product);

      console.log("Document written with ID: ", docRef.id);
      toast.success('Product added successfully!');
    } catch (e) {
      console.error("Error adding document: ", e);
      toast.error("Failed to add product.");
    }
    setIsLoading(false);
  };


  // Add a new size
  const handleAddSize = () => {
    if (newSize && !availableSizes.includes(newSize)) {
      setAvailableSizes(prev => [...prev, newSize]);
      setNewSize('');
    }
  };

  return (
    <div className="container mx-auto md:px-20 px-10 py-6">
      {
        !isLoading ? (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Add New Product</h2>

            {/* Form */}
            <form className="bg-gray-100 p-8 rounded-xl shadow-md space-y-6">
              {/* Product Name */}
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Product Name</label>
                <input
                  required
                  type="text"
                  className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Description</label>
                <textarea
                  className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Category</label>
                <input
                  type="text"
                  className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter new category"
                />
                <div
                  className="bg-blue-600 text-white px-4 py-2 mt-2 rounded-lg transition-all duration-300 hover:scale-105"
                  onClick={handleAddCategory}
                >
                  Add Category
                </div>
                <select
                  className="p-3 border rounded-lg mt-4 focus:outline-none focus:border-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Product Images */}
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Product Images</label>
                <input
                  type="file"
                  className="p-3 border rounded-lg"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files))}
                />
              </div>

              {/* Price and Discount */}
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter product price"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-2">Discount (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Enter discount percentage"
                />
              </div>

              {/* Add New Color */}
              <div className="bg-white p-5 rounded-lg shadow-lg space-y-4">
                <h3 className="text-xl font-semibold">Add Product Colors</h3>

                {/* Color Picker */}
                <div className="flex flex-col mb-4">
                  <label className="font-semibold mb-2">Color</label>
                  <input
                    type="color"
                    className="w-16 h-10 p-1 rounded-lg border"
                    value={newColor.colorCode}
                    onChange={(e) => setNewColor(prev => ({ ...prev, colorCode: e.target.value }))}
                  />
                </div>

                {/* Color Name */}
                <div className="flex flex-col mb-4">
                  <label className="font-semibold mb-2">Color Name</label>
                  <input
                    type="text"
                    className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                    value={newColor.colorName}
                    onChange={(e) => setNewColor(prev => ({ ...prev, colorName: e.target.value }))}
                    placeholder="Enter color name"
                  />
                </div>

                {/* Add New Size */}
                <div className="flex flex-col mb-4">
                  <label className="font-semibold mb-2">Add Size</label>
                  <input
                    type="text"
                    className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Enter new size"
                  />
                  <div
                    className="bg-green-600 text-white px-4 py-2 mt-2 rounded-lg transition-all duration-300 hover:scale-105"
                    onClick={handleAddSize}
                  >
                    Add Size
                  </div>
                </div>

                {/* Size-Stock Relation */}
                <div className="flex flex-col mb-4">
                  <label className="font-semibold mb-2">Add Stock for Selected Size</label>
                  <select
                    className="p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <option value="">Select Size</option>
                    {availableSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="p-3 border rounded-lg focus:outline-none focus:border-blue-500 mt-4"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Enter stock quantity"
                  />
                  <div
                    className="bg-blue-600 text-white px-4 py-2 mt-2 rounded-lg transition-all duration-300 hover:scale-105"
                    onClick={handleAddStockForSize}
                  >
                    Add Stock
                  </div>
                </div>

                {/* Add Color Button */}
                <div
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  onClick={handleAddColor}
                >
                  Add Color
                </div>
              </div>

              {/* Display Added Colors with Sizes and Stock */}
              <div className="bg-gray-100 p-4 mt-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-4">Added Colors</h4>
                {productColors.length === 0 ? (
                  <p>No colors added yet.</p>
                ) : (
                  productColors.map(color => (
                    <div key={color.colorName} className="mb-4 p-4 bg-white rounded-lg shadow-md">
                      <div className="flex items-center mb-4">
                        <div
                          className="w-8 h-8 mr-4 rounded-full"
                          style={{ backgroundColor: color.colorCode }}
                        ></div>
                        <span className="font-semibold">{color.colorName}</span>
                        <button
                          className="ml-auto bg-red-600 text-white px-3 py-1 rounded-lg"
                          onClick={() => handleRemoveColor(color.colorName)}
                        >
                          Remove Color
                        </button>
                      </div>
                      <div>
                        <h5 className="font-semibold">Sizes and Stock:</h5>
                        <ul>
                          {Object.entries(color.sizes).map(([size, stock]) => (
                            <li key={size} className="flex justify-between items-center">
                              <span>{size}: {stock}</span>
                              <button
                                className="ml-2 bg-red-500 text-white px-2 py-1 rounded-lg"
                                onClick={() => handleRemoveSize(color.colorName, size)}
                              >
                                Remove Size
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Save Product */}
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                onClick={handleSaveProduct}
              >
                Save Product
              </button>
            </form>
          </div>
        ) : (
          <div className='w-full h-screen flex justify-center items-center'>
            <BeatLoader size={20} color="#D7CDCC" />
          </div>
        )
      }
    </div>
  );
};

export default AddProduct;
