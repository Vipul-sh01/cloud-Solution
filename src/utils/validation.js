const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
};

const validateRequiredFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (value == null || !value.trim()) {
            return `${key} is required.`;
        }
    }
    return null;
};

const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordPattern.test(password);
};

const validatePhoneNumber = (phoneNumber) => {
    const phonePattern = /^\+91\d{10}$/;
    return phonePattern.test(phoneNumber);
};

const validateName = (name) => {
    const namePattern = /^[a-zA-Z\s]{2,50}$/;
    return namePattern.test(name);
};

export { validateEmail, validateRequiredFields, validatePassword, validatePhoneNumber, validateName };
