import React, { useState } from 'react';
import { MessageSquare, HelpCircle } from 'lucide-react';
import SupportModal from './SupportModal';

const SupportButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-4 border-white"
        aria-label="Get Support"
      >
        <HelpCircle className="w-7 h-7 text-white" />
      </button>

      <SupportModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default SupportButton;