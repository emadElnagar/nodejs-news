// LIVE PREVIEW FOR PROFILE IMAGE CHANGE
let profileInput = document.getElementById('profile-img');
let profileLabel = document.getElementById('profile-label');
let profileFormSubmition = document.getElementById('profile-form-submition');
let profileForm = document.getElementById('profile-form');
profileInput.onchange = function () {
  const reader = new FileReader();
  reader.readAsDataURL(this.files[0]);
  reader.onload = function () {
    document.getElementById('profile-image').src = this.result;
    profileLabel.classList.add('d-none');
    profileFormSubmition.classList.remove('d-none');
    profileForm.classList.add('active-form');
  }
}
// UPDATE USERNAM FORM
let edit = document.getElementById('edit');
let username = document.getElementById('username');
let usernameForm = document.getElementById('username-form');
username.onmouseover = () => {
  edit.classList.remove('d-none');
}
username.onmouseout = () => {
  edit.classList.add('d-none');
}
edit.onclick = () => {
  usernameForm.classList.toggle('d-none');
}
// CHANGE EMAIL FORM
let changeEmailBtn = document.getElementById('change-email');
let changeEmailForm = document.getElementById('change-email-form');
changeEmailBtn.onclick = () => {
  changeEmailForm.classList.toggle('d-none');
}
// CHNAGE PASSWORD
let changePasswordBtn = document.getElementById('change-password');
let changePasswordForm = document.getElementById('change-password-form');
changePasswordBtn.onclick = () => {
  changePasswordForm.classList.toggle('d-none');
}
// DELETE ACCOUNT
const deleteAccountBtn = document.getElementById('delete-account');
const deleteAccountForm = document.getElementById('delete-account-form');
deleteAccountBtn.onclick = () => {
  deleteAccountForm.classList.toggle('d-none');
}
