"use client";
import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { OctagonAlert } from "lucide-react";
import { IoShieldCheckmark } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import { FaXTwitter, FaTelegram } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  X,
  CopyCheckIcon,
  LogOut,
  Menu,
  CheckCircle2,
} from "lucide-react";
// import "../../app/css/input.css";
import Link from "next/link";
import { useCredits } from "@/context/CreditsContext";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import OnboardingModals from "./OnboardingModals";

// Navigation configuration
const NAVIGATION_ITEMS = [
  { path: "/influencer", label: "Influencer", id: "influencer" },
  { path: "/profile", label: "Profile", id: "profile" },
  { path: "/pricing", label: "Pricing", id: "pricing", hasBorders: true },
  { path: "/playground", label: "Playground", id: "playground" },
];

interface NavItemProps {
  item: (typeof NAVIGATION_ITEMS)[0];
  isActive: boolean;
  onClick?: () => void;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  onClick,
  isMobile = false,
}) => {
  const { path, label, hasBorders, id } = item;

  // Desktop nav item
  if (!isMobile) {
    return (
      <Link href={path}>
        <span
          className={`
            px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium inline-block 
            transition-colors duration-200
            ${hasBorders ? "border-l border-r border-gray-700" : ""}
            ${
              isActive
                ? "bg-[#E4EFFF] text-[#393B49]"
                : "text-gray-300 hover:bg-gray-800"
            }
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
      <span
        className={`flex items-center px-4 py-3 text-sm font-medium ${
          isActive
            ? "bg-blue-900/30 text-blue-100 border-l-2 border-blue-400"
            : "text-gray-300 hover:bg-gray-800"
        }`}
      >
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

interface CreditsDisplayProps {
  credits: number | null;
  isLoading: boolean;
  isMobile?: boolean;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({
  credits,
  isLoading,
  isMobile = false,
}) => {
  if (isLoading) {
    // Loading state
    return (
      <div
        className={`flex items-center ${
          isMobile
            ? "px-4 py-2 rounded-lg bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/30"
            : "hidden md:flex px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-700/20 border border-blue-500/50"
        }`}
      >
        <div className="animate-pulse flex items-center">
          <div
            className={`h-4 w-12 bg-blue-400/30 rounded ${
              isMobile ? "ml-auto" : ""
            }`}
          ></div>
          {!isMobile && (
            <span className="text-white font-normal text-xs sm:text-sm ml-1">
              Credits
            </span>
          )}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/30">
        <span className="text-gray-300 font-medium text-sm">
          Available Credits
        </span>
        <span className="text-blue-400 font-bold text-lg">{credits ?? 0}</span>
      </div>
    );
  }

  return (
    <div className="hidden md:block px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-700/20 border border-blue-500/50">
      <span className="text-blue-400 font-bold text-xs sm:text-sm">
        {credits ?? 0} <span className="text-white font-normal">Credits</span>
      </span>
    </div>
  );
};

// Main Header component
interface HeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

const Header: React.FC<HeaderProps> = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramStep, setTelegramStep] = useState(1);
  const { credits, updateCredits, isLoadingCredits } = useCredits();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session, status: sessionStatus } = useSession();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeLink, setActiveLink] = useState("");
  const hasCheckedOnboarding = useRef(false);
  const [shouldCheckRegistration, setShouldCheckRegistration] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const completeSetupButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set active link based on current URL path
  useEffect(() => {
    if (pathname?.includes("/influencer")) setActiveLink("influencer");
    else if (pathname?.includes("/profile")) setActiveLink("profile");
    else if (pathname?.includes("/pricing")) setActiveLink("pricing");
    else if (pathname?.includes("/playground")) setActiveLink("playground");
    else setActiveLink("");
  }, [pathname]);

  // Show welcome toast for new users with credits
  useEffect(() => {
    // Only show welcome toast when credits are loaded and equal to 500
    if (credits === 500) {
      const hasShownWelcomeToast = sessionStorage.getItem(
        "hasShownWelcomeToast"
      );

      if (!hasShownWelcomeToast) {
        toast.info(
          "🎉 Welcome! Explore our prediction markets with your 500 free credits",
          {
            position: "top-center",
            autoClose: 7000,
            hideProgressBar: false,
          }
        );

        sessionStorage.setItem("hasShownWelcomeToast", "true");
      }
    }
  }, [credits]);

  // Reset check status when session changes
  useEffect(() => {
    if (sessionStatus === "unauthenticated" || !session) {
      hasCheckedOnboarding.current = false;
      // Clear stored registration check on logout
      sessionStorage.removeItem("hasCompletedRegistrationCheck");
    }

    // If user just logged in, prepare to check registration
    if (sessionStatus === "authenticated" && session) {
      setShouldCheckRegistration(true);
    }
  }, [sessionStatus, session]);

  // Show onboarding modal for unregistered users only after confirmed
  useEffect(() => {
    // Only proceed if we need to check registration and session is authenticated
    if (
      shouldCheckRegistration &&
      sessionStatus === "authenticated" &&
      session
    ) {
      // Wait until we're sure about the credits status (loaded, not loading)
      if (!isLoadingCredits) {
        // Don't check again this session
        hasCheckedOnboarding.current = true;
        setShouldCheckRegistration(false);

        // Show modal only if credits are null (not registered)
        if (credits === null) {
          // Store this check in sessionStorage to avoid showing on refresh
          const hasCompletedRegistrationCheck = sessionStorage.getItem(
            "hasCompletedRegistrationCheck"
          );

          if (!hasCompletedRegistrationCheck) {
            setShowOnboardingModal(true);
            sessionStorage.setItem("hasCompletedRegistrationCheck", "true");
          }
        } else {
          // User is registered, clear any stored check
          sessionStorage.removeItem("hasCompletedRegistrationCheck");
        }
      }
    }
  }, [
    shouldCheckRegistration,
    sessionStatus,
    session,
    credits,
    isLoadingCredits,
  ]);

  // Listen for custom event to show onboarding modal from other components
  useEffect(() => {
    const handleShowOnboarding = () => {
      if (
        sessionStatus === "authenticated" &&
        credits === null &&
        !isLoadingCredits
      ) {
        setShowOnboardingModal(true);
      }
    };

    window.addEventListener("showOnboarding", handleShowOnboarding);

    return () => {
      window.removeEventListener("showOnboarding", handleShowOnboarding);
    };
  }, [sessionStatus, credits, isLoadingCredits]);

  // Display registration reminder toast for unregistered users
  useEffect(() => {
    // Only show for authenticated users who are not registered and when we're sure about it
    if (
      sessionStatus === "authenticated" &&
      credits === null &&
      !isLoadingCredits
    ) {
      // Only show reminder if onboarding modal is not currently open
      if (!showOnboardingModal && !isTelegramModalOpen) {
        const hasShownRegistrationReminder = sessionStorage.getItem(
          "hasShownRegistrationReminder"
        );

        if (!hasShownRegistrationReminder) {
          // Delay showing the toast to prevent it from appearing too soon after page load
          const timer = setTimeout(() => {
            toast.info(
              <div className="flex items-center">
                <span>Complete registration to access all features</span>
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded-md hover:bg-blue-500"
                >
                  Register Now
                </button>
              </div>,
              {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
              }
            );

            // Mark reminder as shown for this session only
            sessionStorage.setItem("hasShownRegistrationReminder", "true");
          }, 6000); // Show after 6 seconds to ensure initial loading is complete

          return () => clearTimeout(timer);
        }
      }
    }
  }, [
    sessionStatus,
    credits,
    isLoadingCredits,
    showOnboardingModal,
    isTelegramModalOpen,
  ]);

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setTimeout(() => {
        const searchInput = document.getElementById("search-input");
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
      return;
    }

    if (sessionStatus === "loading" || isLoadingCredits) {
      // Don't open modal if we're still loading user data
      return;
    }

    if (credits !== null) {
      // User already has credits, no need to register
      toast.info("You already have credits!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      });
      return;
    }

    // Open the telegram registration modal and reset any previous state
    setIsTelegramModalOpen(true);
    setTelegramStep(1);
    setErrorMessage(null);

    // Mark that registration check has been done - user has seen the modal
    sessionStorage.setItem("hasCompletedRegistrationCheck", "true");
  };

  const startTelegramRegistration = () => {
    setShowOnboardingModal(false);
    setIsTelegramModalOpen(true);
    setTelegramStep(1);
    setErrorMessage(null);

    // Mark that registration check has been done - user has seen the modal
    sessionStorage.setItem("hasCompletedRegistrationCheck", "true");
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

      // Show success modal instead of toast
      setIsTelegramModalOpen(false);
      setShowSuccessModal(true);

      // Immediately update credits to show the user
      updateCredits();

      // Clear registration check from session storage on successful registration
      sessionStorage.removeItem("hasCompletedRegistrationCheck");

      // Reset the telegram form
      setTelegramStep(1);
      setTelegramUsername("");
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

  const closeOnboardingModal = () => {
    if (completeSetupButtonRef.current && modalRef.current) {
      const buttonRect = completeSetupButtonRef.current.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();
      const newTargetX =
        buttonRect.left +
        buttonRect.width / 2 -
        (modalRect.left + modalRect.width / 2);
      const newTargetY =
        buttonRect.top +
        buttonRect.height / 2 -
        (modalRect.top + modalRect.height / 2);
      setTargetX(newTargetX);
      setTargetY(newTargetY);
      setIsModalClosing(true);
    } else {
      setShowOnboardingModal(false);
    }
  };

  return (
    <header className="bg-[#07091573] border rounded-full border-[#3E434B] m-2 sm:m-4">
      <ToastContainer />
      <div className="mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/img/maxxit_logo.svg"
              alt="Maxxit"
              className="h-7 sm:h-8"
            />
            <div className="text-2xl font-napzerRounded bg-gradient-to-b from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">
              maxxit
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="font-leagueSpartan hidden md:flex bg-[#101322B3] rounded-full items-center border border-gray-700 overflow-hidden">
            {NAVIGATION_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeLink === item.id}
              />
            ))}
          </nav>

          {/* Right section - credits and login */}
          <div className="font-leagueSpartan flex items-center space-x-2 sm:space-x-4">
            {/* Credits Display */}

            {/* Conditional rendering for credits/get credits button */}
            {sessionStatus === "loading" ? (
              // Loading state while session is being determined
              <div className="w-20 h-8 bg-gray-800/80 rounded-full animate-pulse"></div>
            ) : !session ? null : isLoadingCredits ? (
              // Show a loading skeleton while credits are being fetched
              <div className="flex items-center bg-gray-800/60 px-2 sm:px-3 py-1 rounded-lg animate-pulse">
                <div className="w-6 h-6 rounded-full bg-gray-700/80 mr-2"></div>
                <div className="h-4 w-16 bg-gray-700/80 rounded"></div>
              </div>
            ) : credits !== null ? (
              // User is logged in and has credits (registered)
              <CreditsDisplay credits={credits} isLoading={isLoadingCredits} />
            ) : (
              // User is logged in but not registered (no credits) - only show when we're sure credits are null
              <button
                ref={completeSetupButtonRef}
                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full hover:from-blue-600 hover:to-blue-700 transition whitespace-nowrap flex items-center gap-1 animate-pulse max-w-[160px] truncate"
                onClick={() => setShowOnboardingModal(true)}
              >
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
                  className="text-yellow-300 flex-shrink-0"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <path d="M12 17v-6" />
                  <path d="M9 14h6" />
                </svg>
                <span className="truncate">Complete Setup</span>
              </button>
            )}

            {/* Login/Profile */}
            {sessionStatus === "loading" ? (
              // Loading state for login button/profile
              <div className="w-24 h-8 bg-gray-800/80 rounded-full animate-pulse"></div>
            ) : !session ? (
              <button
                onClick={() => signIn("twitter")}
                className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-black rounded-full text-xs sm:text-sm font-medium"
              >
                Login with <FaXTwitter className="ml-1" size={14} />
              </button>
            ) : (
              <div className="flex items-center bg-gray-800/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-700">
                <img
                  src={
                    session.user?.image.replace(
                      /_normal(?=\.(jpg|jpeg|png|gif|webp))/i,
                      ""
                    ) || "/default-avatar.png"
                  }
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
              <Menu
                size={18}
                className={`transform transition-transform duration-300 ${
                  mobileMenuOpen ? "rotate-90" : "rotate-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-[75%] max-w-xs bg-gradient-to-b from-[#101322] to-[#070915] border-l border-gray-700 shadow-2xl z-50 md:hidden transition-transform duration-300 ease-in-out transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="text-2xl font-napzerRounded bg-gradient-to-b from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">
            maxxit
          </div>
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
                src={
                  session.user?.image.replace(
                    /_normal(?=\.(jpg|jpeg|png|gif|webp))/i,
                    ""
                  ) || "/default-avatar.png"
                }
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

        {/* Registration banner for unregistered users - only show when we're sure they're not registered */}
        {session && credits === null && !isLoadingCredits && (
          <div className="m-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
            <div className="flex items-start">
              <div className="shrink-0 bg-blue-500/20 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">
                  Complete Registration
                </h4>
                <p className="text-xs text-gray-300 mt-1 mb-3">
                  Connect with Telegram to activate your account and receive 500
                  FREE credits
                </p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowOnboardingModal(true);
                  }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md text-sm flex items-center justify-center"
                >
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
                    className="mr-1.5"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  Connect with Telegram
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator for registration status */}
        {session && isLoadingCredits && (
          <div className="m-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg animate-pulse">
            <div className="flex items-start">
              <div className="shrink-0 bg-gray-700/50 p-2 rounded-full mr-3">
                <div className="w-4 h-4 rounded-full bg-gray-600/80"></div>
              </div>
              <div className="w-full">
                <div className="h-4 w-24 bg-gray-700/80 rounded mb-3"></div>
                <div className="h-3 w-full bg-gray-700/80 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-700/80 rounded mb-4"></div>
                <div className="h-8 w-full bg-gray-700/80 rounded"></div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile navigation */}
        <nav className="py-2 font-leagueSpartan">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </div>
          {NAVIGATION_ITEMS.map((item) => (
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
        {session && credits !== null && (
          <div className="px-4 py-3 mt-auto border-t border-gray-700 md:hidden font-leagueSpartan">
            <CreditsDisplay
              credits={credits}
              isLoading={isLoadingCredits}
              isMobile={true}
            />
          </div>
        )}

        {/* Loading skeleton for credits in mobile */}
        {session && isLoadingCredits && (
          <div className="px-4 py-3 mt-auto border-t border-gray-700 md:hidden">
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800/50 animate-pulse">
              <div className="h-4 w-24 bg-gray-700/80 rounded"></div>
              <div className="h-5 w-10 bg-gray-700/80 rounded"></div>
            </div>
          </div>
        )}

        {/* Get Credits button in mobile if logged in but not registered */}
        {session && credits === null && !isLoadingCredits && (
          <div className="px-4 py-3 mt-auto border-t border-gray-700 md:hidden font-leagueSpartan">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowOnboardingModal(true);
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
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
                className="text-yellow-300"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <path d="M12 17v-6" />
                <path d="M9 14h6" />
              </svg>
              Complete Setup
            </button>
          </div>
        )}

        {/* Login in mobile if not logged in */}
        {!session && sessionStatus !== "loading" && (
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

      {/* Onboarding Modals Component */}
      <OnboardingModals
        isOnboardingModalOpen={showOnboardingModal}
        isTelegramModalOpen={isTelegramModalOpen}
        isSuccessModalOpen={showSuccessModal}
        telegramStep={telegramStep}
        telegramUsername={telegramUsername}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        isModalClosing={isModalClosing}
        targetX={targetX}
        targetY={targetY}
        session={session}
        closeOnboardingModal={closeOnboardingModal}
        startTelegramRegistration={startTelegramRegistration}
        setTelegramModalOpen={setIsTelegramModalOpen}
        setTelegramStep={setTelegramStep}
        setTelegramUsername={setTelegramUsername}
        handleSubmit={handleSubmit}
        setSuccessModalOpen={setShowSuccessModal}
      />

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
