async password => {
  const hash = await application.security.hashPassword(password);
  const { token } = context;
  await application.auth.changePassword({ token, password: hash });
  return { result: 'success' };
};
