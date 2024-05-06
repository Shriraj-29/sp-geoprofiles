import { useContext, useEffect, useRef, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
import { addressDataStructure } from "./profile.page";
import Loader from "../components/loader.component";

const EditAddress = () => {
  let {
    userAuth,
    userAuth: { access_token },
  } = useContext(UserContext);

  let addressForm = useRef();

  let [address, setAddress] = useState(addressDataStructure);
  let [loading, setLoading] = useState(true);

  let {
    address: {
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      postal_code: postalCode,
      state,
      country,
    },
  } = address;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-address", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setAddress(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(addressForm.current);
    let formData = {};

    let postalCodeLimit = 10;

    let wholeNumberRegex = /^\d*$/;

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { addressLine1, city, postalCode, state, country } = formData;

    if (
      !addressLine1.length ||
      !city.length ||
      !postalCode.length ||
      !state.length ||
      !country.length
    ) {
      return toast.error("Please fill in all the required fields");
    }

    if (!wholeNumberRegex.test(postalCode)) {
      return toast.error("Postal Code can only contain Whole numbers.");
    }

    if (postalCode.length > postalCodeLimit) {
      return toast.error(
        `Postal Code should not exceed ${postalCodeLimit} characters.`
      );
    }

    e.target.setAttribute("disabled", true);

    let loadingToast = toast.loading("Updating....");

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/update-address", formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.success("Address Updated Successfully!!👍");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={addressForm}>
          <Toaster />
          <h1 className="max-md:hidden">Edit Address</h1>

          <div className="py-10 w-full md:max-w-[750px]">
            <h1>Address Line 1*</h1>
            <InputBox
              name="addressLine1"
              type="text"
              value={addressLine1}
              className="profile-edit-input"
              placeholder="Address Line 1"
            />

            <h1>Address Line 2</h1>
            <InputBox
              name="addressLine2"
              type="text"
              value={addressLine2}
              className="profile-edit-input"
              placeholder="Address Line 2"
            />

            <div className="grid grid-cols-2 gap-x-10">
              <div>
                <h1>City*</h1>
                <InputBox
                  name="city"
                  type="text"
                  value={city}
                  className="profile-edit-input"
                  placeholder="City"
                />
              </div>

              <div>
                <h1>Postal Code*</h1>
                <InputBox
                  name="postalCode"
                  type="text"
                  value={postalCode}
                  className="profile-edit-input"
                  placeholder="Postal Code"
                />
              </div>

              <div>
                <h1>State*</h1>
                <InputBox
                  name="state"
                  type="text"
                  value={state}
                  className="profile-edit-input"
                  placeholder="State"
                />
              </div>

              <div>
                <h1>Country*</h1>
                <InputBox
                  name="country"
                  type="text"
                  value={country}
                  className="profile-edit-input"
                  placeholder="Country"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="btn-dark px-10 mt-4"
              type="submit"
              aria-label="Save Changes Button"
            >
              Update Address
            </button>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditAddress;
