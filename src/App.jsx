import { Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin/Admin';
import Home from './pages/Home';
import ProductManagement from './pages/Admin/components/ProductManagement';
import AddProduct from './pages/Admin/components/AddProduct';
import EditProduct from './pages/Admin/components/EditProduct';
import OrderManagement from './pages/Admin/components/OrderManagement';
import OrderDetails from './pages/Admin/components/OrderDetails';
import SocialMediaManagement from './pages/Admin/components/SocialMediaManagement';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import { Toaster } from 'react-hot-toast';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import ProtectedRoute from './pages/Admin/components/ProtectedRoute';
import AdminLogin from './pages/Admin/components/AdminLogin/AdminLogin'
import ProductDetailImages from './pages/ProductDetailImages';
import CategoriesSizes from './pages/Admin/components/CategoriesSizes';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="social" element={<SocialMediaManagement />} />  
          <Route path="categories-sizes" element={<CategoriesSizes />} />  
        </Route>

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/add-new-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/edit-product/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/admin/categories-sizes"
          element={
            <ProtectedRoute>
              <CategoriesSizes />
            </ProtectedRoute>
          }
        /> */}


        <Route path="/my-cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/product/images/:id" element={<ProductDetailImages />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
