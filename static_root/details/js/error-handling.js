//Processes and returns any errors that occurred on form submission.

function error_handler() {
    $(document).ready(function () {
        $('form:not(.deleteForm):not(.photo_form)').submit(function (e) {
            //Clear existing errors first
            $(this).find('span.error').remove();

            e.preventDefault();
            var form = $(this);

            //Changes button upon form submission
            $('.bt-submit').addClass('loading').prop('disabled', true).text('Please wait...');

            $.ajax({
                type: "POST",
                url: form.attr('action'), dataType: "json",
                data: $(this).serialize(),
                success: function (jsonData) {
                    if (jsonData.success == 'false') {
                        //Reverse changes to button if form submission fails
                        $('.bt-submit').removeClass('loading').prop('disabled', false).text('Submit');
                        //Turn off the submit state on submission failure
                        //because if submit fails, then the page should not be in "submit" state
                        //if submission clears, the page will refresh.

                        form.find('input:submit').attr('data-submit', 'off');
                        form.find('button.bt-submit').attr('data-submit', 'off');
                        form.find('button.submit').attr('data-submit', 'off');
                        //HJExtention.TurnOffSubmitStateOnAllFormSubmitButtons();


                        var formLevelError = false;
                        console.log("Error count:" + jsonData.errors);
                        var formsetNumber = 0;
                        //Case: submission unsuccessful but error msg has been returned
                        for (error in jsonData.errors) {

                            if (!jQuery.isEmptyObject(jsonData.errors[error])) {
                                var inputFound = false;
                                var isArray = jsonData.errors[error] instanceof Array;
                                //if error is isArray, there is only ONE error returned
                                if (isArray) {
                                    form.find(":input[type!='hidden']").each(function () {
                                        if (this.name.indexOf(error) >= 0) {
                                            var label = $('label[for="' + this.id + '"]');
                                            label.html(label.html() + ' <span class="error">' + jsonData.errors[error][0] + '</span>');
                                            inputFound = true;
                                        }
                                    });
                                } else {
                                    //An collection of {error:[msg]} has been returned
                                    for (prop in jsonData.errors[error]) {

                                        //If this form allows Growable Attributes like Profile -> Main Characteristics form
                                        //then special handling is required.
                                        //Error msg need to be placed within the <td> where input/select elements are located.
                                        if (form.hasClass('accordionFormsetGrowable')) {
                                            //var $attributeRow = form.find('.profile-attributes-table tr:nth-child('+(formsetNumber+1)+')');
                                            console.log('td[data-attr-type="Qualitative"]>select[name*="-' + formsetNumber + '-"]');
                                            var $attributeRow = form.find('td[data-attr-type="Qualitative"]>select[name*="-' + formsetNumber + '-"]').parent().parent();
                                            if ($attributeRow.length > 0) {
                                                $attributeRow.first().children('td:nth-child(2)').prepend(' <span class="error">' + jsonData.errors[error][prop] + '</span>');
                                            }

                                        } else {

                                            //the reason for a loop is to get all prop of the object. but i know there is only 1 prop.
                                            var label = $('label[for*="' + prop + '"]').first();
                                            form.prepend(' <span class="error" id="toperror">' + label.text() + ' ' + jsonData.errors[error][prop] + '</span>');
                                            //label.html( label.html() + ' <span class="error">' + jsonData.errors[error][prop] + '</span>');
                                            inputFound = true;
                                            formLevelError = true;

                                        }
                                    }
                                }

                                if (!inputFound && (error === "__all__" || error === "__ALL__")) {
                                    form.prepend(' <span class="error" id="toperror">' + jsonData.errors[error][0] + '</span>');
                                    formLevelError = true;
                                }
                            }
                            formsetNumber++;
                        }

                        //Case: submission unsuccessful but no error msg returned
                        if (jQuery.isEmptyObject(jsonData.errors)) {
                            form.prepend(' <span class="error" id="toperror"> The server had trouble processing your submission. If this issue persists, please <strong>contact ISSF support</strong>. </span>');
                            formLevelError = true;
                        }

                        //scroll to error only if form isn't inside a modal
                        if (!form.parent().hasClass('reveal-modal')) {
                            var errorOffset = "";
                            if (formLevelError) {
                                errorOffset = form.offset().top - 70;
                            } else {
                                var $errortag = form.find(".error:first");
                                if ($errortag.length > 0) {
                                    errorOffset = $errortag.position().top - 70;
                                }
                            }

                            if (errorOffset != "") {
                                $('html, body').animate({
                                    //scrollTop: form.find(".error:first").position().top+10
                                    scrollTop: errorOffset
                                }, 500);
                            }
                        }
                    }
                    else {
                        var redirectURL;

                        if (jsonData.record === null) {
                            redirectURL = Django.url(jsonData.redirectname);
                        } else {
                            redirectURL = Django.url(jsonData.redirectname, jsonData.record);
                        }
                        window.location.replace(redirectURL);
                    }
                }
            });
        });
    });
}
