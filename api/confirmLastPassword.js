async password => {
  const user = await application.auth.getUserByToken(context.token);
  const hash = user ? user.password : undefined;
  const valid = await application.security.validatePassword(password, hash);
  if (!valid) return false;
  return true;
};
