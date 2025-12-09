import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceType } from '../types';
import { getDeviceType } from '../utils/deviceUtils';

interface DeviceContextType {
  deviceType: DeviceType;
}

const DeviceContext = createContext<DeviceContextType>({ deviceType: DeviceType.DESKTOP });

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType());

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceType }}>
      {children}
    </DeviceContext.Provider>
  );
};