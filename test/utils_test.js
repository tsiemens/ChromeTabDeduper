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

function getMockOptions(keysAndDefaults, callback) {
   var mockOptions = {}
   dictValues(EOpt).forEach((opt) => {
      mockOptions[opt] = getOptionDefault(opt);
   });
   // Just return everything all the time
   callback(mockOptions);
}
// Override the utils function
getOptions = getMockOptions;

function setDefaultOptionsCache() {
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
});

QUnit.test("updateOptionsCache test", (assert) => {
   var done = assert.async();
   updateOptionCache(() => {
      assert.ok(optionCacheInitialized, "callback");
      assert.equal(optionCache[EOpt.useTitleDefault], true, EOpt.useTitleDefault);
      assert.equal(optionCache[EOpt.ignoreFragmentDefault], true,
                   EOpt.ignoreFragmentDefault);
      assert.deepEqual(optionCache[EOpt.urlExempts], [], EOpt.urlExempts);
      assert.deepEqual(optionCache[EOpt.titleOverride], [], EOpt.titleOverride);
      assert.deepEqual(optionCache[EOpt.fragmentOverride], [], EOpt.fragmentOverride);
      assert.deepEqual(optionCache[EOpt.urlTransform], [], EOpt.urlTransform);
      done();
   });
});

QUnit.test("getUrlDedupIdPart test", (assert) => {
   var done = assert.async();
   updateOptionCache(() => {
      assert.equal(getUrlDedupIdPart("foo.com"), "foo.com");

      optionCache[EOpt.ignoreFragmentDefault] = true,
      assert.equal(getUrlDedupIdPart("foo.com#foo"), "foo.com");
      optionCache[EOpt.ignoreFragmentDefault] = false,
      assert.equal(getUrlDedupIdPart("foo.com#foo"), "foo.com#foo");

      optionCache[EOpt.urlTransform] = [new UrlTransform('foo`bar')];
      optionCache[EOpt.ignoreFragmentDefault] = true,
      assert.equal(getUrlDedupIdPart("foo.com#foo"), "bar.com");
      optionCache[EOpt.ignoreFragmentDefault] = false,
      assert.equal(getUrlDedupIdPart("foo.com#foo"), "bar.com#foo");

      optionCache[EOpt.urlTransform] = [new UrlTransform('foo`bar`g')];
      optionCache[EOpt.ignoreFragmentDefault] = true,
      assert.equal(getUrlDedupIdPart("foo.com#foo"), "bar.com");
      optionCache[EOpt.ignoreFragmentDefault] = false,
      assert.equal(getUrlDedupIdPart("foo.com#foo"), "bar.com#bar");

      done();
   });
});

QUnit.test("getTabDedupId test", (assert) => {
   var done = assert.async();
   updateOptionCache(() => {
      optionCache[EOpt.ignoreFragmentDefault] = true,
      optionCache[EOpt.urlTransform] = [new UrlTransform('foo`bar')];
      optionCache[EOpt.useTitleDefault] = true;
      assert.equal(
         getTabDedupId({url:"https://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#Hi!");
      optionCache[EOpt.useTitleDefault] = false;
      assert.equal(
         getTabDedupId({url:"https://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#");

      optionCache[EOpt.titleOverride] = [new UrlRule('foo')];
      optionCache[EOpt.useTitleDefault] = true;
      assert.equal(
         getTabDedupId({url:"http://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#Hi!");
      optionCache[EOpt.useTitleDefault] = false;
      assert.equal(
         getTabDedupId({url:"http://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#Hi!");

      optionCache[EOpt.titleOverride] = [new UrlRule('-foo')];
      optionCache[EOpt.useTitleDefault] = true;
      assert.equal(
         getTabDedupId({url:"http://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#");
      optionCache[EOpt.useTitleDefault] = false;
      assert.equal(
         getTabDedupId({url:"http://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#");

      optionCache[EOpt.titleOverride] = [new UrlRule('-`^foo')];
      optionCache[EOpt.useTitleDefault] = true;
      assert.equal(
         getTabDedupId({url:"http://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#");
      optionCache[EOpt.titleOverride] = [new UrlRule('`^foo')];
      optionCache[EOpt.useTitleDefault] = false;
      assert.equal(
         getTabDedupId({url:"http://foo.com#foo", title: "Hi!"}),
         "bar.com#*#*#Hi!");

      done();
   });
});
