import { Link, useParams } from "react-router-dom";
import { getDay } from "../common/date";
import { useState } from "react";
import Map from "./map.component";

const UserPostCard = ({ address, user, joinedAt }) => {
  let { fullname, username, profile_img, desc } = user;

  let [showSummary, setShowSummary] = useState(false);

  return (
    <>
      <Link
        to={`/user/${username}`}
        className="flex max-[425px]:flex-col gap-8 max-md:gap-4 max-sm:gap-2 max-[425px]:gap-0 items-center border-b border-grey pb-5 mb-4"
        aria-label="Username"
      >
        <img
          src={profile_img}
          className="w-64 h-64 max-md:w-48 max-md:h-48 max-sm:w-32 max-sm:h-32 max-[425px]:w-48 max-[425px]:h-48 rounded-full bg-gray m-5"
          alt="User Profile Image"
        />

        <div className="w-full flex max-[768px]:flex-col gap-2 min-[768px]:items-center max-[425px]:items-center mb-7">
          <div>
            <div className="flex gap-x-2 max-md:flex-col md:max-[1100px]:flex-col">
              <h1 className="flex line-clamp-1 text-3xl capitalize font-gelasio max-[425px]:justify-center">
                {fullname}
              </h1>
              <h1 className="flex line-clamp-1 text-2xl max-[425px]:justify-center">
                @{username}
              </h1>
            </div>

            <p className="my-2 mx-5 min-w-fit text-xl">
              Joined at {getDay(joinedAt)}
            </p>
            <p className="my-3 mx-5 text-xl font-gelasio leading-7 line-clamp-2">
              {desc}
            </p>
          </div>

          <button
            onClick={() => setShowSummary((preVal) => !preVal)}
            className="btn-dark px-10 ml-auto max-[768px]:ml-0 max-[768px]:mr-auto max-[425px]:ml-auto"
            type="submit"
            aria-label="Save Changes Button"
          >
            Summary
          </button>
        </div>
      </Link>

      <div>
        <Map address={address} />
      </div>
    </>
  );
};

export default UserPostCard;
