import React, { useState, useEffect, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS, GET_POSTS } from "../queries";

import ProductCard from "./ProductCard";
import SearchProduct from "./SearchProduct";
import LogoutButton from "./LogoutButton";
import { AuthContext } from "../context/AuthContext";

import ChatRoomList from "./ChatRoomList";

import { Grid } from "@mui/material";

type Product = {
  _id: string;
  name: string;
};

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
  });

  const [firstTenProducts, setFirstTenProducts] = useState([]);

  useEffect(() => {
    if (!loading && !error && data.products) {
      setFirstTenProducts(data.products.slice(0, 10));
    }
  }, [loading]);
  // console.log(currentUser);
  return (
    <div>
      <h1>Home</h1>

      {currentUser ? (
        <>
          <LogoutButton />
        </>
      ) : (
        <>
          <button
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              navigate("/signup");
            }}
          >
            Signup
          </button>
        </>
      )}

      <Grid container direction={"row"} spacing={2} marginTop={1}>
        <Grid item>
          <div style={{ textAlign: "center" }}>
            <h2>First 10 Products:</h2>
            <button
              onClick={() => {
                navigate("/products");
              }}
            >
              More
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Grid
              container
              spacing={2}
              style={{
                overflowX: "auto",
                flexWrap: "nowrap",
                padding: "16px",
                maxWidth: "70vw",
              }}
            >
              {firstTenProducts &&
                firstTenProducts.map((product: Product) => {
                  return (
                    <ProductCard key={product._id} productData={product} />
                  );
                })}
            </Grid>
          </div>

          <div style={{ textAlign: "center" }}>
            <h2>First 10 Posts:</h2>
            <button
              onClick={() => {
                navigate("/posts");
              }}
            >
              More
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Grid
              container
              spacing={2}
              style={{
                overflowX: "auto",
                flexWrap: "nowrap",
                padding: "16px",
                maxWidth: "70vw",
              }}
            ></Grid>
          </div>
        </Grid>
        <Grid item>
          <h2>Chat Room List:</h2>
          <div>
            {currentUser ? <ChatRoomList /> : <h4>Please Login to chat</h4>}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
