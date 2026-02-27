// Validaciones reutilizables para inputs

export const validators = {
  // Solo letras y espacios
  nameOnly: (value: string): boolean => {
    if (!value) return true;
    const regex = /^[a-záéíóúñ\s'-]+$/i;
    return regex.test(value.trim());
  },

  // Email válido
  email: (value: string): boolean => {
    if (!value) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },

  // Números y decimales
  amount: (value: string): boolean => {
    if (!value) return true;
    const regex = /^(\d+\.?\d{0,2})?$/;
    return regex.test(value);
  },

  // Mínimo de caracteres
  minLength:
    (min: number) =>
    (value: string): boolean => {
      return value.length === 0 || value.length >= min;
    },

  // Máximo de caracteres
  maxLength:
    (max: number) =>
    (value: string): boolean => {
      return value.length <= max;
    },

  // Contraseña fuerte (al menos 6 caracteres)
  password: (value: string): boolean => {
    if (!value) return true;
    return value.length >= 6;
  },

  // Solo números
  numbersOnly: (value: string): boolean => {
    if (!value) return true;
    const regex = /^\d+$/;
    return regex.test(value);
  },

  // Descripción (letras, números, espacios, puntuación básica)
  description: (value: string): boolean => {
    if (!value) return true;
    const regex = /^[a-záéíóúñ0-9\s\-.,;:()&]+$/i;
    return regex.test(value);
  },
};

export const validationMessages = {
  nameOnly: "Solo se permiten letras, espacios y guiones",
  email: "Ingresa un email válido",
  amount: "Ingresa una cantidad válida (ej: 100.50)",
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  password: "Mínimo 6 caracteres",
  numbersOnly: "Solo se permiten números",
  description:
    "Solo se permiten letras, números, espacios y puntuación básica",
  required: "Este campo es obligatorio",
};
