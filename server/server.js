// Importing required modules
import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./reactjs-geoprofiles-firebase-adminsdk-dd6in-d2ef09c26b.json" with { type: "json" };
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";

// Importing schema
import User from "./Schema/User.js";

// Initializing the Express server and setting the port number
const server = express();
let PORT = 3000;

// Initializing Firebase admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Regex expressions for email, password and whole number validation
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
let wholeNumberRegex = /^\d*$/;

// Middleware for parsing JSON
server.use(express.json());

// Middleware for enabling Cross-Origin Resource Sharing
server.use(cors());

// Connecting to MongoDB database
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

// Setting up AWS S3 bucket configuration
const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to generate a signed URL for uploading an image to AWS S3 bucket
const generateUploadURL = async () => {
  try {
    const date = new Date();
    const imgName = `${nanoid()}-${date.getTime()}.jpeg`;

    const signedURL = await s3.getSignedUrlPromise("putObject", {
      Bucket: "sp-reactjs-blogging-website",
      Key: imgName,
      Expires: 1000,
      ContentType: "image/jpeg",
    });

    return signedURL;
  } catch (err) {
    console.error("Error generating upload URL:", err);
    throw err;
  }
};

// Middleware to verify JSON Web Token (JWT) for authentication
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      if (err.name == "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid access token" });
      } else if (err.name == "TokenExpiredError") {
        return res.status(401).json({ error: "Access token expired" });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
    req.user = user.id;
    next();
  });
};

// Function to format user data before sending
const formatDataToSend = (user) => {
  try {
    const access_token = jwt.sign(
      { id: user._id },
      process.env.SECRET_ACCESS_KEY
    );

    return {
      access_token,
      profile_img: user.personal_info.profile_img,
      username: user.personal_info.username,
      fullname: user.personal_info.fullname,
      address_line_1: user.address.address_line_1,
      address_line_2: user.address.address_line_2,
      city: user.address.city,
      state: user.address.state,
      postal_code: user.address.postal_code,
      country: user.address.country,
    };
  } catch (err) {
    console.error("Error formatting data to send:", err);
    throw err;
  }
};

// Function to generate a unique username based on the user's email
const generateUsername = async (email) => {
  try {
    let username = email.split("@")[0];

    const isUsernameNotUnique = await User.exists({
      "personal_info.username": username,
    });

    isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";

    return username;
  } catch (error) {
    console.error("Error generating username:", error);
    throw new Error("Failed to generate username");
  }
};

// Endpoint to retrieve a signed URL for uploading images
server.get("/get-upload-url", async (req, res) => {
  await generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      console.error("Error generating upload URL:", err);
      return res.status(500).json({ error: "Failed to generate upload URL" });
    });
});

server.post("/signup", async (req, res) => {
  let { fullname, email, password } = req.body;

  // Validating the data from frontend
  if (!fullname || fullname.length < 3) {
    return res
      .status(400)
      .json({ error: "Full name must be at least 3 letters long." });
  }
  if (!email.length) {
    return res.status(400).json({ error: "Email is required." });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid Email" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password should be 6 to 20 characters long with a numeric, one lowercase and one uppercase letters",
    });
  }

  bcrypt.hash(password, 10, async (err, hashed_password) => {
    const username = await generateUsername(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });

    await user
      .save()
      .then((u) => {
        return res.status(200).json(formatDataToSend(u));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exists" });
        }
        console.error("Error signing up user:", err);
        return res.status(500).json({ error: "Failed to sign up user" });
      });
  });
});

// Endpoint for user sign in
server.post("/signin", async (req, res) => {
  let { email, password } = req.body;

  await User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }

      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res.status(500).json({
              error: "An error occurred while signing in.",
            });
          }

          if (!result) {
            return res.status(403).json({ error: "Incorrect Password!" });
          } else {
            return res.status(200).json(formatDataToSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error: "Account was created with Google. Try signing in with Google",
        });
      }
    })
    .catch((err) => {
      console.error("Error signing in user:", err);
      return res.status(500).json({ error: "Failed to sign in user" });
    });
});

// Endpoint for Google authentication
server.post("/google-auth", async (req, res) => {
  try {
    const { access_token } = req.body;

    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name, picture } = decodedUser;

    const modifiedPicture = picture.replace("s96-c", "s384-c");
    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
    );

    if (!user) {
      const username = await generateUsername(email);
      user = new User({
        personal_info: {
          fullname: name,
          email,
          profile_img: modifiedPicture,
          username,
        },
        google_auth: true,
      });

      await user.save();
    } else if (!user.google_auth) {
      return res.status(403).json({
        error:
          "This email was signed up without Google. Please log in with a password to access the account",
      });
    }

    return res.status(200).json(formatDataToSend(user));
  } catch (error) {
    console.error("Error during Google authentication:", error);
    return res.status(500).json({
      error:
        "Failed to authenticate you with Google. Try with another Google account",
    });
  }
});

