"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import Processing from "@/components/Processing";

import {
  LoadUserRequest,
  LoadUserSuccess,
  LoadUserFail,
} from "@/redux/reducers/userReducer";
import Axios from "../Axios";

interface Props {
  children: React.ReactNode;
}
const UserProvider = ({ children }: Props) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  console.log(user);

  const { data: session, status } = useSession();

  const getUser = async () => {
    try {
      dispatch(LoadUserRequest());
      const { data } = await Axios.get("/get/user", {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });
      dispatch(LoadUserSuccess(data));
    } catch (err: any) {
      dispatch(LoadUserFail(err.response.data.message));
    }
  };
  useEffect(() => {
    if (status === "authenticated") {
      getUser();
    }
  }, [status]);

  if (status === "loading") {
    return <Processing />;
  }
  return <div>{children}</div>;
};

export default UserProvider;
