#define COPYRIGHT Copyright (c) 2018 Trevor Siemens.
#ifndef CSS_DEFS_H
#define CSS_DEFS_H

#define HASH #
#define ESC(_x) _x
#define ID(_x) ESC(HASH)_x // Need this to have # at the beginning of lines for ids

#define APP_BLUE #0098FE
#define APP_BLUE_HOVER #115dc5
#define APP_BLUE_CLICK #0b3d81

#define APP_ORANGE #fe8600
#define APP_ORANGE_HOVER #cb6c02
#define APP_ORANGE_CLICK #814400

#define HEADER_CSS_CLASS(_bgColor,_extras) { \
   padding: 2px; \
   background-color: _bgColor; \
   border-radius: 3pt; \
   color: white; \
   font-weight: bold; \
   font-size: small; \
   margin-bottom: 2pt; \
   padding: 3pt; \
   padding-left: 8pt; \
   _extras \
}

#endif // CSS_DEFS_H
