export const passwordRules = [
    { label: '8 caracteres', test: (p) => p.length >= 8 },
    { label: '1 mayúscula', test: (p) => /[A-Z]/.test(p) },
    { label: '1 minúscula', test: (p) => /[a-z]/.test(p) },
    { label: '1 número', test: (p) => /\d/.test(p) },
    { label: '1 carácter especial', test: (p) => /[=!@#$%^&*]/.test(p) },
]

export const isPasswordValid = (password) =>
    passwordRules.every((rule) => rule.test(password))