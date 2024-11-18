import React, { FunctionComponent, useCallback, useContext, useState, createContext, ReactNode } from "react";
import Popup from "./components/Popup/Popup";

interface PopupContextType {
  showPopup: (title: string, message: string, callback?: ()=>void) => void;
}

const PopupContext = createContext<PopupContextType | null>(null);

export const usePopup = (): PopupContextType => {
  const context = useContext(PopupContext);

  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }

  return context;
};

interface PopupProviderProps {
  children: ReactNode;
}

export const PopupProvider: FunctionComponent<PopupProviderProps> = ({ children }:PopupProviderProps) => {
  const [popup, setPopup] = useState({ isOpen: false, title: "", message: ""});
  const [callback, setCallback] = useState<(()=>void) | null>(null);

  const showPopup = useCallback((title: string, message: string, tempCallback?: ()=>void) => {
    setPopup({isOpen: true, title, message});
    if(tempCallback)
      setCallback(tempCallback);
  }, []);

  const hidePopup = useCallback(() => {
    if(callback)
      callback();
    setPopup({ isOpen: false, title: "", message: ""});
  }, []);

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      {popup.isOpen && (
        <Popup
          title={popup.title}
          message={popup.message}
          onClose={hidePopup}
          onAnswer={hidePopup}
        />
      )}
    </PopupContext.Provider>
  );
};