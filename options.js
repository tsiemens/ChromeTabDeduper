// Copyright (c) 2018 Trevor Siemens.

function saveAllOptions() {
   var useTitleBox = document.getElementById('use-title-default-checkbox');
   setOption(useTitleDefaultOpt, useTitleBox.checked);
}

function loadAllOptions() {
   getOption(useTitleDefaultOpt, (items) => {
      var useTitleBox = document.getElementById('use-title-default-checkbox');
      useTitleBox.checked = items[useTitleDefaultOpt];
   });
}

document.addEventListener("DOMContentLoaded", (event) => {
   console.log("DOM fully loaded and parsed");

   var saveBtn = document.getElementById('save-button');
   saveBtn.addEventListener('click', (e) => {
      saveAllOptions();
   });

   loadAllOptions();
});
