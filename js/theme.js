$(window).load(function () {
    $(".zoom-images").zoomScroller({
        animationTime: 2000,
        easing: "ease",
        initZoom: 1.15,
        zoom: 1
    });
});

$(document).ready(function () {

    $("body").addClass("js");

    $("#select-options a").click(function (e) {
        $("#select-options li").removeClass("active");
        $(this).parent().addClass("active");
        $("body").attr("class", "");
        $("body").addClass("fus-" + $(this).attr("href").substring(1));
    });

    $('.navbar-nav a').click(function (ev) {
        a = $('.navbar-collapse').collapse('hide');
        $(".navbar").removeClass("fus-navbar-solid");
        console.log(ev.target);
        if (ev.target.id == 'event-menu') {
            console.log(ev);
            if (ev.$material) {
                ev.stopPropagation(); //throw away this angular material bullshit
            }
        }
    });

    function get_hash_url() {
        var h = window.location.hash.split('/');
        if (h.length < 2) {
            return '';
        } else {
            return h[1];
        }
    }

    function check_navbar() {
        var h = get_hash_url();
        if (h == '' || h == 'dashboard') {
            if ($(this).scrollTop() > 695) {
                $(".navbar").addClass("fus-navbar-solid");
            } else {
                $(".navbar").removeClass("fus-navbar-solid");
                if ($(window).width() <= 767) {
                    if ($('#nav-collapsible').attr('aria-expanded') != 'true') {
                        console.log($('#nav-collapsible').attr('aria-expanded') )
                        $(".navbar").removeClass("fus-navbar-solid");
                    } else {
                        $(".navbar").addClass("fus-navbar-solid");
                    }
                }
            }
        } else if (['event', 'event_admin', 'dashboard'].indexOf(h) > -1) {
            return;
            if ($(window).width() <= 750) {
                if ($(this).scrollTop() > 40) {
                    $(".navbar").addClass("fus-navbar-solid");
                } else {
                    if ($('#nav-collapsible').attr('aria-expanded') != 'true') {
                        console.log($('#nav-collapsible').attr('aria-expanded') )
                        $(".navbar").removeClass("fus-navbar-solid");
                    } else {
                        $(".navbar").addClass("fus-navbar-solid");
                    }
                }
            } else {
                if ($(this).scrollTop() > 150) {
                    $(".navbar").addClass("fus-navbar-solid");
                } else {
                    $(".navbar").removeClass("fus-navbar-solid");
                }
            }
        }

    }

    $(document).click(check_navbar);
    $(window).scroll(check_navbar);
});
