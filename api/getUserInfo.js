async () => {
  const { token } = context;
  if (!token) {
    return null;
  }
  const { fullname } = await application.auth.getUserInfo(token);
  return { name: fullname };
};
