import React from 'react';

export default function AppContainer({ children }) {
  return (
    <div className="flex-1 max-w-lg mx-auto w-full px-4 pb-28 pt-4 md:pb-32">
      {children}
    </div>
  );
}