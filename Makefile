ZIPFILE = TabDeduper.zip

RES = $(wildcard res/*)
RES_LN = $(subst res/,dist/,$(RES))

build: copy dist-res

dist-dir:
	@mkdir -p dist

$(RES_LN): | dist-dir
	test -L $@ || ln -s -r $(subst dist/,res/,$@) dist/
	# test -f $@ || cp $(subst dist/,res/,$@) dist/

dist-res: $(RES_LN)

$(ZIPFILE): dist-res
	cd dist && zip -x "*.swp" -FSr ../$(ZIPFILE) .

zip: $(ZIPFILE)

clean:
	rm -f dist/*

.PHONY: clean copy build
