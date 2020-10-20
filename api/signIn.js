({
  access: 'public',
  method: async ({ login, password }) => {
    const user = await application.auth.getUser(login);
    const hash = user ? user.password : undefined;
    const valid = await application.security.validatePassword(password, hash);
    if (!user || !valid) return false;
    console.log(`Logged user: ${login}`);
    return { result: 'success', userId: user.id };
  },
});
