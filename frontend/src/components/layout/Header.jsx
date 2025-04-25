import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthPopup from '../auth/AuthPopup';

const Header = () => {
  const { user, logout, isUserLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authPopupOpen, setAuthPopupOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [localUser, setLocalUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Check for user in localStorage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setLocalUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user data from localStorage', e);
    }
  }, []);

  // Update localUser when user state changes
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else if (!isUserLoading) {
      // Only clear localUser if we're not in a loading state
      // This prevents flickering during authentication checks
      setLocalUser(null);
    }
  }, [user, isUserLoading]);

  const navLinkClass = ({ isActive }) =>
    isActive ? 'underline font-medium' : 'hover:underline';

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setLocalUser(null);
  };

  const handleAuthClick = (e) => {
    e.preventDefault();
    setRedirectPath('');
    setAuthPopupOpen(true);
  };

  const handleCartClick = (e) => {
    if (!localUser) {
      e.preventDefault();
      setRedirectPath('/cart');
      setAuthPopupOpen(true);
    }
  };

  const closeAuthPopup = () => {
    setAuthPopupOpen(false);
    setRedirectPath('');
  };

  // Authentication status - consider both React state and localStorage
  const isAuthenticated = !!localUser;

  return (
    <>
      <header className="bg-gray-50 py-4 px-6 flex justify-between items-center border-b border-gray-200 fixed top-0 left-0 w-full z-50">
        {/* Logo */}
        <Link to="/" className="z-50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-400 text-xs text-white flex items-center justify-center mr-2">
              32x32
            </div>
            <h1 className="text-lg font-semibold uppercase tracking-wide">Bookworm</h1>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <nav>
            <ul className="flex gap-6">
              <li><NavLink to="/" className={navLinkClass}>Home</NavLink></li>
              <li><NavLink to="/shop" className={navLinkClass}>Shop</NavLink></li>
              <li><NavLink to="/about" className={navLinkClass}>About</NavLink></li>
            </ul>
          </nav>
          <NavLink 
            to="/cart" 
            className={navLinkClass}
            onClick={handleCartClick}
          >
            Cart (0)
          </NavLink>
          
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown}
                className="flex items-center gap-2 hover:underline"
              >
                <span>{localUser?.name || localUser?.email}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/change-password" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" onClick={handleAuthClick} className={navLinkClass}>Sign In</a>
          )}
        </div>

        {/* Hamburger icon for mobile */}
        <button onClick={toggleMenu} className="md:hidden z-50">
          {menuOpen ? (
            // Close Icon
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // Hamburger Icon
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="fixed top-16 left-0 w-full bg-gray-50 border-t border-gray-200 shadow-md md:hidden z-40">
            <nav className="px-6 py-4 text-sm text-gray-700">
              <ul className="flex flex-col gap-4">
                <li><NavLink to="/" onClick={toggleMenu} className={navLinkClass}>Home</NavLink></li>
                <li><NavLink to="/shop" onClick={toggleMenu} className={navLinkClass}>Shop</NavLink></li>
                <li><NavLink to="/about" onClick={toggleMenu} className={navLinkClass}>About</NavLink></li>
                <li>
                  <NavLink 
                    to="/cart" 
                    onClick={(e) => {
                      if (!isAuthenticated) {
                        e.preventDefault();
                        setRedirectPath('/cart');
                        setAuthPopupOpen(true);
                      }
                      toggleMenu();
                    }} 
                    className={navLinkClass}
                  >
                    Cart (0)
                  </NavLink>
                </li>
                
                {isAuthenticated ? (
                  <>
                    <li><NavLink to="/profile" onClick={toggleMenu} className={navLinkClass}>Profile</NavLink></li>
                    <li><NavLink to="/change-password" onClick={toggleMenu} className={navLinkClass}>Change Password</NavLink></li>
                    <li><button onClick={() => {handleLogout(); toggleMenu();}} className="hover:underline">Logout</button></li>
                  </>
                ) : (
                  <li>
                    <a 
                      href="/login" 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleMenu();
                        setAuthPopupOpen(true);
                      }} 
                      className={navLinkClass}
                    >
                      Sign In
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Auth Popup Component */}
      <AuthPopup 
        isOpen={authPopupOpen} 
        onClose={closeAuthPopup} 
        redirectAfterAuth={redirectPath}
      />
    </>
  );
};

export default Header;