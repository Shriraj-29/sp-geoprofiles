import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import { uploadImg } from "../common/aws";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  let descLimit = 150;

  let profileImgEle = useRef();
  let editProfileForm = useRef();

  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [charactersLeft, setCharactersLeft] = useState(descLimit);
  let [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  let {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      desc,
    },
    social_links,
  } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(descLimit - e.target.value.length);
  };

  const handleImgPreview = (e) => {
    let img = e.target.files[0];

    profileImgEle.current.src = URL.createObjectURL(img);

    setUpdatedProfileImg(img);
  };

  const handleImgUpload = (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading....");

      e.target.setAttribute("disabled", true);

      uploadImg(updatedProfileImg)
        .then((url) => {
          if (url) {
            axios
              .post(
                import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
                { url },
                {
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                  },
                }
              )
              .then(({ data }) => {
                let newUserAuth = {
                  ...userAuth,
                  profile_img: data.profile_img,
                };

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);

                setUpdatedProfileImg(null);

                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.success("Uploaded Successfully!!👍");
              })
              .catch(({ response }) => {
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.error(response.data.error);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(editProfileForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      username,
      desc,
      youtube,
      instagram,
      facebook,
      twitter,
      github,
      website,
    } = formData;

    if (username.length < 3) {
      return toast.error("Username should be at least 3 letters long.");
    }

    if (desc.length > descLimit) {
      return toast.error(`desc should not exceed ${descLimit} characters.`);
    }

    let loadingToast = toast.loading("Updating....");

    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          desc,
          social_links: {
            youtube,
            instagram,
            facebook,
            twitter,
            github,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.username != data.username) {
          let newUserAuth = { ...userAuth, username: data.username };

          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }

        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated Successfully!!👍");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <Toaster />

          <h1 className="max-md:hidden">Edit Profile</h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100">
                  Upload Image
                </div>
                <img
                  ref={profileImgEle}
                  src={profile_img}
                  alt="User Profile Image"
                />
              </label>

              <input
                type="file"
                id="uploadImg"
                accept=".jpeg, .jpg, .png"
                onChange={handleImgPreview}
                hidden
                aria-label="User Profile Image Preview"
              />

              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleImgUpload}
                aria-label="User Profile Image Upload Button"
              >
                Upload
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Full Name"
                    disable={true}
                    icon="fi-rr-user"
                  />
                </div>

                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email ID"
                    disable={true}
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>

              <InputBox
                type="text"
                name="username"
                value={profile_username}
                icon="fi-rr-at"
              />

              <p className="text-dark-grey -mt-3">
                Username will be used to search user and will be visible to all
                users.
              </p>

              <textarea
                name="desc"
                maxLength={descLimit}
                defaultValue={desc}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="desc"
                onChange={handleCharacterChange}
                aria-label="User desc"
              ></textarea>
              <p className="mt-1 text-dark-grey">
                {charactersLeft} characters left
              </p>

              <p className="my-6 text-dark-grey">
                Add your social handles below
              </p>

              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder={"https://"}
                      icon={
                        "fi " +
                        (key != "website" ? "fi-brands-" + key : "fi-rr-globe")
                      }
                    />
                  );
                })}
              </div>

              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleSubmit}
                aria-label="Submit Button"
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
