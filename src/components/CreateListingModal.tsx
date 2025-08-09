import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image, DollarSign, Tag, FileText, Check, Loader2, Shield, Zap, Lock, Users, AlertCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingFormData } from '../types/marketplace';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose }) => {
  const { addItem } = useMarketplace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    price: '',
    category: 'art',
    escrowDuration: '7',
    listingType: 'standard',
    escrowBuyerAddress: '',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image uploaded successfully!');
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateSuiAddress = (address: string): boolean => {
    // Sui addresses are 64 character hex strings (32 bytes) with optional 0x prefix
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    return /^[a-fA-F0-9]{64}$/.test(cleanAddress);
  };

  const validateForm = (): boolean => {
    if (!selectedImage || !imagePreview) {
      toast.error('Please upload an image for your listing');
      return false;
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your listing');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description for your listing');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }
    
    if (formData.listingType === 'escrow') {
      if (!formData.escrowBuyerAddress.trim()) {
        toast.error('Please enter the buyer\'s Sui wallet address for escrow listing');
        return false;
      }
      
      if (!validateSuiAddress(formData.escrowBuyerAddress)) {
        toast.error('Please enter a valid Sui wallet address (64 character hex string)');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the new item to the marketplace
      // Note: seller will be automatically set to 'CurrentUser' in the context
      addItem({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: imagePreview!,
        seller: 'CurrentUser', // This will be overridden in context but we include it for clarity
        escrowDuration: parseInt(formData.escrowDuration),
        listingType: formData.listingType,
        escrowBuyerAddress: formData.listingType === 'escrow' ? formData.escrowBuyerAddress : undefined,
      });
      
      const message = formData.listingType === 'escrow' 
        ? '🔒 Escrow listing created successfully!' 
        : '🎉 Listing created successfully!';
      
      toast.success(message, {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'art',
        escrowDuration: '7',
        listingType: 'standard',
        escrowBuyerAddress: '',
      });
      setSelectedImage(null);
      setImagePreview(null);
      
      // Close modal
      onClose();
    } catch (error) {
      toast.error('Failed to create listing. Please try again.');
      console.error('Error creating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    onClose();
    // Reset form when closing
    setTimeout(() => {
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'art',
        escrowDuration: '7',
        listingType: 'standard',
        escrowBuyerAddress: '',
      });
      setSelectedImage(null);
      setImagePreview(null);
      setIsDragging(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8"
          >
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 glass p-2 rounded-full glass-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-3xl font-bold text-white mb-6">Create New Listing</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Listing Type Selection */}
              <div>
                <label className="flex items-center space-x-2 text-white mb-3">
                  <Shield className="w-5 h-5" />
                  <span>Listing Type *</span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: 'standard', escrowBuyerAddress: '' })}
                    disabled={isSubmitting}
                    className={`glass rounded-2xl p-4 text-left transition-all ${
                      formData.listingType === 'standard' 
                        ? 'ring-2 ring-purple-400 bg-purple-500/10' 
                        : 'glass-hover hover:bg-white/5'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        formData.listingType === 'standard' ? 'bg-purple-500/20' : 'bg-white/10'
                      }`}>
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Standard Listing</h4>
                        <p className="text-white/60 text-sm">Direct peer-to-peer transaction</p>
                        <ul className="mt-2 space-y-1">
                          <li className="text-white/50 text-xs flex items-start">
                            <span className="mr-1">•</span>
                            <span>Instant listing creation</span>
                          </li>
                          <li className="text-white/50 text-xs flex items-start">
                            <span className="mr-1">•</span>
                            <span>Lower transaction fees</span>
                          </li>
                          <li className="text-white/50 text-xs flex items-start">
                            <span className="mr-1">•</span>
                            <span>Direct buyer-seller interaction</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: 'escrow' })}
                    disabled={isSubmitting}
                    className={`glass rounded-2xl p-4 text-left transition-all ${
                      formData.listingType === 'escrow' 
                        ? 'ring-2 ring-blue-400 bg-blue-500/10' 
                        : 'glass-hover hover:bg-white/5'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        formData.listingType === 'escrow' ? 'bg-blue-500/20' : 'bg-white/10'
                      }`}>
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Escrow Listing</h4>
                        <p className="text-white/60 text-sm">Secure transaction with escrow</p>
                        <ul className="mt-2 space-y-1">
                          <li className="text-white/50 text-xs flex items-start">
                            <span className="mr-1">•</span>
                            <span>Funds held securely in smart contract</span>
                          </li>
                          <li className="text-white/50 text-xs flex items-start">
                            <span className="mr-1">•</span>
                            <span>Buyer protection against fraud</span>
                          </li>
                          <li className="text-white/50 text-xs flex items-start">
                            <span className="mr-1">•</span>
                            <span>Seller protection with guaranteed payment</span>
                          </li>
                          <li className="text-white/50 text-xs flex items-start">
                            <span className="mr-1">•</span>
                            <span>Dispute resolution mechanism</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Escrow Buyer Address - Only shown for escrow listings */}
              {formData.listingType === 'escrow' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="flex items-center space-x-2 text-white mb-3">
                    <Wallet className="w-5 h-5" />
                    <span>Escrow Buyer Address *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.escrowBuyerAddress}
                    onChange={(e) => setFormData({ ...formData, escrowBuyerAddress: e.target.value })}
                    className="w-full glass px-4 py-3 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Enter buyer's Sui wallet address (e.g., 0x123...abc)"
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <p className="text-xs text-white/60">
                      This escrow listing will be reserved for the specified buyer. Only they can purchase this item through the escrow service.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Image Upload */}
              <div>
                <label className="flex items-center space-x-2 text-white mb-3">
                  <Image className="w-5 h-5" />
                  <span>Upload Image *</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                
                {!imagePreview ? (
                  <div
                    onClick={handleUploadClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`glass rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'ring-2 ring-white/50 bg-white/10' 
                        : 'glass-hover hover:bg-white/5'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="w-12 h-12 text-white/50 mx-auto mb-3" />
                    <p className="text-white/70 font-medium">
                      {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-white/50 mt-2">PNG, JPG, GIF up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative glass rounded-2xl p-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-white/80 text-sm truncate max-w-xs">
                          {selectedImage?.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isSubmitting}
                        className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-white mb-3">
                  <FileText className="w-5 h-5" />
                  <span>Title *</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full glass px-4 py-3 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Enter item title"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-white mb-3">
                  <FileText className="w-5 h-5" />
                  <span>Description *</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full glass px-4 py-3 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-32 resize-none"
                  placeholder="Describe your item"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-white mb-3">
                    <DollarSign className="w-5 h-5" />
                    <span>Price (SUI) *</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full glass px-4 py-3 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-white mb-3">
                    <Tag className="w-5 h-5" />
                    <span>Category</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full glass px-4 py-3 rounded-xl text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="art" className="bg-gray-800">Digital Art</option>
                    <option value="collectibles" className="bg-gray-800">Collectibles</option>
                    <option value="gaming" className="bg-gray-800">Gaming</option>
                    <option value="music" className="bg-gray-800">Music</option>
                    <option value="domains" className="bg-gray-800">Domains</option>
                  </select>
                </div>
              </div>

              {formData.listingType === 'escrow' && (
                <div>
                  <label className="flex items-center space-x-2 text-white mb-3">
                    <span>Escrow Duration (days)</span>
                  </label>
                  <select
                    value={formData.escrowDuration}
                    onChange={(e) => setFormData({ ...formData, escrowDuration: e.target.value })}
                    className="w-full glass px-4 py-3 rounded-xl text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="3" className="bg-gray-800">3 days</option>
                    <option value="7" className="bg-gray-800">7 days</option>
                    <option value="14" className="bg-gray-800">14 days</option>
                    <option value="30" className="bg-gray-800">30 days</option>
                  </select>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 glass py-4 rounded-xl text-white font-semibold glass-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 py-4 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    `Create ${formData.listingType === 'escrow' ? 'Escrow' : 'Standard'} Listing`
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateListingModal;
