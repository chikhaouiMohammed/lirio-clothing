import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../../../Data/firebase'; // Import storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions
import toast from 'react-hot-toast';
import { BeatLoader } from 'react-spinners';

const AddProduct = () => {
  // State variables
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [newColor, setNewColor] = useState({ colorCode: '#0000000', colorName: '', sizes: {} });
  const [selectedSize, setSelectedSize] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const fetchedCategories = querySnapshot.docs.map((doc) => doc.data().name);
        setCategories(fetchedCategories);
      } catch (e) {
        toast.error('Error fetching categories: ', e);
      }
    };

    const fetchSizes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sizes'));
        const fetchedSizes = querySnapshot.docs.map((doc) => doc.data().name);
        setAvailableSizes(fetchedSizes);
      } catch (e) {
        toast.error('Error fetching sizes: ', e);
      }
    };

    fetchCategories();
    fetchSizes();
  }, []);

  const handleAddColor = () => {
    if (newColor.colorCode && newColor.colorName) {
      setProductColors((prev) => [...prev, newColor]);
      setNewColor({ colorCode: '', colorName: '', sizes: {} });
    }
  };

  const handleAddStockForSize = () => {
    if (selectedSize && stock) {
      setNewColor((prev) => ({
        ...prev,
        sizes: { ...prev.sizes, [selectedSize]: stock }
      }));
      setSelectedSize('');
      setStock('');
    }
  };

  const handleEditColor = (index, field, value) => {
    const updatedColors = [...productColors];
    updatedColors[index][field] = value;
    setProductColors(updatedColors);
  };

  const handleEditSize = (colorIndex, size, newStock) => {
    const updatedColors = [...productColors];
    updatedColors[colorIndex].sizes[size] = newStock;
    setProductColors(updatedColors);
  };

  const handleDeleteSize = (colorIndex, size) => {
    const updatedColors = [...productColors];
    delete updatedColors[colorIndex].sizes[size];
    setProductColors(updatedColors);
  };

  const handleDeleteColor = (index) => {
    const updatedColors = productColors.filter((_, i) => i !== index);
    setProductColors(updatedColors);
  };

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
      console.error('Error uploading images: ', e);
      toast.error('Failed to upload images.');
    }
    setIsLoading(false);
    return imageUrls;
  };

  const handleSaveProduct = async () => {
    setIsLoading(true);
    try {
      const imageUrls = await uploadImages();

      // Calculate total stock
      const totalStock = productColors.reduce((acc, color) => {
        const colorStock = Object.values(color.sizes).reduce(
          (sum, qty) => sum + parseInt(qty, 10),
          0
        );
        return acc + colorStock;
      }, 0);

      // Calculate discount percentage
      const discount = ((price - finalPrice) / price) * 100;

      const product = {
        productName,
        description,
        category,
        productColors,
        images: imageUrls,
        price: parseFloat(price),
        finalPrice: parseFloat(finalPrice),
        discount: parseFloat(discount),
        totalStock: totalStock,
      };

      await addDoc(collection(db, 'products'), product);
      toast.success('Product added successfully!');

      // Reset form after saving
      setProductName('');
      setDescription('');
      setCategory('');
      setProductColors([]);
      setNewColor({ colorCode: '', colorName: '', sizes: {} });
      setSelectedSize('');
      setStock('');
      setImages([]);
      setPrice('');
      setFinalPrice('');
    } catch (e) {
      console.error('Error adding product: ', e);
      toast.error('Failed to add product.');
    }
    setIsLoading(false);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };
  

  return (
    <div className="container mx-auto md:px-20 px-10 py-6">
      {!isLoading ? (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Add New Product</h2>

          <form className="bg-gray-100 p-8 rounded-xl shadow-md space-y-6">
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Product Name</label>
              <input
                type="text"
                className="p-3 border rounded-lg focus:outline-none"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-2">Description</label>
              <textarea
                className="p-3 border rounded-lg focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-2">Category</label>
              <select
                className="p-3 border rounded-lg mt-4"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
              {/* images */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Product Images</label>

              {/* Image Upload Section */}
              <div className="border border-dashed border-gray-400 rounded-lg p-4 relative bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files))}
                />
                <p className="text-center text-gray-500">
                  Click to upload images (Max 5 images)
                </p>
              </div>

              {/* Preview Added Images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      {/* X button to remove image */}
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex justify-center items-center rounded-full focus:outline-none hover:bg-red-600 transition-all"
                        onClick={() => handleRemoveImage(index)}
                      >
                        X
                      </button>

                      {/* Image Preview */}
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>


            <div className="flex flex-col">
              <label className="font-semibold mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                className="p-3 border rounded-lg"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter product price"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-2">Final Price</label>
              <input
                type="number"
                step="0.01"
                className="p-3 border rounded-lg"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="Enter final price after discount"
              />
            </div>

            {/* Add New Color */}
            <div className="bg-white p-5 rounded-lg shadow-lg space-y-4">
              <h3 className="text-xl font-semibold">Add Product Colors</h3>

              <div className="flex flex-col mb-4">
                <label className="font-semibold mb-2">Color</label>
                <input
                  type="color"
                  className="w-16 h-10 p-1 rounded-lg border"
                  value={newColor.colorCode}
                  onChange={(e) =>
                    setNewColor((prev) => ({ ...prev, colorCode: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col mb-4">
                <label className="font-semibold mb-2">Color Name</label>
                <input
                  type="text"
                  className="p-3 border rounded-lg focus:outline-none"
                  value={newColor.colorName}
                  onChange={(e) =>
                    setNewColor((prev) => ({ ...prev, colorName: e.target.value }))
                  }
                  placeholder="Enter color name"
                />
              </div>

              <div className="flex flex-col mb-4">
                <label className="font-semibold mb-2">Select Size & Stock</label>
                <div className="flex flex-wrap w-full justify-center gap-3 items-center">
                  <select
                    className="p-3 border w-full md:w-fit rounded-lg"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <option value="">Select Size</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="p-3 border w-full md:w-fit rounded-lg"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Stock"
                  />

                  <button
                    type="button"
                    onClick={handleAddStockForSize}
                    className="px-4 py-2 w-full md:w-fit bg-green-500 text-white rounded-lg"
                  >
                    Add Stock
                  </button>
                </div>
              </div>

              {/* Show Added Sizes for Current Color */}
              <div>
                <h4 className="font-semibold">Added Sizes:</h4>
                {Object.keys(newColor.sizes).length > 0 ? (
                  <ul className="mt-2">
                    {Object.entries(newColor.sizes).map(([size, qty]) => (
                      <li key={size} className="flex justify-between">
                        <span>{size}</span>
                        <span>{qty} pcs</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No sizes added yet.</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddColor}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Add Color
              </button>
            </div>

            {/* Display Added Colors and Sizes */}
            <div className="bg-white p-5 rounded-lg shadow-lg mt-6 space-y-6">
              <h3 className="text-xl font-semibold">Added Colors</h3>

              {productColors.map((color, colorIndex) => (
                <div key={colorIndex} className="border-b pb-6 mb-6">
                  {/* Color Display and Controls */}
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    {/* Color Preview */}
                    <div className="flex items-center space-x-4">
                     

                      {/* Color Code and Color Name Editing */}
                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Color Code:</label>
                        <input
                          type="color"
                          value={color.colorCode}
                          onChange={(e) => handleEditColor(colorIndex, 'colorCode', e.target.value)}
                          className="w-12 h-12 p-1 border rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Color Name:</label>
                        <input
                          type="text"
                          value={color.colorName}
                          onChange={(e) => handleEditColor(colorIndex, 'colorName', e.target.value)}
                          className="p-2 border rounded-lg w-40"
                          placeholder="Enter color name"
                        />
                      </div>
                    </div>

                    {/* Delete Color Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteColor(colorIndex)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete Color
                    </button>
                  </div>

                  {/* Sizes Section */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Sizes:</h4>
                    <ul className="space-y-2">
                      {Object.entries(color.sizes).map(([size, qty]) => (
                        <li key={size} className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
                          <span className="text-lg font-medium">{size}</span>

                          <div className="flex items-center space-x-4">
                            <input
                              type="number"
                              value={qty}
                              onChange={(e) => handleEditSize(colorIndex, size, e.target.value)}
                              className="p-2 border rounded-lg w-20"
                              placeholder="Qty"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteSize(colorIndex, size)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>


            <button
              type="button"
              onClick={handleSaveProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Save Product
            </button>
          </form>
        </div>
      ) : (
        <div className="flex justify-center items-center h-96">
          <BeatLoader color="#3498db" />
        </div>
      )}
    </div>
  );
};

export default AddProduct;
