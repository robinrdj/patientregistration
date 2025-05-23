import React, { useContext, createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { patDatabase } from "../Databases/DB";

type DBStatus = {
  loading: boolean;
  ready: boolean;
  message: string | null;
};

//using context
export const useDBStatus = () => useContext(DBContext);

//creating context
const DBContext = createContext<DBStatus>({
  loading: true,
  ready: false,
  message: null,
});

export const DBProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const setupDB = async () => {
      try {
        await patDatabase();
        setReady(true);
        setMessage(null);
      } catch (e) {
        console.error("following error occured", e);
        setMessage(
          "Try refreshing the page, since the database is failed to load"
        );
      } finally {
        setLoading(false);
      }
    };
    setupDB();
  }, []);

  return (
    <DBContext.Provider value={{ loading, ready, message }}>
      {children}
    </DBContext.Provider>
  );
};
