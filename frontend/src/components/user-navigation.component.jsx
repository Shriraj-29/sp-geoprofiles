import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };

  return (
    <AnimationWrapper
      className="absolute right-0 z-50"
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
        <Link
          to={`/user/${username}`}
          className="link pl-8 py-4"
          aria-label="User Profile Link"
        >
          Profile
        </Link>

        <Link
          to="/settings/edit-profile"
          className="link pl-8 py-4"
          aria-label="Settings Link"
        >
          Settings
        </Link>

        <span className="absolute border-t border-grey w-[100%]"></span>

        <Link to="/signin">
          <button
            className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
            onClick={signOutUser}
            aria-label="Sign Out Button"
          >
            <h1 className="font-bold text-xl mg-1">Sign Out</h1>
            <p className="text-dark-grey">@{username}</p>
          </button>
        </Link>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
