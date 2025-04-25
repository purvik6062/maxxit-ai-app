"use client";
import React, { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToastContainer, toast } from "react-toastify";
import { OctagonAlert } from "lucide-react";
import { IoShieldCheckmark } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import { FaXTwitter } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import { Search, X, CopyCheckIcon, LogOut, Menu } from "lucide-react";
import "@rainbow-me/rainbowkit/styles.css";
// import "../../app/css/input.css";
import Link from "next/link";
import { useCredits } from "@/context/CreditsContext";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from 'framer-motion'; 
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

// Navigation configuration
const NAVIGATION_ITEMS = [
  { path: "/influencer", label: "Influencer", id: "influencer" },
  { path: "/profile", label: "Profile", id: "profile" },
  { path: "/pricing", label: "Pricing", id: "pricing", hasBorders: true },
  { path: "/playground", label: "Playground", id: "playground" },
];

interface NavItemProps {
  item: typeof NAVIGATION_ITEMS[0];
  isActive: boolean;
  onClick?: () => void;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick, isMobile = false }) => {
  const { path, label, hasBorders, id } = item;

  // Desktop nav item
  if (!isMobile) {
    return (
      <Link href={path}>
        <span
          className={`
            px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium inline-block 
            transition-colors duration-200
            ${hasBorders ? 'border-l border-r border-gray-700' : ''}
            ${isActive ? "bg-[#E4EFFF] text-[#393B49]" : "text-gray-300 hover:bg-gray-800"}
          `}
        >
          {label}
        </span>
      </Link>
    );
  }

  // Mobile nav item
  return (
    <Link href={path} onClick={onClick}>
      <span className={`flex items-center px-4 py-3 text-sm font-medium ${isActive ? "bg-blue-900/30 text-blue-100 border-l-2 border-blue-400" : "text-gray-300 hover:bg-gray-800"}`}>
        {label}
        {isActive && (
          <span className="ml-auto">
            <span className="w-2 h-2 bg-blue-400 rounded-full block"></span>
          </span>
        )}
      </span>
    </Link>
  );
};

interface SearchInputProps {
  searchText: string;
  setSearchText: (text: string) => void;
  showSearchInput: boolean;
  toggleSearchInput?: () => void;
  isMobile?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchText,
  setSearchText,
  showSearchInput,
  toggleSearchInput,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-4 py-2 rounded-full text-white text-sm bg-gray-800/60 border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {searchText ? (
            <button onClick={() => setSearchText("")} className="text-gray-400 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="text-gray-400 w-4 h-4" />
          )}
        </div>
      </div>
    );
  }

  if (showSearchInput) {
    return (
      <div className="relative flex items-center rounded-full transition-all duration-300">
        <input
          id="search-input"
          type="text"
          placeholder="Search accounts..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-4 py-2 rounded-full text-white"
        />
        <div className="absolute right-3 flex space-x-2">
          {searchText && (
            <button onClick={() => setSearchText("")} className="text-gray-400 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={toggleSearchInput} className="text-gray-400 hover:text-white">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleSearchInput}
      className="flex items-center justify-center w-8 h-8 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full"
    >
      <Search className="w-5 h-5" />
    </button>
  );
};

interface CreditsDisplayProps {
  credits: number;
  isMobile?: boolean;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ credits, isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/30">
        <span className="text-gray-300 font-medium text-sm">Available Credits</span>
        <span className="text-blue-400 font-bold text-lg">
          {credits}
        </span>
      </div>
    );
  }

  return (
    <div className="hidden md:block px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-700/20 border border-blue-500/50">
      <span className="text-blue-400 font-bold text-xs sm:text-sm">
        {credits} <span className="text-white font-normal">Credits</span>
      </span>
    </div>
  );
};

