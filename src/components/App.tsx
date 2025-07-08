@@ .. @@
 import Pricing from './components/Pricing/Pricing';
 import SwordiePage from './components/Swordie/SwordiePage';
 import AuthForm from './components/Auth/AuthForm';
 import LandingPage from './components/Landing/LandingPage';
 import SuccessPage from './components/Success/SuccessPage';
 import ChatbotWidget from './components/Chatbot/ChatbotWidget';
+import ContactSupportModal from './components/Support/ContactSupportModal';
import Footer from './components/Footer/Footer';
 import { useAuth } from './hooks/useAuth';
 import { useSubscriptions } from './hooks/useSubscriptions';
 import { useSpendingData } from './hooks/useSpendingData';
@@ .. @@
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [showAuthForm, setShowAuthForm] = useState(false);
   const [showSuccessPage, setShowSuccessPage] = useState(false);
+  const [showContactSupport, setShowContactSupport] = useState(false);
 
   // Check for success page on mount
   useEffect(() => {
@@ .. @@
     };
   }, [generateRenewalNotifications]);
 
+  // Listen for contact support events
+  useEffect(() => {
+    const handleShowContactSupport = () => {
+      setShowContactSupport(true);
+    };
+
+    window.addEventListener('showContactSupport', handleShowContactSupport);
+    
+    return () => {
+      window.removeEventListener('showContactSupport', handleShowContactSupport);
+    };
+  }, []);
+
   // Check for notifications periodically (every 5 minutes)
   useEffect(() => {
     if (user && subscriptions.length > 0) {
@@ .. @@
       
       {/* Chatbot Widget - Only show on non-Swordie pages */}
       {activeTab !== 'swordie' && <ChatbotWidget />}

+      {/* Contact Support Modal */}
+      <ContactSupportModal 
+        isOpen={showContactSupport} 
+        onClose={() => setShowContactSupport(false)} 
+      />
      
      {/* Footer - Only show on landing page */}
      {!user && !showAuthForm && <Footer />}
     </div>
   );
 }