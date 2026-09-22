export const passwordRules = [
    { label: '8 a 15 caracteres', test: (p) => p.length >= 8 && p.length <= 15  },
    { label: '1 mayúscula', test: (p) => /[A-Z]/.test(p) },
    { label: '1 minúscula', test: (p) => /[a-z]/.test(p) },
    { label: '1 número', test: (p) => /\d/.test(p) },
    { label: '1 carácter especial (=!@#$%^&*)', test: (p) => /[=!@#$%^&*]/.test(p) },
    { label: 'Solo letras, números y =!@#$%^&*', test: (p) => /^[A-Za-z\d=!@#$%^&*]*$/.test(p) },
]

export const isPasswordValid = (password) =>
    passwordRules.every((rule) => rule.test(password))