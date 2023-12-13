import React, { useState, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useMutation, useQuery } from "@apollo/client";
import { EDIT_USER, GET_USER } from "../queries.ts";
import {
  doPasswordReset,
  updateUserProfile,
} from "../firebase/FirebaseFunction";
import * as validation from "../helper.tsx";

function UserProfile() {
  let { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  const [userInfo, setUserInfo] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: currentUser.uid },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!loading && !error && data.getUserById) {
      setUserInfo(data.getUserById);
      setFirstname(data.getUserById.firstname);
      setLastname(data.getUserById.lastname);
      setEmail(data.getUserById.email);
    }
    console.log(userInfo);
  }, [loading]);

  const passwordReset = (event) => {
    event.preventDefault();
    if (userInfo && currentUser) {
      doPasswordReset(userInfo.email);
      alert("Password reset email was sent");
    } else {
      alert(
        "Please enter an email address below before you click the forgot password link"
      );
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    let { displayFirstName, displayLastName, email, password } = e.target.elements;
    try {
      displayFirstName = validation.checkFirstNameAndLastName(
        displayFirstName.value,
        "First Name"
      );
      displayLastName = validation.checkFirstNameAndLastName(
        displayLastName.value,
        "Last Name"
      );
      email = validation.checkEmail(email.value);
      password = password.value
      // email = email.value; (cancel to use stevens' email address)
    } catch (error) {
      alert(error);
      return false;
    }

    try {
      let user = await updateUserProfile(
        displayFirstName,
        currentUser.email,
        email,
        password
      );

      console.log(user);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="card">
      <h1>User Profile</h1>
      <form onSubmit={handleEdit}>
        <div className="form-group">
          <label>
            First Name:
            <br />
            <input
              className="form-control"
              required
              name="displayFirstName"
              type="text"
              placeholder="First Name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Last Name:
            <br />
            <input
              className="form-control"
              required
              name="displayLastName"
              type="text"
              placeholder="Last Name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Email:
            <br />
            <input
              className="form-control"
              required
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Verified Password:
            <br />
            <input
              className="form-control"
              required
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <br />
        <button
          className="button"
          id="submitButton"
          name="submitButton"
          type="submit"
        >
          Update
        </button>

        <button className="forgotPassword" onClick={passwordReset}>
          Reset Password
        </button>
      </form>
      <br />
    </div>
  );
}

export default UserProfile;
