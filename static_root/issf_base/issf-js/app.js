/*var issf = angular.module('issf',[]).config(function($interpolateProvider) {
 $interpolateProvider.startSymbol('{$');
 $interpolateProvider.endSymbol('$}');
 });

 issf.controller('issfSearchCtrl', ['$scope', function($scope) {
 $scope.searchValue = "Search..."

 $scope.searchClear = function(obj) {
 $scope.searchValue = ""; //Clear Search input
 }

 $scope.searchChange = function(obj) {

 }

 $scope.searchSubmit = function(obj) {

 }
 }]);*/

// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();
$(document).ready(function () {
    is.init();
});

this.is = {
    init: function () {

        /*************** HJExtention Initialization **************/
        HJExtension.init();


        /*************** Bar Rating Initialization **************/
        //$($('#id_rating').children()[0]).text('');
        //$('#id_rating').barrating({ showSelectedRating:true });


        /** Added by Arnaud **/
        /*************** Misc functions for various pages **************/
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
        })
        $('.bt-edit').on('click', function (e) {
            var $parent = $(this).parent('dd'),
                $table = $parent.find('table'),
                $form = $parent.find('form');
            if ($table.is(":visible")) {
                $table.hide();
                $form.show();
            } else {
                $table.show();
                $form.hide();
            }
        })
        $('.cancel-form').on('click', function (e) {
            var $parent = $(this).parents('dd'),
                $table = $parent.find('table'),
                $form = $parent.find('form');
            $table.show();
            $form.hide();
        })
        /** ************** **/
        $('.accordion>.accordion-navigation>a').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var that = $(this),
                parent = $(this).parent(),
                content = parent.find('.content');


            if (parent.hasClass('active')) {
                content.slideUp('200', function () {
                    parent.removeClass('active');
                });
            } else {
                content.slideDown('300', function () {
                    parent.addClass('active');

                    //needed in order to read-only details map correctly
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
                parent.find('.pop').css({'display': 'block', opacity: 0}).animate({bottom: '120%', opacity: 1}, 400);
            }, 200);
        }, function () {
            $(this).parent().find('.pop').animate({bottom: '100%', opacity: 0}, 300, function () {
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

    /*
     // Update Sept05
     verticalResize: function(){
     var wHi = $(window).height()-20;

     if(wHi<528){
     $('.info-ctn,.map-holder').height(508);
     //$('#map').height(494);
     //$('.dataTable tbody').height(336);
     $('.map-icons a:not(#toexpand)').height(39);
     $('.map-icons').addClass('smaller');
     $('.map-icons h3').each(is.toCenter);
     } else if(wHi>528 && wHi<672){
     $('.info-ctn,.map-holder').height(wHi);
     //$('#map').height(wHi-14);
     //$('.dataTable tbody').height(wHi-172);
     $('.map-icons a:not(#toexpand)').height(((wHi-28)/12)-1);
     $('.map-icons').addClass('smaller');
     $('.map-icons h3').each(is.toCenter);
     } else {
     $('.info-ctn,.map-holder,#map,.dataTable tbody,.map-icons a:not(#toexpand),.map-icons h3').removeAttr('style');
     $('.map-icons').removeClass('smaller');
     }
     },
     // Update Sept05
     toCenter: function(){
     var tHi = $(this).height();
     $(this).css({top:'50%',marginTop:-tHi/2});
     },
     // Update Sept05
     toMap: function(n){
     var body = jQuery("html, body");
     body.animate({scrollTop:n},100);
     return false;
     }
     */
}