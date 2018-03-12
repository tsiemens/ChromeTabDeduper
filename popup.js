// Copyright (c) 2018 Trevor Siemens.

function onDeleteClick(btn) {
   var tabIdStr = btn.getAttribute('data-tabid');
   var tabId = parseInt(tabIdStr);
   if (Number.isNaN(tabId)) {
      console.error("Failed to parse tabid " + tabIdStr);
      return;
   }
   console.log("Deleting tab " + tabId);
   chrome.tabs.remove([tabId]);
}

chrome.tabs.onRemoved.addListener(function(tabId, ri) {
   reloadTabList();
});

function reloadTabList() {
   console.log("reloadTabList");
   getDuplicateTabs((resArr) => {
      var tabList = document.getElementById('tab_list');
      // Clear the list
      tabList.innerHTML = "";
      resArr.forEach((tabs) => { tabs.forEach((t) => {
         tabList.innerHTML +=
            '<div class="tab-list-item">' +
              '<div class="short-w tab-icon-title-grp">' +
              '<img class="tab-icon" src="' + t.favIconUrl + '">' +
              '<div class="short-w tab-title" style="padding-left:2pt">' + t.title +
                '</div>' +
              '</div>' +
              '<button data-tabid="' + t.id + '" class="kill-tab-button">X</button>' +
            "</div>";
      })});

      var buttons = document.getElementsByClassName('kill-tab-button');
      for (var i = 0; i < buttons.length; i++) {
         // Delete the tab for the button clicked
         buttons[i].addEventListener('click', (d) => {
            onDeleteClick(d.target);
         });
      }

      if (buttons.length == 0) {
         tabList.innerHTML +=
            '<div class="no-tabs-item">No duplicate tabs</div>';
      }
   });
}

updateOptionCache(() => {
   reloadTabList();
});
