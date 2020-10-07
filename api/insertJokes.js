async jokes => {
  const { token } = context;
  if (!token) {
    return null;
  }
  const getOneInsert = await application.auth.insertJoke(token);
  jokes.forEach(joke => getOneInsert(joke));
  return { result: 'success' };
};
