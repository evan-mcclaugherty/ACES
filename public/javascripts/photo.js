let imgDiv = document.getElementById("imgDiv");
let submitBtn = document.getElementById("submit");
let imgSrc = document.getElementById("imgSrc");

function loadFile(event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function (event) {
    var image = new Image();
    image.height = 100;
    image.title = file.name;
    image.src = this.result;
    imgSrc.value = this.result;
    imgDiv.appendChild(image);
    submitBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}