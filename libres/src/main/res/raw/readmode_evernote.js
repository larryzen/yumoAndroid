(function() {
var PREVIEW_UNINIT = -1;
var PREVIEW_NORMAL = 0;
var PREVIEW_WEB_SITE = 1;
var PREVIEW_WEB_CONTENT = 2;
var PREVIEW_SNAP_REGION = 3;
var PREVIEW_SELECT_CONTENT = 4;
var PREVIEW_SNAP_WHOLE_PAGE = 5;
var PREVIEW_CANCELED = 6;
var PREVIEW_SNAP_FINISHED = 7;
var PREVIEW_AFTER_SAVE_FROM_SNAP = 8;
var PREVIEW_ALREADY_SELECT = 9;
var PREVIEW_BY_PAGE_URL = 10;

var kMetaDescSelectors = [
        "meta[name=description]",
        "meta[name=Description]",
        "meta[name=DESCRIPTION]"];

var lang_map = {
        OK: '${note2!OK}$',
        Cancel: '${note2!Cancel}$',
        SelectContentTip: '${note2!SelectContentTip}$',
        SelectionDragTip: '${note2!SelectionDragTip}$',
        SourceWebSite: '${note2!SourceWebSite}$'
};

var preivew_obj = {},
    pre_action = -1,
    current_action = -1;

function getLang(key) {
    return lang_map[key] ? lang_map[key] : key;
}

function clearPreAction() {
    if (current_action < 0)
        return;
    preivew_obj[current_action].clear();
}

function beforePreview(type, object_func) {
    clearPreAction();
    current_action = type;

    if (!preivew_obj[current_action])
        preivew_obj[current_action] = object_func();
    preivew_obj[current_action].init();
}

function FormatPreviewContent(content) {
    if (current_action == PREVIEW_WEB_SITE) {
        var meta_ele, description = "";
        for (var i = 0, len = kMetaDescSelectors.length; i < len && !meta_ele; i++) {
            meta_ele = document.querySelector(kMetaDescSelectors[i]);
        }
        if (meta_ele) {
            description = meta_ele.getAttribute("content");
        }
        content = description.length > 0 ? "<p>" + description + "</p>\n" : "";
    }
    else{
        if (location.pathname.endsWith(".txt")) {
            if (content.startsWith("<pre>")) {
                content = content.substr(5, content.length - 11);
            }
            content = content.replace(/\n/g, "<br/>");
        }
    }
    return content;
}

function startPreview(content) {
}

function clearPreviewAction() {
    clearPreAction();
}

function WebSite() {
    function init() {
        startPreview('');
    }

    function nothing() {}
    return {
        init: init,
        clear: nothing
    }
}

function WebContent() {
    var MxJQuery = function(selector, context) {
        return new jquery(selector, context);
    }

    function jquery(selector, context) {
        this._elements = [];
        if (typeof arguments[0] === "string")
            this._elements = document.querySelectorAll(arguments[0]);
        else if (Object.prototype.toString.call(arguments[0]).indexOf("Array") >= 0)
            this._elements = arguments[0];
        else this._elements.push(arguments[0]);
    }

    jquery.prototype.find = function() {
        var eles = [],
            query = arguments[0],
            querys;
        if (query.indexOf(",") >= 0)
            querys = query.split(", ");
        this._elements.forEach(function(item) {
            if (querys)
                querys.forEach(function(q) {
                    var node_list = item.querySelectorAll(q);
                    for (var i=0;i<node_list.length;i++)
                        eles.push(node_list.item(i));
                });
            else {
                var node_list = item.querySelectorAll(query);
                for (var i=0;i<node_list.length;i++)
                    eles.push(node_list.item(i));
            }
        });
        return new MxJQuery(eles);
    }

    jquery.prototype.each = function() {
        var callback = arguments[0];
        this._elements.forEach(function(item, index) {
            callback(index, item);
        });
    }

    jquery.prototype.attr = function() {
        var key = arguments[0];
        if (arguments.length == 2) {
            value = arguments[1];
            this._elements.forEach(function(item) {
                item.setAttribute(key, value)
            });
        } else {
            if (this._elements[0] === undefined)
                return undefined;
            else
                return this._elements[0].getAttribute(key);
        }
    }

    jquery.prototype.css = function() {
        key = arguments[0];
        switch(arguments.length) {
        case 1:
            return this._elements[0].style[key]
        case 2:
            value = argumentsp[1];
            this._elements.forEach(function(item) {
                item.style[key] = value;
            });
            break;
        }
    }


    jquery.prototype.width = function() {
        if (arguments.length >= 1)
            this.css("width", arguments[0] + "px")
        else {
            var result = parseInt(this.css("width"));
            if (!result)
                result = this._elements[0].offsetWidth;
            return result;
        }
    }

    jquery.prototype.height = function() {
        if (arguments.length >= 1)
            this.css("height", arguments[0] + "px")
        else {
            var result = parseInt(this.css("height"));
            if (!result)
                result = this._elements[0].offsetHeight;
            return result;
        }
    }

    jquery.prototype.remove = function() {
        this._elements.forEach(function(item) {
            item.remove();
        });
    }

    jquery.prototype.append = function() {
        var value = arguments[0];
        if (typeof value == "string")
            this._elements.forEach(function(item) {
                item.innerHTML += value;
            });
        else
            this._elements.forEach(function(item) {
                item.appendChild(value);
            });
    }

    jquery.prototype.removeClass = function() {
        var value = arguments[0],
            values = value.indexOf(" ") >= 0 ? value.split(' ') : [value];
        this._elements.forEach(function(item) {
            values.forEach(function(class_name) {
                item.classList.remove(class_name);
            });
        });
        return this;
    }

    jquery.prototype.addClass = function() {
        var value = arguments[0],
            values = value.indexOf(" ") >= 0 ? value.split(' ') : [value];
        this._elements.forEach(function(item) {
            values.forEach(function(class_name) {
                item.classList.add(class_name);
            });
        });
        return this;
    }

    jquery.prototype.on = function() {
        this._elements.forEach(function(item) {
            item.addEventListener(arguments[0], arguments[1]);
        });
    }

    jquery.prototype.mouseup = function() {
        this._elements.forEach(function(item) {
            item.addEventListener("mouseup", arguments[0]);
        });
        return this;
    }

    jquery.prototype.mousedown = function() {
        this._elements.forEach(function(item) {
            item.addEventListener("mousedown", arguments[0]);
        });
    }

    MxJQuery.css = function() {
        return arguments[0].style[arguments[1]];
    }

    MxJQuery.map = function(elems, callback, arg) {
        var length, value,
            i = 0,
            ret = [];

        if ( Object.prototype.toString.call(elems).indexOf("Array") ) {
            length = elems.length;
            for ( ; i < length; i++ ) {
                value = callback( elems[ i ], i, arg );

                if ( value != null ) {
                    ret.push( value );
                }
            }

        } else {
            for ( i in elems ) {
                value = callback( elems[ i ], i, arg );

                if ( value != null ) {
                    ret.push( value );
                }
            }
        }
        return ret;
    }

    MxJQuery.contains = function(context, elem) {
        var adown = context.nodeType === 9 ? context.documentElement : context,
            bup = elem && elem.parentNode;
        return context === bup || !!( bup && bup.nodeType === 1 && (adown.contains( bup )))
    }

    function initClearlyComponent__detect(_paramInstance) {
        if (_paramInstance) {} else {
            return false;
        }
        var $D = _paramInstance;
        switch (true) {
        case(!($D.callbacks)) :
        case(!($D.callbacks.finished)) :
        case(!($D.window)) :
        case(!($D.window.document)) :
        case(!($D.window.document.body)) :
        case(!($D.jQuery)) :
            if ($D.debug) {
               /* console.log(!($D.callbacks));
                console.log(!($D.callbacks.finished));
                console.log(!($D.window));
                console.log(!($D.window.document));
                console.log(!($D.window.document.body));
                console.log(!($D.jQuery));*/
            }
            return false;
        }
        $D.document = $D.window.document;
        if ($D.settings) {} else {
            $D.settings = {};
        }
        var _default = function(_setting, _default_value) {
            if ($D.settings[_setting]) {} else {
                $D.settings[_setting] = _default_value;
            }
        };
        _default('articleTitleMarker__start', '<div id="articleHeader"><h1 id="articleHeader__title">');
        _default('articleTitleMarker__end', '</h1><div id="articleHeader__separator"></div><div></div></div>');
        var $ = $D.jQuery;
        /* $D.$window = $($D.window);*/
        $D.$document = $($D.document);
        $D.language = 'general';
        $D.domainName = $D.window.location.hostname;
        $D.domainNameIs__wikipedia = ($D.domainName.match(/wikipedia.org$/gi) != null);
        $D.domainNameIs__wsj = ($D.domainName.match(/wsj.com$/gi) != null);
        $D.parseOptions = {
            '_elements_ignore': '|button|input|select|textarea|optgroup|command|datalist|--|frame|frameset|noframes|--|style|link|script|noscript|--|canvas|applet|map|--|marquee|area|base|',
            '_elements_ignore_tag': '|form|fieldset|details|dir|--|center|font|',
            '_elements_container': '|body|--|article|section|--|div|--|td|--|li|--|dd|dt|',
            '_elements_self_closing': '|br|hr|--|img|--|col|--|source|--|embed|param|',
            '_elements_visible': '|article|section|--|ul|ol|li|dd|--|table|tr|td|--|div|--|p|--|h1|h2|h3|h4|h5|h6|--|span|',
            '_elements_too_much_content': '|b|i|em|strong|--|h1|h2|h3|h4|h5|--|td|',
            '_elements_link_density': '|div|--|table|ul|ol|--|section|aside|header|',
            '_elements_floating': '|div|--|table|',
            '_elements_above_target_ignore': '|br|--|ul|ol|dl|--|table|',
            '_elements_with_src': '|img|video|audio|source|embed|iframe|',
            '_unskippable_attribute': 'clearly__unskippable_element',
            '_unskippable_attribute_value': 'yes',
            '_use_document_title_attribute': 'clearly__use_document_title_as_article_title',
            '_use_document_title_attribute_value': 'yes',
            '_find_this_in_page_attribute': '',
            '_elements_keep_attributes': {
                'a': ['href', 'title', 'name'],
                'img': ['src', 'width', 'height', 'alt', 'title'],
                'video': ['src', 'width', 'height', 'poster', 'audio', 'preload', 'autoplay', 'loop', 'controls'],
                'audio': ['src', 'preload', 'autoplay', 'loop', 'controls'],
                'source': ['src', 'type'],
                'object': ['data', 'type', 'width', 'height', 'classid', 'codebase', 'codetype'],
                'param': ['name', 'value'],
                'embed': ['src', 'type', 'width', 'height', 'flashvars', 'allowscriptaccess', 'allowfullscreen', 'bgcolor'],
                'iframe': ['src', 'width', 'height', 'frameborder', 'scrolling'],
                'td': ['colspan', 'rowspan'],
                'th': ['colspan', 'rowspan']
            },
            '_skip_link_from_domain': ['doubleclick.net', 'fastclick.net', 'adbrite.com', 'adbureau.net', 'admob.com', 'bannersxchange.com', 'buysellads.com', 'impact-ad.jp', 'atdmt.com', 'advertising.com', 'serving-sys.com', 'itmedia.jp', 'microad.jp', 'adplan-ds.com'],
            '_skip_image_from_domain': ['googlesyndication.com', 'fastclick.net', '.2mdn.net', 'de17a.com', 'content.aimatch.com', 'bannersxchange.com', 'buysellads.com', 'atdmt.com', 'advertising.com', 'serving-sys.com', 'impact-ad.jp', 'itmedia.jp', 'microad.jp', 'adplan-ds.com'],
            '_keep_video_from_domain': ['youtube.com', 'youtube-nocookie.com', 'vimeo.com', 'hulu.com', 'flickr.com', 'yahoo.com', 'newsnetz.ch']
        };
        $D.debug = ($D.debug || false);
        $D.debugRemembered = {};
        $D.debugTimers = [];
        if ($D.debug) {
            switch (true) {
            case(!(!($D.window.console && $D.window.console.log))) : $D.logOneline = function(msg) {
                    $D.window.console.log(msg);
                };
                break;
            case (! (! ($D.window.opera && $D.window.opera.postError))) : $D.logOneline = function(msg) {
                    $D.window.opera.postError(msg);
                };
                break;
            default:
                $D.logOneline = function(msg) {};
                break;
            }
            $D.log = function() {
                if ($D.debug) {} else {
                    return;
                }
                for (var i = 0,
                il = arguments.length; i < il; i++) {
                    $D.logOneline(arguments[i]);
                }
                $D.logOneline('-----------------------------------------');
            };
            $D.debugRemember = function(_k, _v) {
                $D.debugRemembered[_k] = _v;
            };
            $D.debugOutline = function(_element, _category, _reason) {
                var _outline = '#ff5500',
                _background = 'rgba(255, 85, 0, 0.5)';
                switch (true) {
                case(!$D.debug) : case(!(_element.nodeType === 1)) : case(!(_element.tagName > '')) : case(_element.tagName.toLowerCase() == 'object') : case(_element.tagName.toLowerCase() == 'embed') : return;
                }
                switch (true) {
                case(_category == 'target' && _reason == 'first') : _outline = '#00cc00';
                    _background = 'rgba(0, 255, 0, 0.5)';
                    break;
                case (_category == 'target' && _reason == 'second') : _outline = '#0000cc';
                    _background = 'rgba(0, 0, 255, 0.5)';
                    break;
                case (_category == 'target' && _reason == 'next-page') : _outline = '#FF80C0';
                    _background = 'rgba(255, 128, 192, 0.5)';
                    break;
                case (_category == 'target' && _reason == 'add-above') : _outline = '#804000';
                    _background = 'rgba(128, 64, 0, 0.5)';
                    break;
                case (_category == 'clean-before' && _reason == 'floating') : _outline = '#808080';
                    _background = 'rgba(128, 128, 128, 0.5)';
                    break;
                case (_category == 'clean-after' && _reason == 'missing-density') : _outline = '#C0C0C0';
                    _background = 'rgba(192, 192, 192, 0.5)';
                    break;
                case (_category == 'clean-after' || _category == 'clean-before') : _outline = '#000000';
                    _background = 'rgba(0, 0, 0, 0.5)';
                    break;
                }
                $(_element).attr('readable__outline', (_category + ': ' + _reason));
                $(_element).css({
                    'outline': '5px solid ' + _outline,
                    'background-color': '' + _background
                });
            };
            $D.debugTimerStart = function(timerName) {
                $D.debugTimers.push({
                    'name': timerName,
                    'start': (new Date()).getTime()
                });
            };
            $D.debugTimerEnd = function() {
                var _t = $D.debugTimers.pop(),
                _time = ((new Date()).getTime() - _t.start);
                $D.log('TIMER / ' + _t.name + ': ' + _time);
                return _time;
            };
        } else {
            $D.logOneline = function() {
                return false;
            };
            $D.log = function() {
                return false;
            };
            $D.debugRemember = function() {
                return false;
            };
            $D.debugOutline = function() {
                return false;
            };
            $D.debugTimerStart = function() {
                return false;
            };
            $D.debugTimerEnd = function() {
                return false;
            };
        }
        $D.escape_html = function(_string) {
            var _replace = {
                "&": "amp",
                '"': "quot",
                "<": "lt",
                ">": "gt"
            };
            return ((_string && _string.replace) ? _string.replace(/[&"<>]/g,
            function(_match) {
                return ("&" + _replace[_match] + ";");
            }) : '');
        };
        $D.rand = function(_min, _max) {
            return (Math.floor(Math.random() * (_max - _min + 1)) + _min);
        };
        $D.detectLanguage = function() {
            var _text = $D.document.title;
            var _add_text = function(_elements) {
                if (_text.length > 500) {
                    return;
                }
                for (var _l = _elements.length,
                _i = 0,
                _ii = Math.min(5, _l); _i < _ii; _i++) {
                    _text += ' ' + _elements[$D.rand(1, _l) - 1].innerHTML.replace(/<([^>]+?)>/gi, '').replace(/([ \n\r\t]+)/gi, ' ').substr(0, 150);
                }
            };
            var _paragraphs = $D.document.getElementsByTagName('p'),
            _spans = $D.document.getElementsByTagName('span'),
            _divs = $D.document.getElementsByTagName('div'),
            _body = [$D.document.body];
            var _divs2 = [];
            for (var _i = 0,
            _ii = _divs.length; _i < _ii; _i++) {
                if (_divs[_i].id && _divs[_i].id.indexOf && _divs[_i].id.indexOf('evernote_clearly__') === 0) {} else {
                    _divs2.push(_divs[_i]);
                }
            }
            _divs = _divs2;
            _add_text(_paragraphs);
            _add_text(_spans);
            _add_text(_divs);
            _add_text(_body);
            switch (true) {
            case(_text.match(/([\u3000])/gi) != null) : case(_text.match(/([\u3001])/gi) != null) : case(_text.match(/([\u3002])/gi) != null) : case(_text.match(/([\u301C])/gi) != null) : $D.language = 'cjk';
                break;
            }
        };
        $D.rtl = false;
        $D.maybeRTL = false;
        $D.makeRTL = function() {
            $D.rtl = true;
        };
        $D.makeNotRTL = function() {
            $D.rtl = false;
        }; (function() {
            $D.$document.find('html, body').each(function(_i, _e) {
                switch (true) {
                case($(_e).attr('dir') == 'rtl') : case($(_e).css('direction') == 'rtl') : case($(_e).attr('lang') == 'he') : case($(_e).attr('lang') == 'he-il') : case($(_e).attr('lang') == 'ar') : case($(_e).attr('lang') == 'ur') : $D.makeRTL();
                    return false;
                }
                return false;
            });
            if ((!$D.rtl) && ($D.$document.find("div[dir='rtl'], table[dir='rtl'], td[dir='rtl']").length > 0)) {
                $D.maybeRTL = true;
            }
            return false;
        })();
        $D.measureText__getTextLength = function(_the_text) {
            var _text = _the_text;
            _text = _text.replace(/[\s\n\r]+/gi, '');
            return _text.length;
        };
        $D.measureText__getWordCount = function(_the_text) {
            var _text = _the_text;
            _text = _text.replace(/[\s\n\r]+/gi, ' ');
            _text = _text.replace(/([.,?!:;()\[\]'""-])/gi, ' $1 ');
            _text = _text.replace(/([\u3000])/gi, '[=words(1)]');
            _text = _text.replace(/([\u3001])/gi, '[=words(2)]');
            _text = _text.replace(/([\u3002])/gi, '[=words(4)]');
            _text = _text.replace(/([\u301C])/gi, '[=words(2)]');
            _text = _text.replace(/([\u2026|\u2025])/gi, '[=words(2)]');
            _text = _text.replace(/([\u30FB\uFF65])/gi, '[=words(1)]');
            _text = _text.replace(/([\u300C\u300D])/gi, '[=words(1)]');
            _text = _text.replace(/([\u300E\u300F])/gi, '[=words(1)]');
            _text = _text.replace(/([\u3014\u3015])/gi, '[=words(1)]');
            _text = _text.replace(/([\u3008\u3009])/gi, '[=words(1)]');
            _text = _text.replace(/([\u300A\u300B])/gi, '[=words(1)]');
            _text = _text.replace(/([\u3010\u3011])/gi, '[=words(1)]');
            _text = _text.replace(/([\u3016\u3017])/gi, '[=words(1)]');
            _text = _text.replace(/([\u3018\u3019])/gi, '[=words(1)]');
            _text = _text.replace(/([\u301A\u301B])/gi, '[=words(1)]');
            _text = _text.replace(/([\u301D\u301E\u301F])/gi, '[=words(1)]');
            _text = _text.replace(/([\u30A0])/gi, '[=words(1)]');
            var _count = 0,
            _words_match = _text.match(/([^\s\d]{3,})/gi);
            _count += ((_words_match != null) ? _words_match.length: 0);
            _text.replace(/\[=words\((\d)\)\]/,
            function(_match, _plus) {
                _count += (5 * parseInt(_plus, 10));
            });
            return _count;
        };
        $D.levenshteinDistance = function(str1, str2) {
            var l1 = str1.length,
            l2 = str2.length,
            i = 0,
            j = 0,
            d = [];
            if (Math.min(l1, l2) === 0) {
                return Math.max(l1, l2);
            }
            for (i = 0; i <= l1; i++) {
                d[i] = [];
                d[i][0] = i;
            }
            for (j = 0; j <= l2; j++) {
                d[0][j] = j;
            }
            for (i = 1; i <= l1; i++) {
                for (j = 1; j <= l2; j++) {
                    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1));
                }
            }
            return d[l1][l2];
        };
        $D.nextPage__getFirstFragment = function(_html) {
            _html = _html.replace(/<[^>]+?>/gi, '');
            _html = _html.replace(/\s+/gi, ' ');
            return _html.substr(0, 2000);
        };
        $D.isNodeHidden = function(_node, _tag_name) {
            if (_tag_name == 'span') {
                return false;
            }
            switch (true) {
            case(_node.offsetWidth > 0) : case(_node.offsetHeight > 0) : break;
            default:
                switch (true) {
                case(_node.offsetLeft > 0) : case(_node.offsetTop > 0) : break;
                default:
                    if ((_tag_name == 'div') && ((_node.style.display || $.css(_node, "display")) == 'inline')) {
                        break;
                    }
                    return true;
                }
                break;
            }
            return false;
        };
        $D.getContent__computePointsForCandidate__do = function(_ratio_remaining, _power, _ratio, _points_history) {
            var _points_remaining = (_points_history[0] * _ratio_remaining),
            _points_to_compute = (_points_history[0] - _points_remaining);
            if (_ratio < 0) {
                _points_return = _points_remaining;
            } else {
                _points_return = 0 + _points_remaining + (_points_to_compute * Math.pow(_ratio, _power));
            }
            _points_history.unshift(_points_return);
        };
        $D.getContent__computeDetailsForCandidate__first = function(_e, _main) {
            var _r = {};
            if (_e._is__bad) {
                return _r;
            }
            _r['_count__lines_of_65_characters'] = (_e._length__plain_text / 65);
            _r['_count__paragraphs_of_3_lines'] = (_r._count__lines_of_65_characters / 3);
            _r['_count__paragraphs_of_5_lines'] = (_r._count__lines_of_65_characters / 5);
            _r['_count__paragraphs_of_50_words'] = (_e._count__plain_words / 50);
            _r['_count__paragraphs_of_80_words'] = (_e._count__plain_words / 80);
            _r['_ratio__length__plain_text_to_total_plain_text'] = (_e._length__plain_text / _main._length__plain_text);
            _r['_ratio__count__plain_words_to_total_plain_words'] = (_e._count__plain_words / _main._count__plain_words);
            _r['_ratio__length__links_text_to_plain_text'] = (_e._length__links_text / _e._length__plain_text);
            _r['_ratio__count__links_words_to_plain_words'] = (_e._count__links_words / _e._count__plain_words);
            _r['_ratio__length__links_text_to_all_text'] = (_e._length__links_text / _e._length__all_text);
            _r['_ratio__count__links_words_to_all_words'] = (_e._count__links_words / _e._count__all_words);
            _r['_ratio__length__links_text_to_total_links_text'] = (_e._length__links_text / (_main._length__links_text + 1));
            _r['_ratio__count__links_words_to_total_links_words'] = (_e._count__links_words / (_main._count__links_words + 1));
            _r['_ratio__count__links_to_total_links'] = (_e._count__links / (_main._count__links + 1));
            _r['_ratio__count__links_to_plain_words'] = ((_e._count__links * 2) / _e._count__plain_words);
            var _divide__candidates = Math.max(2, Math.ceil(_e._count__above_candidates * 0.5)),
            _above_text = (((_e._length__above_plain_text * 1) + (_e._length__above_plain_text / _divide__candidates)) / 2),
            _above_words = (((_e._count__above_plain_words * 1) + (_e._count__above_plain_words / _divide__candidates)) / 2);
            _r['_ratio__length__above_plain_text_to_total_plain_text'] = (_above_text / _main._length__plain_text);
            _r['_ratio__count__above_plain_words_to_total_plain_words'] = (_above_words / _main._count__plain_words);
            _r['_ratio__count__candidates_to_total_candidates'] = (_e._count__candidates / (_main._count__candidates + 1));
            _r['_ratio__count__containers_to_total_containers'] = (_e._count__containers / (_main._count__containers + 1));
            return _r;
        };
        $D.getContent__computePointsForCandidate__first = function(_e, _main) {
            var _details = _e.__candidate_details,
            _points_history = [],
            _really_big = ((_main._length__plain_text / 65) > 250);
            if (_e._is__bad) {
                return [0];
            }
            _points_history.unshift(((0 + (_details._count__paragraphs_of_3_lines) + (_details._count__paragraphs_of_5_lines * 1.5) + (_details._count__paragraphs_of_50_words) + (_details._count__paragraphs_of_80_words * 1.5) + (_e._count__images_large * 3) - ((_e._count__images_skip + _e._count__images_small) * 0.5)) * 1000));
            if (_points_history[0] < 0) {
                return [0];
            }
            var _divide__pieces = Math.max(5, Math.ceil(_e._count__pieces * 0.25)),
            _divide__candidates = Math.max(5, Math.ceil(_e._count__candidates * 0.25)),
            _divide__containers = Math.max(10, Math.ceil(_e._count__containers * 0.25));
            _points_history.unshift(((0 + (_points_history[0] * 3) + (_points_history[0] / _divide__pieces) + (_points_history[0] / _divide__candidates) + (_points_history[0] / _divide__containers)) / 6));
            $D.getContent__computePointsForCandidate__do(0.10, 2, (1 - (1 - _details._ratio__length__plain_text_to_total_plain_text)), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 2, (1 - (1 - _details._ratio__count__plain_words_to_total_plain_words)), _points_history);
            if (_really_big) {
                $D.getContent__computePointsForCandidate__do(0.10, 4, (1 - (1 - _details._ratio__length__plain_text_to_total_plain_text)), _points_history);
                $D.getContent__computePointsForCandidate__do(0.10, 4, (1 - (1 - _details._ratio__count__plain_words_to_total_plain_words)), _points_history);
            }
            $D.getContent__computePointsForCandidate__do(0.10, 5, (1 - _details._ratio__length__above_plain_text_to_total_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 5, (1 - _details._ratio__count__above_plain_words_to_total_plain_words), _points_history);
            if (_really_big) {
                $D.getContent__computePointsForCandidate__do(0.10, 10, (1 - _details._ratio__length__above_plain_text_to_total_plain_text), _points_history);
                $D.getContent__computePointsForCandidate__do(0.10, 10, (1 - _details._ratio__count__above_plain_words_to_total_plain_words), _points_history);
            }
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__length__links_text_to_total_links_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__links_words_to_total_links_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__links_to_total_links), _points_history);
            var __lr = ($D.language == 'cjk' ? 0.75 : 0.50);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__length__links_text_to_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_words_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__length__links_text_to_all_text), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_words_to_all_words), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__candidates_to_total_candidates), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__containers_to_total_containers), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details._ratio__count__pieces_to_total_pieces), _points_history);
            return _points_history;
        };
        $D.getContent__processCandidates__first = function(_candidatesToProcess) {
            var _candidates = _candidatesToProcess;
            _candidates.sort(function(a, b) {
                switch (true) {
                case(a.__index < b.__index) : return - 1;
                case(a.__index > b.__index) : return 1;
                default:
                    return 0;
                }
            });
            var _main = _candidates[0];
            if ($D.debug) {
                $D.log('should be body', _main, _main.__node);
            }
            for (var i = 0,
            _i = _candidates.length; i < _i; i++) {
                var _count__pieces = 0,
                _array__pieces = [];
                for (var k = i,
                _k = _candidates.length; k < _k; k++) {
                    if (_candidates[k]._count__candidates > 0) {
                        continue;
                    }
                    if ($.contains(_candidates[i].__node, _candidates[k].__node)) {} else {
                        continue;
                    }
                    if ($D.debug) {
                        _array__pieces.push(_candidates[k]);
                    }
                    _count__pieces++;
                }
                _candidates[i]['__candidate_details'] = $D.getContent__computeDetailsForCandidate__first(_candidates[i], _main);
                _candidates[i]['_count__pieces'] = _count__pieces;
                _candidates[i]['_array__pieces'] = _array__pieces;
                _candidates[i]['__candidate_details']['_ratio__count__pieces_to_total_pieces'] = (_count__pieces / (_candidates[0]._count__pieces + 1));
                _candidates[i].__points_history = $D.getContent__computePointsForCandidate__first(_candidates[i], _main);
                _candidates[i].__points = _candidates[i].__points_history[0];
            }
            _candidates.sort(function(a, b) {
                switch (true) {
                case(a.__points > b.__points) : return - 1;
                case(a.__points < b.__points) : return 1;
                default:
                    return 0;
                }
            });
            return _candidates;
        };
        $D.getContent__computePointsForCandidate__second = function(_e, _main) {
            var _details = _e.__candidate_details,
            _details_second = _e.__candidate_details_second,
            _points_history = [];
            if (_e._is__bad) {
                return [0];
            }
            _points_history.unshift(_e.__points_history[(_e.__points_history.length - 1)]);
            var _divide__pieces = Math.max(5, Math.ceil(_e._count__pieces * 0.25)),
            _divide__candidates = Math.max(5, Math.ceil(_e._count__candidates * 0.25)),
            _divide__containers = Math.max(10, Math.ceil(_e._count__containers * 0.25));
            _points_history.unshift(((0 + (_points_history[0] * 3) + ((_points_history[0] / _divide__pieces) * 2) + ((_points_history[0] / _divide__candidates) * 2) + ((_points_history[0] / _divide__containers) * 2)) / 9));
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - (1 - _details_second._ratio__length__plain_text_to_total_plain_text)), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - (1 - _details_second._ratio__count__plain_words_to_total_plain_words)), _points_history);
            var __ar = ($D.language == 'cjk' ? 0.50 : 0.10);
            $D.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__length__above_plain_text_to_total_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__count__above_plain_words_to_total_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__length__above_plain_text_to_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(__ar, 1, (1 - _details_second._ratio__count__above_plain_words_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details_second._ratio__count__links_to_total_links), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details_second._ratio__length__links_text_to_total_links_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - _details_second._ratio__count__links_words_to_total_links_words), _points_history);
            var __lr = ($D.language == 'cjk' ? 0.75 : 0.50);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__length__links_text_to_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details._ratio__count__links_words_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details_second._ratio__length__links_text_to_all_text), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details_second._ratio__count__links_words_to_all_words), _points_history);
            $D.getContent__computePointsForCandidate__do(__lr, 1, (1 - _details_second._ratio__count__links_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 2, (1 - _details_second._ratio__count__candidates_to_total_candidates), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 2, (1 - _details_second._ratio__count__containers_to_total_containers), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 2, (1 - _details_second._ratio__count__pieces_to_total_pieces), _points_history);
            return _points_history;
        };
        $D.getContent__computeDetailsForCandidate__second = function(_e, _main) {
            var _r = {};
            if (_e._is__bad) {
                return _r;
            }
            _r['_ratio__length__plain_text_to_total_plain_text'] = (_e._length__plain_text / _main._length__plain_text);
            _r['_ratio__count__plain_words_to_total_plain_words'] = (_e._count__plain_words / _main._count__plain_words);
            _r['_ratio__length__links_text_to_all_text'] = (_e._length__links_text / _e._length__all_text);
            _r['_ratio__count__links_words_to_all_words'] = (_e._count__links_words / _e._count__all_words);
            _r['_ratio__length__links_text_to_total_links_text'] = (_e._length__links_text / (_main._length__links_text + 1));
            _r['_ratio__count__links_words_to_total_links_words'] = (_e._count__links_words / (_main._count__links_words + 1));
            _r['_ratio__count__links_to_total_links'] = (_e._count__links / (_main._count__links + 1));
            _r['_ratio__count__links_to_plain_words'] = ((_e._count__links * 2) / _e._count__plain_words);
            var _divide__candidates = Math.max(2, Math.ceil((_e._count__above_candidates - _main._count__above_candidates) * 0.5)),
            _above_text = (((_e.__second_length__above_plain_text * 1) + (_e.__second_length__above_plain_text / _divide__candidates)) / 2),
            _above_words = (((_e.__second_count__above_plain_words * 1) + (_e.__second_count__above_plain_words / _divide__candidates)) / 2);
            _r['_ratio__length__above_plain_text_to_total_plain_text'] = (_above_text / _main._length__plain_text);
            _r['_ratio__count__above_plain_words_to_total_plain_words'] = (_above_words / _main._count__plain_words);
            _r['_ratio__length__above_plain_text_to_plain_text'] = (_above_text / _e._length__plain_text);
            _r['_ratio__count__above_plain_words_to_plain_words'] = (_above_words / _e._count__plain_words);
            _r['_ratio__count__candidates_to_total_candidates'] = (Math.max(0, (_e._count__candidates - (_main._count__candidates * 0.25))) / (_main._count__candidates + 1));
            _r['_ratio__count__containers_to_total_containers'] = (Math.max(0, (_e._count__containers - (_main._count__containers * 0.25))) / (_main._count__containers + 1));
            _r['_ratio__count__pieces_to_total_pieces'] = (Math.max(0, (_e._count__pieces - (_main._count__pieces * 0.25))) / (_main._count__pieces + 1));
            return _r;
        };
        $D.getContent__processCandidates__second = function(_processedCandidates) {
            var _candidates = _processedCandidates,
            _main = _candidates[0];
            _candidates = $.map(_candidates,
            function(_element, _index) {
                switch (true) {
                case(!(_index > 0)) : case(!($.contains(_main.__node, _element.__node))) : return null;
                default:
                    return _element;
                }
            });
            _candidates.unshift(_main);
            _candidates.sort(function(a, b) {
                switch (true) {
                case(a.__index < b.__index) : return - 1;
                case(a.__index > b.__index) : return 1;
                default:
                    return 0;
                }
            });
            for (var i = 0,
            _i = _candidates.length; i < _i; i++) {
                _candidates[i].__second_length__above_plain_text = (_candidates[i]._length__above_plain_text - _main._length__above_plain_text);
                _candidates[i].__second_count__above_plain_words = (_candidates[i]._count__above_plain_words - _main._count__above_plain_words);
                _candidates[i]['__candidate_details_second'] = $D.getContent__computeDetailsForCandidate__second(_candidates[i], _main);
                _candidates[i].__points_history_second = $D.getContent__computePointsForCandidate__second(_candidates[i], _main);
                _candidates[i].__points_second = _candidates[i].__points_history_second[0];
            }
            _candidates.sort(function(a, b) {
                switch (true) {
                case(a.__points_second > b.__points_second) : return - 1;
                case(a.__points_second < b.__points_second) : return 1;
                default:
                    return 0;
                }
            });
            return _candidates;
        };
        $D.getContent__computePointsForCandidate__third = function(_e, _main) {
            var _details = _e.__candidate_details,
            _details_second = _e.__candidate_details_second,
            _points_history = [];
            if (_e._is__bad) {
                return [0];
            }
            _points_history.unshift(_e.__points_history[(_e.__points_history.length - 1)]);
            var _divide__pieces = Math.max(2, Math.ceil(_e._count__pieces * 0.25)),
            _divide__candidates = Math.max(2, Math.ceil(_e._count__candidates * 0.25)),
            _divide__containers = Math.max(4, Math.ceil(_e._count__containers * 0.25));
            _points_history.unshift(((0 + (_points_history[0] * 3) + ((_points_history[0] / _divide__pieces) * 2) + ((_points_history[0] / _divide__candidates) * 2) + ((_points_history[0] / _divide__containers) * 2)) / 9));
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - (1 - _details_second._ratio__length__plain_text_to_total_plain_text)), _points_history);
            $D.getContent__computePointsForCandidate__do(0.75, 1, (1 - (1 - _details_second._ratio__count__plain_words_to_total_plain_words)), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__length__above_plain_text_to_total_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__above_plain_words_to_total_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__length__above_plain_text_to_total_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__count__above_plain_words_to_total_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__length__above_plain_text_to_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.10, 1, (1 - _details_second._ratio__count__above_plain_words_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__length__links_text_to_all_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__links_words_to_all_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__length__links_text_to_plain_text), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__links_words_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__links_to_plain_words), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__candidates_to_total_candidates), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__containers_to_total_containers), _points_history);
            $D.getContent__computePointsForCandidate__do(0.50, 1, (1 - _details._ratio__count__pieces_to_total_pieces), _points_history);
            return _points_history;
        };
        $D.getContent__exploreNodeAndGetStuff = function(_nodeToExplore, _justExploring) {
            var _global__element_index = 0,
            _global__inside_link = false,
            _global__inside_link__element_index = 0,
            _global__length__above_plain_text = 0,
            _global__count__above_plain_words = 0,
            _global__length__above_links_text = 0,
            _global__count__above_links_words = 0,
            _global__count__above_candidates = 0,
            _global__count__above_containers = 0,
            _global__above__plain_text = '',
            _global__above__links_text = '',
            _return__containers = [],
            _return__candidates = [],
            _return__links = [];
            var _recursive = function(_node) {
                _global__element_index++;
                var _tag_name = (_node.nodeType === 3 ? '#text': ((_node.nodeType === 1 && _node.tagName && _node.tagName > '') ? _node.tagName.toLowerCase() : '#invalid')),
                _result = {
                    '__index': _global__element_index,
                    '__node': _node,
                    '_is__container': ($D.parseOptions._elements_container.indexOf('|' + _tag_name + '|') > -1),
                    '_is__candidate': false,
                    '_is__text': false,
                    '_is__link': false,
                    '_is__link_skip': false,
                    '_is__image_small': false,
                    '_is__image_medium': false,
                    '_is__image_large': false,
                    '_is__image_skip': false,
                    '_is__unskippable': false,
                    '_debug__above__plain_text': _global__above__plain_text,
                    '_debug__above__links_text': _global__above__links_text,
                    '_length__above_plain_text': _global__length__above_plain_text,
                    '_count__above_plain_words': _global__count__above_plain_words,
                    '_length__above_links_text': _global__length__above_links_text,
                    '_count__above_links_words': _global__count__above_links_words,
                    '_length__above_all_text': (_global__length__above_plain_text + _global__length__above_links_text),
                    '_count__above_all_words': (_global__count__above_plain_words + _global__count__above_links_words),
                    '_count__above_candidates': _global__count__above_candidates,
                    '_count__above_containers': _global__count__above_containers,
                    '_length__plain_text': 0,
                    '_count__plain_words': 0,
                    '_length__links_text': 0,
                    '_count__links_words': 0,
                    '_length__all_text': 0,
                    '_count__all_words': 0,
                    '_count__containers': 0,
                    '_count__candidates': 0,
                    '_count__links': 0,
                    '_count__links_skip': 0,
                    '_count__images_small': 0,
                    '_count__images_medium': 0,
                    '_count__images_large': 0,
                    '_count__images_skip': 0
                };
                if (((_result._is__container) || ($D.parseOptions._elements_self_closing.indexOf('|' + _tag_name + '|') > -1))) {
                    var _unskip = _node.getAttribute($D.parseOptions._unskippable_attribute);
                    if (_unskip == $D.parseOptions._unskippable_attribute_value) {
                        _result._is__unskippable = true;
                    }
                }
                switch (true) {
                case((_tag_name == '#invalid')) : case(($D.parseOptions._elements_ignore.indexOf('|' + _tag_name + '|') > -1)) : return false;
                case(($D.parseOptions._elements_visible.indexOf('|' + _tag_name + '|') > -1)) : if ($D.isNodeHidden(_node, _tag_name)) {
                        return false;
                    }
                    break;
                case ($D.parseOptions._elements_self_closing.indexOf('|' + _tag_name + '|') > -1) : switch (true) {
                    case((_tag_name == 'img')) : break;
                    default:
                        return false;
                    }
                    break;
                }
                switch (true) {
                case((_tag_name == '#text')) : _result._is__text = true;
                    var _nodeText = _node.nodeValue;
                    _result._length__plain_text = $D.measureText__getTextLength(_nodeText);
                    _result._count__plain_words = $D.measureText__getWordCount(_nodeText);
                    if (_global__inside_link) {
                        _global__length__above_links_text += _result._length__plain_text;
                        _global__count__above_links_words += _result._count__plain_words;
                        if (false && $D.debug) {
                            _global__above__links_text += ' ' + _nodeText;
                        }
                    } else {
                        _global__length__above_plain_text += _result._length__plain_text;
                        _global__count__above_plain_words += _result._count__plain_words;
                        if (false && $D.debug) {
                            _global__above__plain_text += ' ' + _nodeText;
                        }
                    }
                    return _result;
                case(_tag_name == 'a') : var _href = _node.href;
                    if (_href > '') {} else {
                        break;
                    }
                    if (_href.indexOf) {} else {
                        break;
                    }
                    _result._is__link = true;
                    for (var i = 0,
                    _i = $D.parseOptions._skip_link_from_domain.length; i < _i; i++) {
                        if (_node.href.indexOf($D.parseOptions._skip_link_from_domain[i]) > -1) {
                            _result._is__link_skip = true;
                            break;
                        }
                    }
                    if (_global__inside_link) {} else {
                        _global__inside_link = true;
                        _global__inside_link__element_index = _result.__index;
                    }
                    _return__links.push(_result);
                    break;
                case (_tag_name == 'img') :
                    if (_node.currentSrc) {
                        _node.src = _node.currentSrc;
                    }
                    if (_node.src && _node.src.indexOf) {
                        for (var i = 0,
                        _i = $D.parseOptions._skip_image_from_domain.length; i < _i; i++) {
                            if (_node.src.indexOf($D.parseOptions._skip_image_from_domain[i]) > -1) {
                                _result._is__image_skip = true;
                                break;
                            }
                        }
                    }
                    var _width = $(_node).width(),
                    _height = $(_node).height();
                    switch (true) {
                    case((_width * _height) >= 50000) : case((_width >= 350) && (_height >= 75)) : _result._is__image_large = true;
                        break;
                    case ((_width * _height) >= 20000) : case((_width >= 150) && (_height >= 150)) : _result._is__image_medium = true;
                        break;
                    case ((_width <= 5) && (_height <= 5)) : _result._is__image_skip = true;
                        break;
                    default:
                        _result._is__image_small = true;
                        break;
                    }
                    break;
                }
                for (var i = 0, _i = _node.childNodes.length; i < _i; i++) {
                    var _child = _node.childNodes[i],
                    _child_result = _recursive(_child);
                    if (_child_result) {} else {
                        continue;
                    }
                    _result._count__links += _child_result._count__links + (_child_result._is__link ? 1 : 0);
                    _result._count__links_skip += _child_result._count__links_skip + (_child_result._is__link_skip ? 1 : 0);
                    _result._count__images_small += _child_result._count__images_small + (_child_result._is__image_small ? 1 : 0);
                    _result._count__images_medium += _child_result._count__images_medium + (_child_result._is__image_medium ? 1 : 0);
                    _result._count__images_large += _child_result._count__images_large + (_child_result._is__image_large ? 1 : 0);
                    _result._count__images_skip += _child_result._count__images_skip + (_child_result._is__image_skip ? 1 : 0);
                    _result._count__containers += _child_result._count__containers + (_child_result._is__container ? 1 : 0);
                    _result._count__candidates += _child_result._count__candidates + (_child_result._is__candidate ? 1 : 0);
                    _result._length__all_text += _child_result._length__plain_text + _child_result._length__links_text;
                    _result._count__all_words += _child_result._count__plain_words + _child_result._count__links_words;
                    switch (true) {
                    case(_child_result._is__link):
                        _result._length__links_text += (_child_result._length__plain_text + _child_result._length__links_text);
                        _result._count__links_words += (_child_result._count__plain_words + _child_result._count__links_words);
                        break;
                    default:
                        _result._length__plain_text += _child_result._length__plain_text;
                        _result._count__plain_words += _child_result._count__plain_words;
                        _result._length__links_text += _child_result._length__links_text;
                        _result._count__links_words += _child_result._count__links_words;
                        break;
                    }
                }
                if ((_result._is__link) && (_global__inside_link__element_index == _result.__index)) {
                    _global__inside_link = false;
                    _global__inside_link__element_index = 0;
                }
                if (_result._is__container || ((_result.__index == 1) && (_justExploring == true))) {
                    _return__containers.push(_result);
                    if (_result._is__container) {
                        _global__count__above_containers++;
                    }
                    if (_justExploring) {} else {
                        switch (true) {
                        case(($D.language != 'cjk') && ((_result._count__links * 2) >= _result._count__plain_words)) : case(($D.language != 'cjk') && (_result._length__plain_text < (65 / 3))) : case(($D.language != 'cjk') && (_result._count__plain_words < 5)) : case(($D.language == 'cjk') && (_result._length__plain_text < 10)) : case(($D.language == 'cjk') && (_result._count__plain_words < 2)) : break;
                        default:
                            _result._is__candidate = true;
                            _return__candidates.push(_result);
                            _global__count__above_candidates++;
                            break;
                        }
                        if ((_result.__index == 1) && !(_result._is__candidate)) {
                            _result._is__candidate = true;
                            _result._is__bad = true;
                            _return__candidates.push(_result);
                        }
                    }
                }
                return _result;
            };
            _recursive(_nodeToExplore);
            if (_justExploring) {
                return _return__containers.pop();
            }
            return {
                '_containers': _return__containers,
                '_candidates': _return__candidates,
                '_links': _return__links
            };
        };
        $D.getContent__buildHTMLForNode = function(_nodeToBuildHTMLFor, _custom_mode) {
            var _global__element_index = 0,
            _global__the_html = '',
            _global__exploreNodeToBuildHTMLFor = $D.getContent__exploreNodeAndGetStuff(_nodeToBuildHTMLFor, true);
            switch (_custom_mode) {
            case 'above-the-target':
                _global__exploreNodeToBuildHTMLFor = false;
                break;
            }
            var _recursive = function(_node) {
                _global__element_index++;
                var _explored = false,
                _tag_name = (_node.nodeType === 3 ? '#text': ((_node.nodeType === 1 && _node.tagName && _node.tagName > '') ? _node.tagName.toLowerCase() : '#invalid')),
                _pos__start__before = 0,
                _pos__start__after = 0,
                _pos__end__before = 0,
                _pos__end__after = 0;
                switch (true) {
                case((_tag_name == '#invalid')) : case(($D.parseOptions._elements_ignore.indexOf('|' + _tag_name + '|') > -1)) : return;
                case (_tag_name == '#text') : _global__the_html += _node.nodeValue.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
                    return;
                }
                if (($D.parseOptions._elements_visible.indexOf('|' + _tag_name + '|') > -1) && $D.isNodeHidden(_node, _tag_name)) {
                    return;
                }
                switch (_tag_name) {
                case('object'):
                case('embed'):
                case('iframe'):
                    var _src = (_tag_name == 'object' ? $(_node).find("param[name='movie']").attr('value') : $(_node).attr('src')),
                    _skip = ((_src > '') ? false: true);
                    if (_skip) {} else {
                        _skip = true;
                        for (var i = 0,
                        _i = $D.parseOptions._keep_video_from_domain.length; i < _i; i++) {
                            if (_src.indexOf($D.parseOptions._keep_video_from_domain[i]) > -1) {
                                _skip = false;
                                break;
                            }
                        }
                    }
                    if (_skip) {
                        _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                        if (_explored && _explored._is__unskippable) {} else {
                            $D.debugOutline(_node, 'clean-before', 'object-embed-iframe');
                            return;
                        }
                    }
                    break;
                }
                if (_tag_name == 'a' || _tag_name == 'li') {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        switch (true) {
                        case(_explored._is__link_skip):
                        case(((_explored._count__images_small + _explored._count__images_skip) > 0) && (_explored._length__plain_text < 65)) :
                            $D.debugOutline(_node, 'clean-before', 'skip-link');
                            return;
                        }
                    }
                }
                if ($D.parseOptions._elements_link_density.indexOf('|' + _tag_name + '|') > -1) {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        switch (true) {
                        case(_explored._length__plain_text > (65 * 3 * 2)) : case($D.language == 'cjk' && (_explored._length__plain_text > (65 * 3 * 1))) : case(!(_explored._count__links > 1)) : case(_global__exploreNodeToBuildHTMLFor && (_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.5) : case(_global__exploreNodeToBuildHTMLFor && (_explored._count__plain_words / _global__exploreNodeToBuildHTMLFor._count__plain_words) > 0.5) : case((_explored._length__plain_text == 0) && (_explored._count__links == 1) && (_explored._length__links_text < 65)) : case((_explored._length__plain_text < 25) && ((_explored._count__images_large + _explored._count__images_medium) > 0)) : break;
                        case ((_explored._length__links_text / _explored._length__all_text) < 0.5) : if (_explored._count__links > 0) {} else {
                                break;
                            }
                            if (_explored._count__links_skip > 0) {} else {
                                break;
                            }
                            if (((_explored._count__links_skip / _explored._count__links) > 0.25) && (_explored._length__links_text / _explored._length__all_text) < 0.05) {
                                break;
                            }
                        default:
                            $D.debugOutline(_node, 'clean-before', 'link-density');
                            return;
                        }
                    }
                }
                if ($D.parseOptions._elements_floating.indexOf('|' + _tag_name + '|') > -1) {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        switch (true) {
                        case(_explored._length__plain_text > (65 * 3 * 2)) : case($D.language == 'cjk' && (_explored._length__plain_text > (65 * 3 * 1))) : case(_global__exploreNodeToBuildHTMLFor && (_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.25) : case(_global__exploreNodeToBuildHTMLFor && (_explored._count__plain_words / _global__exploreNodeToBuildHTMLFor._count__plain_words) > 0.25) : case((_explored._length__plain_text < 25) && (_explored._length__links_text < 25) && ((_explored._count__images_large + _explored._count__images_medium) > 0)) : case(_node.getElementsByTagName && (_explored._length__plain_text < (65 * 3 * 1)) && ((_node.getElementsByTagName('h1').length + _node.getElementsByTagName('h2').length + _node.getElementsByTagName('h3').length + _node.getElementsByTagName('h4').length) > 0)) : break;
                        default:
                            var _float = $(_node).css('float');
                            if (_float == 'left' || _float == 'right') {} else {
                                break;
                            }
                            if ((_explored._length__links_text == 0) && ((_explored._count__images_large + _explored._count__images_medium) > 0)) {
                                break;
                            }
                            $D.debugOutline(_node, 'clean-before', 'floating');
                            return;
                        }
                    }
                }
                if (_custom_mode == 'above-the-target') {
                    if ($D.parseOptions._elements_above_target_ignore.indexOf('|' + _tag_name + '|') > -1) {
                        _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                        if (_explored && _explored._is__unskippable) {} else {
                            $D.debugOutline(_node, 'clean-before', 'above-target');
                            return;
                        }
                    }
                    if (_tag_name == 'img') {
                        _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                        if (_explored && _explored._is__unskippable) {} else {
                            if (_explored._is__image_large) {} else {
                                $D.debugOutline(_node, 'clean-before', 'above-target');
                                return;
                            }
                        }
                    }
                }
                if (_tag_name.match(/^h(1|2|3|4|5|6)$/gi) != null) {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        switch (true) {
                        case((_explored._length__plain_text < 10) && ((_explored._count__images_small + _explored._count__images_medium + _explored._count__images_large + _explored._count__images_skip) > 0)) : $D.debugOutline(_node, 'clean-before', 'skip-heading');
                            return;
                        }
                    }
                }
                if ($D.parseOptions._elements_ignore_tag.indexOf('|' + _tag_name + '|') > -1) {} else {
                    _pos__start__before = _global__the_html.length;
                    _global__the_html += '<' + _tag_name;
                    if (_tag_name in $D.parseOptions._elements_keep_attributes) {
                        for (var i = 0,
                        _i = $D.parseOptions._elements_keep_attributes[_tag_name].length; i < _i; i++) {
                            var _attribute_name = $D.parseOptions._elements_keep_attributes[_tag_name][i],
                            _attribute_value = _node.getAttribute(_attribute_name);
                            if (_attribute_name == 'src' || _attribute_name == 'href') {
                                if ((_tag_name == 'a') || ($D.parseOptions._elements_with_src.indexOf('|' + _tag_name + '|') > -1)) {
                                    switch (true) {
                                    case( !! (_attribute_name == 'src' && _node.src)) : _attribute_value = _node.src;
                                        break;
                                    case ( !! (_attribute_name == 'href' && _node.href)) : _attribute_value = _node.href;
                                        break;
                                    }
                                }
                            }
                            if (_attribute_value > '') {
                                _global__the_html += ' ' + _attribute_name + '="' + _attribute_value + '"';
                            }
                        }
                    }
                    var _id_attribute = _node.getAttribute('id');
                    if (_id_attribute > '') {
                        _global__the_html += ' id="' + _id_attribute + '"';
                    }
                    if (_tag_name == 'a') {
                        _global__the_html += ' target="_blank"';
                    }
                    if ($D.parseOptions._elements_self_closing.indexOf('|' + _tag_name + '|') > -1) {
                        _global__the_html += ' />';
                    } else {
                        _global__the_html += '>';
                    }
                    _pos__start__after = _global__the_html.length;
                }
                if ($D.parseOptions._elements_self_closing.indexOf('|' + _tag_name + '|') > -1) {} else {
                    for (var i = 0, _i = _node.childNodes.length; i < _i; i++) {
                        _recursive(_node.childNodes[i]);
                    }
                }
                switch (true) {
                case(($D.parseOptions._elements_ignore_tag.indexOf('|' + _tag_name + '|') > -1)) : return;
                case (($D.parseOptions._elements_self_closing.indexOf('|' + _tag_name + '|') > -1)) : _pos__end__before = _global__the_html.length;
                    _pos__end__after = _global__the_html.length;
                    break;
                default:
                    _pos__end__before = _global__the_html.length;
                    _global__the_html += '</' + _tag_name + '>';
                    _pos__end__after = _global__the_html.length;
                    break;
                }
                if ($D.domainNameIs__wikipedia && ('|h1|h2|h3|h4|h5|h6|'.indexOf('|' + _tag_name + '|') > -1)) {
                    _global__the_html = '' + _global__the_html.substr(0, _pos__start__after) + _global__the_html.substr(_pos__start__after, _pos__end__before).replace(/<a([^>]+?)>edit<\/a>/gi, '') + _global__the_html.substr(_pos__end__before) + '';
                }
                if ($D.domainNameIs__wsj && (_tag_name == 'span') && (_node.className) && (_node.className.indexOf('article-chiclet') > -1)) {
                    var _full_content = _global__the_html.substr(_pos__start__after, _pos__end__before),
                    _keep_content = _full_content.substr(_full_content.indexOf('<a '), _full_content.indexOf('</a>')) + '</a>';
                    _global__the_html = '' + _global__the_html.substr(0, _pos__start__before) + '( ' + _keep_content + ' )' + _global__the_html.substr(_pos__end__after) + '';
                }
                if (_tag_name == 'iframe' || _tag_name == 'embed' || _tag_name == 'object') {
                    _global__the_html = '' + _global__the_html.substr(0, _pos__start__before) + '<div class="readableLargeObjectContainer">' + _global__the_html.substr(_pos__start__before, (_pos__end__after - _pos__start__before)) + '</div>' + '';
                    return;
                }
                if (_tag_name == 'img') {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        switch (true) {
                        case(_explored._is__image_skip):
                            $D.debugOutline(_node, 'clean-after', 'skip-img');
                            _global__the_html = _global__the_html.substr(0, _pos__start__before);
                            return;
                        case (_explored._is__image_large):
                            _global__the_html = '' + _global__the_html.substr(0, _pos__start__before) + '<div class="readableLargeImageContainer' + (($(_node).width() <= 250) && ($(_node).height() >= 250) ? ' float': '') + '">' + _global__the_html.substr(_pos__start__before, (_pos__end__after - _pos__start__before)).replace(/width="([^=]+?)"/gi, '').replace(/height="([^=]+?)"/gi, '') + '</div>' + '';
                            return;
                        }
                    }
                }
                if (_tag_name == 'a') {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    switch (true) {
                    case(_explored._count__images_large == 1) : _global__the_html = '' + _global__the_html.substr(0, _pos__start__after - 1) + ' class="readableLinkWithLargeImage">' + _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after)) + '</a>' + '';
                        return;
                    case (_explored._count__images_medium == 1) : _global__the_html = '' + _global__the_html.substr(0, _pos__start__after - 1) + ' class="readableLinkWithMediumImage">' + _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after)) + '</a>' + '';
                        return;
                    }
                }
                if ($D.parseOptions._elements_too_much_content.indexOf('|' + _tag_name + '|') > -1) {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        switch (true) {
                        case(_tag_name == 'h1' && (_explored._length__all_text > (65 * 2))) : case(_tag_name == 'h2' && (_explored._length__all_text > (65 * 2 * 3))) : case((_tag_name.match(/^h(3|4|5|6)$/) != null) && (_explored._length__all_text > (65 * 2 * 5))) : case((_tag_name.match(/^(b|i|em|strong)$/) != null) && (_explored._length__all_text > (65 * 5 * 5))) : $D.debugOutline(_node, 'clean-after', 'too-much-content');
                            _global__the_html = '' + _global__the_html.substr(0, _pos__start__before) + _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after)) + '';
                            return;
                        }
                    }
                }
                switch (true) {
                case(($D.parseOptions._elements_self_closing.indexOf('|' + _tag_name + '|') > -1)) : case(($D.parseOptions._elements_ignore_tag.indexOf('|' + _tag_name + '|') > -1)) : case(_tag_name == 'td') : break;
                default:
                    var _contents = _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after));
                    _contents = _contents.replace(/(<br \/>)/gi, '');
                    _contents = _contents.replace(/(<hr \/>)/gi, '');
                    if (_tag_name == 'tr') {
                        _contents = _contents.replace(/<td[^>]*?>/gi, '');
                        _contents = _contents.replace(/<\/td>/gi, '');
                    }
                    if (_tag_name == 'table') {
                        _contents = _contents.replace(/<tr[^>]*?>/gi, '');
                        _contents = _contents.replace(/<\/tr>/gi, '');
                    }
                    var _contentsLength = $D.measureText__getTextLength(_contents);
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        switch (true) {
                        case(_contentsLength == 0 && _tag_name == 'p') : _global__the_html = _global__the_html.substr(0, _pos__start__before) + '<br /><br />';
                            return;
                        case (_contentsLength == 0) :
                            $D.debugOutline(_node, 'clean-after', 'blank');
                            _global__the_html = _global__the_html.substr(0, _pos__start__before);
                            return;
                        }
                    }
                    break;
                }
                if ($D.parseOptions._elements_link_density.indexOf('|' + _tag_name + '|') > -1) {
                    _explored = (_explored || $D.getContent__exploreNodeAndGetStuff(_node, true));
                    if (_explored && _explored._is__unskippable) {} else {
                        var _contents = _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after)).replace(/(<([^>]+)>)/gi, ''),
                        _contentsLength = $D.measureText__getTextLength(_contents),
                        _initialLength = 0 + _explored._length__all_text + (_explored._count__images_small * 10) + (_explored._count__images_skip * 10) + (_node.getElementsByTagName('iframe').length * 10) + (_node.getElementsByTagName('object').length * 10) + (_node.getElementsByTagName('embed').length * 10) + (_node.getElementsByTagName('button').length * 10) + (_node.getElementsByTagName('input').length * 10) + (_node.getElementsByTagName('select').length * 10) + (_node.getElementsByTagName('textarea').length * 10);
                        switch (true) {
                        case(!(_contentsLength > 0)) : case(!(_initialLength > 0)) : case(!((_contentsLength / _initialLength) < 0.5)) : case(!(($D.language == 'cjk') && (_contentsLength / _initialLength) < 0.1)) : case((_global__exploreNodeToBuildHTMLFor && ((_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.25))) : case(($D.language == 'cjk') && (_global__exploreNodeToBuildHTMLFor && ((_explored._length__plain_text / _global__exploreNodeToBuildHTMLFor._length__plain_text) > 0.1))) : break;
                        default:
                            $D.debugOutline(_node, 'clean-after', 'missing-density');
                            _global__the_html = _global__the_html.substr(0, _pos__start__before);
                            return;
                        }
                    }
                }
                return;
            };
            _recursive(_nodeToBuildHTMLFor);
            return _global__the_html;
        };
        $D.getContent__find__hasIsolatedTitleInHTML = function(_html) {
            return (_html.substr(0, $D.settings.articleTitleMarker__start.length) == $D.settings.articleTitleMarker__start);
        };
        $D.getContent__find__getIsolatedTitleInHTML = function(_html) {
            if ($D.getContent__find__hasIsolatedTitleInHTML(_html)) {} else {
                return '';
            }
            var _getTitleRegex = new RegExp($D.settings.articleTitleMarker__start + '(.*?)' + $D.settings.articleTitleMarker__end, 'i'),
            _getTitleMatch = _html.match(_getTitleRegex);
            if (_getTitleMatch != null) {} else {
                return '';
            }
            return _getTitleMatch[1];
        };
        $D.getContent__find__isolateTitleInHTML = function(_html, _document_title) {
            if ($D.$document.find('body').attr($D.parseOptions._use_document_title_attribute) == $D.parseOptions._use_document_title_attribute_value) {
                return _html;
            }
            var _heading_pregs = [(/<(h1)[^>]*?>([\s\S]+?)<\/\1>/gi), (/<(h2)[^>]*?>([\s\S]+?)<\/\1>/gi), (/<(h3|h4|h5|h6)[^>]*?>([\s\S]+?)<\/\1>/gi)],
            _secondary_headings = '|h2|h3|h4|h5|h6|',
            _search_document_title = ' ' + _document_title.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' ') + ' ';
            for (var i = 0,
            _i = _heading_pregs.length; i < _i; i++) {
                var _match = _heading_pregs[i].exec(_html);
                switch (true) {
                case(!(_match)) : case(!(_heading_pregs[i].lastIndex > -1)) : break;
                default:
                    var _heading_end_pos = _heading_pregs[i].lastIndex,
                    _heading_start_pos = (_heading_end_pos - _match[0].length),
                    _heading_type = _match[1],
                    _heading_text = _match[2].replace(/<\s*br[^>]*>/gi, '').replace(/[\n\r]+/gi, ''),
                    _heading_text_plain = _heading_text.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' '),
                    _heading_length = $D.measureText__getTextLength(_heading_text_plain),
                    _heading_words = [],
                    _to_heading_text = _html.substr(0, _heading_start_pos),
                    _to_heading_length = $D.measureText__getTextLength(_to_heading_text.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' '));
                    switch (true) {
                    case(!(_heading_length > 5)) : case(!(_heading_length < (65 * 3))) : case(!(_to_heading_length < (65 * 3 * 2))) : break;
                    case ((_secondary_headings.indexOf('|' + _heading_type + '|') > -1)) : _heading_words = _heading_text_plain.split(' ');
                        for (var j = 0,
                        _j = _heading_words.length,
                        _matched_words = ''; j < _j; j++) {
                            if (_search_document_title.indexOf(' ' + _heading_words[j] + ' ') > -1) {
                                _matched_words += _heading_words[j] + ' ';
                            }
                        }
                        var _no_break = false;
                        switch (true) {
                        case((_heading_length > 20) && (_search_document_title.indexOf(_heading_text_plain) > -1)) : case((_heading_length > 10) && ((_search_document_title.indexOf(_heading_text_plain) == 1) || (_search_document_title.indexOf(_heading_text_plain) == (_search_document_title.length - 1 - _heading_text_plain.length)))) : _no_break = true;
                            break;
                        }
                        var _break = false;
                        switch (true) {
                        case(_no_break):
                            break;
                        case ((_heading_length > ((_search_document_title.length - 2) * 2)) && (_heading_type != 'h2')) : case((_heading_length < Math.ceil((_search_document_title.length - 2) * 0.50))) : case((_heading_length < 25) && (_matched_words.length < Math.ceil(_heading_length * 0.75))) : case((_heading_length < 50) && (_matched_words.length < Math.ceil(_heading_length * 0.65))) : case((_matched_words.length < Math.ceil(_heading_length * 0.55))) : _break = true;
                            break;
                        }
                        if (_break) {
                            break;
                        }
                    default:
                        var _titleHTML = '' + $D.settings.articleTitleMarker__start + _heading_text_plain + $D.settings.articleTitleMarker__end + '';
                        var _balanceTagsAtStart = _html.substr(_heading_end_pos);
                        _balanceTagsAtStart = $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__remove(_balanceTagsAtStart, '<div', '</div>');
                        _balanceTagsAtStart = $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__add(_balanceTagsAtStart, '<section', '</section>');
                        _balanceTagsAtStart = $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__add(_balanceTagsAtStart, '<article', '</article>');
                        return '' + _titleHTML + _balanceTagsAtStart + '';
                    }
                    break;
                }
            }
            return _html;
        };
        $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__substrCount = function(_haystack, _needle, _offset, _length) {
            var cnt = 0;
            _haystack += '';
            _needle += '';
            if (isNaN(_offset)) {
                _offset = 0;
            }
            if (isNaN(_length)) {
                _length = 0;
            }
            if (_needle.length == 0) {
                return false;
            }
            _offset--;
            while ((_offset = _haystack.indexOf(_needle, _offset + 1)) != -1) {
                if (_length > 0 && (_offset + _needle.length) > _length) {
                    return false;
                }
                cnt++;
            }
            return cnt;
        };
        $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__add = function(_html, _the_start_tag, _the_end_tag) {
            var _h = _html,
            _end_tag_pos = -1,
            _last_pos = 0;
            for (var _i = 0; _i < 2; _i++) {
                _end_tag_pos = _h.indexOf(_the_end_tag, _last_pos);
                if (_end_tag_pos > -1) {} else {
                    break;
                }
                var _sub = _h.substr(0, _end_tag_pos),
                _start_tags = $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__substrCount(_sub, _the_start_tag, 0),
                _end_tags = (1 + $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__substrCount(_sub, _the_end_tag, 0));
                if (_start_tags < _end_tags) {
                    _h = _the_start_tag + '>' + _h;
                    _last_pos = _end_tag_pos + 1;
                } else {
                    _last_pos = _end_tag_pos + 1;
                }
            }
            return _h;
        };
        $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__remove = function(_html, _the_start_tag, _the_end_tag) {
            var _h = _html.replace(/^(\s*<\s*\/\s*[^>]+>)+/gi, ''),
            _end_tag_pos = -1,
            _last_pos = 0;
            for (var _i = 0; _i < 100; _i++) {
                _end_tag_pos = _h.indexOf(_the_end_tag, _last_pos);
                if (_end_tag_pos > -1) {} else {
                    break;
                }
                var _sub = _h.substr(0, _end_tag_pos),
                _start_tags = $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__substrCount(_sub, _the_start_tag, 0),
                _end_tags = ((_start_tags > 0) ? (1 + $D.getContent__find__isolateTitleInHTML__balanceTagsAtStart__substrCount(_sub, _the_end_tag, 0)) : false);
                if ((! (_start_tags > 0)) || (_start_tags < _end_tags)) {
                    _h = _h.substr(0, _end_tag_pos) + _h.substr(_end_tag_pos + _the_end_tag.length);
                    _last_pos = _end_tag_pos;
                } else {
                    _last_pos = _end_tag_pos + 1;
                }
            }
            return _h;
        };
        $D.getContent__findInPage = function(_pageWindow) {
            var _firstCandidate = false,
            _secondCandidate = false,
            _targetCandidate = false;
            $D.debugTimerStart('ExploreAndGetStuff');
            var _stuff = $D.getContent__exploreNodeAndGetStuff(_pageWindow.document.body);
            $D.debugRemember('ExploreAndGetStuff', $D.debugTimerEnd() + 'ms');
            $D.debugTimerStart('ProcessFirst');
            var _processedCandidates = $D.getContent__processCandidates__first(_stuff._candidates);
            _firstCandidate = _processedCandidates[0];
            _targetCandidate = _firstCandidate;
            $D.debugRemember('ProcessFirst', $D.debugTimerEnd() + 'ms');
            if ($D.debug) {
                $D.log('First 5 Main Candidates:');
                for (var x in _processedCandidates) {
                    if (x == 5) {
                        break;
                    }
                    $D.log(_processedCandidates[x], _processedCandidates[x].__node);
                }
                $D.debugOutline(_firstCandidate.__node, 'target', 'first');
            }
            $D.debugRemember('Target', 'first');
            var _find_this_in_page__attribute = $D.parseOptions._find_this_in_page_attribute,
            _find_this_in_page__id = ((_find_this_in_page__attribute > '') ? $D.$document.find('body').attr(_find_this_in_page__attribute) : ''),
            _find_this_in_page__element = ((_find_this_in_page__id > '') ? $D.document.getElementById(_find_this_in_page__id) : false);
            switch (true) {
            case( !! (_find_this_in_page__element)) : $D.log('Using specified target element.');
                _targetCandidate = {
                    '__node': _find_this_in_page__element
                };
                break;
            case (! (_firstCandidate._count__containers > 0)) : case(!(_firstCandidate._count__candidates > 0)) : case(!(_firstCandidate._count__pieces > 0)) : case(!(_firstCandidate._count__containers > 25)) : break;
            default:
                $D.debugTimerStart('ProcessSecond');
                var _processedCandidatesSecond = $D.getContent__processCandidates__second(_processedCandidates);
                _secondCandidate = _processedCandidatesSecond[0];
                $D.debugRemember('ProcessSecond', $D.debugTimerEnd() + 'ms');
                if (_firstCandidate.__node == _secondCandidate.__node) {
                    break;
                }
                if ($D.debug) {
                    $D.log('First 5 Second Candidates:');
                    for (var x in _processedCandidatesSecond) {
                        if (x == 5) {
                            break;
                        }
                        $D.log(_processedCandidatesSecond[x], _processedCandidatesSecond[x].__node);
                    }
                    $D.debugOutline(_secondCandidate.__node, 'target', 'second');
                }
                _firstCandidate['__points_history_final'] = $D.getContent__computePointsForCandidate__third(_firstCandidate, _firstCandidate);
                _firstCandidate['__points_final'] = _firstCandidate.__points_history_final[0];
                _secondCandidate['__points_history_final'] = $D.getContent__computePointsForCandidate__third(_secondCandidate, _firstCandidate);
                _secondCandidate['__points_final'] = _secondCandidate.__points_history_final[0];
                if ($D.debug) {
                    $D.log('The 2 Candidates:');
                    $D.log(_firstCandidate);
                    $D.log(_secondCandidate);
                }
                switch (true) {
                case((_secondCandidate.__candidate_details._count__lines_of_65_characters < 20) && ((_secondCandidate.__points_final / _firstCandidate.__points_final) > 1)) : case((_secondCandidate.__candidate_details._count__lines_of_65_characters > 20) && ((_secondCandidate.__points_final / _firstCandidate.__points_final) > 0.9)) : case((_secondCandidate.__candidate_details._count__lines_of_65_characters > 50) && ((_secondCandidate.__points_final / _firstCandidate.__points_final) > 0.75)) : _targetCandidate = _secondCandidate;
                    $D.debugRemember('Target', 'second');
                    break;
                }
                if ($D.debug) {
                    $D.debugRemember('PointsFirst', _firstCandidate['__points_history_final'][0].toFixed(2));
                    $D.debugRemember('PointsSecond', _secondCandidate['__points_history_final'][0].toFixed(2));
                }
                break;
            }
            if ($D.debug) {
                $(_targetCandidate.__node).css({
                    'box-shadow': 'inset 0px 0px 50px rgba(255, 255, 0, 0.95), 0px 0px 50px rgba(255, 255, 0, 0.95)'
                });
            }
            $D.debugTimerStart('BuildHTML');
            var _html = $D.getContent__buildHTMLForNode(_targetCandidate.__node, 'the-target');
            _html = _html.substr((_html.indexOf('>') + 1));
            _html = _html.substr(0, _html.lastIndexOf('<'));
            $D.debugRemember('BuildHTML', $D.debugTimerEnd() + 'ms');
            $D.debugTimerStart('BuildHTMLPregs');
            _html = _html.replace(/<span([^>]*?)>p<\/span>\s*?<\/(div|h1|h2|h3|h4|h5|h6|li|p|span)/gi, '</$2');
            _html = _html.replace(/<(\/)?span([^>]*?)>/gi, '');
            _html = _html.replace(/<(blockquote|div|p|td|li)([^>]*)>(\s*<br \/>)+/gi, '<$1$2>');
            _html = _html.replace(/(<br \/>\s*)+<\/(blockquote|div|p|td|li)>/gi, '</$2>');
            _html = _html.replace(/(<br \/>\s*)+<(blockquote|div|h\d|ol|p|table|ul|li)([^>]*)>/gi, '<$2$3>');
            _html = _html.replace(/<\/(blockquote|div|h\d|ol|p|table|ul|li)>(\s*<br \/>)+/gi, '</$1>');
            _html = _html.replace(/(<hr \/>\s*<hr \/>\s*)+/gi, '<hr />');
            _html = _html.replace(/(<br \/>\s*<br \/>\s*)+/gi, '<br /><br />');
            $D.debugRemember('BuildHTMLPregs', $D.debugTimerEnd() + 'ms');
            return {
                '_html': _html,
                '_links': _stuff._links,
                '_targetCandidate': _targetCandidate,
                '_firstCandidate': _firstCandidate
            };
        };
        $D.start = function() {
            $D.detectLanguage();
            var _found = $D.getContent__findInPage($D.window),
            _found_links = _found._links,
            _targetNode = _found._targetCandidate.__node,
            _$targetNode = $(_targetNode),
            _aboveNodes = [];
            switch (true) {
            case(_$targetNode.attr('dir') == 'rtl') : case(_$targetNode.css('direction') == 'rtl') : $D.makeRTL();
                break;
            }
            var _foundHTML = _found._html,
            _firstFragmentBeforeProcessing = $D.nextPage__getFirstFragment(_foundHTML),
            _documentTitle = ($D.document.title > '' ? $D.escape_html($D.document.title) : '');
            var _$og_title = $D.$document.find("meta[property='og:title']");
            if (_$og_title && (_$og_title.length > 0)) {
                _documentTitle = $D.escape_html(_$og_title.attr('content'));
            }
            _foundHTML = $D.getContent__find__isolateTitleInHTML(_foundHTML, _documentTitle);
            $D.articleTitle = $D.getContent__find__getIsolatedTitleInHTML(_foundHTML);
            $D.debugRemember('TitleSource', 'target');
            if ($D.articleTitle > '') {} else {
                var _prevNode = _found._targetCandidate.__node,
                _prevHTML = '',
                _aboveHTML = '',
                _differentTargets = (_found._firstCandidate.__node != _found._targetCandidate.__node); (function() {
                    while (true) {
                        switch (true) {
                        case(_prevNode.tagName && (_prevNode.tagName.toLowerCase() == 'body')) : case(_differentTargets && (_prevNode == _found._firstCandidate.__node)) : return;
                        }
                        if (_prevNode.previousSibling) {} else {
                            _prevNode = _prevNode.parentNode;
                            continue;
                        }
                        _prevNode = _prevNode.previousSibling;
                        if ($D.debug) {
                            $D.debugOutline(_prevNode, 'target', 'add-above');
                        }
                        _prevHTML = $D.getContent__buildHTMLForNode(_prevNode, 'above-the-target');
                        _aboveHTML = _prevHTML + _aboveHTML;
                        _aboveNodes.unshift(_prevNode);
                        _aboveHTML = $D.getContent__find__isolateTitleInHTML(_aboveHTML, _documentTitle);
                        switch (true) {
                        case($D.measureText__getTextLength(_aboveHTML.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' ')) > (65 * 3 * 3)) : case($D.getContent__find__hasIsolatedTitleInHTML(_aboveHTML)):
                            return;
                        }
                    }
                })();
                switch (true) {
                case($D.getContent__find__hasIsolatedTitleInHTML(_aboveHTML)):
                case(_differentTargets && (_aboveHTML.split('<a ').length < 3) && ($D.measureText__getTextLength(_aboveHTML.replace(/<[^>]+?>/gi, '').replace(/\s+/gi, ' ')) < (65 * 3))) : _foundHTML = _aboveHTML + _foundHTML;
                    break;
                default:
                    _aboveHTML = '';
                    _aboveNodes = [];
                    break;
                }
                $D.articleTitle = $D.getContent__find__getIsolatedTitleInHTML(_foundHTML);
                $D.debugRemember('TitleSource', 'above_HTML');
                if ($D.articleTitle > '') {} else { (function() {
                        if (_documentTitle > '') {} else {
                            return;
                        }
                        var _doc_title_parts = [],
                        _doc_title_pregs = [(/( [-][-] |( [-] )|( [>][>] )|( [<][<] )|( [|] )|( [\/] ))/i), (/(([:] ))/i)];
                        for (var i = 0,
                        _i = _doc_title_pregs.length; i < _i; i++) {
                            _doc_title_parts = _documentTitle.split(_doc_title_pregs[i]);
                            if (_doc_title_parts.length > 1) {
                                break;
                            }
                        }
                        _doc_title_parts.sort(function(a, b) {
                            switch (true) {
                            case(a.length > b.length) : return - 1;
                            case(a.length < b.length) : return 1;
                            default:
                                return 0;
                            }
                        });
                        _foundHTML = '' + $D.settings.articleTitleMarker__start + (_doc_title_parts[0].split(/\s+/i).length > 1 ? _doc_title_parts[0] : _documentTitle) + $D.settings.articleTitleMarker__end + _foundHTML + '';
                    })();
                    $D.articleTitle = $D.getContent__find__getIsolatedTitleInHTML(_foundHTML);
                    $D.debugRemember('TitleSource', 'document_title');
                }
            }
            $D.debugRemember('theTarget', _found._targetCandidate.__node);
            $D.debugRemember('firstCandidate', _found._firstCandidate.__node);
            $D.nextPage__firstFragment__firstPage = _firstFragmentBeforeProcessing;
            $D.nextPage__firstFragment__lastPage = $D.nextPage__getFirstFragment(_foundHTML);
            $D.nextPage__firstLinks = _found_links;
            var _result = {
                '_html': _foundHTML,
                '_title': $D.articleTitle,
                '_language': $D.language,
                '_rtl': $D.rtl,
                '_rtl_maybe': $D.maybeRTL
            };
            _result['_elements'] = _aboveNodes;
            _result['_elements'].push(_found._targetCandidate.__node);
            $D.callbacks.finished(_result);
            return _result;
        };
        return $D;
    }

    function getDefaultArticle(callback) {
        var S = {
            callbacks: {
                finished: function(b) {
                    callback(b._html);
                }
            },
            window: window,
            jQuery: MxJQuery
        };

        S = initClearlyComponent__detect(S)
        var result = S.start();
        return result._html;
    }

    function init() {
        return getDefaultArticle(grabWebContentsCallback);
    }

    function clear() {}

    return {
        init: init,
        clear: clear
    }
}

