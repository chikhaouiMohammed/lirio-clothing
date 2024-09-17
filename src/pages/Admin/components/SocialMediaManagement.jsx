import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../Data/firebase';

const SocialMediaManagement = () => {
  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/admin',
    twitter: 'https://twitter.com/admin',
    instagram: 'https://instagram.com/admin',
    tiktok: 'https://tiktok.com/admin',
    email: '',
    phone: ''
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prevLinks => ({
      ...prevLinks,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Save social links and contact info to the Firestore collection
      const contactDocRef = doc(collection(db, 'contact'), 'info');
      await setDoc(contactDocRef, socialLinks);
      console.log('Saved social links and contact info:', socialLinks);
      // Optionally show a success message
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving contact info:', error);
      // Optionally show an error message
      alert('Error saving changes. Please try again.');
    }
  };

  return (
    <div className="container mx-auto md:px-20 px-10 py-6 text-darkGray">
      <p className='font-bold w-full text-center text-xl md:text-3xl py-5'>Social Media Links Management</p>
      
      <form onSubmit={handleSave} className="w-full max-w-lg mx-auto bg-gray-200 p-6 rounded-2xl">
        {/* Social Media Links */}
        <div className="mb-4">
          <label htmlFor="facebook" className="block text-lg font-semibold mb-2">Facebook</label>
          <input
            type="url"
            id="facebook"
            name="facebook"
            value={socialLinks.facebook}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="https://facebook.com/admin"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="twitter" className="block text-lg font-semibold mb-2">Twitter</label>
          <input
            type="url"
            id="twitter"
            name="twitter"
            value={socialLinks.twitter}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="https://twitter.com/admin"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="instagram" className="block text-lg font-semibold mb-2">Instagram</label>
          <input
            type="url"
            id="instagram"
            name="instagram"
            value={socialLinks.instagram}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="https://instagram.com/admin"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tiktok" className="block text-lg font-semibold mb-2">Tiktok</label>
          <input
            type="url"
            id="tiktok"
            name="tiktok"
            value={socialLinks.tiktok}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="https://tiktok.com/admin"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-lg font-semibold mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={socialLinks.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="your-email@example.com"
          />
        </div>

        {/* Phone Number Input */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-lg font-semibold mb-2">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={socialLinks.phone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            placeholder="+1234567890"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-green-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default SocialMediaManagement;
