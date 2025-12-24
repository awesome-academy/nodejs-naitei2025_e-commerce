import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Account from './pages/Account';
import About from './pages/About';
import Search from './pages/Search';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import SizeGuide from './pages/SizeGuide';
import ReturnPolicy from './pages/ReturnPolicy';
import StyleAdvice from './pages/StyleAdvice';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminChat from './pages/admin/AdminChat';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import OrderDetail from './pages/OrderDetail';
import VnpayReturn from './pages/VnpayReturn';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/men" element={<ProductList key="men" />} />
                <Route path="/women" element={<ProductList key="women" />} />
                <Route path="/kids" element={<ProductList key="kids" />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/account" element={<Account />} />
                <Route path="/about" element={<About />} />
                <Route path="/search" element={<Search />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/advice" element={<StyleAdvice />} />
                <Route path="/size-guide" element={<SizeGuide />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/payment/vnpay-return" element={<VnpayReturn />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/admin/chat"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminChat />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/customer" 
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/order/:id" element={<OrderDetail />} />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
          </div>
        </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
