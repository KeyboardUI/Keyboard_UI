import whatInput from "what-input";

document.addEventListener("click", e => {
  if (whatInput.ask() === "mouse") {
    if (e.target.tagName === "BUTTON") e.target.blur();
  }
});
