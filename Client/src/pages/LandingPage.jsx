import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import instance from "../lib/axios";
import Footer from '../components/Footer';
import NewsTicker from '../components/NewsTicker';

export default function LandingPage() {
  const { user, isAuthenticated, isLoading, loginWithPopup } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [canScrollLeftCourses, setCanScrollLeftCourses] = useState(false);
  const [canScrollRightCourses, setCanScrollRightCourses] = useState(false);
  const [canScrollLeftArticles, setCanScrollLeftArticles] = useState(false);
  const [canScrollRightArticles, setCanScrollRightArticles] = useState(false);
  const courseCarouselRef = useRef(null);
  const articleCarouselRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [openedArticle, setOpenedArticle] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  // Enhanced loading UI
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-800 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  async function fetchCourses() {
    setLoading(true)
    try {
      const res = await instance.get("/courses/getall")
      if (res.data.length > 0) {
        setCourses(res.data)
        setLoading(false)
      }
    } catch (err) {
      setError("Failed to load courses.")
    }
  }

  const fetchArticles = async () => {
    try {
      const res = await instance.post("/articles/getall", { limit: 15, offset: 0 })
      setArticles(res?.data)
    } catch (err) {
      setError("Failed to load articles.")
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchArticles()
  }, [])

  useEffect(() => {
    const shouldReload = sessionStorage.getItem("forceReload");
    if (shouldReload) {
      sessionStorage.removeItem("forceReload");
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    if (isSidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const checkScroll = (el, setLeft, setRight) => {
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    setLeft(scrollLeft > 10);
    setRight(scrollLeft < maxScrollLeft - 10);
  };

  const scrollLeft = (ref) => {
    const el = ref.current;
    if (el) {
      const width = el.getBoundingClientRect().width;
      el.scrollBy({ left: -width, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref) => {
    const el = ref.current;
    if (el) {
      const width = el.getBoundingClientRect().width;
      el.scrollBy({ left: width, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el1 = courseCarouselRef.current;
    const el2 = articleCarouselRef.current;

    const updateScrollStates = () => {
      checkScroll(el1, setCanScrollLeftCourses, setCanScrollRightCourses);
      checkScroll(el2, setCanScrollLeftArticles, setCanScrollRightArticles);
    };

    const handler1 = () => checkScroll(el1, setCanScrollLeftCourses, setCanScrollRightCourses);
    const handler2 = () => checkScroll(el2, setCanScrollLeftArticles, setCanScrollRightArticles);

    if (el1) {
      el1.addEventListener('scroll', handler1);
    }
    if (el2) {
      el2.addEventListener('scroll', handler2);
    }

    const resizeObserver = new ResizeObserver(updateScrollStates);
    const mutationObserver = new MutationObserver(updateScrollStates);

    if (el1) {
      resizeObserver.observe(el1);
      mutationObserver.observe(el1, { childList: true, subtree: true });
    }
    if (el2) {
      resizeObserver.observe(el2);
      mutationObserver.observe(el2, { childList: true, subtree: true });
    }

    updateScrollStates();

    return () => {
      if (el1) {
        el1.removeEventListener('scroll', handler1);
        resizeObserver.unobserve(el1);
        mutationObserver.disconnect();
      }
      if (el2) {
        el2.removeEventListener('scroll', handler2);
        resizeObserver.unobserve(el2);
        mutationObserver.disconnect();
      }
    };
  }, [courses, articles]);

  return (
    <div className="min-h-screen bg-gray-100 pb-5 text-gray-800 font-inter">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .wave-container {
            position: relative;
            overflow: hidden;
            background: #431FCE;
          }
          @media (min-width: 1024px) and (max-width: 1366px) {
            .ipad-pro-fix {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 1.5rem;
              overflow-x: visible;
            }
            .ipad-pro-fix .card-content img {
              width: clamp(60px, 10vw, 80px);
              height: clamp(60px, 10vw, 80px);
              max-width: clamp(70px, 12vw, 90px);
              object-fit: contain;
            }
            .ipad-pro-fix .card-content {
              min-width: 0;
              width: 100%;
              padding: 1rem;
            }
          }
        `}
      </style>
      <header className="flex flex-col px-4 sm:px-10 lg:px-16 py-3 sm:py-6 bg-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4 sm:mb-6">
          <div className="flex items-center justify-between w-full sm:w-auto">
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
          <nav role="navigation" aria-label="Main navigation" className="hidden sm:flex flex-wrap items-center justify-center sm:justify-end gap-6 sm:gap-10">
            <Link to="/courses" aria-label="View courses" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">Courses</Link>
            <Link to="/articles" aria-label="View articles" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">Articles</Link>
            <Link to="/about" aria-label="About us" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">About Us</Link>
            <button onClick={loginWithPopup} className="px-5 py-2 bg-amber-400 text-white rounded-md   font-bold hover:bg-amber-500 transition-colors duration-200 text-base sm:text-lg cursor-pointer">Sign up / Login</button>
          </nav>
        </div>
      </header>
      <NewsTicker />

      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-100 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden z-50`}>
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
          className="fixed inset-0 bg-gray-100 bg-opacity-80 sm:hidden z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      <main className="flex flex-col lg:flex-row justify-between items-center px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="max-w-full lg:max-w-xl mb-10 lg:mb-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-5 font-semibold text-center lg:text-left leading-tight">Take Control of Your Financial Future—For Free</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 text-center lg:text-left">
            FinEd simplifies finance with bite-sized, engaging courses designed to help you save more, invest smarter, and take control of your money - all for free!
          </p>
        </div>
        <div className="w-full lg:w-[600px] flex justify-center">
          <img
            src="/landing1.png"
            alt="Code preview"
            className="w-full max-w-[600px] rounded-2xl shadow-xl object-contain"
          />
        </div>
      </main>

      <section className="bg-[#3B0DAD] text-white py-12 sm:py-16 px-6 sm:px-10 lg:px-16 text-center relative">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-5 font-semibold">Jump into your first course</h2>
        <p className="text-base sm:text-lg mb-8">No sign-in, no hassle. Start learning about money in just one click.</p>
        <Link to={`/courses/course/${courses[courses.length - 1]?.id}`} className="bg-[#fbbf24] text-white py-3 px-8 rounded-lg font-bold no-underline text-base sm:text-lg hover:bg-[#e6b640] transition-colors duration-200">Give It a Go →</Link>
      </section>

      <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-20 flex flex-col md:flex-row justify-between items-center bg-gray-100 gap-8">
        <div className="flex-1 w-full md:w-[45%] text-center md:text-left mb-10 md:mb-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Small Lessons. Big Impact.</h2>
          <ul className="list-none p-0 mb-6 space-y-4">
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Step-by-step roadmaps to guide your journey</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Quizzes that reinforce learning, not test memory</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Real-life examples to make concepts stick</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Zero jargon—just clear, practical explanations</li>
          </ul>
          <p className="text-base sm:text-lg">Perfect for busy minds with big goals.</p>
        </div>
        <div className="flex-1 w-full md:w-[45%] flex justify-center">
          <img
            src="/landing2.png"
            alt="Dashboard preview 1"
            className="w-full max-w-[500px] h-auto rounded-lg shadow-lg object-contain"
          />
        </div>
      </div>

      <div className="px-6 sm:px-10 lg:px-20 flex flex-col-reverse md:flex-row justify-between items-center bg-gray-100 gap-8">
        <div className="flex-1 w-full md:w-[45%] flex justify-center mb-10 md:mb-0">
          <img
            src="/landing3.jpg"
            alt="Dashboard preview 2"
            className="w-full max-w-[600px] h-auto rounded-xl shadow-lg object-contain"
          />
        </div>
        <div className="flex-1 w-full md:w-[45%] text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Knowledge Pays—Literally.</h2>
          <ul className="list-none p-0 mb-6 space-y-4">
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Collect FinStars as you complete lessons and quizzes</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Climb the leaderboard and track your progress</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Unlock real rewards—from gift cards to exclusive perks</li>
          </ul>
          <p className="text-base sm:text-lg">
            Learn smart, earn smarter with our rewards system.<br />
            Because learning finance should feel as rewarding as it is impactful.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-20 flex flex-col md:flex-row justify-between items-center bg-gray-100 gap-8">
        <div className="flex-1 w-full md:w-[45%] text-center md:text-left mb-10 md:mb-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Turn Knowledge into Action</h2>
          <ul className="list-none p-0 mb-6 space-y-4">
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Interactive tools that bridge learning with real-life money moves</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Built for everyday use, from quick decisions to long-term planning</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Designed for simplicity, so you can focus on what matters</li>
          </ul>
          <p className="text-base sm:text-lg">
            Learning is just the start—our tools help you make it real from budget trackers to smart goal planners, we have something for everyone.
          </p>
        </div>
        <div className="flex-1 w-full md:w-[45%] flex justify-center">
          <img
            src="/landing4.jpg"
            alt="Organization Overview"
            className="w-full max-w-[500px] h-auto rounded-lg shadow-lg object-contain"
          />
        </div>
      </div>

      <section className="wave-container text-white py-16 px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Explore Courses</h2>
          <div className="flex gap-3">
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollLeftCourses ? 'bg-amber-400 text-white hover:bg-amber-500 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              onClick={() => scrollLeft(courseCarouselRef)}
              disabled={!canScrollLeftCourses}
              aria-label="Scroll courses left"
            >
              ❮
            </button>
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollRightCourses ? 'bg-amber-400 text-white hover:bg-amber-500 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              onClick={() => scrollRight(courseCarouselRef)}
              disabled={!canScrollRightCourses}
              aria-label="Scroll courses right"
            >
              ❯
            </button>
          </div>
        </div>

        <div ref={courseCarouselRef} role="region" aria-label="Explore courses carousel" className="flex flex-row h-[240px] pt-4 gap-8 sm:px-2 mb-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <div onClick={() => toast.error("Please sign in!")} key={index} className="bg-gray-100 text-gray-900 rounded-xl p-4 shadow-md flex flex-col justify-between h-48 w-full sm:w-[440px] shrink-0 transition-transform duration-200 hover:-translate-y-1 snap-start card-content cursor-pointer">
                <div className='flex justify-between gap-4' >
                  <div className='max-w-3/5' >
                    <p className='text-2xl text-purple-700 font-semibold' >{course.title}</p>
                  </div>
                  <div className="flex">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-28 w-44 object-cover rounded-2xl"
                    />
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-sm sm:text-base text-gray-700">{course.modules_count} modules • {course.duration} mins</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-4">No courses available.</p>
          )}
        </div>

        <div className="wave absolute bottom-0 left-0 w-full h-24 overflow-hidden leading-none z-0">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="relative block w-full h-24">
            <path d="M0.00,49.98 C150.00,150.00 349.90,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" className="fill-gray-100"></path>
          </svg>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Articles</h2>
          <div className="flex gap-3">
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollLeftArticles ? 'bg-amber-400 text-white hover:bg-amber-500 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              onClick={() => scrollLeft(articleCarouselRef)}
              disabled={!canScrollLeftArticles}
              aria-label="Scroll articles left"
            >
              ❮
            </button>
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollRightArticles ? 'bg-amber-400 text-white hover:bg-amber-500 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              onClick={() => scrollRight(articleCarouselRef)}
              disabled={!canScrollRightArticles}
              aria-label="Scroll articles right"
            >
              ❯
            </button>
          </div>
        </div>

        <div ref={articleCarouselRef} role="region" aria-label="Explore courses carousel" className="flex flex-row h-[190px] pt-4 gap-8 sm:px-2 mb-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div onClick={() => setOpenedArticle(article)} key={index} className="bg-gray-50 text-gray-900 rounded-xl p-4 shadow-lg flex flex-col justify-between h-40 w-full sm:w-[440px] shrink-0 transition-transform duration-200 hover:-translate-y-1 snap-start card-content cursor-pointer">
                <div className='flex justify-between gap-4' >
                  <div className='max-w-3/5' >
                    <p className='text-xl text-purple-700 font-semibold' >{article.title}</p>
                  </div>
                  <div className="flex">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="h-32 w-58 object-cover rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-4">No articles available.</p>
          )}
        </div>
      </section>

      {openedArticle && (
        <div
          className="fixed inset-0 z-20 bg-gray-100 flex items-center justify-center transition-opacity duration-500"
        >
          <div className="bg-white w-full h-full overflow-y-auto p-6 sm:p-10 relative rounded-none shadow-lg transition-all duration-300">
            <button
              onClick={() => setOpenedArticle(null)}
              className="absolute -top-2 right-0 sm:top-0 sm:right-2 text-gray-500 hover:text-gray-700 text-4xl font-bold z-50 transition-all duration-200 cursor-pointer"
            >
              &times;
            </button>
            <img
              src={openedArticle.image_url || "_"}
              alt="Article"
              className="h-60 w-full sm:h-3/4 sm:max-h-full object-contain rounded-md mb-6"
            />
            <div className='sm:px-40' >
              <h2 className="text-xl sm:text-4xl font-bold sm:font-extrabold text-gray-800 mb-3">{openedArticle.title}</h2>
              <p className="text-sm font-medium text-gray-500 mb-6">
                {new Date(openedArticle.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </p>
              <div className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line text-justify sm:font-medium">
                {openedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}