/*
  useFormWithValidation.js
  Custom hook for managing form state + validation.
  Tracks values, errors, validity, and whether the user has submitted.
  Accepts an optional `validate` callback to provide custom validation logic.
*/
import { useCallback, useState } from "react";

export function useFormWithValidation(
  defaultValues = {},
  validate = () => ({}),
) {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const runValidation = useCallback(
    (valuesToValidate) => {
      const validationErrors = validate(valuesToValidate);
      const valid = Object.values(validationErrors).every(
        (message) => !message,
      );

      setErrors(validationErrors);
      setIsValid(valid);

      return valid;
    },
    [validate],
  );

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    // Update value immediately
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    // Validate just the changed field, but keep other field errors unchanged.
    const fieldErrors = validate(nextValues)[name];
    setErrors((prev) => {
      const nextErrors = { ...prev, [name]: fieldErrors };
      setIsValid(Object.values(nextErrors).every((message) => !message));
      return nextErrors;
    });
  };

  const handleWYSIWYGChange = (name, value) => {
    // Update value immediately
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    // Validate just the changed field, but keep other field errors unchanged.
    const fieldErrors = validate(nextValues)[name];
    setErrors((prev) => {
      const nextErrors = { ...prev, [name]: fieldErrors };
      setIsValid(Object.values(nextErrors).every((message) => !message));
      return nextErrors;
    });
  };

  const handleDatePickerChange = (name, value, validateOrNot = true) => {
    // Update value immediately
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    // Validate just the changed field, but keep other field errors unchanged.
    if (validateOrNot) {
      const fieldErrors = validate(nextValues)[name];
      setErrors((prev) => {
        const nextErrors = { ...prev, [name]: fieldErrors };
        setIsValid(Object.values(nextErrors).every((message) => !message));
        return nextErrors;
      });
    } else {
      setErrors((prev) => {
        const nextErrors = { ...prev, [name]: "" };
        return nextErrors;
      });
    }
  };

  const handleSubmit = (evt, onValidSubmit) => {
    evt.preventDefault();
    setIsSubmitted(true);

    const trimmedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    );

    const valid = runValidation(trimmedValues);
    if (!valid) return false;

    if (typeof onValidSubmit === "function") {
      onValidSubmit(trimmedValues);
    }

    return true;
  };

  const resetForm = useCallback(
    (newValues = defaultValues) => {
      setValues(newValues);
      setErrors({});
      setIsValid(false);
      setIsSubmitted(false);
    },
    [defaultValues],
  );

  return {
    values,
    errors,
    isValid,
    isSubmitted,
    handleChange,
    handleWYSIWYGChange,
    handleDatePickerChange,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
    setIsValid,
    setIsSubmitted,
  };
}
