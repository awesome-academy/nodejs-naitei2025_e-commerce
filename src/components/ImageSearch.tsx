import React from 'react';
import AIImageSearch from './AIImageSearch';

interface ImageSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ isOpen, onClose }) => {
  return <AIImageSearch isOpen={isOpen} onClose={onClose} />;
};

export default ImageSearch;
