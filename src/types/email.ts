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

export const confirmationEmailViaLink = (email: string, link: string) => {
  return {
    subject: "Account Activation",
    from: process.env.EMAIL,
    to: email,
    html: `<h3>Confirmation Link</h3>
        <h2>http://localhost:3000/api/v1/auth/verifyAccountViaToken/${link}</h2>
        `,
  };
};

export const resetPasswordEmail = (email: string, code: number) => {
  return {
    subject: "6 digit Code",
    from: process.env.EMAIL,
    to: email,
    html: `<h3>Reset Code</h3>
        <h2>${code}</h2>
        `,
  };
};
