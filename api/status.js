({
  access: 'public',
  method: async () => {
    const status = context.token ? 'logged' : 'not logged';
    return { result: status };
  },
});
