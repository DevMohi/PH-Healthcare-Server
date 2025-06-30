const loginUser = async (payload: { email: string; password: string }) => {
  console.log("User logged in", payload);
};

export const AuthServices = {
  loginUser,
};