// Main Header component
interface HeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchText, setSearchText }) => {
  const pathname = usePathname();
  const [view, setView] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState("");
  const [showTokens, setShowTokens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramStep, setTelegramStep] = useState(1);
  const [tweetLink, setTweetLink] = useState(
    "https://x.com/triggerxnetwork/status/1908126605110636929"
  );
  const { credits, updateCredits } = useCredits();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const [hasRegistered, setHasRegistered] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeLink, setActiveLink] = useState("");
  // const { theme, toggleTheme } = useTheme();

  // Error mapping for telegram registration
  const ERROR_MAPPING: { [key: string]: string } = {
    "Twitter username already registered":
      "This Twitter username is already connected to another account",
    "Telegram username already registered":
      "This Telegram username is already in use",
    "Telegram account already linked to another user":
      "This Telegram account is connected to another user",
    "Please start a chat with our bot first and send a message. Check step 1 & 2 in the instructions.":
      "Complete Step 1 & 2: Start the bot and send /start",
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Close mobile menu on resize to larger viewport
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set active link based on current URL path
  useEffect(() => {
    if (pathname?.includes("/influencer")) setActiveLink("influencer");
    else if (pathname?.includes("/profile")) setActiveLink("profile");
    else if (pathname?.includes("/pricing")) setActiveLink("pricing");
    else if (pathname?.includes("/playground")) setActiveLink("playground");
    else setActiveLink("");
  }, [pathname]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen || isTelegramModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, [isModalOpen, isTelegramModalOpen]);

  // Check if user has registered
  useEffect(() => {
    const hasRegisteredPreviously = localStorage.getItem("hasRegistered");
    if (hasRegisteredPreviously === "true") {
      setShowTokens(true);
      setHasRegistered(true);
    }

    const fetchUserData = async () => {
      if (!session || !session.user?.id) return;

      try {
        const response = await fetch(
          `/api/get-user?twitterId=${session.user.id}`
        );

        if (response.status === 404) {
          setShowTokens(false);
          setHasRegistered(false);
          localStorage.removeItem("hasRegistered");
          return;
        }

        const data = await response.json();
        console.log("data::", data);
        if (data.success) {
          setShowTokens(true);
          setHasRegistered(true);
          localStorage.setItem("hasRegistered", "true");
        } else {
          setShowTokens(false);
          setHasRegistered(false);
          localStorage.removeItem("hasRegistered");
        }
        setIsTelegramModalOpen(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setShowTokens(false);
        setHasRegistered(false);
        localStorage.removeItem("hasRegistered");
      }
    };

    fetchUserData();
  }, [session]);

  // Show welcome toast for new users with credits
  useEffect(() => {
    const hasShownWelcomeToast = localStorage.getItem("hasShownWelcomeToast");

    if (credits === 500 && !hasShownWelcomeToast) {
      toast.info(
        "🎉 Welcome! Explore our prediction markets with your 500 free credits",
        {
          position: "top-center",
          autoClose: 7000,
          hideProgressBar: false,
        }
      );

      localStorage.setItem("hasShownWelcomeToast", "true");
    }
  }, [credits]);

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleTelemodal = () => {
    if (!session) {
      toast.error("Please login with Twitter/X first", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } else {
      setIsTelegramModalOpen(true);
      setTelegramStep(1);
    }
  };

  const handleLater = () => {
    setIsTelegramModalOpen(false);
    setTelegramUsername("");
    setTelegramStep(1);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterUsername: session?.user?.username,
          twitterId: session?.user?.id,
          telegramId: telegramUsername,
          credits: 500,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Registration failed");
      }

      setHasRegistered(true);
      setShowTokens(true);
      localStorage.setItem("hasRegistered", "true");

      toast.success("Success! 500 Credits added to your account", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        onClose: () => {
          setIsTelegramModalOpen(false);
          setTelegramStep(1);
          setTelegramUsername("");
          updateCredits();
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      const mappedErrorKey = Object.keys(ERROR_MAPPING).find((key) =>
        message.includes(key)
      );
      setErrorMessage(
        mappedErrorKey
          ? ERROR_MAPPING[mappedErrorKey]
          : "Registration failed. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="bg-[#07091573] border rounded-full border-[#3E434B] m-2 sm:m-4">
      <ToastContainer />
      <div className="mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/img/maxxit_logo.svg" alt="Maxxit" className="h-7 sm:h-8" />
            <div className="text-2xl font-napzerRounded bg-gradient-to-b from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">maxxit</div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="font-leagueSpartan hidden md:flex bg-[#101322B3] rounded-full items-center border border-gray-700 overflow-hidden">
            {NAVIGATION_ITEMS.map(item => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeLink === item.id}
              />
            ))}

            {/* Search icon and input inside navbar - Desktop */}
            <div className="ml-2 mr-2 relative">
              <SearchInput
                searchText={searchText}
                setSearchText={setSearchText}
                showSearchInput={showSearchInput}
                toggleSearchInput={toggleSearchInput}
              />
            </div>
          </nav>

          {/* Right section - credits and login */}
          <div className="font-leagueSpartan flex items-center space-x-2 sm:space-x-4">
            {/* Credits Display */}

            {/* <motion.button
              onClick={toggleTheme}
              className="mr-2 p-2 rounded-full bg-background/80 border border-accent/20 hover:bg-accent/10 transition-colors flex items-center justify-center"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.1 }}
              whileTap={{ 
                rotate: 180, 
                scale: 0.9,
                backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(109, 40, 217, 0.2)'
              }}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              )}
            </motion.button> */}

            {showTokens ? (
              <CreditsDisplay credits={credits} />
            ) : (
              <button
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition whitespace-nowrap"
                onClick={handleTelemodal}
              >
                Get Credits
              </button>
            )}

            {/* Login/Profile */}
            {!session ? (
              <button
                onClick={() => signIn("twitter")}
                className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-black rounded-full text-xs sm:text-sm font-medium"
              >
                Login with <FaXTwitter className="ml-1" size={14} />
              </button>
            ) : (
              <div className="flex items-center bg-gray-800/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-700">
                <img
                  src={session.user?.image.replace(/_normal(?=\.(jpg|jpeg|png|gif|webp))/i, "") || "/default-avatar.png"}
                  alt="Profile"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full mr-1 sm:mr-2 border border-blue-400"
                />
                <span className="text-gray-200 text-xs sm:text-sm font-medium hidden sm:inline">
                  @{session.user?.username || session.user?.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-1 sm:ml-2 p-1 sm:p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
                  title="Sign out"
                >
                  <LogOut size={12} className="sm:hidden" />
                  <LogOut size={14} className="hidden sm:block" />
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center p-1.5 text-gray-300 hover:text-white bg-[#101322B3] rounded-full border border-gray-700 transition-colors duration-200 hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={18} className={`transform transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Improved with animations and better styling */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-[75%] max-w-xs bg-gradient-to-b from-[#101322] to-[#070915] border-l border-gray-700 shadow-2xl z-50 md:hidden transition-transform duration-300 ease-in-out transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-gray-200">Menu</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile profile section */}
        {session && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              <img
                src={session.user?.image.replace(/_normal(?=\.(jpg|jpeg|png|gif|webp))/i, "") || "/default-avatar.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-blue-400"
              />
              <div className="ml-3">
                <p className="text-gray-200 font-medium">
                  @{session.user?.username || session.user?.name}
                </p>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center mt-1 text-xs text-gray-400 hover:text-red-400"
                >
                  <LogOut size={12} className="mr-1" /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile search */}
        <div className="px-4 py-3 border-b border-gray-700">
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            showSearchInput={true}
            isMobile={true}
          />
        </div>

        {/* Mobile navigation */}
        <nav className="py-2 font-leagueSpartan">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </div>
          {NAVIGATION_ITEMS.map(item => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeLink === item.id}
              onClick={() => setMobileMenuOpen(false)}
              isMobile={true}
            />
          ))}
        </nav>

        {/* Credits in mobile */}
        {showTokens && (
          <div className="px-4 py-3 mt-auto border-t border-gray-700 md:hidden font-leagueSpartan">
            <CreditsDisplay credits={credits} isMobile={true} />
          </div>
        )}

        {/* Login in mobile if not logged in */}
        {!session && (
          <div className="px-4 py-3 mt-auto border-t border-gray-700 font-leagueSpartan">
            <button
              onClick={() => {
                signIn("twitter");
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center w-full px-4 py-2 bg-blue-100 text-black rounded-lg text-sm font-medium"
            >
              <FaXTwitter className="mr-2" size={16} />
              Login with X
            </button>
          </div>
        )}
      </div>

      {/* Telegram Modal - keeping this intact for functionality */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-gray-900 p-6 shadow-2xl border border-blue-500/30">
            {telegramStep === 1 ? (
              // Step 1: Instructions
              <div className="space-y-5">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500/15 rounded-full mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400"
                    >
                      <path d="M18 8l-1-4-1 1-2 1-3-1h-2L7 6 6 5 5 8l-1 3v2l1 3 3 3 2 1h2l3-1 2-2 1-2 1-5z"></path>
                      <path d="M11 8h.01"></path>
                      <path d="M13 12h.01"></path>
                      <path d="M9 12h.01"></path>
                      <path d="M7 16h.01"></path>
                      <path d="M13 16h.01"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Welcome to Maxxit - The Signal Generator Platform
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full"></div>
                  <p className="text-gray-300 mb-6">
                    To claim your{" "}
                    <span className="text-blue-400 font-semibold">
                      500 FREE Credits
                    </span>
                    , please Complete these below mentioned steps
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="M12 8v4"></path>
                      <path d="M12 16h.01"></path>
                    </svg>
                    Important Steps
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0">
                        1
                      </span>
                      <span>
                        Start a chat with{" "}
                        <a
                          href="https://t.me/Tst01ccxt_testing_bot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline inline-flex items-center"
                        >
                          @Tst01ccxt_testing_bot
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0">
                        2
                      </span>
                      <span>
                        Send the message{" "}
                        <code className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200">
                          "start"
                        </code>{" "}
                        to the bot
                      </span>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleLater}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span>Cancel</span>{" "}
                    <MdCancel color="rgb(250, 109, 109)" size={15} />
                  </button>
                  <button
                    onClick={() => setTelegramStep(2)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 flex items-center justify-center gap-1"
                  >
                    <span>I've Done This</span>{" "}
                    <GiConfirmed color="rgb(135, 255, 135)" size={15} />
                  </button>
                </div>

                <div className="mt-2 border-t border-gray-800">
                  <div className="flex items-center justify-center mb-2">
                    <span className="inline-flex h-5 w-5 text-red-500 animate-pulse drop-shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </span>
                    <p className="text-sm font-bold text-red-500 drop-shadow-md ml-2 uppercase tracking-wide animate-pulse">
                      Important
                    </p>
                  </div>
                  <p className="text-sm text-center text-gray-300 before:content-['➜'] before:text-red-500 before:mr-2">
                    <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent font-semibold drop-shadow-md">
                      You must complete this step
                    </span>
                    &nbsp;to access our platform&apos;s features, including
                    subscribing to an influencer.
                  </p>
                </div>
              </div>
            ) : telegramStep === 2 ? (
              // Step 2: Telegram Username Input (now the final step)
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Verify Your Telegram Account
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-sm text-gray-300">Step 2 of 2</p>
                </div>

                <div className="relative">
                  <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="pl-4 text-gray-400">@</span>
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={(e) => {
                        // Auto-remove @ and trim spaces
                        const value = e.target.value.replace("@", "").trim();
                        setTelegramUsername(value.toLowerCase());
                      }}
                      placeholder="your_username"
                      className="w-full px-2 py-3 rounded-lg bg-gray-800 text-white focus:outline-none"
                    />
                  </div>
                  <div className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                    <OctagonAlert size={15} color="red" />{" "}
                    <span>Must match exactly with your Telegram username</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTelegramStep(1)}
                    className="flex items-center justify-center gap-1 flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !telegramUsername}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span>Complete & Get Credits</span>
                        <IoShieldCheckmark
                          size={15}
                          color="rgb(135, 255, 135)"
                        />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Verify Your Telegram Account
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-sm text-gray-300">Step 2 of 2</p>
                </div>
                <p className="text-sm text-gray-300">
                  You've completed all steps. Click "Complete & Get Credits" to
                  finish.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-leagueSpartan">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="z-50 w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl p-6 mx-4 transform -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2 fixed">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="flex items-center mt-6 gap-1">
                <h3 className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-center text-2xl font-semibold text-transparent">
                  Coming Soon!
                </h3>
                <div>🚀✨</div>
              </div>
              <p className="mt-2 text-center text-gray-300">
                Exciting developments are underway! Our team is working hard to
                bring you cutting-edge AI-powered trading features. Stay tuned
                for updates! 🛠️💡
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;