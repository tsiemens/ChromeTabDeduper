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
   kvs[EOpt.useTitleDefault] = useTitleCb.checked;
   kvs[EOpt.ignoreFragmentDefault] = ignoreFragCb.checked;
   kvs[EOpt.urlExempts] = urlExemptTb.value;
   kvs[EOpt.titleOverride] = titleOverrideTb.value;
   kvs[EOpt.fragmentOverride] = fragOverrideTb.value;
   kvs[EOpt.urlTransform] = urlTranformTb.value;

   setOptions(kvs, () => {
      updateOptionCache(() => {
         handleTab();
      });
   });
}

function loadAllOptions() {
   getOptions([
      EOpt.useTitleDefault,
      EOpt.ignoreFragmentDefault,
      EOpt.urlExempts,
      EOpt.titleOverride,
      EOpt.fragmentOverride,
      EOpt.urlTransform
     ], (items) => {
      var useTitleCb = ebi('use-title-default-checkbox');
      useTitleCb.checked = items[EOpt.useTitleDefault];

      var ignoreFragCb = ebi('ignore-fragment-default-checkbox');
      ignoreFragCb.checked = items[EOpt.ignoreFragmentDefault];

      var urlExemptTb = ebi("url-exempt-tb");
      urlExemptTb.value = items[EOpt.urlExempts];

      var titleOverrideTb = ebi("title-override-tb");
      titleOverrideTb.value = items[EOpt.titleOverride];

      var fragOverrideTb = ebi("fragment-override-tb");
      fragOverrideTb.value = items[EOpt.fragmentOverride];

      var urlTranformTb = ebi("url-transform-tb");
      urlTranformTb.value = items[EOpt.urlTransform];
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
