({
  access: 'public',
  method: async ({ password, href }) => {
    const hash = await application.security.hashPassword(password);
    const exist = await application.auth.changePasswordByLink({
      hash,
      href,
    });
    if (exist) return { result: 'success' };
  },
});
