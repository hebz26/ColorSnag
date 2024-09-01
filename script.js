(function () {
  // Show or hide tab content based on the active tab ID
  const showTabContent = (tabId) => {
    document.querySelectorAll(".tab-content").forEach((tab) => {
      // If the tab ID matches, show it by adding the 'active' class
      // Otherwise, hide it by removing the 'active' class
      tab.id === tabId
        ? tab.classList.add("active")
        : tab.classList.remove("active");
    });
  };

  // Copy text to the clipboard and provide feedback
  const copyToClipboard = async (text, elem) => {
    try {
      await navigator.clipboard.writeText(text);
      elem.innerText = "Copied"; // Update text to "Copied" for feedback
      setTimeout(() => (elem.innerText = text), 750); // Revert text after 750ms
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  // Validate if a string is a valid hex color code
  const isValidHexColor = (hex) => /^#[0-9A-F]{6}$/i.test(hex);

  // DOM Manipulation Functions

  // Set up functionality for switching between tabs
  const initializeTabs = () => {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab; // Get tab ID from button's data attribute
        showTabContent(tabId); // Show the content of the selected tab

        // Update the active state for tab buttons
        document.querySelectorAll(".tab-btn").forEach((tabBtn) => {
          tabBtn.classList.remove("active"); // Remove 'active' class from all buttons
        });
        btn.classList.add("active"); // Add 'active' class to the clicked button
      });
    });
  };

  // Set up functionality for the color picker tab
  const initializeColorPicker = () => {
    const colorPickerTab = document.getElementById("color-picker-tab");
    const colorPickerBtn = colorPickerTab.querySelector("#color-picker");
    const clearAll = colorPickerTab.querySelector(".clear-all");

    // Load picked colors from local storage, or use an empty array if none exist
    const pickedColors =
      JSON.parse(localStorage.getItem("picked-colors")) || [];

    // Display the picked colors in the UI
    const showColors = () => {
      if (!pickedColors.length) return; // Exit if no colors are picked
      const colorsHtml = pickedColors
        .map(
          (color) => `<li class="color">
            <span class="rect" style="background: ${color}; border: 1px solid ${
            color === "#ffffff" ? "#ccc" : color
          };"></span>
            <span class="value" data-color="${color}">${color}</span>
          </li>`
        )
        .join(""); // Create HTML for each picked color
      colorPickerTab.querySelector(".all-colors").innerHTML = colorsHtml;
      colorPickerTab.querySelector(".picked-colors").classList.remove("hide");

      // Add event listeners to color items for copying to clipboard
      colorPickerTab.querySelectorAll(".color").forEach((li) => {
        li.addEventListener("click", (e) =>
          copyToClipboard(
            e.currentTarget.lastElementChild.dataset.color,
            e.currentTarget.lastElementChild
          )
        );
      });
    };

    // Activate the EyeDropper API to pick a color
    const activateEyeDropper = async () => {
      document.body.style.display = "none"; // Hide the body to avoid flickering
      setTimeout(async () => {
        try {
          const eyeDropper = new EyeDropper();
          const { sRGBHex } = await eyeDropper.open();
          // Add new color to the list if it's not already picked
          if (!pickedColors.includes(sRGBHex)) {
            pickedColors.push(sRGBHex);
            localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
            showColors(); // Update the displayed colors
          }
        } catch (error) {
          console.log("Failed to get color");
        }
        document.body.style.display = "block"; // Show the body again
      }, 10);
    };

    // Clear all picked colors
    const clearAllColors = () => {
      pickedColors.length = 0; // Empty the picked colors array
      localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
      colorPickerTab.querySelector(".picked-colors").classList.add("hide");
    };

    // Set up event listeners for buttons in the color picker tab
    clearAll.addEventListener("click", clearAllColors);
    colorPickerBtn.addEventListener("click", activateEyeDropper);
    showColors(); // Initial display of picked colors
  };

  // Set up functionality for the palette maker tab
  const initializePaletteMaker = () => {
    const paletteMakerTab = document.getElementById("palette-maker-tab");

    // Save all palettes to local storage
    const savePalettes = () => {
      const palettes = Array.from(
        document.querySelectorAll("#palette-list .palette")
      ).map((palette) =>
        Array.from(palette.querySelectorAll(".rect")).map(
          (rect) => rect.dataset.color
        )
      );
      localStorage.setItem("saved-palettes", JSON.stringify(palettes));
    };

    // Load saved palettes from local storage and display them
    const loadPalettes = () => {
      const savedPalettes =
        JSON.parse(localStorage.getItem("saved-palettes")) || [];
      const paletteList = document.getElementById("palette-list");
      paletteList.innerHTML = "";

      if (savedPalettes.length === 0) {
        paletteMakerTab.querySelector(".my-palettes").classList.add("hide");
      } else {
        savedPalettes.forEach((palette) => {
          const newPalette = createPaletteElement(palette);
          paletteList.appendChild(newPalette);
        });
        paletteMakerTab.querySelector(".my-palettes").classList.remove("hide");
      }
    };

    // Create a new palette element
    const createPaletteElement = (colors) => {
      const newPalette = document.createElement("li");
      newPalette.className = "palette";
      colors.forEach((color) => {
        const rect = document.createElement("span");
        rect.className = "rect";
        rect.dataset.color = color;
        rect.style.backgroundColor = color;
        newPalette.appendChild(rect);
      });

      const spacer = document.createElement("div");
      spacer.className = "spacer";
      newPalette.appendChild(spacer);

      // Add controls for the palette
      const paletteControls = document.createElement("div");
      paletteControls.className = "palette-controls";
      paletteControls.innerHTML = `
        <button class="copy-all">Copy All</button>
        <button class="remove-btn">
          <i class="fa-regular fa-trash-can"></i>
        </button>`;
      newPalette.appendChild(paletteControls);

      return newPalette;
    };

    // Add a new palette with default colors
    const addNewPalette = () => {
      const defaultColors = [
        "#F0F0F0",
        "#F0F0F0",
        "#F0F0F0",
        "#F0F0F0",
        "#F0F0F0",
      ];
      const newPalette = createPaletteElement(defaultColors);
      document.getElementById("palette-list").appendChild(newPalette);
      paletteMakerTab.querySelector(".my-palettes").classList.remove("hide");
      savePalettes(); // Save the new palette
    };

    // Copy all colors from a palette to the clipboard
    const copyAllColors = (paletteElement) => {
      const colors = Array.from(paletteElement.querySelectorAll(".rect"))
        .map((rect) => rect.dataset.color)
        .join(", ");
      copyToClipboard(colors); // Use the utility function to copy text
    };

    // Handle clicks within the palette list
    document
      .getElementById("palette-list")
      .addEventListener("click", (event) => {
        if (event.target.classList.contains("copy-all")) {
          const paletteElement = event.target.closest(".palette");
          copyAllColors(paletteElement); // Copy all colors in the selected palette
        } else if (event.target.closest(".remove-btn")) {
          const paletteElement = event.target.closest(".palette");
          if (paletteElement) {
            paletteElement.remove(); // Remove the palette element
            savePalettes(); // Update local storage
            if (
              document.querySelectorAll("#palette-list .palette").length === 0
            ) {
              paletteMakerTab
                .querySelector(".my-palettes")
                .classList.add("hide"); // Hide section if no palettes are left
            }
          }
        } else if (event.target.classList.contains("rect")) {
          navigator.clipboard
            .readText()
            .then((text) => {
              if (isValidHexColor(text)) {
                event.target.style.backgroundColor = text;
                event.target.dataset.color = text;
                savePalettes(); // Update palette and save
              } else {
                alert("Clipboard does not contain a valid hex color.");
              }
            })
            .catch((err) =>
              console.error("Failed to read clipboard contents: ", err)
            );
        }
      });

    // Set up event listeners for adding a new palette and clearing all palettes
    document
      .getElementById("palette-maker")
      .addEventListener("click", addNewPalette);

    document.querySelector(".clear-all-p").addEventListener("click", () => {
      document.getElementById("palette-list").innerHTML = ""; // Clear all palettes
      localStorage.removeItem("saved-palettes"); // Remove from local storage
      paletteMakerTab.querySelector(".my-palettes").classList.add("hide");
    });

    loadPalettes(); // Load and display saved palettes on initialization
  };

  // Initialization function to set up all tabs and functionality
  const init = () => {
    initializeTabs();
    initializeColorPicker();
    initializePaletteMaker();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
