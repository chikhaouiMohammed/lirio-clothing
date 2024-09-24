import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, storage } from '../../../Data/firebase'; // Ensure correct path
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { BeatLoader } from 'react-spinners';

const EditProduct = () => {
  const { id } = useParams(); // Get product ID from URL
  const [existingProduct, setExistingProduct] = useState(null); // State to store product data
  const [isLoading, setIsLoading] = useState(true); // Loading state

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
    const fetchSizes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sizes'));
        const fetchedSizes = querySnapshot.docs.map((doc) => doc.data().name);
        setAvailableSizes(fetchedSizes);
      } catch (e) {
        toast.error('Error fetching sizes: ', e);
      }
    };
    fetchSizes();

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

      
      const updatedProduct = {
        productName,
        description,
        category,
        productColors,
        images: imageUrls,
        price: parseFloat(price),
        discount: parseFloat(discount),
        finalPrice: parseFloat(discount),
        totalStock // Add totalStock to the updated product data
      };

      const productRef = doc(db, "products", id);
      await updateDoc(productRef, updatedProduct);

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

  // Remove image handler
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle editing color or size
  const handleEditColor = (colorIndex, field, value) => {
    setProductColors(prev => prev.map((color, index) => (
      index === colorIndex ? { ...color, [field]: value } : color
    )));
  };

  const handleEditSize = (colorIndex, size, value) => {
    setProductColors(prev => prev.map((color, index) => (
      index === colorIndex
        ? { ...color, sizes: { ...color.sizes, [size]: parseInt(value, 10) } }
        : color
    )));
  };

  const handleDeleteColor = (colorIndex) => {
    setProductColors(prev => prev.filter((_, index) => index !== colorIndex));
  };

  const handleDeleteSize = (colorIndex, size) => {
    setProductColors(prev => prev.map((color, index) => {
      if (index === colorIndex) {
        const newSizes = { ...color.sizes };
        delete newSizes[size];
        return { ...color, sizes: newSizes };
      }
      return color;
    }));
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
    <div className="container mx-auto md:px-20 px-10 py-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Edit Product</h2>

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
              rows={4}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-2">Category</label>
            <select
              className="p-3 border rounded-lg focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

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
                Click to upload images
              </p>
            </div>

            {/* Preview Added Images */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? image : URL.createObjectURL(image);
                  return (
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
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          <div className="flex flex-col">
            <label className="font-semibold mb-2">Price</label>
            <input
              type="number"
              className="p-3 border rounded-lg focus:outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter product price"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-2">Discount</label>
            <input
              type="number"
              className="p-3 border rounded-lg focus:outline-none"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Enter product discount"
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

          <div className="flex justify-center">
            <button
              type="submit"
              onClick={handleSaveProduct}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
