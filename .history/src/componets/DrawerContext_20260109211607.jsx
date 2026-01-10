import React, { createContext, useContext, useState } from 'react';

const DrawerContext = createContext(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    // Возвращаем значения по умолчанию вместо ошибки для совместимости
    return {
      mobileOpen: false,
      setMobileOpen: () => {},
      toggleDrawer: () => {}
    };
  }
  return context;
};

export const DrawerProvider = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <DrawerContext.Provider value={{ mobileOpen, setMobileOpen, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};
