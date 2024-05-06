import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import { UserContext } from "../App";
import axios from "axios";
import UserNavigationPanel from "./user-navigation.component";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);

  let navigate = useNavigate();

  const {
    userAuth,
    userAuth: { access_token, profile_img },
    setUserAuth,
  } = useContext(UserContext);

  const handleUserNavPanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10 h-10">
          <img src={logo} alt="Logo" />
        </Link>

        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (searchBoxVisibility ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            name=""
            id=""
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setSearchBoxVisibility((currentVal) => !currentVal)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>

          {access_token ? (
            <>
              <Link
                to="/settings/edit-address"
                className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10"
                aria-label="Edit Address Link"
              >
                <i className="fi fi-rr-marker text-2xl block mt-2.5 ml-3"></i>
              </Link>

              <div
                className="relative"
                onClick={handleUserNavPanel}
                onBlur={handleBlur}
              >
                <button
                  className="w-12 h-12 mt-1"
                  aria-label="User Profile Button"
                >
                  <img
                    src={profile_img}
                    className="w-full h-full object-cover rounded-full"
                    alt="User Profile"
                  />
                </button>

                {userNavPanel ? <UserNavigationPanel /> : ""}
              </div>
            </>
          ) : (
            <>
              <Link
                className="btn-dark py-2"
                to="/signin"
                aria-label="Sign In Link"
              >
                Sign In
              </Link>

              <Link
                className="btn-light py-2 hidden md:block"
                to="/signup"
                aria-label="Sign Up Link"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;