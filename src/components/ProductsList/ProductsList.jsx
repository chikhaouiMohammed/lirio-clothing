import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Data/firebase';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ProductsList = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const navigate = useNavigate(); // Initialize useNavigate
  console.log(products)
  // Function to fetch products from Firestore
  const fetchProducts = async () => {
    try {
      setIsLoading(true); // Set loading to true when starting fetch
      const productsCollection = collection(db, 'products'); // Firestore collection
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Map Firestore data into your product structure
      const mappedProducts = productsList.map(product => ({
        id: product.id, // Include id in the product structure
        image: product.images || [], // Use Firestore images or default to empty array
        title: product?.productName || 'No title', // Use fallback in case productName is missing
        price: product?.finalPrice
          ? `DA ${product.finalPrice.toFixed(2)} DZD`
          : 'Price not available', // Handle undefined finalPrice
        oldPrice: product?.discount && product?.price
          ? `DA ${product.price.toFixed(2)} DZD`
          : null,
        totalStock : product.totalStock
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false); // Set loading to false after fetch completes
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products on component mount
  }, []);

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  const handleClick = (product) => {
    // Navigate to the ProductDetails page with product id
    navigate(`/product/${product.id}`); // Pass id to navigate
  };

  return (
    <div className="container px-14 mx-auto pt-3">
      {/* products */}
      {
        isLoading ? (
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
                className="w-[250px] cursor-pointer flex flex-col justify-center items-center gap-5 overflow-hidden"
              >
                <div className="relative w-full h-auto">
                  {/* Image container */}
                  {product.image.length > 0 && (
                    <>
                      <img
                        className={`rounded-2xl w-full h-auto transition-opacity duration-500 ${hoveredCard === index ? 'opacity-0' : 'opacity-100'}`}
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
        )
      }
    </div>
  );
};

export default ProductsList;
