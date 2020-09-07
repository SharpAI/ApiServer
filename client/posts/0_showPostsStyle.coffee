#
# Created by Simba on 9/29/15.
#

postFontStyleDefault='font-size:large;';
postFontStyleNormal='font-size:large;';
postFontStyleQuota='font-size:15px;background:#F5F5F5;padding-left:3%;padding-right:3%;color:grey;';

@calcTextItemStyle = (layoutObj)->
  fontStyle = postFontStyleDefault
  alignStyle = 'text-align:left;'
  if layoutObj
    if layoutObj.font
      if layoutObj.font is 'normal'
        fontStyle=postFontStyleNormal
      else if layoutObj.font is 'quota'
        fontStyle=postFontStyleQuota
    if layoutObj.align
      if layoutObj.align is 'right'
        alignStyle = "text-align:right;"
      else if layoutObj.align is 'center'
        alignStyle = "text-align:center;"
    if layoutObj.weight
      alignStyle = "font-weight:"+layoutObj.weight+";"
  fontStyle+alignStyle