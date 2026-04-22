/*
    AvatarGenerator.jsx
    Renders an avatar generator for the user to select a random avatar
*/

import "./AvatarGenerator.css";
import React, { useEffect, useState, useRef } from "react";
import Avatar from "../../utils/Avatar";

function AvatarGenerator({
  elementId = "avatar",
  size = 60,
  defaultValue = "",
  onChange,
  onError,
  showReset = false,
}) {
  const [generatorAvailable, setGeneratorAvailable] = useState(true);
  const [avatarState, setAvatarState] = useState({ index: -1, length: 0 });
  const handleError = (err) => {
    setGeneratorAvailable(false);
    if (onError) onError(err);
  };
  const avatarRef = useRef(null);
  if (avatarRef.current === null) {
    avatarRef.current = new Avatar({
      type: "DiceBear",
      target: "avatar",
      defaultValue,
      options: {},
      onSuccess: onChange,
      onError: handleError,
      onStateChange: setAvatarState,
    });
  }
  const avatar = avatarRef.current;

  const handlePrev = () => {
    if (generatorAvailable) avatar.prev();
  };
  const handleNext = () => {
    if (generatorAvailable) avatar.next();
  };
  const handleChangeType = (evt) => {
    if (generatorAvailable) {
      avatar.setType(evt.target.value);
      handleGenerate();
    }
  };
  const handleGenerate = () => {
    if (generatorAvailable) {
      avatar.generate();
    }
  };
  const handleReset = () => {
    avatar.resetToDefault();
  };

  //generate avatar on render (either a new one or uses the default value if provided)
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="avatar__generator">
      {generatorAvailable ? (
        <>
          <div
            className="generator__result"
            id={elementId}
            style={{ width: size, height: size }}
          ></div>

          <div className="generator__controls">
            <div className="generator__buttons">
              <button
                className={`generator__prev-btn ${avatarState.index > 0 ? "" : "generator__prev-btn_disabled"}`}
                type="button"
                onClick={handlePrev}
              />
              <button
                className="generator__generate-btn"
                type="button"
                onClick={handleGenerate}
              >
                Refresh
              </button>
              <button
                className={`generator__next-btn ${avatarState.length - 1 > avatarState.index ? "" : "generator__next-btn_disabled"}`}
                type="button"
                onClick={handleNext}
              />
              {showReset ? (
                <button
                  className="generator__reset-btn"
                  type="button"
                  onClick={handleReset}
                >
                  Reset
                </button>
              ) : (
                ""
              )}
            </div>
            <select
              className="form__select generator__type"
              onChange={handleChangeType}
            >
              <option value="DiceBear">Style 1</option>
              <option value="MultiAvatar">Style 2</option>
            </select>
          </div>
        </>
      ) : (
        <div className="generator__error">
          Error: Could not create Avatar Generator
        </div>
      )}
    </div>
  );
}
export default React.memo(AvatarGenerator);
