// src/pages/Admin/components/EditProduct.jsx

import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { doc, updateDoc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../../../Data/firebase'; // Ensure correct path
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { BeatLoader, ClipLoader } from 'react-spinners';

const EditProduct = () => {
  const { id } = useParams(); // Get product ID from URL
  const [existingProduct, setExistingProduct] = useState(null); // State to store product data
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // States for form inputs
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]); // Dynamic categories
  const [newCategory, setNewCategory] = useState('');
  const [productColors, setProductColors] = useState([]);
  const [newColor, setNewColor] = useState({ colorCode: '', colorName: '', sizes: {} });
  const [selectedSize, setSelectedSize] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [availableSizes, setAvailableSizes] = useState([]);

  // Fetch existing product and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product data
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          setExistingProduct(productData);
          setProductName(productData.productName);
          setDescription(productData.description);
          setCategory(productData.category);
          setProductColors(productData.productColors || []);
          setPrice(productData.price);
          setDiscount(productData.discount || 0);
          setImages(productData.images || []);
        } else {
          toast.error("Product not found!");
        }

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const fetchedCategories = categoriesSnapshot.docs.map(doc => doc.data().name);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch product data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);


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
        sizes: { ...prev.sizes, [selectedSize]: parseInt(stock, 10) }
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
        // If the image is already a URL (existing image), skip uploading
        if (typeof file === 'string') {
          imageUrls.push(file);
          continue;
        }
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
    const handleSaveProduct = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const imageUrls = await uploadImages();
        
        // Calculate the total stock from the sizes in each color
        const totalStock = productColors.reduce((total, color) => {
          const colorStock = Object.values(color.sizes).reduce((sum, sizeStock) => sum + sizeStock, 0);
          return total + colorStock;
        }, 0);

        const discountPrice = discount ? price - (price * (discount / 100)) : price;
        
        const updatedProduct = {
          productName,
          description,
          category,
          productColors,
          images: imageUrls,
          price: parseFloat(price),
          discount: parseFloat(discount),
          finalPrice: parseFloat(discountPrice),
          totalStock // Add totalStock to the updated product data
        };

        const productRef = doc(db, "products", id);
        await updateDoc(productRef, updatedProduct);

        console.log("Product updated with ID: ", id);
        toast.success('Product updated successfully!');
      } catch (e) {
        console.error("Error updating product: ", e);
        toast.error("Failed to update product.");
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


  if (isLoading) {
    return (
      <div className='w-full h-screen flex justify-center items-center'>
        <BeatLoader size={20} color="#D7CDCC" />
      </div>
    );
  }

  if (!existingProduct) {
    return <p className="text-center mt-10">Product not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-20 py-6">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Edit Product</h2>
  
      {/* Form */}
      <form onSubmit={handleSaveProduct} className="bg-gray-100 p-6 md:p-8 rounded-xl shadow-md space-y-6">
        
        {/* Product Name */}
        <div className="flex flex-col">
          <label className="font-semibold mb-2">Product Name</label>
          <input
            required
            type="text"
            className="p-3 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>
  
        {/* Description */}
        <div className="flex flex-col">
          <label className="font-semibold mb-2">Description</label>
          <textarea
            className="p-3 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
          />
        </div>
  
        {/* Category */}
        <div className="flex flex-col">
          <label className="font-semibold mb-2">Category</label>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <select
              className="p-3 border rounded-lg w-full focus:outline-none focus:border-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
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
          {/* Display existing images */}
          <div className="flex flex-wrap mt-4">
            {images.map((img, index) => (
              <img
                key={index}
                src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                alt={`Product ${index}`}
                className="w-24 h-24 object-cover mr-4 mb-4 rounded"
              />
            ))}
          </div>
        </div>
  
        {/* Price and Discount */}
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="flex flex-col flex-1">
            <label className="font-semibold mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              className="p-3 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter product price"
              required
            />
          </div>
  
          <div className="flex flex-col flex-1">
            <label className="font-semibold mb-2">Discount (%)</label>
            <input
              type="number"
              step="0.01"
              className="p-3 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Enter discount percentage"
            />
          </div>
        </div>
  
        {/* Add/Manage Colors */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-lg space-y-4">
          <h3 className="text-xl font-semibold">Manage Product Colors</h3>
  
          {/* Add New Color */}
          <div className="space-y-4">
            {/* Color Picker */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Color</label>
              <input
                type="color"
                className="w-16 h-10 p-1 rounded-lg border"
                value={newColor.colorCode}
                onChange={(e) => setNewColor(prev => ({ ...prev, colorCode: e.target.value }))}
              />
            </div>
  
            {/* Color Name */}
            <div className="flex flex-col">
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
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Add Size</label>
              <div className="flex flex-col gap-5 space-x-4">
                <input
                  type="text"
                  className="p-3 border rounded-lg flex-1 focus:outline-none focus:border-blue-500"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Enter new size"
                />
                <button
                  type="button"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  onClick={handleAddSize}
                >
                  Add Size
                </button>
              </div>
            </div>
  
            {/* Size-Stock Relation */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Add Stock for Selected Size</label>
              <div className="flex flex-col gap-5 space-x-4">
                <select
                  className="p-3 border rounded-lg flex-1 focus:outline-none focus:border-blue-500"
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
                  className="p-3 border rounded-lg flex-1 focus:outline-none focus:border-blue-500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Enter stock quantity"
                />
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  onClick={handleAddStockForSize}
                >
                  Add Stock
                </button>
              </div>
            </div>
  
            {/* Add Color Button */}
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                onClick={handleAddColor}
              >
                Add Color
              </button>
            </div>
          </div>
  
          {/* Display Added Colors with Sizes and Stock */}
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold mb-4">Added Colors</h4>
            {productColors.length === 0 ? (
              <p>No colors added yet.</p>
            ) : (
              productColors.map((color, index) => (
                <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div
                      className="w-8 h-8 mr-4 rounded-full"
                      style={{ backgroundColor: color.colorCode }}
                    ></div>
                    <span className="font-semibold">{color.colorName}</span>
                    <button
                      type="button"
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
                          <span>{size}: {stock} pcs</span>
                          <button
                            type="button"
                            className="bg-red-500 text-white px-2 py-1 rounded-lg"
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
        </div>
  
        {/* Save Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
  
};

export default EditProduct;
