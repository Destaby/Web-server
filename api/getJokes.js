async () => {
  const { token } = context;
  if (!token) {
    return null;
  }
  const jokes = await application.auth.getJokes(token);
  if (jokes) return { data: jokes };
};
