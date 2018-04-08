function dict(k, v) {
   var d = {};
   d[k] = v;
   return d;
}

function dictValues(obj) {
   var vals = [];
   for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
         vals.push(obj[k]);
      }
   }
   return vals;
}

function setOptionsCache() {
   chrome.storage.local.get.throws();
   optionCacheInitialized = true;
   dictValues(EOpt).forEach((opt) => {
      optionCache[opt] = getOptionDefault(opt);
   });
   assert.ok(true);
}

QUnit.test("getSanitizedLines test", (assert) => {
   var lines = getSanitizedLines("foo");
   assert.deepEqual(lines, ["foo"]);

   var lines = getSanitizedLines(" foo \n  \n x");
   assert.deepEqual(lines, ["foo", "x"]);

   // updateOptionCache(() => {
      // assert.ok(true, "Finished updateOptionCache");
      // done();
   // })
});


QUnit.test("isValidUrlTransformLine test", (assert) => {
   assert.ok(isValidUrlTransformLine("a`v"));
   assert.ok(isValidUrlTransformLine("axxxx`vfgfdg"));
   assert.ok(isValidUrlTransformLine("axxxx`vfgfdg`dfsdf"));
   assert.notOk(isValidUrlTransformLine("axxx"));
   assert.notOk(isValidUrlTransformLine(""));
});
