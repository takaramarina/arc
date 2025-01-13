const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let scale = 1; // Initial zoom scale
let offsetX = 0, offsetY = 0; // Initial offset for dragging the page
let isDraggingCanvas = false;
let dragStartX = 0, dragStartY = 0;

let images = [];
let selectedImage = null;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.addEventListener('mousedown', (e) => {
  const mousePos = getMousePosition(e);

  // Check if the user clicked on an image
  selectedImage = images.find((img) =>
    mousePos.x >= img.x &&
    mousePos.x <= img.x + img.width &&
    mousePos.y >= img.y &&
    mousePos.y <= img.y + img.height
  );

  if (selectedImage) {
    selectedImage.dragStartX = mousePos.x - selectedImage.x;
    selectedImage.dragStartY = mousePos.y - selectedImage.y;
  } else {
    isDraggingCanvas = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (selectedImage) {
    const mousePos = getMousePosition(e);
    selectedImage.x = mousePos.x - selectedImage.dragStartX;
    selectedImage.y = mousePos.y - selectedImage.dragStartY;
    drawCanvas();
  } else if (isDraggingCanvas) {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    offsetX -= dx / scale;
    offsetY -= dy / scale;

    dragStartX = e.clientX;
    dragStartY = e.clientY;

    drawCanvas();
  }
});

canvas.addEventListener('mouseup', () => {
  isDraggingCanvas = false;
  selectedImage = null;
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();

  const zoomSpeed = 1.1;
  const mouseX = (e.clientX - canvas.offsetLeft) / scale - offsetX;
  const mouseY = (e.clientY - canvas.offsetTop) / scale - offsetY;

  if (e.deltaY < 0) {
    scale *= zoomSpeed;
  } else {
    scale /= zoomSpeed;
  }

  offsetX = mouseX - (e.clientX - canvas.offsetLeft) / scale;
  offsetY = mouseY - (e.clientY - canvas.offsetTop) / scale;
  // maybe update to center zoom on the mouse position
  drawCanvas();
});

function addImage(src, x, y) {
  const img = new Image();
  img.src = src;

  img.onload = () => {
    images.push({ img, x, y, width: img.width, height: img.height });
    drawCanvas();
  };

  img.onerror = () => {
    console.error(`Failed to load image: ${src}`);
  };
}

function drawCanvas() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply transformations for page dragging and zooming
  ctx.setTransform(scale, 0, 0, scale, -offsetX * scale, -offsetY * scale);

  // Draw images
  images.forEach((image) => {
    ctx.drawImage(image.img, image.x, image.y, image.width, image.height);
  });

  // Reset transformations
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / scale + offsetX,
    y: (e.clientY - rect.top) / scale + offsetY,
  };
}

// Example of adding images
addImage('IMG_2654.jpg', 300, 300);
addImage('IMG_2654.jpg', 1000, 1000);

// Adjust canvas size on window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawCanvas();
});

async function loadImages() {
    try {
      // Fetch the saved image URLs from the backend
      const response = await fetch("https://arc-ecru-ten.vercel.app/api/save-image");
      const data = await response.json();
  
      if (data.images && data.images.length > 0) {
        // Loop through the images and add them to the canvas
        data.images.forEach((url, index) => {
          // Add each image to the canvas at a specific position (e.g., staggered)
          const x = 100 + index * 50; // Staggered x position
          const y = 100 + index * 50; // Staggered y position
          addImage(url, x, y);
        });
      } else {
        console.log("No images found to load.");
      }
    } catch (error) {
      console.error("Error loading images:", error);
    }
  }
  
  // Call the function on page load to load and render saved images
  window.onload = loadImages;
  