import React from 'react'
import { usePuterStore } from '~/lib/puter';
import { useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
export const meta = () => {
  return [
    { title: "HireLens | Auth" },
    { name: "description", content: "Log into your account" }
  ]
}

const Auth = () => {
  const { auth, isLoading, error } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get('next') || '/';

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);

  }, [auth.isAuthenticated, navigate, next]);
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center ">
      <div className='gradient-border shadow-lg' style={{ borderRadius: '40px' }}>
        <section className='flex flex-col gap-8 bg-white rounded-3xl'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <h1>WELCOME</h1>
            <h2>Log In to continue your Job Journey</h2>
          </div>
          <div>
            <div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {
                isLoading ? (
                  <button className='auth-button animate-pulse' style={{ borderRadius: '9999px' }}>
                    <p>Signing you in...</p>
                  </button>
                ) : (
                  <>
                    {auth.isAuthenticated ? (
                      <button className='auth-button' style={{ borderRadius: '9999px' }} onClick={auth.signOut}>
                        <p>Sign Out</p>
                      </button>
                    ) : (
                      <button className='auth-button' style={{ borderRadius: '9999px' }} onClick={auth.signIn}>
                        <p>Sign In</p>
                      </button>
                    )}
                  </>
                )
              }
            </div>
          </div>
        </section>
      </div>

    </main>
  )
}

export default Auth
