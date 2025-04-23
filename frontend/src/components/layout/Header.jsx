import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
  };

  return (
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
        <NavLink to="/cart" className={navLinkClass}>Cart (0)</NavLink>
        
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="flex items-center gap-2 hover:underline"
            >
              <span>{user.name || user.email}</span>
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
          <NavLink to="/login" className={navLinkClass}>Sign In</NavLink>
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
              <li><NavLink to="/cart" onClick={toggleMenu} className={navLinkClass}>Cart (0)</NavLink></li>
              
              {user ? (
                <>
                  <li><NavLink to="/profile" onClick={toggleMenu} className={navLinkClass}>Profile</NavLink></li>
                  <li><NavLink to="/change-password" onClick={toggleMenu} className={navLinkClass}>Change Password</NavLink></li>
                  <li><button onClick={() => {handleLogout(); toggleMenu();}} className="hover:underline">Logout</button></li>
                </>
              ) : (
                <li><NavLink to="/login" onClick={toggleMenu} className={navLinkClass}>Sign In</NavLink></li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;