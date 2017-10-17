let imgDiv = document.getElementById("imgDiv");
let submitBtn = document.getElementById("submit");
let input = document.getElementById("imgSrc");
let canvas = document.getElementById("canvas");
let img = document.createElement("img");

function loadFile(event) {
  var file = event.target.files[0];
  img.src = window.URL.createObjectURL(file);
  img.onload = () => {
    let ctx = canvas.getContext("2d");
    // ctx.drawImage(img, 0, 0);
    var MAX_WIDTH = 300;
    var MAX_HEIGHT = 300;
    var width = img.width;
    var height = img.height;
    
    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    img.src = canvas.toDataURL();
    imgDiv.appendChild(img);
    submitBtn.disabled = false;
  }
}