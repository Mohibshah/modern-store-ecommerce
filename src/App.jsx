import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Announcement from './components/Announcement/Announcement';
import CartSidebar from './components/CartSidebar/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';
import './index.css';
import { PRODUCTS } from './data/products';

const Hero = lazy(() => import('./components/Hero/Hero'));
const Carousel = lazy(() => import('./components/Carousel/Carousel'));
const CategoryGrid = lazy(() => import('./components/CategoryGrid/CategoryGrid'));
const ProductListing = lazy(() => import('./components/ProductListing/ProductListing'));
const ProductDetail = lazy(() => import('./ProductDetail/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));

const routeFallback = <div style={{ padding: '110px 5%' }}>Loading...</div>;

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Announcement />
      <Navbar />
      <CartSidebar />
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Carousel />
              <CategoryGrid />
            </>
          } />
          <Route path="/shop" element={<ProductListing allProducts={PRODUCTS} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}
const Cart = () => <div style={{padding: '100px'}}><h1>Your Shopping Cart is Empty</h1></div>;

export default App;