// Endpoint for changing user password
server.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword } = req.body;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with a numeric, one lowercase and one uppercase letters",
    });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "You can't change account's password because you logged in through Google",
        });
      }

      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            console.error("Error changing password:", err);
            return res.status(500).json({
              error:
                "Some error occurred while changing the password, please try again later",
            });
          }

          if (!result) {
            return res
              .status(403)
              .json({ error: "Incorrect current password" });
          }

          if (currentPassword == newPassword) {
            return res.status(403).json({
              error: "New password cannot be the same as current password",
            });
          }

          bcrypt.hash(newPassword, 10, (err, hashed_password) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password }
            )
              .then(() => {
                return res
                  .status(200)
                  .json({ status: "Password changed successfully!" });
              })
              .catch((err) => {
                console.error("Error saving password:", err);
                return res.status(500).json({
                  error:
                    "Some error occurred while saving new password, please try again later",
                });
              });
          });
        }
      );
    })
    .catch((err) => {
      console.error("Error finding user:", err);
      return res.status(500).json({ status: "User Not Found" });
    });
});

// Endpoint to retrieve user address
server.post("/get-address", (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
    .select(
      "address.address_line_1 address.address_line_2 address.city address.postal_code address.state address.country"
    )
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      console.error("Error fetching user address:", err);
      return res.status(500).json({ error: "Failed to fetch user address" });
    });
});

server.post("/update-address", verifyJWT, (req, res) => {
  let { addressLine1, addressLine2, city, postalCode, state, country } =
    req.body;

    let postalCodeLimit = 10;

  if (
    !addressLine1.length ||
    !city.length ||
    !postalCode.length ||
    !state.length ||
    !country.length
  ) {
    return res
      .status(403)
      .json({ error: "Please fill in all the required fields" });
  }

  if (!wholeNumberRegex.test(postalCode)){
    return res.status(403).json({ error: "Postal Code can only contain Whole numbers." })
  }

  if (postalCode.length > postalCodeLimit) {
    return res
      .status(403)
      .json({ error: `Postal Code should not exceed ${postalCodeLimit} characters.` });
  }

  User.findOneAndUpdate(
    { _id: req.user },
    {
      "address.address_line_1": addressLine1,
      "address.address_line_2": addressLine2,
      "address.city": city,
      "address.postal_code": postalCode,
      "address.state": state,
      "address.country": country,
    },
    {
      runValidators: true,
    }
  ).then(() => {
    return res.status(200).json({ status: "Address updated successfully!" });
  }).catch((err) => {
    console.error("Error updating address:", err);
    return res.status(500).json({
      error:
        "Some error occurred while updating address, please try again later",
    });
  });
});

// Endpoint to retrieve user profile
server.post("/get-profile", (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    });
});

// Endpoint to update user profile image
server.post("/update-profile-img", verifyJWT, async (req, res) => {
  let { url } = req.body;

  await User.findOneAndUpdate(
    { _id: req.user },
    { "personal_info.profile_img": url }
  )
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      console.error("Error updating profile image:", err);
      return res.status(500).json({ error: "Failed to update profile image" });
    });
});

// Endpoint to update user profile information
server.post("/update-profile", verifyJWT, async (req, res) => {
  let { username, desc, social_links } = req.body;
  const descLimit = 150;

  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be at least 3 letters long." });
  }

  if (desc.length > descLimit) {
    return res
      .status(403)
      .json({ error: `desc should not exceed ${descLimit} characters.` });
  }

  let socialLinksArr = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] != "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid.`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  let UpdateObj = {
    "personal_info.username": username,
    "personal_info.desc": desc,
    social_links,
  };

  await User.findOneAndUpdate({ _id: req.user }, UpdateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(409).json({ error: "Username is already taken." });
      }

      console.error("Error updating user profile:", err);
      return res.status(500).json({ error: "Failed to update user profile." });
    });
});

server.get("/latest-users", (req, res) => {

  let maxLimit = 25;

  User.find({ "personal_info.username" : { $exists: true } })
  .sort({ "publishedAt": -1 })
  .select("-_id -google_auth -__v -social_links")
  .limit(maxLimit)
  .then(users => {
    return res.status(200).json({ users })
  })
  .catch( err => {
    return res.status(500).json({ error: err.message })
  })
})

server.listen(PORT);
