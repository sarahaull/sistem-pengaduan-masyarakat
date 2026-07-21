import React,
{
 createContext,
 useContext,
 useEffect,
 useState
}
from "react";

import {
 getToken,
 removeToken,
 saveToken
}
from "../utils/storage";

interface AuthContextType {
 isLoggedIn:boolean;
 loginUser:(token:string)=>Promise<void>;
 logoutUser:()=>Promise<void>;
}

const AuthContext =
createContext<AuthContextType>(
 {} as AuthContextType
);

export const AuthProvider = ({
 children,
}:any) => {

 const [isLoggedIn,
 setIsLoggedIn]
 =
 useState(false);

 useEffect(() => {
  checkAuth();
 }, []);

 const checkAuth =
 async () => {
  const token =
   await getToken();

  setIsLoggedIn(
   !!token
  );
 };

 const loginUser =
 async (
  token:string
 ) => {
  await saveToken(token);

  setIsLoggedIn(true);
 };

 const logoutUser =
 async () => {

  await removeToken();

  setIsLoggedIn(false);
 };

 return (
  <AuthContext.Provider
   value={{
    isLoggedIn,
    loginUser,
    logoutUser
   }}
  >
   {children}
  </AuthContext.Provider>
 );
};

export const useAuth =
 () =>
 useContext(AuthContext);