const colorPickerBtn = document.querySelector("#color-picker");
const pickedColors = [];

const activateEyeDropper = async () => {
  try {
    const eyeDropper = new EyeDropper();
    const { sRGBHex } = await eyeDropper.open();
    navigator.clipboard.writeText(sRGBHex);
    pickedColors.push(sRGBHex);
    console.log(pickedColors);
  } catch (error) {
    console.log(error);
  }
};

colorPickerBtn.addEventListener("click", activateEyeDropper);
