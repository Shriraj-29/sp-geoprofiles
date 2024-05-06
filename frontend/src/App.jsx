import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import HomePage from "./pages/home.page";
import SideNav from "./components/sidenavbar.component";
import EditProfile from "./pages/edit-profile.page";
import EditAddress from "./pages/edit-address.page";
import ChangePassword from "./pages/change-password.page";
import ProfilePage from "./pages/profile.page";
import PageNotFound from "./pages/404.page";

export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="dashboard" element={<SideNav />}></Route>
          <Route path="settings" element={<SideNav />}>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="edit-address" element={<EditAddress />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="user/:id" element={<ProfilePage />} />
          <Route index element={<HomePage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
