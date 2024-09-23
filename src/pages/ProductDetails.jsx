import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../Data/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { BeatLoader } from 'react-spinners';
import NavBar from '../components/Header/NavBar';
import Footer from '../components/Footer/Footer';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const productId = id;
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(10);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const navigate = useNavigate();

  

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const productRef = doc(db, "products", productId);
        const docSnap = await getDoc(productRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct(data);

          // Set the initial stock based on the total stock
          setStock(data.totalStock || 10);

          // Fetch all products and select 4 random ones
          const productsRef = collection(db, 'products');
          const productsSnapshot = await getDocs(productsRef);
          const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Randomly select 4 products excluding the current one
          const filteredProducts = allProducts.filter(p => p.id !== productId);
          const randomProducts = filteredProducts.sort(() => 0.5 - Math.random()).slice(0, 4);

          setRelatedProducts(randomProducts);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product details: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    if (product) {
      const colorObj = product.productColors.find(colorObj => colorObj.colorName === selectedColor);
      if (colorObj) {
        const sizeStock = colorObj.sizes[selectedSize];
        setStock(sizeStock || 0);
      } else {
        setStock(0);
      }
    }
  }, [selectedColor, selectedSize, product]);

  const handleQuantityChange = (change) => {
    setQuantity(prevQuantity => {
      const newQuantity = prevQuantity + change;
      return newQuantity >= 1 && newQuantity <= stock ? newQuantity : prevQuantity;
    });
  };

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    const newItem = {
      id: productId,
      name: product.productName,
      image: product.images[0],
      price: product.finalPrice || product.price,
      quantity,
      selectedColor,
      selectedSize,
    };

    const existingItemIndex = cartItems.findIndex((item) => item.id === productId && item.selectedColor === selectedColor && item.selectedSize === selectedSize);

    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      cartItems.push(newItem);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    toast.success('The item has been added successfully');
  };

  const handleBuyNow = () => {
    const buyNowItem = {
      id: productId,
      name: product.productName,
      image: product.images[0],
      price: product.finalPrice || product.price,
      quantity,
      selectedColor,
      selectedSize,
    };

    navigate('/checkout', { state: { buyNowItem } });
  };

  return (
    <div className="font-poppins">
      <NavBar />
      {isLoading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <BeatLoader size={20} color="#D7CDCC" />
        </div>
      ) : product ? (
        <div className="container mx-auto py-10 px-4 md:px-20">
          <div className="w-full flex flex-col md:flex-row justify-between items-start">
            {/* Product Images */}
            <div className="w-full md:flex-shrink-0 md:w-1/2 h-auto">
              {/* For small screens, display images in a slider */}
              <div className="md:mb-10 overflow-hidden rounded-lg">
                <div className="block md:hidden">
                  <div className="flex overflow-x-scroll no-scrollbar space-x-4">
                    <div className="flex gap-3 w-full">
                      {product.images.map((img, index) => (
                        <Link
                          className="cursor-pointer flex-shrink-0 w-full"
                          to={`/product/images/${productId}`}
                          state={{ images: product.images }}
                          key={index}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="rounded-lg w-full min-w-full object-cover"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* For large devices, display images in the current grid format */}
                <div className="hidden md:block">
                  <Link to={`/product/images/${productId}`} state={{ images: product.images }}>
                    <img src={product.images[0]} alt="Product" className="rounded-lg" />
                  </Link>
                  <div className="grid grid-cols-2 gap-y-4 mt-4">
                    {product.images.slice(1).map((img, index) => (
                      <Link
                        to={`/product/images/${productId}`}
                        state={{ images: product.images }}
                        key={index}
                        className="max-w-[250px] overflow-hidden rounded-lg"
                      >
                        <img className="w-full" src={img} alt={`Thumbnail ${index + 1}`} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            {/* Product Details */}
            <div className="flex flex-col justify-start items-start px-4 md:px-10 w-full">
              <h2 className="lg:text-5xl text-3xl mb-2">{product.productName}</h2>
              <h3 className="flex flex-col text-2xl justify-center items-center gap-4 font-montserrat mb-4">
                {product.finalPrice !== product.price ? (
                  <del>{`DA ${product.price.toFixed(2)} DZD`}</del>
                ) : null}
                {product.finalPrice && (
                  <span>{`DA ${product.finalPrice.toFixed(2)} DZD`}</span>
                )}
              </h3>
              <div className="bg-darkGray rounded-md px-7 py-2 text-xs text-white flex justify-center items-center font-roboto">
                {product.totalStock === 0 ? 'Sold Out' : 'Sale'}
              </div>
  
              {/* Color Dropdown */}
              <div className="mb-4 w-full">
                <label className="block text-sm font-semibold mb-2">Color</label>
                <div className="relative">
                  <select
                    className="w-full p-3 border-[0.5px] border-gray-300 rounded-lg focus:outline-none focus:border-darkGray appearance-none"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    <option value="">Select Color</option>
                    {product?.productColors?.map((colorObj, index) => (
                      <option key={index} value={colorObj.colorName}>
                        {colorObj.colorName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m-4 12V5" />
                    </svg>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="flex gap-2 mt-2">
                  {product?.productColors?.map((colorObj, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedColor(colorObj.colorName);
                        setSelectedSize(''); // Reset selected size when color changes
                      }}
                      className={`flex items-center cursor-pointer ${selectedColor === colorObj.colorName ? 'font-semibold' : ''}`}
                    >
                      <div
                        className="w-5 h-5 rounded-full mr-2"
                        style={{ backgroundColor: colorObj.colorCode }}
                      ></div>
                      <span>{colorObj.colorName}</span>
                    </div>
                  ))}
                </div>
              </div>



  
              {/* Size Dropdown */}
              <div className="mb-4 w-full">
                <label className="block text-sm font-semibold mb-2">Size</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  disabled={!selectedColor || !product.productColors.find(colorObj => colorObj.colorName === selectedColor)?.sizes}
                >
                  <option value="">Select Size</option>
                  {selectedColor && product.productColors
                    .find(colorObj => colorObj.colorName === selectedColor)?.sizes && 
                    Object.keys(product.productColors
                      .find(colorObj => colorObj.colorName === selectedColor)
                      .sizes).map((size, index) => {
                        const sizeStock = product.productColors
                          .find(colorObj => colorObj.colorName === selectedColor)
                          .sizes[size];
                        return (
                          <option
                            key={index}
                            value={size}
                            disabled={sizeStock <= 0} // Disable size if stock is 0 or less
                          >
                            {sizeStock <= 0 ? `${size} - Unavailable` : size}
                          </option>
                        );
                    })
                  }
                </select>
              </div>
  
              {/* Quantity Counter */}
              <div className="flex font-montserrat items-center gap-2 border-darkGray border-[1.2px] rounded-md mb-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-4 py-2"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-4 py-2"
                  disabled={quantity >= stock}
                >
                  +
                </button>
              </div>
  
              {/* Buttons */}
              <div className="flex flex-col w-full gap-4">
                <button
                  onClick={handleAddToCart}
                  className="bg-transparent px-6 py-3 disabled:opacity-40 rounded-md text-darkGray border-darkGray border-[1px] font-semibold transition-all duration-300 hover:scale-105"
                  disabled={!selectedColor || !selectedSize || stock === 0} // Disable if no color/size is selected or if stock is 0
                >
                  Add to Cart
                </button>
  
                <button 
                  onClick={handleBuyNow} 
                  className="bg-gold px-6 py-3 rounded-md disabled:opacity-40 text-white font-semibold transition-all duration-300 hover:scale-105"
                  disabled={!selectedColor || !selectedSize || stock === 0}
                >
                  Buy It Now
                </button>
              </div>
            </div>
          </div>
          {/* description */}
          <div className=' w-full'>
                  <h3 className=' text-2xl font-bold mb-4'>Product description :</h3>
                  <p className=' font-roboto text-lg leading-5'>{product.description}.</p>
          </div>
  
          {/* Related Products Section */}
          <div className="py-10">
            <h2 className="text-3xl font-semibold mb-6">Related Products</h2>
            {relatedProducts.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-8 items-center">
                {relatedProducts.map((product, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-[250px] cursor-pointer flex flex-col justify-center items-center gap-5 overflow-hidden"
                  >
                    <div className="relative w-full h-auto">
                      {product.images.length > 0 && (
                        <img
                          className="rounded-2xl w-full h-auto transition-opacity duration-500"
                          src={product.images[0]}
                          alt={product.productName}
                        />
                      )}
                    </div>
                    <div className="w-full flex flex-col justify-center items-start gap-2">
                      <h3 className="text-gray-500 text-base">{product.productName}</h3>
                      {product.finalPrice !== product.price ? (
                        <h2 className="text-gray-400 text-lg line-through">
                          {`DA ${product.price.toFixed(2)} DZD`}
                        </h2>
                      ) : (
                        <h2 className="text-gray-400 h-6 line-through"></h2>
                      )}
                      <h2 className="font-montserrat text-xl font-medium">
                        {`DA ${product.finalPrice?.toFixed(2) || product.price.toFixed(2)} DZD`}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No related products found.</p>
            )}
          </div>
        </div>
      ) : null}
      <Footer />
    </div>
  );
  
};

export default ProductDetails;
