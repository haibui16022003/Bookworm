import React, {useState} from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const {login} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-extrabold">Sign in</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-extrabold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="inline-block w-full p-4 leading-6 text-lg font-semibold placeholder-indigo-900 bg-white shadow border-2 border-indigo-900 rounded"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-extrabold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="inline-block w-full p-4 leading-6 text-lg font-semibold placeholder-indigo-900 bg-white shadow border-2 border-indigo-900 rounded"
            required
          />
        </div>
        <div className="flex flex-wrap -mx-4 mb-6 items-center justify-between">
          {/* <div className="w-full lg:w-auto px-4 mb-4 lg:mb-0">
            <label className="inline-flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="font-extrabold">Remember me</span>
            </label>
          </div> */}
          <div className="w-full lg:w-auto px-4">
            <a className="inline-block font-extrabold hover:underline" href="#">
              Forgot your password?
            </a>
          </div>
        </div>
        {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}
        <button
          type="submit"
          className="inline-block w-full py-4 px-6 mb-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-800 hover:bg-indigo-900 border-3 border-indigo-900 shadow rounded transition duration-200"
        >
          Sign in
        </button>
        <p className="text-center font-extrabold">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-red-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
