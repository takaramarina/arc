const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let scale = 1; // Initial zoom scale
let offsetX = 0, offsetY = 0; // Initial offset for dragging the page
let isDraggingCanvas = false;
let dragStartX = 0, dragStartY = 0;

let images = [];
let selectedImage = null;
let resizingImage = null;  // For resizing
let resizeHandleSize = 10; // Size of the resize handle

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
    // Check if the user clicked on the resize handle (bottom-right corner)
    const resizeHandleX = selectedImage.x + selectedImage.width - resizeHandleSize;
    const resizeHandleY = selectedImage.y + selectedImage.height - resizeHandleSize;

    if (
      mousePos.x >= resizeHandleX &&
      mousePos.x <= resizeHandleX + resizeHandleSize &&
      mousePos.y >= resizeHandleY &&
      mousePos.y <= resizeHandleY + resizeHandleSize
    ) {
      resizingImage = selectedImage;
      resizingImage.dragStartX = mousePos.x;
      resizingImage.dragStartY = mousePos.y;
    } else {
      // If clicked inside the image, start dragging the image
      selectedImage.dragStartX = mousePos.x - selectedImage.x;
      selectedImage.dragStartY = mousePos.y - selectedImage.y;
      selectedImage = null;
    }
  }

  if (!selectedImage) {
    isDraggingCanvas = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }
});

canvas.addEventListener('mousemove', async (e) => {
  const mousePos = getMousePosition(e);

  if (resizingImage) {
    // Calculate the new width and height based on mouse movement
    const dx = mousePos.x - resizingImage.dragStartX;
    const dy = mousePos.y - resizingImage.dragStartY;

    resizingImage.width = Math.max(50, resizingImage.width + dx); // Prevent shrinking too small
    resizingImage.height = Math.max(50, resizingImage.height + dy); // Prevent shrinking too small

    resizingImage.dragStartX = mousePos.x;
    resizingImage.dragStartY = mousePos.y;

    drawCanvas();

    // Save the new image size to Firebase
    await updateImageSize(resizingImage);
  } else if (selectedImage) {
    // Handle moving the image
    selectedImage.x = mousePos.x - selectedImage.dragStartX;
    selectedImage.y = mousePos.y - selectedImage.dragStartY;

    drawCanvas();

    // Save the new position to Firebase
    await updateImagePosition(selectedImage);
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

canvas.addEventListener('mouseup', async () => {
  resizingImage = null;
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
  drawCanvas();
});

function addImage(src, x = 100, y = 100, skipSave = false) {
  const img = new Image();
  img.src = src;

  img.onload = async () => {
    const newImage = { img, x, y, width: img.width, height: img.height };
    images.push(newImage);
    drawCanvas();

    if (!skipSave) {
      await saveImageToFirebase(newImage);
    }
  };

  img.onerror = () => {
    console.error(`Failed to load image: ${src}`);
  };
}

async function updateImageSize(image) {
  try {
    await fetch("https://arc-ecru-ten.vercel.app/api/save-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageUrl: image.img.src,
        x: image.x,
        y: image.y,
        width: image.width,
        height: image.height
      })
    });
  } catch (error) {
    console.error("Error updating image size:", error);
  }
}

async function updateImagePosition(image) {
  try {
    await fetch("https://arc-ecru-ten.vercel.app/api/save-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageUrl: image.img.src,
        x: image.x,
        y: image.y
      })
    });
  } catch (error) {
    console.error("Error updating image position:", error);
  }
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.setTransform(scale, 0, 0, scale, -offsetX * scale, -offsetY * scale);

  images.forEach((image) => {
    ctx.drawImage(image.img, image.x, image.y, image.width, image.height);
    // Draw resize handle at the bottom-right corner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(image.x + image.width - resizeHandleSize, image.y + image.height - resizeHandleSize, resizeHandleSize, resizeHandleSize);
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / scale + offsetX,
    y: (e.clientY - rect.top) / scale + offsetY,
  };
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawCanvas();
});

async function loadImages() {
  try {
    const response = await fetch("https://arc-ecru-ten.vercel.app/api/save-image");
    const data = await response.json();

    if (data.images && data.images.length > 0) {
      data.images.forEach((imgData) => {
        const x = imgData.x !== undefined ? imgData.x : 100;
        const y = imgData.y !== undefined ? imgData.y : 100;
        addImage(imgData.url, x, y, true); // true to skip re-saving
      });
    }
  } catch (error) {
    console.error("Error loading images:", error);
  }
}

window.onload = loadImages;
