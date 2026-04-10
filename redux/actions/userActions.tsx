"use client";
import { useDispatch } from "react-redux";

import Axios from "@/components/Axios";

// /* ======== GET USER ========== */
// export const getUser = async () => {
//   const dispatch = useDispatch();

//   try {
//     dispatch(LoadUserRequest());
//     const { data } = await Axios.get("/profile/me");
//     dispatch(LoadUserSuccess(data));
//   } catch (err: any) {
//     dispatch(LoadUserFail(err.response.data.message));
//   }
// };
