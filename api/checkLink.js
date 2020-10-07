({
  access: 'public',
  method: async href => {
    const exist = await application.auth.linkExist(href);
    if (exist) return true;
    return false;
  },
});
