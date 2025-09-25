const buttons = document.querySelectorAll(".selective-btn");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach((button) => {
  button.addEventListener("click", function () {
    // Get the content ID from the data attribute
    const contentID = this.getAttribute("data-toggle");

    const contentElement = document.getElementById(contentID);

    // Hide all contents
    contents.forEach((content) => {
      content.classList.remove("activate");
    });

    buttons.forEach((content) => {
      content.classList.remove("activate");
    });

    // Show the clicked content
    contentElement.classList.add("activate");
    this.classList.add("activate");
  });
});
