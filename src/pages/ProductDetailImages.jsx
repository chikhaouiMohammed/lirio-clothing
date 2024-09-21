import { IoClose } from "react-icons/io5";
import { Link, useLocation, useParams } from "react-router-dom";

const ProductDetailImages = () => {
  let { state } = useLocation();
  const params = useParams();
  const productImages = state.images;

  return (
    <div className="container mx-auto p-20">
      {/* content */}
      <div className="w-full flex flex-nowrap gap-5 justify-center items-start">
        {/* list of images */}
        <div className="w-full flex flex-col gap-8 justify-center items-center">
          {productImages.map((image, index) => (
            <div className="bg-cover rounded-lg overflow-hidden" key={index}>
              <img className="w-full h-full bg-cover" src={image} alt={`product-${index}`} />
            </div>
          ))}
        </div>
        {/* X close button */}
        <div className="fixed top-5 right-5">
          <Link
            to={`/product/${params.id}`}
            className="w-[40px] bg-[#dddddd] flex justify-center items-center rounded-full border-[.15px] border-darkGray h-[40px] cursor-pointer transition-all duration-200 hover:text-red-500"
          >
            <IoClose style={{ width: "70%", height: "70%" }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailImages;
