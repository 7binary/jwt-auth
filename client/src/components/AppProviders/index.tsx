import React, { PropsWithChildren } from 'react';
import { Store, StoreContext } from 'src/store';

interface Props {
  children: JSX.Element
}

const store = new Store();

export const AppProviders: React.FC<PropsWithChildren<Props>> = ({ children }) => {
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};
