({
  access: 'public',
  method: async ({ login, password, fullName, email }) => {
    const hash = await application.security.hashPassword(password);
    const exist = await application.auth.registerUser(
      login,
      hash,
      fullName,
      email
    );
    if (exist) return { denied: exist.field };
    return { result: 'success' };
  },
});
