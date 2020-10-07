({
  access: 'public',
  method: async ({ email, href }) => {
    const user = await application.auth.getUserByEmail(email);
    if (!user) return false;
    const linkTail = await application.auth.generateLink();
    const link = `${href}/${linkTail}`;
    await application.auth.insertLink(user.id, link);
    const subject = '[Destaby] Please reset your password';
    const message = `We heard that you lost your Destaby password. 
Sorry about that!
    
You can use the following link to reset your password:
    
${link}

If you don’t use this link within an hour, it will expire.

Thanks,
The Destaby`;

    await application.mailer.message({ to: email, subject, message });
    return true;
  },
});
