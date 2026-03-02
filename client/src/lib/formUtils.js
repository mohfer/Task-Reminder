export const getFieldError = (errors, field) => {
    if (!errors) return null;
    const error = errors[field];
    if (Array.isArray(error)) return error[0];
    return error || null;
};
