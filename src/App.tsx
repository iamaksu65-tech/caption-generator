import React, { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { Type, Image, Sparkles } from 'lucide-react';

// Initialize the Gemini AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
// Console log removed for security - never log API keys in production

// Define the structure for a caption object
interface Caption {
  id: string;
  text: string;
  type: 'short' | 'medium' | 'long';
}

// Asynchronously convert a File object to the generative part format required by the API
async function fileToGenerativePart(file: File): Promise<any> {
  const base64Encoded = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64Encoded,
      mimeType: file.type,
    },
  };
}

function App() {
  // State management for the application
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textCaptions, setTextCaptions] = useState<Caption[]>([]);
  const [imageCaptions, setImageCaptions] = useState<Caption[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to generate captions from text input
  const generateTextCaptions = useCallback(async () => {
    if (!textInput.trim() || isGenerating) return;
    setIsGenerating(true);
    setTextCaptions([]);

    const prompt = `You are an AI social media caption generator. Only respond with JSON in the format:
{
  "short": "one-line caption",
  "medium": "two-line caption",
  "long": "more descriptive, multi-line caption"
}
Do not include any extra text or markdown.

Text: ${textInput}`;

    try {
      // ✅ FIX: Use the correct model name 'gemini-2.5-pro'
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in Gemini response");

      const parsed = JSON.parse(jsonMatch[0]);

      const newCaptions: Caption[] = [
        { id: uuidv4(), text: parsed.short, type: 'short' },
        { id: uuidv4(), text: parsed.medium, type: 'medium' },
        { id: uuidv4(), text: parsed.long, type: 'long' },
      ];
      setTextCaptions(newCaptions);
    } catch (err) {
      console.error('Text caption error:', err);
      alert('Text caption generation failed.');
    } finally {
      setIsGenerating(false);
    }
  }, [textInput, isGenerating]);

  // Function to generate captions from an image
  const generateImageCaptions = useCallback(async () => {
    if (!imageFile || isGenerating) return;
    setIsGenerating(true);
    setImageCaptions([]);

    const prompt = `You are an AI image caption generator. Only respond with JSON like:
{
  "short": "quick catchy line",
  "medium": "slightly detailed line",
  "long": "storytelling caption"
}
Don't include extra text or markdown.`;

    try {
      const imagePart = await fileToGenerativePart(imageFile);
      // ✅ FIX: Use the correct model name 'gemini-pro-vision'
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });        
      // ✅ FIX: Use the correct payload structure for multimodal input
      const result = await model.generateContent([prompt, imagePart]);
      
      const text = await result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in image response");

      const parsed = JSON.parse(jsonMatch[0]);

      const newCaptions: Caption[] = [
        { id: uuidv4(), text: parsed.short, type: 'short' },
        { id: uuidv4(), text: parsed.medium, type: 'medium' },
        { id: uuidv4(), text: parsed.long, type: 'long' },
      ];
      setImageCaptions(newCaptions);
    } catch (err) {
      console.error('Image caption error:', err);
      alert('Image caption generation failed.');
    } finally {
      setIsGenerating(false);
    }
  }, [imageFile, isGenerating]);

  // Handle file input change for image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);
      setImageCaptions([]); // Clear previous image captions
    }
  };

  // Copy text to clipboard and show feedback
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Utility to get Tailwind CSS classes based on caption type
  const getCaptionTypeColor = (type: string) => {
    switch (type) {
      case 'short':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'long':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CaptionCraft</h1>
                <p className="text-sm text-gray-500">AI-Powered Caption Generator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'text'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {activeTab === 'text' ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Generate from Text</h2>
                <p className="text-sm text-gray-500 mb-4">Describe your post, product, or the vibe you're going for.</p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g., A beautiful sunset over the mountains"
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  onClick={generateTextCaptions}
                  disabled={isGenerating || !textInput.trim()}
                  className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? 'Generating...' : 'Generate Captions'}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Generate from Image</h2>
                <p className="text-sm text-gray-500 mb-4">Upload an image to get captions based on its content.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="rounded-lg max-h-64 mx-auto shadow-md" />
                  </div>
                )}
                <button
                  onClick={generateImageCaptions}
                  disabled={isGenerating || !imageFile}
                  className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? 'Generating...' : 'Generate Captions'}
                </button>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            {(activeTab === 'text' ? textCaptions : imageCaptions).map((caption) => (
              <div
                key={caption.id}
                className={`p-4 border rounded-xl shadow-sm ${getCaptionTypeColor(caption.type)} flex flex-col gap-2`}
              >
                <div className="flex justify-between items-center">
                  <strong className="capitalize text-sm font-semibold">{caption.type} Caption</strong>
                  <button
                    onClick={() => copyToClipboard(caption.text, caption.id)}
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    {copiedId === caption.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-base whitespace-pre-wrap">{caption.text}</p>
              </div>
            ))}
            {isGenerating && (
                <div className="text-center p-8 text-gray-500">
                    <p>Generating captions, please wait...</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;