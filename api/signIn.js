({
  access: 'public',
  method: async ({ login, password }) => {
    const user = await application.auth.getUser(login);
    console.log('user', user);
    const hash = user ? user.password : undefined;
    const valid = await application.security.validatePassword(password, hash);
    console.log(valid);
    if (!user || !valid) return false;
    console.log(`Logged user: ${login}`);
    return { result: 'success', userId: user.id };
  },
});
