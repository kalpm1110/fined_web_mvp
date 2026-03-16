import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../lib/axios";
import { useAuth0 } from '@auth0/auth0-react';
import toast from "react-hot-toast";
import { FiMenu, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const imageAssets = {
  completed: "/FcomplitedModule.png",
  incompleted: "/start.png",
  locked: "/locked.png",
  pathLeftToRight: "/FpathLtoR.png",
  pathRightToLeft: "/FpathRtoL.png",
};

export default function CourseOverviewPage() {
  const navigate = useNavigate();
  const { course_id } = useParams();

  const { user, isLoading, isAuthenticated, logout } = useAuth0();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [course, setCourse] = useState([]);
  const [showLockedAlert, setShowLockedAlert] = useState(false);
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [isEnteredEmail, setIsEnteredEmail] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setEmail(user?.email || "");
      setHasUser(true);
      const roles = user?.["https://fined.com/roles"];
      setRole(roles?.[0] || "");
    }
  }, [isLoading, isAuthenticated]);

  async function fetchCourse() {
    setLoading(true);
    try {
      const res = await instance.post(`/courses/course/${course_id}`, { email });
      setCourseTitle(res.data.title);
      setCourse(res.data.data);
      setLoading(false);
    } catch (err) {
      setWarning("Failed to load course.");
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCourse();
    }, 500);

    return () => clearTimeout(timeout);
  }, [hasUser]);

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

  async function fetchEnteredEmail() {
    try {
      const res = await instance.post("/articles/getenteredemail", { email });
      if (res.data[0]?.enteredEmail) {
        setEnteredEmail(res.data[0]?.enteredEmail || null);
        setIsEnteredEmail(true);
      }
    } catch (error) {
      setEnteredEmail("");
      setIsEnteredEmail(false);
    }
  }

  useEffect(() => {
    if (!email) return;
    fetchEnteredEmail();
    fetchHasUnseen();
  }, [email]);

  const saveEmail = async () => {
    if (enteredEmail === "") return;
    setIsSaved(true);
    try {
      await instance.post("/articles/saveemail", { email, enteredEmail });
      toast.success("🎉 Subscribed successfully.");
      setIsEnteredEmail(true);
    } catch (err) {
      setWarning("Failed to save email.");
    } finally {
      setIsSaved(false);
    }
  };

  const removeEmail = async () => {
    setIsSaved(true);
    try {
      await instance.post("/articles/removeemail", { email, enteredEmail });
      toast.success("Unsubscribed successfully.");
      setEnteredEmail("");
      setIsEnteredEmail(false);
    } catch (err) {
      setWarning("Failed to remove email.");
    } finally {
      setIsSaved(false);
    }
  };

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

  return (
    <div className="min-h-screen pb-5 bg-gray-100 overflow-x-hidden">
      <Navbar />

      {loading ? (
        <div className="flex flex-col gap-8 items-center my-20">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[50%] h-24 bg-gray-300 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="py-5 px-4 sm:py-10 bg-gray-100 min-h-screen">
          <div className="bg-violet-800 text-white rounded-2xl overflow-hidden mb-6 w-full sm:max-w-3xl sm:mx-auto">
            <div className="flex items-center px-4 py-3 border-b border-white/40">
              <button onClick={() => navigate('/courses')} className="text-lg sm:text-xl mr-4 cursor-pointer">←</button>
              <h2 className="text-md sm:text-lg font-semibold">{courseTitle}</h2>
            </div>
            <div className="px-4 py-2">
              <div className="font-medium sm:font-semibold">Module 1</div>
              <div>{course[0]?.moduleTitle}</div>
            </div>
          </div>

          {course.map((module, index) => (
            <div key={index} className="mb-20 mx-auto max-w-3xl">
              {index !== 0 && (
                <div className="bg-violet-800 text-white px-4 py-2 rounded-2xl font-medium text-left w-full">
                  <div className="font-medium sm:font-semibold">Module {index + 1}</div>
                  <div className="font-normal">{module.moduleTitle}</div>
                </div>
              )}

              <div className="mt-10 flex flex-col items-center gap-4 px-4 sm:px-0">
                {module.cards.map((card, i) => {
                  const isClickable = i === 0 || module.cards[i - 1].status === "completed";
                  const isOngoing = isClickable && card.status !== "completed";
                  return (
                    <div key={i} className={`w-full flex flex-col ${i % 2 === 0 ? "items-start" : "items-end"}`}>
                      <div className={`flex flex-col items-center w-1/6 ${i % 2 === 0 ? 'ml-0 sm:ml-[165px]' : 'sm:mr-[165px]'}`}>
                        <button
                          onClick={() => {
                            if (isClickable) {
                              navigate(`module/${module.moduleId}/card/${card.card_id}`);
                            } else {
                              setShowLockedAlert(true);
                            }
                          }}
                          className="transition-transform duration-200 hover:scale-110 focus:scale-90 cursor-pointer"
                        >
                          <img
                            src={imageAssets[
                              card.status === "completed"
                                ? "completed"
                                : isOngoing
                                  ? "incompleted"
                                  : "locked"
                            ]}
                            alt="status icon"
                            className="w-16 h-16 object-contain"
                          />
                        </button>
                        <p className="text-center w-28 sm:w-96 mb-2 overflow-hidden text-[10px] sm:text-base text-ellipsis">
                          {card.title}
                        </p>
                      </div>

                      {i !== module.cards.length - 1 && (
                        <img
                          src={i % 2 === 0 ? imageAssets.pathLeftToRight : imageAssets.pathRightToLeft}
                          alt="path"
                          className="w-6/7 sm:w-5/12 h-16 mx-auto"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />

      {warning && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
            <p className="text-xl font-bold text-red-600">⚠️ Alert</p>
            <p className="text-md font-semibold text-gray-700">
              {warning}
            </p>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => { setWarning(""); setLoading(false); navigate("/courses"); }}
                className={`bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg ${isSaved ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showLockedAlert && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
            <p className="text-xl font-bold text-red-600">⚠️ Card Locked</p>
            <p className="text-md font-semibold text-gray-700">
              Please complete the previous card to unlock this one.
            </p>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowLockedAlert(false)}
                className="bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}