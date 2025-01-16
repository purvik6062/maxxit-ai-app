$.fn.frenifyMoveCursorToEnd = function() {
    "use strict";
    this.focus();
    var e = this.val();
    return this.val("").val(e), this
};
var FrenifyTechWaveTime = new Date;
! function(e) {
    "use strict";
    var t = 0,
        a = !1,
        o = !1,
        n = "",
        s = "",
        i = 0,
        r = {
            init: function() {
                this.marquee(), this.tooltip(), this.fontDialog(), this.modelTabs(), this.bookmark(), this.contactForm(), this.negativePrompt(), this.imageGenerationSidebar(), this.rangeSlider(), this.quantity(), this.selectModel(), this.anchor(), this.aiChatBot__chat(), this.aiChatBotOptions(), this.aiChatBotTextareaHeight(), this.billingProgress(), this.inputFileOnChange(), this.optionsList(), this.pricingTab(), this.feedFilters(), this.report(), this.follow(), this.copyLink(), this.galleryIsotope(), this.imageLightbox(), this.like(), this.accordion(), this.search(), this.animatedText(), this.movingSubMenuForLeftPanel(), this.panelResize(), this.navBarItems(), this.redetectFullScreen(), this.fullSCreen(), this.navSubMenu(), this.imgToSVG(), this.BgImg(), this.popupMobile()
            },
            marquee: function() {
                e(".TickerNews .marquee").each(function() {
                    var t = e(this);
                    t.hasClass("ready") || t.addClass("ready").marquee({
                        duplicated: !0,
                        duration: 1e3 * parseInt(t.data("speed")),
                        delayBeforeStart: 0,
                        direction: "left",
                        startVisible: !0
                    })
                })
            },
            popupMobile: function() {
                if (window.matchMedia("(max-width: 767px)").matches) {
                    var t = e(".techwave_fn_wrapper").width();
                    e(".item__popup,.fn__nav_bar .item_popup").each(function() {
                        var a = e(this),
                            o = a.parent(),
                            n = t - 20,
                            s = Math.min(n, 300),
                            i = o.offset().left,
                            r = 10 - i + (n - s) / 2,
                            l = "auto";
                        "right" === a.data("position") ? i + o.width() > s && (r = "auto", l = 0) : i + s < n && (r = 0), a.css({
                            maxWidth: s,
                            width: s,
                            left: r,
                            right: l
                        })
                    })
                } else e(".fn__nav_bar .item_popup,.item__popup").attr("style", "")
            },
            tooltip: function() {
                e("body").on("mouseover mouseenter", ".fn__tooltip", function() {
                    var t = e(this),
                        a = t.attr("data-position");
                    (void 0 === a || !0 === a) && (a = ["top", "bottom", "right", "left"]);
                    var o = {
                        contentAsHTML: "true",
                        maxWidth: 300,
                        animationDuration: 0,
                        animation: "fade",
                        delay: 0,
                        theme: "tooltipster-techwave",
                        side: a
                    };
                    if (t.hasClass("menu__item") && !e("html").hasClass("panel-opened")) {
                        t.tooltipster(o).tooltipster("hide");
                        return
                    }
                    t.tooltipster(o), t.tooltipster("show")
                })
            },
            fontDialog: function() {
                var t = e(".techwave_fn_font");
                e(".font__trigger").off().on("click", function() {
                    return t.addClass("opened"), !1
                }), t.find(".font__closer").off().on("click", function() {
                    return t.removeClass("opened"), !1
                }), t.find(".font__closer_link").off().on("click", function() {
                    return t.removeClass("opened"), !1
                }), t.find(".apply").off().on("click", function() {
                    return e(".fn__chat_font_size_style").remove(), e("body").append('<style type="text/css" class="fn__chat_font_size_style">frenify_typing h3,.fn__chatbot .chat{font-size: ' + e("#font_size").find(":selected").val() + "px;}</style>"), t.removeClass("opened"), !1
                })
            },
            modelTabs: function() {
                e(".techwave_fn_models .fn__tabs a").off().on("click", function() {
                    var t = e(this);
                    if (!t.hasClass("active") && !o) {
                        o = !0, t.siblings().removeClass("active"), t.addClass("active");
                        var a = t.closest(".techwave_fn_models");
                        a.find(".models__results").addClass("loading"), setTimeout(function() {
                            a.find(".models__results").removeClass("loading"), a.find(".tab__item.active").removeClass("active"), e(t.attr("href")).addClass("active"), o = !1
                        }, 1500)
                    }
                    return !1
                })
            },
            contactForm: function() {
                e("#send_message").on("click", function() {
                    var t = e(".fn_contact_form #name").val(),
                        a = e(".fn_contact_form #email").val(),
                        o = e(".fn_contact_form #tel").val(),
                        n = e(".fn_contact_form #message").val(),
                        s = e(".fn_contact_form .returnmessage").data("success");
                    return e(".fn_contact_form .returnmessage").empty(), "" === t || "" === a || "" === n ? e(".fn_contact_form .empty_notice").slideDown(500).delay(2e3).slideUp(500) : e.post("modal/contact.php", {
                        ajax_name: t,
                        ajax_email: a,
                        ajax_message: n,
                        ajax_tel: o
                    }, function(t) {
                        e(".fn_contact_form .returnmessage").append(t), e(".fn_contact_form .returnmessage span.contact_error").length ? e(".fn_contact_form .returnmessage").slideDown(500).delay(2e3).slideUp(500) : (e(".fn_contact_form .returnmessage").append("<span class='contact_success'>" + s + "</span>"), e(".fn_contact_form .returnmessage").slideDown(500).delay(4e3).slideUp(500)), "" === t && e("#fn_contact_form")[0].reset()
                    }), !1
                })
            },
            negativePrompt: function() {
                e("#negative_prompt").on("change", function() {
                    this.checked ? e(".techwave_fn_image_generation_page .exclude_area").slideDown(200) : e(".techwave_fn_image_generation_page .exclude_area").slideUp(200)
                })
            },
            imageGenerationSidebar: function() {
                e(".techwave_fn_image_generation_page .sidebar__trigger").off().on("click", function() {
                    return e(".techwave_fn_wrapper").toggleClass("fn__has_sidebar"), !1
                })
            },
            rangeSlider: function() {
                e(".fn__range").each(function() {
                    var t = e(this),
                        a = t.find("input"),
                        o = a.val(),
                        n = t.find(".value"),
                        s = a.attr("min"),
                        i = a.attr("max"),
                        r = t.find(".slider");
                    r.css({
                        width: o * (100 * s) / i + "%"
                    }), a.on("input", function() {
                        o = e(this).val(), n.text(o), r.css({
                            width: o * (100 * s) / i + "%"
                        })
                    })
                })
            },
            quantity: function() {
                e(".fn__quantity .increase").off().on("click", function() {
                    var t = e(this).closest(".fn__quantity").find("input"),
                        a = parseInt(t.attr("max"), 10),
                        o = parseInt(t.val(), 10);
                    return o = isNaN(o) ? 0 : o, a !== o && (o++, t.val(o), !1)
                }), e(".fn__quantity .decrease").off().on("click", function() {
                    var t = e(this).closest(".fn__quantity").find("input"),
                        a = parseInt(t.val(), 10),
                        o = parseInt(t.attr("min"), 10);
                    return a = isNaN(a) ? 0 : a, o !== a && (a--, t.val(a), !1)
                })
            },
            selectModel: function() {
                e(".fn__select_model .model_open").off().on("click", function() {
                    return e(this).closest(".fn__select_model").toggleClass("opened"), !1
                }), e(window).on("click", function() {
                    e(".fn__select_model").removeClass("opened")
                }), e(".fn__select_model .all_models").on("click", function(e) {
                    e.stopPropagation()
                })
            },
            anchor: function() {
                e(".techwave_fn_doc_page .docsidebar li.menu-item-has-children > a").off().on("click", function() {
                    return e(this).siblings("ul").slideToggle(), !1
                }), e().onePageNav && e(".techwave_fn_doc_page .docsidebar > ul").onePageNav()
            },
            aiChatBot__chat: function() {
                e("#fn__chat_textarea").length && !e(".techwave_fn_intro").length && e("#fn__chat_textarea").focus(), e("#fn__chat_textarea").keypress(function(t) {
                    var a = t.keyCode ? t.keyCode : t.which;
                    if (13 === a && t.shiftKey);
                    else if (13 === a) return e(".fn__chat_comment button").trigger("click"), !1
                }), e(".fn__chat_comment button").off().on("click", function() {
                    var t = e(this),
                        a = e("#fn__chat_textarea"),
                        o = a.val();
                    if (!("" === o || t.hasClass("disabled"))) {
                        s = o = o.replace(/\n\r?/g, "<br />");
                        var n = e(".fn__chatbot .chat__item.active"),
                            i = '<div class="chat__box your__chat"><div class="author"><span>You</span></div><div class="chat"><p>' + o + "</p></div></div>";
                        if (e(".fn__chat_comment").removeClass("neww"), "chat0" === n.attr("id")) {
                            n.removeClass("active"), e(".fn__new_chat_link").removeClass("active");
                            var l = e(".fn__chatbot .chat__item").length;
                            e(".fn__chatbot .chat__list").append('<div class="chat__item active" id="chat' + l + '">' + i + "</div>");
                            var h = '<li class="group__item"><div class="fn__chat_link active" href="#chat' + l + '"><span class="text">New Chat</span><input type="text" value="New Chat"><span class="options"><button class="trigger"><span></span></button><span class="options__popup"><span class="options__list"><button class="edit">Edit</button><button class="delete">Delete</button></span></span></span><span class="save_options"><button class="save"><img src="svg/check.svg" alt="" class="fn__svg"></button><button class="cancel"><img src="svg/close.svg" alt="" class="fn__svg"></button></span></div></li>';
                            e(".fn__chatbot .chat__group.new").length ? e(".fn__chatbot .chat__group.new ul").append(h) : e(".fn__chatbot .sidebar_content").prepend('<div class="chat__group"><h2 class="group__title">Today</h2><ul class="group__list">' + h + "</ul></div>"), r.imgToSVG(), r.aiChatBotOptions()
                        } else n.append(i);
                        return a.val(""), a.siblings(".fn__hidden_textarea").val(""), r.aiChatBotTextareaHeight(), e(".techwave_fn_intro").length ? e("html, body").animate({
                            scrollTop: a.offset().top - e(window).height() + 100
                        }) : e("html, body").animate({
                            scrollTop: e(document).height() - e(window).height()
                        }), a.frenifyMoveCursorToEnd(), r.frenifyChat(), !1
                    }
                })
            },
            shuffleArray: function(e) {
                for (var t, a = e.length; 0 !== a;) t = Math.floor(Math.random() * a), a--, [e[a], e[t]] = [e[t], e[a]];
                return e
            },
            escapeHTML: function(e) {
                var t = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                    "/": "&#x2F;",
                    "`": "&#x60;",
                    "=": "&#x3D;"
                };
                return String(e).replace(/[&<>"'`=\/]/g, function(e) {
                    return t[e]
                })
            },
            aiChatBotOptions: function() {
                e(".fn__chat_link").off().on("click", function() {
                    var t = e(this);
                    return t.hasClass("active") || (e(".fn__chat_link.active").removeClass("active"), e(".fn__chatbot .chat__item.active").removeClass("active"), t.addClass("active"), e(t.attr("href")).addClass("active"), i = e(t.attr("href")).find(".chat__box").length, e(".fn__new_chat_link").removeClass("active"), e(".fn__chat_comment").removeClass("neww"), e(".fn__chatbot .fn__title_holder .title").text(t.find(".text").text()), "" === e(t.attr("href")).html() && e(".fn__chat_comment").addClass("neww")), e("#fn__chat_textarea").frenifyMoveCursorToEnd(), !1
                }), e(".fn__new_chat_link").off().on("click", function() {
                    var t = e(this);
                    return t.hasClass("active") || (e(".fn__chat_link.active").removeClass("active"), e(".fn__chatbot .chat__item.active").removeClass("active"), t.addClass("active"), e(t.attr("href")).addClass("active"), i = 0, e(".fn__chatbot .fn__title_holder .title").text("New Chat")), e(".fn__chat_comment").addClass("neww"), e("#fn__chat_textarea").frenifyMoveCursorToEnd(), !1
                }), e(".fn__chat_link input").off().on("click", function(e) {
                    e.stopPropagation()
                }), e(".fn__chat_link .trigger").off().on("click", function() {
                    var t = e(this).closest(".fn__chat_link");
                    return t.hasClass("opened") ? t.removeClass("opened") : t.addClass("opened"), !1
                }), e(".fn__chat_link .edit").off().on("click", function() {
                    var t = e(this).closest(".fn__chat_link"),
                        a = t.find("input");
                    return t.addClass("live_edit").removeClass("opened"), n = a.val(), setTimeout(function() {
                        a.frenifyMoveCursorToEnd()
                    }, 100), !1
                }), e(".fn__chat_link .cancel").off().on("click", function() {
                    var t = e(this).closest(".fn__chat_link"),
                        a = t.find("input");
                    return t.removeClass("live_edit"), a.val(n), !1
                }), e(".fn__chat_link .save").off().on("click", function() {
                    var t = e(this).closest(".fn__chat_link"),
                        a = t.find("input");
                    return t.removeClass("live_edit"), n = a.val(), t.find(".text").text(n), !1
                }), e(window).on("click", function() {
                    e(".fn__chat_link").removeClass("opened")
                }), e(".fn__chat_link .options__popup").on("click", function(e) {
                    e.stopPropagation()
                })
            },
            aiChatBotTextareaHeight: function() {
                e("#fn__chat_textarea").on("mouseup keyup", function() {
                    var t = e(this),
                        a = t.val(),
                        o = t.siblings(".fn__hidden_textarea");
                    o.val(a);
                    var n = Math.floor((o[0].scrollHeight - 34) / 22);
                    t.css({
                        height: 22 * n + 34 + 4
                    }), n > 6 ? t.css({
                        overflowY: "auto"
                    }) : t.css({
                        overflowY: "hidden"
                    })
                }), e("#fn__include_textarea").on("mouseup keyup", function() {
                    var t = e(this),
                        a = t.val(),
                        o = t.siblings(".fn__hidden_textarea");
                    o.val(a);
                    var n = Math.floor((o[0].scrollHeight - 34) / 22);
                    t.css({
                        height: 22 * n + 34 + 4
                    }), n > 6 ? t.css({
                        overflowY: "auto"
                    }) : t.css({
                        overflowY: "hidden"
                    })
                }), e("#fn__exclude_textarea").on("mouseup keyup", function() {
                    var t = e(this),
                        a = t.val(),
                        o = t.siblings(".fn__hidden_textarea");
                    o.val(a);
                    var n = Math.floor((o[0].scrollHeight - 34) / 22);
                    t.css({
                        height: 22 * n + 34 + 4
                    }), n > 6 ? t.css({
                        overflowY: "auto"
                    }) : t.css({
                        overflowY: "hidden"
                    })
                })
            },
            billingProgress: function() {
                e(".techwave_fn_user_billing .progress").each(function() {
                    var t = e(this);
                    t.waypoint({
                        handler: function() {
                            t.hasClass("active") || setTimeout(function() {
                                t.css("--frenify-progress", t.data("percentage")), t.addClass("active")
                            }, 500)
                        },
                        offset: "90%"
                    })
                })
            },
            inputFileOnChange: function() {
                e(".fn__upload").on("change", function(t) {
                    var a = e(this),
                        o = t.target.files[0];
                    o && a.addClass("has_img").find(".preview_img").attr("src", URL.createObjectURL(o))
                }), e(".fn__upload .fn__closer").on("click", function() {
                    var t = e(this).closest(".fn__upload");
                    return t.removeClass("has_img"), t.find(".preview_img").attr("src", "#"), t.find('input[type="file]').val(""), !1
                })
            },
            optionsList: function() {
                e(".fn__options_list a").off().on("click", function() {
                    var t = e(this);
                    return t.hasClass("enabled") ? t.removeClass("enabled").addClass("disabled") : t.removeClass("disabled").addClass("enabled"), !1
                })
            },
            pricingTab: function() {
                e(".techwave_fn_pricing .toggle_in").each(function() {
                    var t = e(this),
                        a = t.find(".active"),
                        o = a.offset().left - t.offset().left;
                    t.find(".bg").css({
                        left: o,
                        width: a.outerWidth(!0, !0)
                    })
                }), e(".techwave_fn_pricing .toggle_in a").off().on("click", function() {
                    var t = e(this);
                    if (!t.hasClass("active")) {
                        var a = t.closest(".toggle_in"),
                            o = t.closest(".techwave_fn_pricing"),
                            n = t.offset().left - a.offset().left;
                        o.find(".pricing__tab.active").removeClass("active"), e(t.attr("href")).addClass("active"), t.siblings().removeClass("active"), t.addClass("active"), a.find(".bg").css({
                            left: n,
                            width: t.outerWidth(!0, !0)
                        })
                    }
                    return !1
                })
            },
            feedFilters: function() {
                e('.techwave_fn_feed .filter__select input[type="checkbox"]').change(function() {
                    var t = e(this),
                        a = t.is(":checked"),
                        o = t.closest(".techwave_fn_feed"),
                        n = o.find(".fn__gallery_items .item");
                    a ? (n.addClass("select__ready"), o.find(".fn__selection_box").slideDown(200)) : (n.removeClass("select__ready"), o.find(".fn__selection_box").slideUp(200))
                }), e(".fn__selectable_item").off().on("click", function() {
                    var a = e(this),
                        o = a.closest(".techwave_fn_community_page");
                    return o.find(".fn__gallery_items .item"), a.hasClass("selected") ? (a.removeClass("selected"), t--) : (a.addClass("selected"), t++), o.find(".fn__selection_box .count").text(t), !1
                }), e(".techwave_fn_feed .fn__tabs a").on("click", function() {
                    var t = e(this);
                    if (!t.hasClass("active") && !a) {
                        a = !0, t.siblings().removeClass("active"), t.addClass("active");
                        var o = t.closest(".techwave_fn_feed");
                        o.find(".feed__results").addClass("loading"), setTimeout(function() {
                            o.find(".feed__results").removeClass("loading"), a = !1, r.galleryIsotope()
                        }, 1500)
                    }
                    return !1
                }), e(".techwave_fn_feed .filter__sorting a").on("click", function() {
                    var t = e(this);
                    if (!t.hasClass("enabled") && !a) {
                        a = !0, t.siblings().removeClass("enabled").addClass("disabled"), t.removeClass("disabled").addClass("enabled");
                        var o = t.closest(".techwave_fn_feed");
                        o.find(".feed__results").addClass("loading"), setTimeout(function() {
                            o.find(".feed__results").removeClass("loading"), a = !1
                        }, 1500)
                    }
                    return !1
                }), e('.techwave_fn_feed .filter__upscaled input[type="checkbox"]').change(function() {
                    var t = e(this);
                    t.is(":checked");
                    var a = t.closest(".techwave_fn_feed");
                    a.find(".feed__results").addClass("loading"), setTimeout(function() {
                        a.find(".feed__results").removeClass("loading")
                    }, 1500)
                }), e(".techwave_fn_feed .filter__search a").on("click", function() {
                    if (!a) {
                        var t = e(this).closest(".techwave_fn_feed");
                        t.find(".feed__results").addClass("loading"), setTimeout(function() {
                            t.find(".feed__results").removeClass("loading"), a = !1
                        }, 1500)
                    }
                    return !1
                })
            },
            report: function() {
                var t = e(".techwave_fn_report");
                e(".fn__report").off().on("click", function() {
                    return e(this).data("id"), t.hasClass("opened") ? t.removeClass("opened") : t.addClass("opened"), !1
                }), t.find(".cancel").off().on("click", function() {
                    return t.removeClass("opened"), !1
                }), t.find(".fn__closer").off().on("click", function() {
                    return t.removeClass("opened"), !1
                }), t.find(".report__closer").off().on("click", function() {
                    return t.removeClass("opened"), !1
                })
            },
            follow: function() {
                e(".fn__follow").off().on("click", function() {
                    var t = e(this),
                        a = t.find(".text");
                    return t.data("id"), t.hasClass("has__follow") ? (t.removeClass("has__follow"), a.text(t.data("follow-text"))) : (t.addClass("has__follow"), a.text(t.data("unfollow-text"))), !1
                })
            },
            copyLink: function() {
                e(".fn__copy").off().on("click", function() {
                    var t = e(this),
                        a = t.text(),
                        o = t.data("copied"),
                        n = t.attr("data-text"),
                        s = t.attr("href");
                    void 0 !== n && !1 !== n && (s = n);
                    var i = e("<input>");
                    return e("body").append(i), i.val(s).select(), document.execCommand("copy"), i.remove(), t.text(o).delay(1e3).queue(function(e) {
                        t.text(a), e()
                    }), !1
                })
            },
            galleryIsotope: function() {
                var t = e(".fn__gallery_items");
                e().isotope && t.each(function() {
                    e(this).isotope({
                        percentPosition: !0,
                        itemSelector: ".fn__gallery_item",
                        masonry: {}
                    })
                })
            },
            imageLightbox: function() {
                var t = e("body"),
                    a = 0;
                e(".fn__gallery_items .item").off().on("click", function() {
                    var n = e(this);
                    return n.data("id"), n.hasClass("select__ready") || (o.scrollTop(0), a = document.documentElement.style.getPropertyValue("--techwave-scroll-y"), t.css({
                        position: "fixed",
                        top: a
                    }), t.addClass("fn__lightbox_mode"), o.addClass("opened")), !1
                });
                var o = e(".techwave_fn_img_lightbox");
                o.find(".fn__closer").off().on("click", function() {
                    t.removeClass("fn__lightbox_mode"), o.removeClass("opened"), t.css({
                        position: "relative",
                        top: ""
                    }), setTimeout(function() {
                        window.scrollTo({
                            top: 300,
                            left: 0,
                            behavior: "instant"
                        }), r.galleryIsotope()
                    }, 1)
                })
            },
            bookmark: function() {
                e(".fn__bookmark").off().on("click", function() {
                    var t = e(this);
                    return t.hasClass("has__bookmark") ? t.removeClass("has__bookmark") : t.addClass("has__bookmark"), !1
                })
            },
            like: function() {
                e(".fn__like").off().on("click", function() {
                    var t = e(this),
                        a = t.find(".count");
                    return t.data("id"), t.hasClass("has__like") ? (t.removeClass("has__like"), a.text(parseInt(a.text()) - 1)) : (t.addClass("has__like"), a.text(parseInt(a.text()) + 1)), !1
                })
            },
            accordion: function() {
                e(".techwave_fn_accordion").each(function() {
                    e(this).find(".opened .acc__content").slideDown(300)
                }), e(".techwave_fn_accordion .acc__header").on("click", function() {
                    var t = e(this),
                        a = t.closest(".acc__item"),
                        o = t.closest(".techwave_fn_accordion"),
                        n = a.find(".acc__content"),
                        s = o.data("type");
                    a.hasClass("opened") ? (a.removeClass("opened"), n.slideUp(300)) : ("accordion" === s && (o.find(".acc__item").removeClass("opened"), o.find(".acc__content").slideUp(300)), a.addClass("opened"), n.slideDown(300))
                })
            },
            search: function() {
                var t = e(".techwave_fn_searchbar"),
                    a = t.find(".search__input"),
                    o = t.find(".search__results");
                e(".fn__nav_bar .bar__item_search .item_opener").on("click", function() {
                    return t.addClass("opened"), setTimeout(function() {
                        a[0].focus()
                    }, 100), !1
                }), t.find(".search__closer").on("click", function() {
                    return a.val(""), o.removeClass("opened"), t.removeClass("opened"), !1
                });
                var n = null;
                a.on("keyup", function() {
                    var t = e(this).val();
                    clearTimeout(n), n = setTimeout(function() {
                        "" === t ? o.removeClass("opened") : o.addClass("opened")
                    }, 700)
                })
            },
            animatedText: function() {
                e(".fn__animated_text").each(function() {
                    var t = e(this),
                        a = t.text().split(""),
                        o = t.data("wait");
                    o || (o = 0);
                    var n = t.data("speed");
                    n || (n = 4), n /= 100, t.html("<em>321...</em>").addClass("ready"), t.waypoint({
                        handler: function() {
                            t.hasClass("stop") || (t.addClass("stop"), setTimeout(function() {
                                t.text(""), e.each(a, function(e, a) {
                                    var o = document.createElement("span");
                                    o.textContent = a, o.style.animationDelay = e * n + "s", t.append(o)
                                })
                            }, o))
                        },
                        offset: "90%"
                    })
                })
            },
            movingSubMenuForLeftPanel: function() {
                var t = e(".techwave_fn_fixedsub"),
                    a = e(".techwave_fn_leftpanel .group__list > li"),
                    o = e(".techwave_fn_content");

                function n() {
                    o.on("mouseenter", function() {
                        t.removeClass("opened"), a.removeClass("hovered").parent().removeClass("hovered")
                    })
                }
                a.on("mouseenter", function() {
                    var o = e(this),
                        s = o.children("ul.sub-menu"),
                        i = s.html();
                    s.length ? (a.removeClass("hovered"), o.addClass("hovered").parent().addClass("hovered"), t.removeClass("opened").children("ul").html("").html(i), t.addClass("opened")) : (a.removeClass("hovered"), t.removeClass("opened"), o.removeClass("hovered").parent().removeClass("hovered"));
                    var r = o.offset().top,
                        l = e(".techwave_fn_leftpanel .leftpanel_content").offset().top;
                    t.css({
                        top: r - l
                    }), n()
                }), n()
            },
            panelResize: function() {
                var t = e("html");
                e(".techwave_fn_leftpanel .desktop_closer").off().on("click", function() {
                    return t.hasClass("panel-opened") ? (t.removeClass("panel-opened"), localStorage.frenify_panel = "") : (t.addClass("panel-opened"), localStorage.frenify_panel = "panel-opened"), !1
                }), e(".techwave_fn_leftpanel .mobile_closer").off().on("click", function() {
                    return t.hasClass("mobile-panel-opened") ? t.removeClass("mobile-panel-opened") : t.addClass("mobile-panel-opened"), !1
                })
            },
            navBarItems: function() {
                var t = e(".fn__nav_bar .bar__item_user");
                t.find(".user_opener").on("click", function(a) {
                    return a.stopPropagation(), t.hasClass("opened") ? t.removeClass("opened") : t.addClass("opened"), e(".bar__item_language,.bar__item_notification").removeClass("opened"), !1
                }), t.on("click", function(e) {
                    e.stopPropagation()
                }), e(window).on("click", function() {
                    t.removeClass("opened")
                }), e(".fn__nav_bar .bar__item_skin .item_opener").off().on("click", function() {
                    return "light" === e("html").attr("data-techwave-skin") ? (e("html").attr("data-techwave-skin", "dark"), localStorage.frenify_skin = "dark") : (e("html").attr("data-techwave-skin", "light"), localStorage.frenify_skin = "light"), e(".bar__item_user,.bar__item_language,.bar__item_notification").removeClass("opened"), !1
                });
                var a = e(".fn__nav_bar .bar__item_language");
                a.find(".item_opener").on("click", function(t) {
                    return t.stopPropagation(), a.hasClass("opened") ? a.removeClass("opened") : a.addClass("opened"), e(".bar__item_user,.bar__item_notification").removeClass("opened"), !1
                }), a.on("click", function(e) {
                    e.stopPropagation()
                }), e(window).on("click", function() {
                    a.removeClass("opened")
                });
                var o = e(".fn__nav_bar .bar__item_notification");
                o.find(".item_opener").on("click", function(t) {
                    return t.stopPropagation(), o.hasClass("opened") ? o.removeClass("opened") : o.addClass("opened"), e(".bar__item_user,.bar__item_language").removeClass("opened"), !1
                }), o.on("click", function(e) {
                    e.stopPropagation()
                }), e(window).on("click", function() {
                    o.removeClass("opened")
                })
            },
            redetectFullScreen: function() {
                var t = e(".fn__nav_bar .bar__item_fullscreen a");
                window.innerHeight === screen.height ? t.addClass("full_screen") : t.removeClass("full_screen")
            },
            fullSCreen: function() {
                var t = e(".fn__nav_bar .bar__item_fullscreen a");
                t.off().on("click", function() {
                    return t.hasClass("full_screen") ? (t.removeClass("full_screen"), document.exitFullscreen ? document.exitFullscreen() : document.msExitFullscreen ? document.msExitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen()) : (t.addClass("full_screen"), document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : document.documentElement.msRequestFullscreen ? document.documentElement.msRequestFullscreen() : document.documentElement.mozRequestFullScreen ? document.documentElement.mozRequestFullScreen() : document.documentElement.webkitRequestFullscreen && document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)), !1
                })
            },
            navSubMenu: function() {
                e(".techwave_fn_leftpanel .menu-item-has-children > a").off().on("click", function() {
                    var t = e(this).closest("li");
                    return t.hasClass("closed") ? (t.removeClass("closed"), t.children("ul").slideDown(200)) : (t.addClass("closed"), t.children("ul").slideUp(200)), !1
                })
            },
            preloader: function() {
                var t = e(".techwave_fn_preloader"),
                    a = new Date - FrenifyTechWaveTime,
                    o = 4e3;
                a < o ? o -= a : o = 0, t.hasClass("wait_for_full_preloading_animation") || (o = 0), setTimeout(function() {
                    t.addClass("fn_ready")
                }, o), setTimeout(function() {
                    t.remove()
                }, o + 2e3)
            },
            imgToSVG: function() {
                e("img.fn__svg").each(function() {
                    var t = e(this),
                        a = t.attr("class"),
                        o = t.attr("src");
                    e.get(o, function(o) {
                        var n = e(o).find("svg");
                        void 0 !== a && (n = n.attr("class", a + " replaced-svg")), t.replaceWith(n)
                    }, "xml")
                })
            },
            BgImg: function() {
                e("*[data-bg-img]").each(function() {
                    var t = e(this),
                        a = t.attr("data-bg-img"),
                        o = t.data("bg-img");
                    void 0 !== a && t.css({
                        backgroundImage: "url(" + o + ")"
                    })
                })
            }
        };
    e(document).ready(function() {
        r.init(), e(":root").css("--techwave-scroll-y", -1 * window.scrollY + "px"), setTimeout(function() {
            r.galleryIsotope()
        }, 500)
    }), e(window).on("resize", function() {
        r.popupMobile(), r.redetectFullScreen(), r.galleryIsotope()
    }), e(window).on("load", function() {
        r.preloader(), r.galleryIsotope(), setTimeout(function() {
            r.galleryIsotope()
        }, 1e3)
    }), e(window).on("scroll", function() {
        e(":root").css("--techwave-scroll-y", -1 * window.scrollY + "px")
    })
}(jQuery);