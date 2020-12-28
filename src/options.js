// Copyright (c) 2018 Trevor Siemens.
#include "utils.js"

function setOptionErrorText(errors, errPar) {
   var errHtmls = [];
   if (errors !== null && errors !== undefined) {
      errors.forEach((e) => {
         errHtmls.push(escapeHtml(e));
      });
   }
   errPar.innerHTML = errHtmls.join('<br/>');
}

function setOptionsErrorTexts(errors) {
   setOptionErrorText(
      errors === null ? null : errors[EOpt.urlExempts],
      ebi("url-exempt-errors"));

   setOptionErrorText(
      errors === null ? null : errors[EOpt.titleOverride],
      ebi("title-override-errors"));

   setOptionErrorText(
      errors === null ? null : errors[EOpt.fragmentOverride],
      ebi("fragment-override-errors"));

   setOptionErrorText(
      errors === null ? null : errors[EOpt.urlTransform],
      ebi("url-transform-errors"));

   var saveErrors = ebi("save-errors");
   saveErrors.textContent = errors !== null ? "[ ! ] Errors found" : "";
}

function saveAllOptions() {
   let allWindowsCb = ebi('dedup-all-windows-checkbox');
   var useTitleCb = ebi('use-title-default-checkbox');
   var ignoreFragCb = ebi('ignore-fragment-default-checkbox');
   var urlExemptTb = ebi("url-exempt-tb");
   var titleOverrideTb = ebi("title-override-tb");
   var fragOverrideTb = ebi("fragment-override-tb");
   var urlTranformTb = ebi("url-transform-tb");

   var kvs = {};
   kvs[EOpt.dedupAllWindows] = allWindowsCb.checked;
   kvs[EOpt.useTitleDefault] = useTitleCb.checked;
   kvs[EOpt.ignoreFragmentDefault] = ignoreFragCb.checked;
   kvs[EOpt.urlExempts] = urlExemptTb.value;
   kvs[EOpt.titleOverride] = titleOverrideTb.value;
   kvs[EOpt.fragmentOverride] = fragOverrideTb.value;
   kvs[EOpt.urlTransform] = urlTranformTb.value;

   setOptions(kvs, () => {
      updateOptionCache((errors) => {
         setOptionsErrorTexts(errors);
         handleTab();
      });
   });
}

function loadAllOptions() {
   getOptions([
      EOpt.dedupAllWindows,
      EOpt.useTitleDefault,
      EOpt.ignoreFragmentDefault,
      EOpt.urlExempts,
      EOpt.titleOverride,
      EOpt.fragmentOverride,
      EOpt.urlTransform
     ], (items) => {
      let allWindowsCb = ebi('dedup-all-windows-checkbox');
      allWindowsCb.checked = items[EOpt.dedupAllWindows];

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

      updateOptionCache((errors) => {
         setOptionsErrorTexts(errors);
      });
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
