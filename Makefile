ZIPFILE = TabDeduper.zip

ALL_SRCS = $(wildcard src/*)

PP_TGTS =
PP_TGTS += common_styles.css
PP_TGTS += utils.js
PP_TGTS += eventPage.js
PP_TGTS += options.js
PP_TGTS += options.css
PP_TGTS += popup.js
PP_TGTS += popup.css

PP_OBJS = $(addprefix dist/,$(PP_TGTS))
PP_SRCS = $(addprefix src/,$(PP_TGTS))

RES = $(wildcard res/*)
RES_LN = $(subst res/,dist/,$(RES))

build: pp dist-res

dist-dir:
	@mkdir -p dist

# Be lazy (a lazy Makefile author, that is) and re-process everything if any
# source file changes.
$(PP_OBJS): $(ALL_SRCS) | dist-dir
	cpp -P -Wundef -nostdinc -I src -C $(subst dist/,src/,$@) > $@

pp: $(PP_OBJS)

$(RES_LN): | dist-dir
	test -L $@ || ln -s -r $(subst dist/,res/,$@) dist/
	# test -f $@ || cp $(subst dist/,res/,$@) dist/

dist-res: $(RES_LN)

$(ZIPFILE): pp
	zip -FSr $(ZIPFILE) dist

zip: $(ZIPFILE)

clean:
	rm dist/*

.PHONY: clean
