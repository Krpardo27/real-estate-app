// Estas variables son públicas. Nunca deben contener credenciales.
const email = import.meta.env.VITE_CONTACT_EMAIL?.trim() || "";
const phone = import.meta.env.VITE_CONTACT_PHONE?.trim() || "";
export const CONTACT_EMAIL = /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(email) ? email : "";
export const CONTACT_PHONE = /^\+[1-9]\d{7,14}$/.test(phone) ? phone : "";