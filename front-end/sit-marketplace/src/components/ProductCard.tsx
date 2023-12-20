import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import noImage from "../assets/noimage.jpg";
import { AuthContext } from "../context/AuthContext";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import { socketID, socket } from "./socket";

import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Grid,
  Link,
  Button,
  IconButton,
} from "@mui/material";

import {
  ADD_FAVORITE_TO_USER,
  REMOVE_FAVORITE_FROM_USER,
  ADD_POSSIBLE_BUYER,
  GET_USERS_BY_IDS,
  GET_USER_FOR_FAVORITE,
} from "../queries";
import { useMutation } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { GET_USER } from "../queries";

export default function ProductCard({ productData }) {
  const navigate = useNavigate();

  const { currentUser } = useContext(AuthContext);

  const [hasFavorited, setHasFavorited] = useState(false);

  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER_FOR_FAVORITE, {
    variables: { id: currentUser ? currentUser.uid : "" },
    fetchPolicy: "cache-and-network",
  });

  const baseUrl = "/product/";

  const [addPossibleBuyer] = useMutation(ADD_POSSIBLE_BUYER);

  const [removeFavorite, { removeData, removeLoading, removeError }] =
    useMutation(REMOVE_FAVORITE_FROM_USER, {
      refetchQueries: [GET_USER, "getUserById"],
    });

  const [addFavorite, { addData, addLoading, addError }] = useMutation(
    ADD_FAVORITE_TO_USER,
    {
      refetchQueries: [
        {
          query: GET_USER,
          variables: { _id: currentUser ? currentUser.uid : "" },
        },
      ],
    }
  );

  useEffect(() => {
    // console.log("user data", userData);
    // console.log(userLoading);
    // console.log("error", userError);
    if (!userLoading) {
      // console.log(userData, "usedata");
      // console.log("in favorite?", userData?.getUserById?.favorite);
      if (userData?.getUserById?.favorite?.includes(productData._id)) {
        // console.log(userData);
        // console.log(userData.getUserById);
        setHasFavorited(true);
      } else {
        // console.log("in the else");
        setHasFavorited(false);
      }
    }
  }, [userLoading, userData, userError]);

  function handleFavorite() {
    // console.log("user id", currentUser.uid);
    // console.log("product id", productData._id);

    try {
      if (!currentUser || !currentUser.uid) {
        alert("You need to login to favorite this product!");
        return;
      }
      if (hasFavorited) {
        //if already favorited this product, remove this product from favorite list.
        removeFavorite({
          variables: { id: currentUser.uid, productId: productData._id },
        });
        console.log(false)
        setHasFavorited(false);
      } else {
        addFavorite({
          variables: { id: currentUser.uid, productId: productData._id },
        });
        setHasFavorited(true);
      }
    } catch (error) {
      console.log(error.message);
    }
    // if (addError || removeError) {
    //   console.log(addError);
    //   console.log(removeError);
    // }
  }
  return (
    <Grid item>
      <Card sx={{ width: 300, height: "100%" }}>
        <Link
          component="button"
          sx={{
            textDecoration: "none",
          }}
          onClick={() => navigate(baseUrl + productData._id)}
        >
          <CardHeader
            titleTypographyProps={{ fontWeight: "bold" }}
            title={productData && productData.name}
          ></CardHeader>
        </Link>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <CardMedia
            component="img"
            image={productData.image ? productData.image : noImage}
            title="thumbnail"
            sx={{
              width: "auto",
              height: 300,
            }}
          />
        </div>

        <CardContent>
          <p>Price: {productData && productData.price}</p>
          <p>Condition: {productData && productData.condition}</p>

          {currentUser && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {productData.seller_id !== currentUser.uid ? (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    onClick={() => {
                      if (currentUser.uid) {
                        addPossibleBuyer({
                          variables: {
                            id: productData.seller_id,
                            buyerId: currentUser.uid,
                          },
                        });
                        socket.emit("join room", {
                          room: productData.seller_id,
                          user: currentUser.uid,
                        });

                        // socket.emit("message", {
                        //   room: productData.seller_id,
                        //   sender: currentUser.uid,
                        //   message: `Hi, I have questions regarding product: "${productData.name}"`,
                        //   time: new Date().toISOString(),
                        // });
                      }
                    }}
                    sx={{ fontWeight: "bold" }}
                  >
                    Chat with seller
                  </Button>

                  <IconButton sx={{ marginLeft: 3 }} onClick={handleFavorite}>
                    {hasFavorited ? (
                      <FavoriteIcon sx={{ color: "#e91e63" }} />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </>
              ) : (
                <></>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