function SnapImage() {
    var base64_image;
    function init() {
        setTimeout(function() {
            var cmd = "note.startSnapRegion";
            if (current_action == PREVIEW_SNAP_WHOLE_PAGE)
                cmd = "note.startSnapPage";
            else if (current_action == PREVIEW_AFTER_SAVE_FROM_SNAP)
                cmd = "note.getSnapImageData";
        }, 200);
    }

    function clear() {

    }

    return {
        init: init,
        clear: clear
    };
}

function SelectContent() {
    var tips_img, selected_html, cover_ele, cover_head, cover_foot, cover_ok_btn, pre_window_click, pre_window_contextmenu;
    var is_left_down = false;
    var cover_html = '<div class="mx_select_cover_head"> \
                        <img src="mx://note/preview/img/shubiao.png"> \
                        <span style="font-size:16px;font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, \'Microsoft YaHei\';">'
                            + getLang('SelectContentTip') + '</span> \
                    </div> \
                    <div class="mx_select_cover_foot" style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, \'Microsoft YaHei\';"> \
                        <button class="mx_ok_btn" disabled="true">' + getLang('OK') + '</button> \
                        <button class="mx_cancel_btn">' + getLang('Cancel') + '</button> \
                    </div>';
    function TipsImageMouseEnterHandler(event) {
        tips_img.style.display = "block";
        cover_head.style.top = '0';
        cover_foot.style.bottom = '0';
    }
    function TipsImageMouseLeaveHandler(event) {
        tips_img.style.display = "none";
        cover_head.style.top = '0';
        cover_foot.style.bottom = '0';
    }

    function TipsImageMouseMoveHandler(event) {
        if (is_left_down == false) {
            tips_img.style.top = (event.y+20) + "px";
            tips_img.style.left = (event.x+20) + "px";
            if (event.y < 120) {
                cover_head.style.top = (event.y - 120) + 'px';
            /* } else if (event.y > window.innerHeight - 84) {
               cover_foot.style.bottom = (window.innerHeight - 84 - event.y) + 'px';*/
            } else {
                cover_head.style.top = 0;
                cover_foot.style.bottom = 0;
            }
        }
        if (event.which == 1 && is_left_down == false) {
            TipsImageMouseDownHandler(event);
            is_left_down = true;
        }
        if (event.which != 1 && is_left_down == true) {
            TipsImageMouseUpHandler(event);
            is_left_down = false;
        }
    }

    function TipsImageMouseDownHandler(event) {
        if (event.target.classList.contains('mx_cancel_btn') ||
            event.target.classList.contains('mx_ok_btn'))
            return;
        /*document.removeEventListener("mousemove", TipsImageMouseMoveHandler, false);*/
        document.removeEventListener("mouseenter", TipsImageMouseEnterHandler, false);
        document.removeEventListener("mouseleave", TipsImageMouseLeaveHandler, false);
        TipsImageMouseLeaveHandler();
        /* document.removeEventListener("mousedown", TipsImageMouseDownHandler, false);*/
        cover_head.style.top = '-200px';
        cover_foot.style.bottom = '-100px';
    }

    function TipsImageMouseUpHandler(event) {
        cover_head.style.top = '0';
        cover_foot.style.bottom = '0';

        GetSelectionForAllIFrame();

        if (selected_html.length > 0) {
            cover_ok_btn.disabled = false;
        } else {
            cover_ok_btn.disabled = true;
            document.addEventListener("mousemove", TipsImageMouseMoveHandler, false);
            document.addEventListener("mouseenter", TipsImageMouseEnterHandler, false);
            document.addEventListener("mouseleave", TipsImageMouseLeaveHandler, false);
            /*document.addEventListener("mousedown", TipsImageMouseDownHandler, false);*/
        }
    }

    function GetSelectionForAllIFrame() {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            var content = selection.getRangeAt(0).cloneContents();
            ParseSelectContent(content);
            return;
        }
        var all_frames = document.querySelectorAll("iframe");
        for (var i=0,len=all_frames.length;i<len;i++) {
            try {
                var selection = all_frames[i].contentWindow.getSelection();
                if (selection.rangeCount > 0) {
                    var content = selection.getRangeAt(0).cloneContents();
                    ParseSelectContent(content);
                    return;
                }
            } catch (e) {}
        }
        selected_html = "";
    }

    function ParseSelectContent(select_content) {
        var tmp_div = document.createElement("div");
        tmp_div.appendChild(select_content);
        function forEach(x, f) {
            for (var i = 0; i < x.length; ++i) {
                f(x[i]);
            }
        }
        forEach(tmp_div.querySelectorAll("*[style]"), function(a) {
            a.style.width="";
            a.style.height="";
            a.style.position="";
        });
        forEach(tmp_div.querySelectorAll('a'), function(a) {
            a.setAttribute('target', '_blank');
        });
        forEach(tmp_div.querySelectorAll('img'), function(a) {
            a.style.top = 0;
            a.style.left = 0;
            a.style.right = 0;
            a.style.bottom = 0;
            a.style.width = "auto";
            a.style.height = "auto";
            a.style.position = "";
            if (a.getAttribute("src") && a.getAttribute("src")) {
                a.setAttribute("src", a.src);
            }
        });
        selected_html = tmp_div.innerHTML;
    }

    function init() {
        document.body.classList.add("maxthonSelectionPreview");
        tips_img = document.createElement("div");
        var tips_img_internal = document.createElement('img');
        tips_img.setAttribute("id", "maxthonSelectionTipImage");
        tips_img_internal.setAttribute("src", "mx://note/preview/img/selection-tips.png");
        tips_img.style.position = "fixed";
        tips_img.style.width = "280px";
        tips_img_internal.style.width = "280px";
        tips_img.style.background="white";
        tips_img.style.padding="16px";
        tips_img.style.boxShadow="0 0 3px 3px #ccc";
        tips_img.style.zIndex = "2147483646";
        tips_img.style.boxSizing = "content-box";
        tips_lang = document.createElement('p');
        tips_lang.innerHTML = getLang('SelectionDragTip');
        tips_lang.style.fontFamily="Microsoft YaHei";
        tips_lang.style.fontSize="14px";
        tips_lang.style.marginBottom = "16px";
        tips_lang.style.marginTop = "0px";
        tips_img.appendChild(tips_lang);
        tips_img.appendChild(tips_img_internal);
        document.body.appendChild(tips_img);

        pre_window_click = window.onclick;
        window.onclick = function(e) {TipsImageMouseUpHandler(e);e.preventDefault();return true;}
        pre_window_contextmenu = window.oncontextmenu;
        window.oncontextmenu = function(e) {e.preventDefault();return true;}

        cover_ele = document.createElement("div");
        cover_ele.innerHTML = cover_html;
        cover_ele.classList.add("mx_select_cover");
        document.body.appendChild(cover_ele);

        cover_head = document.querySelector(".mx_select_cover_head");
        cover_foot = document.querySelector(".mx_select_cover_foot");
        cover_ok_btn = document.querySelector(".mx_select_cover_foot button:first-child");
        cover_ok_btn.onclick = function() {
            window.getSelection().removeAllRanges();
            cover_ok_btn.disabled = true;
            startPreview(selected_html)
        };
        if (cover_ok_btn.clientWidth == 0 || cover_ok_btn.clientHeight == 0) {
            clear();
            return;
        }
        document.querySelector(".mx_select_cover_foot .mx_cancel_btn").onclick = function() {
            clear();
        }
        document.addEventListener("mousemove", TipsImageMouseMoveHandler, false);
        document.addEventListener("mouseenter", TipsImageMouseEnterHandler, false);
        document.addEventListener("mouseleave", TipsImageMouseLeaveHandler, false);
        /* document.addEventListener("mousedown", TipsImageMouseDownHandler, false);
         document.addEventListener("mouseup", TipsImageMouseUpHandler, false);*/

        if (current_action == PREVIEW_ALREADY_SELECT) {
            tips_img.style.display = "none";
            GetSelectionForAllIFrame();
            startPreview(selected_html);
        }
    }

    function clear() {
        document.body.classList.remove("maxthonSelectionPreview");
        tips_img.remove();
        cover_ele.remove();
        document.removeEventListener("mousemove", TipsImageMouseMoveHandler, false);
        document.removeEventListener("mouseup", TipsImageMouseUpHandler, false);
        /*window.getSelection().removeAllRanges();*/

        window.onclick = pre_window_click;
        window.oncontextmenu = pre_window_contextmenu;
    }

    function selectImageAt(x, y) {
        select_image_ele = document.elementFromPoint(x,y);
        if (select_image_ele) {
            ParseSelectContent(select_image_ele.cloneNode())
            startPreview(selected_html)
        }
    }

    return {
        init: init,
        clear: clear,
        selectImageAt:selectImageAt
    }
}

function grabWebContentsCallback(webContents) {};
var text = WebContent().init();
console.log(text);
}());
