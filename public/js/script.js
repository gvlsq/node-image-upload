const uploadArea = document.querySelector("#uploadArea");
const uploadFileInput = document.querySelector("#uploadFileInput");

uploadArea.addEventListener("dragenter", disableDefaultBehavior);
uploadArea.addEventListener("dragover", disableDefaultBehavior);
uploadArea.addEventListener("dragleave", disableDefaultBehavior);
uploadArea.addEventListener("drop", disableDefaultBehavior);

uploadArea.addEventListener("dragenter", highlightElement);
uploadArea.addEventListener("dragover", highlightElement);

uploadArea.addEventListener("dragleave", unhighlightElement);
uploadArea.addEventListener("drop", unhighlightElement);

uploadArea.addEventListener("drop", uploadFile);
uploadFileInput.addEventListener("change", uploadFile);

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function disableDefaultBehavior(e) {
  e.preventDefault();
  e.stopPropagation();  
}

function highlightElement(e) {
  e.target.classList.add("highlight");
}

function unhighlightElement(e) {
  e.target.classList.remove("highlight");
}

function uploadFile(e) {
  function formatByteCount(byteCount) {
    let result;

    const kb = 1024;
    const mb = 1024*kb;
    const gb = 1024*mb;

    if (byteCount > 1*gb)
      result = `${truncate(byteCount / gb)} GB`;
    else if (byteCount > 1*mb)
      result = `${truncate(byteCount / mb)} MB`;
    else if (byteCount > 1*kb)
      result = `${truncate(byteCount / kb)} KB`;
    else
      result = `${truncate(byteCount)} B`;

    return result;
  }

  function truncate(byteCount) {
    const result = Math.floor(byteCount*100) / 100;

    return result;
  }

  function flipBackslashes(text) {
    const result = text.replace(/\\/g, "/");

    return result;
  }

  let file;

  if (e.target.files != undefined) {
    // Dialog
    const files = e.target.files;
    if (files.length < 1) return;
    
    file = files.item(0);

    e.target.value = null;
  } else {
    // Drag 'n' drop
    const files = e.dataTransfer.files;
    if (files.count < 1) return;

    file = files[0];
  }

  if (file.type.substr(0, 6) != "image/")
    return alert("Only images are accepted for upload");

  if (file.size > 12*1024*1024)
    return alert("Image uploads must be 12 MB or smaller in size");

  let formData = new FormData();
  formData.append("file", file);

  fetch("upload", {
    method: "POST",
    body: formData
  })
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    const fileData = data.data;

    let fileName = fileData.name;
    if (fileName.length > 26)
      fileName = fileName.substr(0, 26 - 1) + "..." + fileName.substr(fileName.length - 4, fileName.length);

    let div = document.createElement("div");
    div.classList.add("uploaded-file");
    div.innerHTML = `<img src="img/image.svg" class="document-image">
                     <div class="file-description">
                       <h3>${fileName}</h3>
                       <h4>${formatByteCount(fileData.size)}</h4>
                     </div>
                     <div class="tooltip" onclick="copyToClipboard('${flipBackslashes(fileData.path)}')">
                       <span class="tooltip-text">Copy link</span>
                       <img src="img/link.svg" class="link-image">
                     </div>`;
    
    document.querySelector("#container").insertBefore(div, uploadArea);
  })
  .catch((error) => {
    alert(`Exception thrown: ${error.message}`);
  });
}
