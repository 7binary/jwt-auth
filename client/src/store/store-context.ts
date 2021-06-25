import React, { useContext } from 'react';
import { Store } from './store';

export const StoreContext = React.createContext<Store>({} as Store);

export const useStore = (): Store => useContext(StoreContext);
