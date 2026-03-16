import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import instance from '../lib/axios'
import toast from 'react-hot-toast'
import FinScoreChart from '../components/finScoreChart'
import { IoIosInformationCircleOutline } from "react-icons/io"
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import NewsTicker from '../components/NewsTicker'

const HomePage = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")
  const [email, setEmail] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [warning, setWarning] = useState("")
  const [error, setError] = useState("")
  const [featuredArticle, setFeaturedArticle] = useState({})
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [ongoingCourse, setOngoingCourse] = useState({})
  const [recommendedSchemes, setRecommendedSchemes] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const carouselRef1 = useRef(null)
  const [canScrollLeft1, setCanScrollLeft1] = useState(false)
  const [canScrollRight1, setCanScrollRight1] = useState(false)
  const [userData, setUserData] = useState({})
  const [showLeaderBoard, setShowLeaderBoard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [finScoreLog, setFinScoreLog] = useState([])
  const [showFinScoreLog, setShowFinScoreLog] = useState(false)
  const [isFetchingLog, setIsFechingLog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [course_id, setCourseId] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      setEmail(user?.email)
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  const checkScroll = (el, setLeft, setRight) => {
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft < maxScrollLeft - 2);
  };

  const scrollLeft = (ref) => {
    const el = ref.current;
    if (el) {
      const scrollAmount = window.innerWidth <= 768 ? 310 : window.innerWidth >= 1400 ? 930 : 620;
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref) => {
    const el = ref.current;
    if (el) {
      const scrollAmount = window.innerWidth <= 768 ? 310 : window.innerWidth >= 1400 ? 930 : 620;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el1 = carouselRef1.current;
    const handler1 = () => checkScroll(el1, setCanScrollLeft1, setCanScrollRight1);
    if (el1) {
      el1.addEventListener('scroll', handler1);
      checkScroll(el1, setCanScrollLeft1, setCanScrollRight1);
    }
    return () => {
      if (el1) el1.removeEventListener('scroll', handler1);
    };
  }, [recommendedCourses]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await instance.post("/home/getdata", { email, userId: user?.sub });
      if (res.data?.userData) {
        setUserData(res.data.userData);
        setFeaturedArticle(res.data.featuredArticle);
        setRecommendedCourses(res.data.recommendedCourses);
        setOngoingCourse(res.data.ongoingCourseData);
        setFinScoreLog(res.data.logData);
        setTimeout(() => {
          setShowFeedback(res.data.showFeedback)
        }, 2000)
        setLoading(false);
      }
    } catch (error) {
      setError("Failed to fetch your data.");
    }
  }

  useEffect(() => {
    if (!email) return;
    fetchData();
  }, [email]);

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const idFromQuery = query.get("courseId")
    if (idFromQuery) {
      setCourseId(idFromQuery)
    }
  }, [location.search])

  const fetchRecommendations = async () => {
    try {
      const res = await instance.post("/home/recommendations", { email, course_id });
      setRecommendedSchemes(res.data?.recommendations);
    } catch (err) {
      setShowLeaderBoard(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchRecommendations()
    }
  }, [email, course_id])

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/home/leaderboard");
      setLeaderboard(res.data || []);
    } catch (err) {
      toast.error("Failed to load leaderboard.", err);
      setShowLeaderBoard(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinScoreLog = async () => {
    setIsFechingLog(true);
    try {
      const res = await instance.post("/home/finscorelog", { email });
      setFinScoreLog(res.data || []);
    } catch (err) {
      toast.error("Failed to load fin score history.", err);
      setShowFinScoreLog(false);
    } finally {
      setIsFechingLog(false);
    }
  };

  useEffect(() => {
    if (showLeaderBoard) fetchLeaderboard();
    if (showFinScoreLog) fetchFinScoreLog();
  }, [showLeaderBoard, showFinScoreLog]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-800 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 font-inter text-[#1e1e1e] pb-5 2xl:max-w-[2000px] 2xl:mx-auto">
      <Navbar />
      {loading && !showLeaderBoard ? (
        <div className="p-4 animate-pulse space-y-6 2xl:max-w-[1400px] 2xl:mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start pt-6">
            <div className="space-y-4 w-full">
              <div className="bg-gray-300 rounded-2xl w-full h-[174px]" />
              <div className="bg-gray-300 rounded-2xl w-full h-[110px]" />
            </div>
            <div className="w-full h-[300px] bg-gray-300 rounded-2xl" />
            <div className="w-full h-[300px] bg-gray-300 rounded-2xl" />
          </div>
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <div className="flex-1 space-y-4">
              <div className="w-48 h-6 bg-gray-300 rounded" />
              <div className="flex gap-4 overflow-hidden bg-gray-300 rounded-2xl">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-[310px] h-[350px] bg-gray-300 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="w-full sm:w-[420px] h-[390px] bg-gray-300 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="pt-5 px-4 sm:px-10 2xl:max-w-[1400px] 2xl:mx-auto">
          <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start bg-gray-100 mb-5">
            <div className="col-span-1 md:col-span-1 xl:col-span-1">
              <section className="bg-[#4E00E3] p-4 h-[194px] rounded-2xl text-white text-center flex flex-col justify-center items-center gap-4">
                <div>
                  <div className="relative w-[75px] h-[75px] mx-auto">
                    <img
                      src={user?.picture}
                      onError={(e) => { e.currentTarget.src = "/profile.png" }}
                      alt="Profile"
                      className="w-[75px] h-[75px] object-cover rounded-full border-2 border-gray-300"
                    />
                    <img
                      src="edit.png"
                      className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white bg-gray-200 p-1"
                      alt="Edit"
                    />
                  </div>
                  <h3 className="mt-1 text-base sm:text-lg font-semibold text-white text-center">{user?.name}</h3>
                </div>
                <div className="flex justify-center gap-4 sm:gap-10">
                  <div title="FinStars are earned by completing tasks like reading articles, completing modules, and logging expenses." className="bg-white px-3 py-2 w-20 rounded-full flex items-center justify-center gap-4 font-semibold shadow-sm text-gray-900">
                    <img src="/star.png" alt="fin-stars" className="w-5 h-5" />
                    <p>{userData?.fin_stars}</p>
                  </div>
                  <div title={`🔥 Current Streak: You've been active for ${userData?.streak_count || 0} day${userData?.streak_count === 1 ? '' : 's'} in a row.`} className="bg-white px-3 py-2 w-20 rounded-full flex items-center justify-center gap-4 font-semibold shadow-sm text-gray-900">
                    <img src="/flame.png" alt="streak" className="w-6 h-5" />
                    <p>{userData?.streak_count}</p>
                  </div>
                  <div
                    title={`🏅 Your Rank: You're currently ranked #${userData?.rank || 'N/A'} based on your FinScore.`}
                    onClick={() => setShowLeaderBoard(true)}
                    className="bg-white px-3 py-2 w-20 rounded-full flex items-center justify-center gap-4 font-semibold shadow-sm text-gray-900 cursor-pointer"
                  >
                    <img src="/badge.png" alt="leaderboard" className="w-5 h-5" />
                    <p>{userData?.rank}</p>
                  </div>
                </div>
              </section>

              <section className="flex items-center bg-white rounded-2xl p-2 gap-4 border border-gray-300 mt-4">
                <img
                  src={ongoingCourse?.thumbnail_url || recommendedCourses[recommendedCourses.length - 1]?.thumbnail_url}
                  alt="Course"
                  className="w-[120px] sm:w-[140px] h-[80px] sm:h-[94px] object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex flex-col justify-center items-center flex-grow gap-1 sm:gap-2">
                  <h3 className="text-sm sm:text-base font-semibold line-clamp-2">{ongoingCourse?.title || recommendedCourses[recommendedCourses.length - 1]?.title}</h3>
                  <button
                    onClick={() => navigate(`/courses/course/${ongoingCourse?.id || recommendedCourses[recommendedCourses.length - 1]?.id}`)}
                    className="bg-[#fbbf24] border-none p-1 sm:px-4 sm:py-1 rounded-xl font-semibold text-white cursor-pointer flex items-center justify-center gap-2 shadow-md transition-colors hover:bg-[#c09e2b] text-sm sm:text-base w-full"
                  >
                    <span>{ongoingCourse?.title ? "Continue" : "Start"}</span>
                    <span className="text-md sm:text-2xl">→</span>
                  </button>
                </div>
              </section>
            </div>

            <section onClick={() => navigate("/articles")} className="bg-white px-4 sm:px-5 py-2 rounded-2xl font-sans flex flex-col justify-between w-full h-80 border border-gray-300 col-span-1 md:col-span-1 xl:col-span-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-bold">Featured</h3>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-sm sm:text-base">View More</span>
                  <span className="text-xl sm:text-2xl">→</span>
                </div>
              </div>
              <div className="flex-grow flex flex-col items-center justify-center gap-2 px-4 sm:px-6 py-3">
                <img
                  src={featuredArticle?.image_url}
                  alt="Featured"
                  className="w-full max-w-[360px] h-48 sm:h-52 object-cover rounded-2xl"
                />
                <p className="text-base sm:text-md font-semibold leading-tight">{featuredArticle?.title}</p>
              </div>
            </section>

            <section
              onClick={() => setShowFinScoreLog(true)}
              className="bg-white rounded-2xl px-4 py-2 text-center flex flex-col flex-1 w-full max-w-[480px] mx-auto h-80 border border-gray-300 cursor-pointer overflow-hidden col-span-1 md:col-span-1 xl:col-span-1"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-base sm:text-lg font-bold">FinScore</h3>
                <IoIosInformationCircleOutline onClick={(e) => { e.stopPropagation(); setShowDescription(true) }} className="text-xl sm:text-2xl" />
              </div>
              <div className="flex justify-center items-center w-full h-auto">
                <FinScoreChart score={userData.fin_score} />
              </div>
              <p className="text-sm sm:text-[15px] text-gray-700 mt-4">
                Every expert was once a <b className="font-bold">beginner</b>.
                <br />
                Keep Going!
              </p>
            </section>

          </main>

          <div className="flex flex-col xl:flex-row gap-5 pb-8 items-start bg-gray-100">
            <div className="w-full xl:w-2/3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-semibold">Recommended Courses</h2>
                <div className="flex gap-3 md:gap-4">
                  <button
                    className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${canScrollLeft1 ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                    onClick={() => scrollLeft(carouselRef1)}
                    disabled={!canScrollLeft1}
                  >
                    ❮
                  </button>
                  <button
                    className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${canScrollRight1 ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                    onClick={() => scrollRight(carouselRef1)}
                    disabled={!canScrollRight1}
                  >
                    ❯
                  </button>
                </div>
              </div>
              <div
                ref={carouselRef1}
                style={{ scrollbarWidth: 'none' }}
                className="carousel-track bg-white rounded-2xl flex overflow-x-auto max-w-[310px] sm:max-w-[620px] md:max-w-[930px] xl:max-w-[927px] 2xl:max-w-[1400px] mx-auto border border-gray-300 snap-x snap-mandatory gap-4 sm:gap-3 px-4 sm:px-0"
              >
                {recommendedCourses.length > 0 && recommendedCourses.map((course, index) => (
                  <div
                    onClick={() => navigate(`/courses/course/${course.id}`)}
                    className="bg-white rounded-2xl px-4 py-8 w-[280px] md:w-[300px] shrink-0 space-y-1 h-96 cursor-pointer snap-center"
                    key={index}
                  >
                    <img
                      src={course.thumbnail_url}
                      alt="Course"
                      className="w-full h-40 md:h-44 rounded-xl object-cover"
                    />
                    <div className="flex justify-between my-2.5 px-2 text-xs md:text-sm text-gray-600">
                      <span className="bg-purple-300 text-black rounded-lg px-2 py-0.5 text-xs">Basic</span>
                      <span className="font-medium">{course.modules_count} modules • {course.duration} mins</span>
                    </div>
                    <h3 className="font-semibold px-2 text-sm md:text-base">{course.title}</h3>
                    <p className="text-xs md:text-sm px-2 line-clamp-3">{course.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full xl:w-1/3">
              <section className="bg-white rounded-3xl border border-gray-300 text-center flex flex-col justify-between w-full min-h-[320px] sm:h-[440px] mt-4 xl:mt-0">
                <div className="flex justify-between items-center">
                  <img src='/schemes.png' alt='schemes' className='rounded-2xl' />
                </div>

                {recommendedSchemes?.length > 0 ? (
                  <div className="space-y-4 max-h-44 overflow-y-auto text-start px-2 mt-4 sm:mt-0">
                    {recommendedSchemes.map((scheme, index) => (
                      <div key={index} className="sm:px-3 flex gap-2">
                        <div className='h-9 w-9 sm:h-12 sm:w-12' >
                          <img src={scheme?.bank_name === "HDFC Bank" ? "/hdfc.png" : scheme?.bank_name === "SBI Bank" ? "/sbi.png" : scheme?.bank_name === "ICICI Bank" ? "/icici.png" : "/kotak.png"} alt='bank_logo' className='h-9 w-9 sm:h-12 sm:w-12' />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold">{scheme?.bank_name} {scheme?.scheme_name}</p>
                          <p className="text-sm">{scheme?.description.slice(0, 40)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-sm font-medium">
                    🎯 Complete a course to see recommendations!
                  </div>
                )}

                <div className="border-t border-gray-300 py-3">
                  <div
                    onClick={() => {
                      if (course_id) {
                        navigate(`/policies?courseId=${course_id}`);
                      } else {
                        navigate("/policies");
                      }
                    }}
                    className="flex justify-center items-center gap-3 cursor-pointer transition"
                  >
                    <p className="font-semibold text-lg">View All</p>
                    <span className="text-2xl -mt-[3px]">→</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <Footer />
        </div>
      )}

      {
        warning && (
          <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-[500px] space-y-4">
              <p className="text-lg sm:text-xl font-bold text-red-600">⚠️ Alert</p>
              <p className="text-sm sm:text-md font-semibold text-gray-700">{warning}</p>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setWarning("")}
                  className={`bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg ${isSaved ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        error && (
          <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-xl w-[90%] max-w-[500px] space-y-4">
              <p className="text-lg sm:text-xl font-bold text-red-600">⚠️ Alert</p>
              <p className="text-sm sm:text-md font-semibold text-gray-700">{error}</p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { setError(""); setLoading(false); navigate("/home") }}
                  className={`bg-amber-400 hover:bg-amber-500 transition-all duration-300 text-white px-4 py-2 rounded-lg ${isSaved ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        showLeaderBoard && (
          <div onClick={() => setShowLeaderBoard(false)} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()} className="bg-white w-[90%] max-w-xl rounded-2xl shadow-xl p-6 relative">
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">🏆 FinScore Leaderboard</h2>
              <button
                onClick={() => setShowLeaderBoard(false)}
                className="absolute top-3 right-4 text-xl sm:text-2xl text-gray-500 hover:text-black cursor-pointer"
              >
                ×
              </button>
              {loading ? (
                <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-100 px-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex justify-between items-center py-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <div className="w-32 h-5 rounded bg-gray-300"></div>
                      </div>
                      <div className="w-16 h-5 rounded bg-gray-300"></div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-2 pt-5">
                    <div className="w-40 h-5 rounded-lg bg-gray-300 animate-pulse"></div>
                    <div className="w-28 h-5 rounded-lg bg-gray-300 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {(() => {
                    const leaderboardWithRanks = [];
                    let rank = 1;
                    let lastStars = null;
                    let skip = 0;
                    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.finScore - a.finScore);
                    for (let i = 0; i < sortedLeaderboard.length; i++) {
                      const current = sortedLeaderboard[i];
                      if (current.finScore === lastStars) {
                        skip++;
                      } else {
                        rank += skip;
                        skip = 1;
                        lastStars = current.finScore;
                      }
                      leaderboardWithRanks.push({ ...current, rank });
                    }
                    return (
                      <div>
                        <div className='overflow-y-auto max-h-[400px]' >
                          {leaderboardWithRanks.map((entry, index) => {
                            const isCurrentUser = user?.email === entry.email;
                            const name = entry.email?.split("@")[0] || "User";
                            const rankEmoji =
                              entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;
                            return (
                              <div
                                key={entry.user_sub || index}
                                className={`flex justify-between items-center px-4 py-3 text-base sm:text-lg transition-all duration-200 ${isCurrentUser ? "bg-yellow-100 font-semibold rounded-md" : ""}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg sm:text-xl">{rankEmoji}</span>
                                  <span>{name}</span>
                                </div>
                                <span className="font-bold text-indigo-600">
                                  {entry.finScore} ⭐
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between items-center px-4 sm:px-12 pt-5 text-base sm:text-lg font-semibold">
                          <p>Your rank: {leaderboardWithRanks.find((entry) => entry.email === user?.email)?.rank ?? "N/A"}</p>
                          <p>Your finScore: {userData?.fin_score}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )
      }

      {
        showFinScoreLog && (
          <div onClick={() => setShowFinScoreLog(false)} className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()} className="bg-white px-4 sm:px-6 py-4 rounded-2xl shadow-xl w-[90%] max-w-[500px] space-y-4">
              <div className="flex justify-between">
                <p className="text-lg sm:text-xl font-bold text-indigo-700">🕓 FinScore History</p>
                <button
                  onClick={() => setShowFinScoreLog(false)}
                  className="text-xl sm:text-2xl text-gray-500 hover:text-black cursor-pointer -mt-2"
                >
                  ×
                </button>
              </div>
              {isFetchingLog ? (
                <ul className="space-y-4 max-h-[80vh] overflow-y-auto">
                  {[...Array(4)].map((_, i) => (
                    <li key={i} className="bg-gray-100 p-3 rounded-lg animate-pulse space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 w-16 bg-gray-300 rounded"></div>
                        <div className="h-3 w-24 bg-gray-300 rounded"></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : finScoreLog && finScoreLog.length > 0 ? (
                <ul className="space-y-3 max-h-[60vh] overflow-y-auto p-2">
                  {finScoreLog.map((log, index) => (
                    <li key={index} className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-800">{log.description}</p>
                      <div className="text-xs text-gray-500 mt-1 flex justify-center">
                        <span>{log.change > 0 ? `+${log.change}` : log.change} pts</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">No recent FinScore changes logged.</p>
              )}
            </div>
          </div>
        )
      }
      {
        showFeedback && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
              <h2 className="text-xl font-bold text-gray-800">We’d love your feedback!</h2>
              <p className="text-gray-600">Please take a moment to tell us how we're doing.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    navigate("/feedback");
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Give Feedback
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        showDescription && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white max-w-3xl w-full rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
              <button
                onClick={() => setShowDescription(false)}
                className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                &times;
              </button>

              <h2 className="text-3xl font-bold mb-4 text-primary">📊 What is FinScore?</h2>
              <p className="mb-4 text-gray-700">
                <strong>FinScore</strong> is your financial growth score on FinEd. It reflects how well you learn, budget, and track your money. The higher your score, the better your financial behavior!
              </p>

              <h3 className="text-xl font-semibold mb-2 text-secondary">Why FinScore Matters</h3>
              <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-1">
                <li>Track your financial growth</li>
                <li>Unlock badges and achievements</li>
                <li>Stay motivated through visible progress</li>
                <li>Compete on the leaderboard</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 text-secondary">🔢 How It's Calculated</h3>
              <div className="mb-4 space-y-2 text-gray-700">
                <p><strong>1. Learning & Courses:</strong> Complete cards and quizzes to earn FinStars and course points.</p>
                <p><strong>2. Budgeting:</strong> Set budgets early in the month, stick to them, and get rewarded.</p>
                <p><strong>3. Consistency:</strong> Maintain streaks and show up daily to earn bonus points.</p>
              </div>

              <h3 className="text-xl font-semibold mb-2 text-secondary">🎯 FinScore Examples</h3>
              <table className="w-full text-sm mb-6 border border-gray-300 rounded-md overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="py-2 px-4 border-b">Action</th>
                    <th className="py-2 px-4 border-b">FinScore Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Complete a card", "+5 to +10"],
                    ["Finish a module", "+15"],
                    ["Set a monthly budget (first 5 days)", "+10"],
                    ["Achieve monthly budget", "+15"],
                    ["Miss monthly budget", "-10"],
                    ["Upload transactions", "+ small boost"],
                    ["7-day streak", "+10 bonus"],
                  ].map(([action, score], i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{action}</td>
                      <td className="py-2 px-4">{score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-xl font-semibold mb-2 text-secondary">📈 How to Improve FinScore</h3>
              <ul className="list-disc ml-6 mb-6 text-gray-700 space-y-1">
                <li>Complete course cards and finish modules</li>
                <li>Set and review budgets monthly</li>
                <li>Upload your expenses and income regularly</li>
                <li>Log in and use the platform daily</li>
              </ul>

              <p className="text-gray-700 font-medium">
                Your FinScore is more than a number — it’s a celebration of your financial learning journey! 💡
              </p>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default HomePage;