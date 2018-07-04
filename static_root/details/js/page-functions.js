//This file is for any common code that has to do with page functionality.


$(document).ready(function () {
    var tw = $('.page-title').width(),
        th = $('.page-title').height();

    var tt = $('.page-title').offset().top;
    var tw = $('.page-title').width();
    var th = $('.page-title').height();

    $(window).scroll(function () {
        var wt = $(window).scrollTop();

        if (wt > tt + 47) {
            $('.page-title:not(#contribute-title)').addClass('fixed-top').width(tw);
            $('#main').css({paddingTop: th + 30});
        } else {
            $('.page-title').removeClass('fixed-top').width(tw);
            $('#main').css({paddingTop: 0});
        }
    });

    //prevents info header from overflowing div
    var infoDiv = $('div.basic-info');
    if (infoDiv.text().length > 120) {
        infoDiv.html(infoDiv.text().substring(0, 117) + '...');

    }
});
