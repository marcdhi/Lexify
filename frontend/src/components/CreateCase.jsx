import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { Upload, X, Plus } from 'lucide-react';
import CryptoJS from 'crypto-js';

const CreateCase = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(
      data, 
      import.meta.env.VITE_ENCRYPTION_KEY
    ).toString();
  };

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files).map(file => ({
      file,
      description: '',
      original_name: file.name
    }));
    setFiles([...files, ...newFiles]);
  };

  const handleDescriptionChange = (index, description) => {
    const updatedFiles = [...files];
    updatedFiles[index].description = description;
    setFiles(updatedFiles);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        title,
        description,
        lawyer1_address: user.sub,
        files: await Promise.all(files.map(async (fileObj) => {
          const ipfsHash = `placeholder-${fileObj.original_name}`;
          
          return {
            ipfs_hash: ipfsHash,
            description: fileObj.description,
            original_name: fileObj.original_name
          };
        })),
        case_status: "Open"
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/cases/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create case');
      }

      const data = await response.json();
      navigate(`/cases/${data.case_id}`);
    } catch (error) {
      console.error('Error creating case:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-sky-100 shadow-xl">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Case</h1>
            <p className="text-gray-500 mb-8">Fill in the details to create a new legal case</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-sky-500">Case Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 
                    focus:ring-2 focus:ring-sky-300 focus:border-sky-300 
                    bg-white/50 text-sky-600 placeholder-sky-300"
                  placeholder="Enter case title"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-sky-100 focus:ring-2 focus:ring-sky-300 focus:border-sky-300 bg-white/80 text-sky-600 placeholder-sky-300 transition-all"
                  placeholder="Describe your case"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <label className="block text-sm font-medium text-gray-700">Evidence Files</label>
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-sky-50/50 text-sky-400 border-2 border-sky-100 border-dashed cursor-pointer hover:bg-sky-100 transition-all">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm">Drop files here or click to upload</span>
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </motion.div>

              {/* File List */}
              <motion.div layout className="space-y-3">
                {files.map((fileObj, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start space-x-4 bg-gray-50 p-4 rounded-xl"
                  >
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-gray-700">{fileObj.original_name}</p>
                      <input
                        type="text"
                        value={fileObj.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        placeholder="Add file description"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || files.length === 0}
              className={`w-full py-3 px-6 rounded-xl text-white font-medium flex items-center justify-center space-x-2 
                ${loading || files.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                } transition-all`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Case</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateCase;

