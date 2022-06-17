export const confirmationEmail = (email: string, code: number) => {
  return {
    subject: "6 digit Code",
    from: process.env.EMAIL,
    to: email,
    html: `<h3>Confirmation code</h3>
        <h2>${code}</h2>
        `,
  };
};
