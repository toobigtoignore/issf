// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();
$(document).ready(function () {
  is.init();
});

this.is = {
  init: function () {
    /* HJExtention Initialization */
    HJExtension.init();

    /* Misc functions for various pages */
    $('.bt-detail').on('click', function () {
      if ($(this).text() === 'more details') {
        $(this).text("hide details");
        $('.accordion').find('dd').each(function (index) {
          $(this).find('.content').slideDown('500', function () {
          });
          $(this).addClass('active');
        })
      } else {
        $(this).text("more details");
        $('.accordion').find('dd').each(function (index) {
          $(this).find('.content').slideUp('500', function () {
          });
          $(this).removeClass('active');
        })
      }
    });

    $('.bt-edit').on('click', function (e) {
      var parent = $(this).parent('dd');
      var table = parent.find('table');
      var multiforms = parent.find('.multiforms');
      var form = parent.find('form');

      if (table.is(":visible")) {
        table.hide();
        form.show();
        multiforms.show();
      } else {
        table.show();
        form.hide();
        multiforms.hide();
      }
    });

    $('.cancel-form').on('click', function (e) {
      var $parent = $(this).parents('dd'),
        $table = $parent.find('table'),
        $form = $parent.find('form');
      $table.show();
      $form.hide();
    });

    $('.accordion>.accordion-navigation>a').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var parent = $(this).parent();
      var content = parent.find('.content');

      if (parent.hasClass('active')) {
        content.slideUp('200', function () {
          parent.removeClass('active');
        });
      } else {
        content.slideDown('300', function () {
          parent.addClass('active');

          // needed in order to read-only details map correctly
          $(this).trigger('mapReload')
        });
      }
    });

    $(':input[required]').each(function () {
      var idd = $(this).attr('id');
      $('label[for="' + idd + '"]').append('<sup>*</sup>');
    });

    $('.bt-prev').click(function () {
      $('.tabs .active').prev().find('a').trigger('click');
      is.visibleCheck();
    });

    $('.bt-next').click(function () {
      $('.tabs .active').next().find('a').trigger('click');
      is.visibleCheck();
    });

    $('.desc').hover(function () {
      var parent = $(this).parent();
      setTimeout(function () {
        parent.find('.pop').css({ 'display': 'block', opacity: 0 }).animate({ bottom: '120%', opacity: 1 }, 400);
      }, 200);
    }, function () {
      $(this).parent().find('.pop').animate({ bottom: '100%', opacity: 0 }, 300, function () {
        $(this).hide();
      });
    });
  },

  visibleCheck: function () {
    if ($('.content-section .tabs li:first-child').hasClass('active')) {
      $('.bt-prev').addClass('disable');
    } else {
      $('.bt-prev').removeClass('disable');
    }
    if ($('.content-section .tabs li:last-child').hasClass('active')) {
      $('.bt-next').addClass('disable');
    } else {
      $('.bt-next').removeClass('disable');
    }
  },
}
