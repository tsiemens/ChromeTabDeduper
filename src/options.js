// Copyright (c) 2018 Trevor Siemens.

function ebi(id) {
   return document.getElementById(id);
}

function saveAllOptions() {
   var useTitleCb = ebi('use-title-default-checkbox');
   var ignoreFragCb = ebi('ignore-fragment-default-checkbox');
   var urlExemptTb = ebi("url-exempt-tb");
   var titleOverrideTb = ebi("title-override-tb");
   var fragOverrideTb = ebi("fragment-override-tb");
   var urlTranformTb = ebi("url-transform-tb");

   var kvs = {};
   kvs[useTitleDefaultOpt] = useTitleCb.checked;
   kvs[ignoreFragmentDefaultOpt] = ignoreFragCb.checked;
   kvs[urlExemptsOpt] = urlExemptTb.value;
   kvs[titleOverrideOpt] = titleOverrideTb.value;
   kvs[fragmentOverrideOpt] = fragOverrideTb.value;
   kvs[urlTransformOpt] = urlTranformTb.value;

   setOptions(kvs, () => {
      updateOptionCache(() => {
         handleTab();
      });
   });
}

function loadAllOptions() {
   getOptions([
      useTitleDefaultOpt,
      ignoreFragmentDefaultOpt,
      urlExemptsOpt,
      titleOverrideOpt,
      fragmentOverrideOpt,
      urlTransformOpt
     ], (items) => {
      var useTitleCb = ebi('use-title-default-checkbox');
      useTitleCb.checked = items[useTitleDefaultOpt];

      var ignoreFragCb = ebi('ignore-fragment-default-checkbox');
      ignoreFragCb.checked = items[ignoreFragmentDefaultOpt];

      var urlExemptTb = ebi("url-exempt-tb");
      urlExemptTb.value = items[urlExemptsOpt];

      var titleOverrideTb = ebi("title-override-tb");
      titleOverrideTb.value = items[titleOverrideOpt];

      var fragOverrideTb = ebi("fragment-override-tb");
      fragOverrideTb.value = items[fragmentOverrideOpt];

      var urlTranformTb = ebi("url-transform-tb");
      urlTranformTb.value = items[urlTransformOpt];
   });
}

function doConvertTest() {
   var input = document.getElementById('convert-sample-url-text');
   var url = input.value;
   url = afterHttp(url);
   var newUrl = getUrlDedupIdPart(url);

   var resultDiv = document.getElementById('convert-test-result');
   resultDiv.innerText = newUrl;
}

document.addEventListener("DOMContentLoaded", (event) => {
   console.log("DOM fully loaded and parsed");

   var saveBtn = document.getElementById('save-button');
   saveBtn.addEventListener('click', (e) => {
      saveAllOptions();
   });

   var convertTestBtn = document.getElementById('convert-test-button');
   convertTestBtn.addEventListener('click', (e) => {
      if (!optionCacheInitialized) {
         updateOptionCache(() => {
            doConvertTest();
         });
      } else {
         doConvertTest();
      }
   });

   loadAllOptions();
});
