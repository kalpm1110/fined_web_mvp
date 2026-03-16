import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import instance from '../lib/axios'
import toast from 'react-hot-toast'
import { FiMenu, FiX } from "react-icons/fi"
import { MdLogout } from "react-icons/md"
import NewsTicker from './NewsTicker'

export default function Navbar() {

    const { user, isLoading, isAuthenticated, logout, loginWithPopup } = useAuth0()
    const [role, setrole] = useState("")
    const [email, setEmail] = useState("")

    const [hasUnseen, setHasUnseen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            setEmail(user?.email || "")
            const roles = user?.["https://fined.com/roles"]
            setrole(roles?.[0] || "")
        }
    }, [isLoading, isAuthenticated])

    async function fetchHasUnseen() {
        try {
            const res = await instance.post("/home/hasunseen", { email });
            if (res) {
                setHasUnseen(res.data);
            }
        } catch (error) {
            toast.error("Failed to fetch notifications status.");
        }
    }

    useEffect(() => {
        if (!email) return
        fetchHasUnseen()
    }, [email])

    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div>
            {isAuthenticated ?
                <header className="flex flex-col bg-gray-100 box-border mb-4">
                    {/* Mobile and Tablet Header */}
                    <div className="flex justify-between items-center w-full mt-4 xl:hidden px-4">
                        <div onClick={() => navigate('/')} className="flex flex-col items-center font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap cursor-pointer">
                            <img src="/logo.png" alt="FinEd Logo" className="h-12 w-auto object-contain" />
                            <span className='text-[#4100bc] text-[10px] -mt-2' >Beta</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div onClick={() => navigate("/notifications")} className="relative bg-white rounded-full p-2 shadow-sm cursor-pointer">
                                <img src="/bell.png" alt="Bell Icon" className='w-6' />
                                {hasUnseen && (
                                    <div className="absolute top-1 right-1 w-3 h-3 bg-amber-400 rounded-full" />
                                )}
                            </div>
                            <button className="p-2 text-2xl" onClick={toggleSidebar}>
                                {isSidebarOpen ? <FiX /> : <FiMenu />}
                            </button>
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden xl:flex xl:flex-col items-center w-full mt-8 px-10">
                        <div className="flex xl:flex-row xl:items-center w-full justify-between mb-4">
                            <div onClick={() => navigate('/home')} className="flex flex-col items-center font-bold text-lg w-32 max-w-[180px] overflow-hidden whitespace-nowrap cursor-pointer">
                                <img src="/logo.png" alt="FinEd Logo" className="h-[60px] w-auto object-contain rounded-b-md" />
                                <span className='text-[#4100bc] text-[10px] -mt-2' >Beta</span>
                            </div>
                            <nav className="flex flex-wrap justify-center gap-5">
                                <button
                                    className={`w-28 h-10 text-base border-none rounded-full cursor-pointer shadow-sm font-medium transition-colors ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => navigate('/home')}
                                >
                                    Home
                                </button>
                                <button
                                    className={`w-28 h-10 text-base border-none rounded-full cursor-pointer shadow-sm font-medium transition-colors ${location.pathname.startsWith('/courses') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => navigate('/courses')}
                                >
                                    Courses
                                </button>
                                <button
                                    className={`w-28 h-10 text-base border-none rounded-full cursor-pointer shadow-sm font-medium transition-colors ${location.pathname === '/articles' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => navigate('/articles')}
                                >
                                    Articles
                                </button>
                                <button
                                    className={`w-28 h-10 text-base border-none rounded-full cursor-pointer shadow-sm font-medium transition-colors ${location.pathname.startsWith('/fin-tools') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => navigate('/fin-tools')}
                                >
                                    FinTools
                                </button>
                                {role === "Admin" && (
                                    <button
                                        className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/admin' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                        onClick={() => navigate('/admin')}
                                    >
                                        Admin Dashboard
                                    </button>
                                )}
                            </nav>
                            <div className='flex items-center gap-4' >
                                <div className='h-12 w-12 rounded-full bg-white flex justify-center items-center hover:bg-gray-200 transition-all duration-200 shadow-sm cursor-pointer' >
                                    <MdLogout
                                        title='Log out'
                                        className={`text-2xl`}
                                        onClick={() => {
                                            sessionStorage.setItem("forceReload", "true");
                                            logout({ logoutParams: { returnTo: window.location.origin } })
                                        }}
                                    />
                                </div>
                                <div onClick={() => navigate("/notifications")} className="relative bg-white rounded-full p-3 shadow-sm cursor-pointer">
                                    <img src="/bell.png" alt="Bell Icon" width="24" />
                                    {hasUnseen && (
                                        <div className="absolute top-0 right-1 w-3 h-3 bg-amber-400 rounded-full" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                        {/* Sidebar for mobile and tablet */}
                        <div
                            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:hidden`}
                        >
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold">Menu</h2>
                                <button onClick={toggleSidebar} className="text-2xl">
                                    <FiX />
                                </button>
                            </div>
                            <nav className="flex flex-col p-4 gap-2">
                                <button
                                    className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => { navigate('/home'); setIsSidebarOpen(false); }}
                                >
                                    Home
                                </button>
                                <button
                                    className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/courses' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => { navigate('/courses'); setIsSidebarOpen(false); }}
                                >
                                    Courses
                                </button>
                                <button
                                    className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/articles' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => { navigate('/articles'); setIsSidebarOpen(false); }}
                                >
                                    Articles
                                </button>
                                <button
                                    className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => { navigate('/fin-tools'); setIsSidebarOpen(false); }}
                                >
                                    FinTools
                                </button>
                                {role === "Admin" && (
                                    <button
                                        className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/admin' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                        onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }}
                                    >
                                        Admin Dashboard
                                    </button>
                                )}
                                <button
                                    className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left bg-white text-gray-700 hover:bg-gray-200`}
                                    onClick={() => {
                                        logout({ logoutParams: { returnTo: window.location.origin } });
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    LogOut
                                </button>
                            </nav>
                        </div>
                        {
                            isSidebarOpen && (
                                <div
                                    className="fixed inset-0 bg-black/50 z-40"
                                    onClick={toggleSidebar}
                                ></div>
                            )
                        }
                        <NewsTicker />
                </header>
                :
                <div>
                    <header className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-10 lg:px-16 py-3 sm:py-6 bg-gray-100">
                        <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
                            <div onClick={() => navigate('/')} className="flex flex-col items-center font-bold text-lg max-w-[200px] overflow-hidden whitespace-nowrap cursor-pointer">
                                <img
                                    src="/logo.png"
                                    alt="FinEd logo"
                                    className="h-12 sm:h-14 w-auto object-contain"
                                />
                                <span className='text-[#4100bc] text-[10px] -mt-2' >Beta</span>
                            </div>
                            <button
                                className="sm:hidden text-gray-800 focus:outline-none p-2"
                                onClick={toggleSidebar}
                                aria-label="Toggle menu"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                                </svg>
                            </button>
                        </div>
                        <nav role="navigation" aria-label="Main navigation" className="hidden sm:flex flex-wrap items-center justify-center sm:justify-end gap-6">
                            <Link to="/courses" aria-label="View courses" className={`w-28 h-10 text-base flex items-center justify-center border-none rounded-full cursor-pointer shadow-sm font-medium transition-colors ${location.pathname.startsWith('/courses') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>Courses</Link>
                            <Link to="/articles" aria-label="View articles" className={`w-28 h-10 text-base flex items-center justify-center border-none rounded-full cursor-pointer shadow-sm font-medium transition-colors ${location.pathname === '/articles' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>Articles</Link>
                            <Link to="/about" aria-label="About us" className={`w-28 h-10 text-base flex items-center justify-center border-none rounded-full cursor-pointer shadow-sm font-medium transition-colors ${location.pathname === '/about' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>About Us</Link>
                            <button onClick={loginWithPopup} className="px-5 py-2 bg-amber-400 text-white rounded-md font-bold hover:bg-amber-500 transition-colors duration-200 text-base sm:text-lg cursor-pointer">Sign up / Login</button>
                        </nav>
                    </header>
                    <NewsTicker />
                    <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden z-50`}>
                        <div className="flex justify-between items-center p-5 border-b">
                            <span className="font-bold text-lg">Menu</span>
                            <button onClick={toggleSidebar} className="text-gray-800 focus:outline-none" aria-label="Close menu">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <nav role="navigation" aria-label="Mobile navigation" className="flex flex-col p-5 space-y-5">
                            <Link to="/courses" aria-label="View courses" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-lg" onClick={toggleSidebar}>Courses</Link>
                            <Link to="/articles" aria-label="View articles" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-lg" onClick={toggleSidebar}>Articles</Link>
                            <Link to="/about" aria-label="About us" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-lg" onClick={toggleSidebar}>About Us</Link>
                            <button onClick={() => { loginWithPopup(); toggleSidebar(); }} className="px-5 py-2 bg-amber-400 text-white rounded-lg font-bold hover:bg-amber-500 transition-colors duration-200 text-lg cursor-pointer">Sign up / Login</button>
                        </nav>
                    </div>
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-white bg-opacity-80 sm:hidden z-40"
                            onClick={toggleSidebar}
                            aria-hidden="true"
                        ></div>
                    )}
                </div>
            }
        </div>
    )
}