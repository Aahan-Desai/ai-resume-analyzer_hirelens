import React from 'react'
import { useParams,Link } from 'react-router'
import Navbar from '~/components/Navbar';

const resume = () => {
    const {id} = useParams();
  return (
    <main className='!pt-0'>
        <nav className='resume-nav'>
          <Link to="/" className='back-button' >
          <img src="/icon/back.svg" alt="logo" className='h-2.5 w-2.5' />
          <span className='text-gray-800 text-sm font-semibold'>Back to Homepage</span>
          </Link>
        </nav>
    </main>
  )
}

export default resume