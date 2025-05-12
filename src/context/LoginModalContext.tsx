"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

interface LoginModalContextType {
  isOpen: boolean;
  message: string;
  callbackUrl: string;
  showLoginModal: (message?: string, callbackUrl?: string) => void;
  hideLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(
  undefined
);

export const LoginModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Please login to continue");
  const [callbackUrl, setCallbackUrl] = useState("/");

  const showLoginModal = useCallback(
    (newMessage?: string, newCallbackUrl?: string) => {
      setMessage(newMessage || "Please login to continue");
      setCallbackUrl(newCallbackUrl || "/");
      setIsOpen(true);
    },
    []
  );

  const hideLoginModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <LoginModalContext.Provider
      value={{
        isOpen,
        message,
        callbackUrl,
        showLoginModal,
        hideLoginModal,
      }}
    >
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error("useLoginModal must be used within a LoginModalProvider");
  }
  return context;
};
