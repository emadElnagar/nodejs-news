// LIVE PREVIEW FOR ARTICLE
const headerInput = document.getElementById('title');
const demoHeader = document.getElementById('demo-header');
const subjectInput = document.getElementById('subject');
const demoSubject = document.getElementById('demo-paragraph');
const imageUpload = document.getElementById('image');
headerInput.oninput = function () {
  demoHeader.innerText = this.value;
}
subjectInput.oninput = function () {
  demoSubject.innerText = this.value;
}
imageUpload.oninput = function () {
  const reader = new FileReader();
  reader.readAsDataURL(this.files[0]);
  reader.onload = function () {
    document.getElementById('demo-image').src = this.result;
    document.getElementById('demo-image').classList.remove('d-none');
  }
}
