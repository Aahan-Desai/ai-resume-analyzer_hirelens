import type { JSX } from 'react';
import { Link } from 'react-router';
import { usePuterStore } from '~/lib/puter';

const Navbar: () => JSX.Element = () => {
  const { auth } = usePuterStore();

  return (
    <nav className="navbar">
      <Link to='/'>
        <p className='text-2xl font-bold text-gradient'>HireLens</p>
      </Link>
      <div className="flex gap-4 items-center">
        <Link to='/upload' className='primary-button w-fit'>
          Upload Resume
        </Link>
        {auth.isAuthenticated && (
          <button onClick={auth.signOut} className='bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer border border-red-200'>
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
