/*
    PasswordStrengthChecker.jsx
    Password Strength Meter for registration

    DISABLED FOR NOW
*/
import { useState, useMemo } from "react";
import zxcvbn from "zxcvbn";

const PasswordStrengthChecker = ({ password, onUpdate }) => {
  const strength = useMemo(() => {
    if (!password) {
      return null;
    }
    const evaluation = zxcvbn(password);
    if (typeof onUpdate === "function") {
      onUpdate(evaluation);
    }
    return evaluation;
  }, [password, onUpdate]);

  const labels = {
    0: "Worst",
    1: "Bad",
    2: "Weak",
    3: "Good",
    4: "Strong",
  };

  return (
    <>
      <div className="form__password-strength">
        <span className="password-strength__label">
          Password Strength:
          {/* ({strength ? labels[strength.score] : labels[0]}) */}
        </span>
        <meter
          min={1}
          max={4}
          value={strength ? strength.score : 0}
          className={`password-strength__meter meter_${strength ? strength.score : 0}`}
        ></meter>
      </div>
      {/*{strength ? <p>{strength.feedback.suggestions}</p> : ""}*/}
    </>
  );
};

export default PasswordStrengthChecker;
