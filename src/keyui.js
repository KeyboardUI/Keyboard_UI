import whatInput from "what-input";

document.addEventListener("click", () => {
  if (whatInput.ask() === "mouse") {
    console.log(whatInput.element());
  } else if (whatInput.ask() === "keyboard") {
    console.log("KEYBOARD");
  }
});
