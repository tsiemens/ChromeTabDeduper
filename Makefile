ZIPFILE = TabDeduper.zip

ALL_SRCS = $(wildcard src/*)

CSS_FILES = common_styles.css options.css popup.css
CSS_OBJS = $(addprefix dist/,$(CSS_FILES))
CSS_SRCS = $(addprefix src/,$(CSS_FILES))

PP_TGTS = utils.js eventPage.js options.js popup.js
PP_OBJS = $(addprefix dist/,$(PP_TGTS))
PP_SRCS = $(addprefix src/,$(PP_TGTS))

RES = $(wildcard res/*)
RES_LN = $(subst res/,dist/,$(RES))

build: pp css dist-res

dist-dir:
	@mkdir -p dist

# Process JS files with cpp
$(PP_OBJS): $(ALL_SRCS) | dist-dir
	cpp -P -Wundef -nostdinc -I src -C $(subst dist/,src/,$@) > $@

# Simply copy CSS files
$(CSS_OBJS): $(CSS_SRCS) | dist-dir
	cp $(subst dist/,src/,$@) $@

pp: $(PP_OBJS)
css: $(CSS_OBJS)

$(RES_LN): | dist-dir
	test -L $@ || ln -s -r $(subst dist/,res/,$@) dist/
	# test -f $@ || cp $(subst dist/,res/,$@) dist/

dist-res: $(RES_LN)

$(ZIPFILE): pp
	zip -FSr $(ZIPFILE) dist

zip: $(ZIPFILE)

clean:
	rm -f dist/*

.PHONY: clean pp css build
