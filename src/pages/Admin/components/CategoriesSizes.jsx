import  { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../../Data/firebase';
import toast from 'react-hot-toast';

const CategoriesSizes = () => {
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSize, setNewSize] = useState('');
  
  // Fetch categories and sizes from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const categoriesCollection = await getDocs(collection(db, 'categories'));
      const sizesCollection = await getDocs(collection(db, 'sizes'));

      setCategories(categoriesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSizes(sizesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  // Add a new category
  const handleAddCategory = async () => {
    if (newCategory) {
      await addDoc(collection(db, 'categories'), { name: newCategory });
      setCategories([...categories, { name: newCategory }]);
      setNewCategory('');
      toast.success(`The ${newCategory} categorie has been added successfully !`)
    }
  };

  // Add a new size
  const handleAddSize = async () => {
    if (newSize) {
      await addDoc(collection(db, 'sizes'), { name: newSize });
      setSizes([...sizes, { name: newSize }]);
      setNewSize('');
      toast.success(`The ${newSize} size has been added successfully !`)
    }
  };

  // Delete category or size
  const handleDelete = async (id, type) => {
    const docRef = doc(db, type === 'category' ? 'categories' : 'sizes', id);
    await deleteDoc(docRef);

    if (type === 'category') {
      setCategories(categories.filter(category => category.id !== id));
      toast.success(`The ${newCategory} categorie has been deleted successfully !`)
    } else {
      setSizes(sizes.filter(size => size.id !== id));
      toast.success(`The ${newSize} size has been deleted successfully !`)
    }
  };

  return (
    <div className="container mx-auto py-10 px-8">
      <h2 className="text-3xl font-semibold mb-8">Manage Categories & Sizes</h2>

      {/* Categories Section */}
      <div className="mb-10">
        <h3 className="text-xl font-medium mb-4">Categories</h3>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Add new category"
          />
          <button
            onClick={handleAddCategory}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <ul className="list-disc pl-5">
          {categories.map((category) => (
            <li key={category.id} className="flex justify-between items-center py-2">
              {category.name}
              <button
                onClick={() => handleDelete(category.id, 'category')}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sizes Section */}
      <div>
        <h3 className="text-xl font-medium mb-4">Sizes</h3>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Add new size"
          />
          <button
            onClick={handleAddSize}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <ul className="list-disc pl-5">
          {sizes.map((size) => (
            <li key={size.id} className="flex justify-between items-center py-2">
              {size.name}
              <button
                onClick={() => handleDelete(size.id, 'size')}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoriesSizes;
