import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';  // Import the CSS file
import { db } from '../../../../Data/firebase';
import { collection, where, getDocs, query } from 'firebase/firestore';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Clear previous error messages

    try {
      // Query Firestore to find the admin by email
      const adminQuery = query(collection(db, 'admin'), where('email', '==', email));
      const querySnapshot = await getDocs(adminQuery);

      if (!querySnapshot.empty) {
        const adminDoc = querySnapshot.docs[0];
        const adminData = adminDoc.data();

        // Check if the password matches
        if (adminData.password === password) {
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/admin');
        } else {
          setError('Invalid password');
        }
      } else {
        setError('Admin not found');
      }
    } catch (err) {
      console.error('Error logging in: ', err);
      setError('Error logging in, please try again');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
