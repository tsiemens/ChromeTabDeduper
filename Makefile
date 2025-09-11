ZIPFILE = TabDeduper.zip

ALL_SRCS = $(wildcard src/*)

COPY_FILES = common_styles.css options.css popup.css utils.js eventPage.js options.js popup.js
COPY_OBJS = $(addprefix dist/,$(COPY_FILES))
COPY_SRCS = $(addprefix src/,$(COPY_FILES))

RES = $(wildcard res/*)
RES_LN = $(subst res/,dist/,$(RES))

build: copy dist-res

dist-dir:
	@mkdir -p dist

# Simply copy all source files
$(COPY_OBJS): $(COPY_SRCS) | dist-dir
	cp $(subst dist/,src/,$@) $@

copy: $(COPY_OBJS)

$(RES_LN): | dist-dir
	test -L $@ || ln -s -r $(subst dist/,res/,$@) dist/
	# test -f $@ || cp $(subst dist/,res/,$@) dist/

dist-res: $(RES_LN)

$(ZIPFILE): copy
	zip -FSr $(ZIPFILE) dist

zip: $(ZIPFILE)

clean:
	rm -f dist/*

.PHONY: clean copy build
