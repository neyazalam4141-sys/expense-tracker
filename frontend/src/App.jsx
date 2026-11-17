import { useState, useEffect } from 'react';
import axios from 'axios';

const AUTH_API = 'http://localhost:5000/api/auth';
const EXPENSE_API = 'http://localhost:5000/api/expense';

function Dashboard({ user, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadExpenses = async () => {
    try {
      const res = await axios.get(`${EXPENSE_API}/all/${user.id}`);
      setExpenses(res.data);
    } catch (err) {
      setMessage('Expenses load nahi ho paye');
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!file) {
      setMessage('Pehle receipt ki photo chuno');
      return;
    }

    const data = new FormData();
    data.append('receipt', file);
    data.append('userId', user.id);

    setUploading(true);
    setMessage('Receipt padh raha hoon... 10-30 second lagenge');
    try {
      await axios.post(`${EXPENSE_API}/upload`, data);
      setMessage('Expense save ho gaya!');
      setFile(null);
      form.reset();
      await loadExpenses();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload fail ho gaya');
    }
    setUploading(false);
  };

  const total = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="dash">
      <div className="topbar">
        <h2>Hi, {user.name}</h2>
        <button className="logout" onClick={onLogout}>Logout</button>
      </div>

      <div className="panel">
        <h3>Receipt upload karo</h3>
        <form onSubmit={handleUpload}>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <button type="submit" disabled={uploading}>
            {uploading ? 'Processing...' : 'Upload'}
          </button>
        </form>
        {message && <p className="info">{message}</p>}
      </div>

      <div className="panel">
        <h3>Total kharcha: ₹{total.toFixed(2)}</h3>
        {expenses.length === 0 ? (
          <p>Abhi koi expense nahi hai.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.date).toLocaleDateString('en-IN')}</td>
                  <td>{item.merchant || '-'}</td>
                  <td>{item.category}</td>
                  <td>₹{(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (mode === 'signup') {
        await axios.post(`${AUTH_API}/signup`, form);
        setMessage('Signup ho gaya! Ab login karo.');
        setMode('login');
      } else {
        const res = await axios.post(`${AUTH_API}/login`, {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Kuch galat ho gaya');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  return (
    <div className="card">
      <h2>{mode === 'login' ? 'Login' : 'Signup'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        )}
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button type="submit">{mode === 'login' ? 'Login' : 'Signup'}</button>
      </form>
      <button className="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Naya account banao' : 'Pehle se account hai? Login'}
      </button>
      {message && <p className="msg">{message}</p>}
    </div>
  );
}