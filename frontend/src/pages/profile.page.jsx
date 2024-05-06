import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import filterPaginationData from "../common/filter-pagination-data";
import PageNotFound from "./404.page";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    desc: "",
  },
  social_links: {},
  joinedAt: "",
};

export const addressDataStructure = {
  address: {
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  },
};

const ProfilePage = () => {
  let { id: profileId } = useParams();

  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [profileLoaded, setProfileLoaded] = useState("");

  let {
    personal_info: { fullname, username: profile_username, profile_img, desc },
    social_links,
    joinedAt,
  } = profile;

  let {
    userAuth: { username },
  } = useContext(UserContext);

  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (user != null) {
          setProfile(user);
        }
        setProfileLoaded(profileId);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserProfile();
  }, [profileId]);

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
              alt="User Profile Image"
            />

            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>

            <div className="flex gap-4 mt-2">
              {profileId == username ? (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-md"
                  aria-label="Edit Profile Link"
                >
                  Edit Profile
                </Link>
              ) : (
                ""
              )}
            </div>

            <AboutUser
              className="max-md:hidden"
              desc={desc}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>

          <div className="max-md:mt-12 w-full"></div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
