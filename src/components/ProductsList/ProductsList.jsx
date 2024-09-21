import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Data/firebase';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

const ProductsList = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Function to fetch products from Firestore
  const fetchProducts = async (category = '') => {
    try {
      setIsLoading(true);
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filteredProducts = category
        ? productsList.filter(product => product.category === category)
        : productsList;

      const mappedProducts = filteredProducts.map(product => ({
        id: product.id,
        image: product.images || [],
        title: product?.productName || 'No title',
        price: product?.finalPrice
          ? `DA ${product.finalPrice.toFixed(2)} DZD`
          : 'Price not available',
        oldPrice: product?.discount && product?.price
          ? `DA ${product.price.toFixed(2)} DZD`
          : null,
        totalStock: product.totalStock
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const fetchedCategories = querySnapshot.docs.map(doc => doc.data().name);
      setCategories(fetchedCategories);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products on component mount
    fetchCategories(); // Fetch categories on component mount
  }, []);

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    fetchProducts(category);
  };

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  const handleClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="container lg:px-14 px-7 mx-auto pt-3">
      <div className="mb-6">
        <label htmlFor="categoryDropdown" className="block text-lg font-semibold mb-2">Category</label>
        <select
          id="categoryDropdown"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <BeatLoader size={20} color="#D7CDCC" />
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {products.map((product, index) => (
            <div
              key={index}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(product)}
              className=" cursor-pointer flex flex-col justify-center items-center gap-5 overflow-hidden"
            >
              <div className="relative w-[278px] h-[278px]">
                {/* Image container */}
                {product.image.length > 0 && (
                  <>
                    <img
                      className={`rounded-2xl w-full h-full bg-cover transition-opacity duration-500 ${hoveredCard === index ? 'opacity-0' : 'opacity-100'}`}
                      src={product.image[0]}  // Default image
                      alt={product.title}
                    />
                    {product.image.length > 1 && (
                      <img
                        className={`rounded-2xl w-full h-auto transition-opacity duration-500 absolute top-0 left-0 ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}`}
                        src={product.image[1]}  // Hover image
                        alt={product.title}
                      />
                    )}
                  </>
                )}
                {hoveredCard === index && (
                  <div className="bg-darkGray rounded-md px-4 absolute bottom-2 left-2 text-sm text-white flex justify-center items-center font-roboto">
                    {product.totalStock === 0 ? 'Sold Out' : 'Sale'}
                  </div>
                )}
              </div>
              {/* text */}
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <h3 className={`text-gray-500 text-base transition-all duration-500 ${hoveredCard === index ? 'underline' : ''}`}>
                  {product.title}
                </h3>
                {/* Old Price */}
                {product.oldPrice ? (
                  <h2 className="text-gray-400 text-lg line-through">{product.oldPrice}</h2>
                ) : (
                  <h2 className="font-montserrat text-white text-xl font-medium">{product.price}</h2>
                )}
                {/* Discounted Price */}
                <h2 className="font-montserrat text-xl font-medium">{product.price}</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
