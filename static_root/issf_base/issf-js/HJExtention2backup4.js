Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

var HJExtention = new function () {

    var Global_OnSubmit = false;
    var Global_LeavePageWarningMessage = "You still have unsaved data.";
    var Global_InitialFormValues = "";
    var Global_FormSetTemplates = [];	//Stores an list of formset templates, incase there are more than 1 growable forms on page.

    this.init = function () {
        MarkOutEmptyContainers();			//ready
        HideOtherFieldsGlobal();			//ready
        SetUpSelectOtherFieldToggle();			//ready
        SetUpULCheckBoxOtherFieldToggle();		//ready
        SetUpFormSetCheckBoxOtherFieldToggle();
        LeavePageWarning();					//ready
        InsertBreakLinesToFormSets();		//ready:  note, InsertBreakLinesToFormSets has to come before DynamicFormsets
        DynamicFormSet();					//ready
        GrowableQualitativeSelection();     //for profile page
        FormsetToggler();					//ready
    };

    //--------------------------------------
    //Allow custom Leave Page Warning Message
    //--------------------------------------
    this.SetLeavePageWarningMessage = function (msg) {
        Global_LeavePageWarningMessage = msg;
    };

    //--------------------------------------
    //Any empty <p> or <div> containers will be given a class of "EmptyContainer"
    //--------------------------------------
    var MarkOutEmptyContainers = function () {
        console.log("-->[init]MarkOutEmptyContainers");
        $('p').each(function () {
            if ($(this).children().length == 0 && $(this).text().length == 0) {
                $(this).addClass('EmptyContainer');
            }
        });
        $('div').each(function () {
            if ($(this).children().length == 0 && $(this).text().length == 0) {
                $(this).addClass('EmptyContainer');
            }
        });
    };

    //--------------------------------------
    //Any input field with a name containing "other" will be hidden together with its siblings
    //Condition:  If the associated "other"  select/radio/checkbox has been checked.
    //--------------------------------------
    var HideOtherFieldsGlobal = function () {
        console.log("-->[init]HideOtherFieldsGlobal");

        //Mark out all other inputfields/labels for easy manipulation
        $('.FormSet input[type="text"][name*=other]').each(function () {
            $(this).addClass("FormSetOtherInputField");
            if ($(this).prev().attr('for') == $(this).prop('id')) {
                $(this).prev().addClass("FormSetOtherInputLabel");
            }
            if ($(this).next().attr('for') == $(this).prop('id')) {
                $(this).next().addClass("FormSetOtherInputLabel");
            }
        });
        //Hide Raw Other Fields: those that are directly under <div class="FormSet">
        $('.FormSet').each(function () {
            $(this).children('input[type="checkbox"][name*="other"]').each(function () {
                var text = "";
                if ($(this).prev().attr('for') == $(this).prop('id')) {
                    text = $(this).prev().text().trim().toLowerCase();
                }
                if ($(this).next().attr('for') == $(this).prop('id')) {
                    text = $(this).next().text().trim().toLowerCase();
                }
                console.log($(this).prop('id') + ":" + text);
                if (text.indexOf('other') == 0) {
                    var isChecked = $(this).is(":checked");
                    if (isChecked) {
                        //do nothing, since element is visible by default.
                    } else {
                        Util_HideAssociatedOtherField($(this));
                    }

                    //Insert a <br> after this checkbox just to make page look better
                    //for Addtional Details FormSet
                    $(this).after("<br>");
                }
            });
        });
        //Hide Select Associated Other Fields
        $('.FormSet select').each(function () {
            if ($(this).children('option:last-child').text().trim().toLowerCase().indexOf("other") == 0) {
                //Case: other option is selected
                if ($(this).val() == $(this).children('option:last-child').val()) {
                    //do nothing, since elements are shown by default.
                }
                else //Case: other option is not selected
                {
                    Util_HideAssociatedOtherField($(this));
                }
            }
        });
        //Hide UnorderedList-Checkbox Associated Other Fields
        $('.FormSet ul').each(function () {
            var text = $(this).children('li:last-child').text().trim().toLowerCase();
            var hasCheckBox = $(this).children('li:last-child').find('input[type="checkbox"]').length > 0;

            //Check if this list has a Other checkbox
            if (text == 'other' && hasCheckBox) {
                var isChecked = $(this).children('li:last-child').find('input[type="checkbox"]').is(':checked');
                if (isChecked) {
                    //do nothing, since elements are shown by default.
                } else {
                    Util_HideAssociatedOtherField($(this));
                }
            }
        });
        //Hide RadioButton Associated Other Fields
    };

    //--------------------------------------
    // Toggle [UL-CheckBox] Other Field: this is the case where checkbox is a <UL>
    //--------------------------------------
    var SetUpULCheckBoxOtherFieldToggle = function () {
        console.log('-->[init]ToggleChecklistOtherField');
        $('.FormSet ul').each(function () {
            var text = $(this).children('li:last-child').text().trim().toLowerCase();
            var hasCheckBox = $(this).children('li:last-child').find('input[type="checkbox"]').length > 0;
            var $parentUL = $(this);

            //Check if the last list item has a Other checkbox
            if (text == 'other' && hasCheckBox) {
                $(this).children('li:last-child').find('input[type="checkbox"]').on('change', function () {
                    var isChecked = $(this).is(":checked");
                    if (isChecked) {
                        Util_ShowAssociatedOtherField($parentUL);
                    } else {
                        Util_HideAssociatedOtherField($parentUL);
                    }
                });
            }
        });
    };

    //--------------------------------------
    // Toggle [FormSet-CheckBox] Other Field: this is the case where checkbox is directly under <div class="FormSet"> element (Additional Details formset)
    //--------------------------------------
    var SetUpFormSetCheckBoxOtherFieldToggle = function () {
        console.log('-->[init]ToggleChecklistOtherField');
        $('.FormSet').each(function () {
            $(this).children('input[type="checkbox"][name*="other"]').each(function () {
                var text = "";
                if ($(this).prev().attr('for') == $(this).prop('id')) {
                    text = $(this).prev().text().trim().toLowerCase();
                }
                if ($(this).next().attr('for') == $(this).prop('id')) {
                    text = $(this).next().text().trim().toLowerCase();
                }
                if (text.indexOf('other') == 0) {
                    $(this).on('change', function () {
                        var isChecked = $(this).is(":checked");
                        if (isChecked) {
                            Util_ShowAssociatedOtherField($(this));
                        } else {
                            Util_HideAssociatedOtherField($(this));
                        }
                    });
                }
            });
        });
    };

    //--------------------------------------
    // Toggle [select] Other Field
    //--------------------------------------
    var SetUpSelectOtherFieldToggle = function () {
        console.log('-->[init]SetUpSelectOtherFieldToggle');
        $('.FormSet select').each(function () {
            if ($(this).children('option:last-child').text().trim().toLowerCase().indexOf("other") == 0) {
                $(this).on('change', function () {
                    if ($(this).val() == $(this).children('option:last-child').val()) {
                        Util_ShowAssociatedOtherField($(this));
                    } else {
                        Util_HideAssociatedOtherField($(this));
                    }
                });
            }
        });
    };

    var ToggleRadioOtherField = function () {
    };

    //---------------------------------------------------------
    //Used specifically for Geographic Scope page
    //Hides and show different form sets by selecting from a list
    //---------------------------------------------------------
    var FormsetToggler = function () {
        console.log('-->[init]FormsetToggler - for GeographicScope Page');

        //Click listener for Toggler options
        $('.FormSetToggler > ul').on('click', function (evt) {
            var $itemClicked = $(evt.target);
            if (evt.target.tagName.toLowerCase() == 'input') {
                //Clear existing errors first [caters for the form error handler]
                $(this).parents('form').find('span.error').remove();

                var indexToShow = $($itemClicked.parent().parent()).index();
                $('.FormSetTogglable').hide();
                $($('.FormSetTogglable')[indexToShow]).fadeIn('fast');
            }
        });

        //Page load initial toggle
        $('.FormSetToggler input:radio').each(function () {
            if ($(this).is(':checked')) {
                var indexToShow = $(this).parent().parent().index();
                $('.FormSetTogglable').hide();
                $($('.FormSetTogglable')[indexToShow]).fadeIn('fast');
            }
        });
    };

    //---------------------------------------------------------
    //Prompt user when navigating away from page
    //---------------------------------------------------------
    var LeavePageWarning = function () {
        console.log('-->[init]LeavePageWarning');
        Global_InitialFormValues = Util_GetAllFormValues();

        //Forms that has ajax submits prevents the bubbling of
        //submit button click events. therefore attributes will
        //have to be assigned to each submit button rather than
        //relying on a boolean flag variable and click triggers
        $('input:submit').click(function () {
            //Global_OnSubmit = true;
            $(this).attr('data-submit', 'on');
        });
        $('button.bt-submit').click(function () {
            //Global_OnSubmit = true;
            $(this).attr('data-submit', 'on');
        });
        $('button.submit').click(function () {
            //Global_OnSubmit = true;
            $(this).attr('data-submit', 'on');
        });

        window.onbeforeunload = function () {
            //console.log("before unload event");
            var currentFormValues = Util_GetAllFormValues();

            //Check if the user is trying to submit a form
            Global_OnSubmit = false;
            $('input:submit').each(function () {
                if ($(this).attr('data-submit') == 'on') {
                    Global_OnSubmit = true;
                }
            });
            $('button.bt-submit').each(function () {
                if ($(this).attr('data-submit') == 'on') {
                    Global_OnSubmit = true;
                }
            });
            $('button.submit').each(function () {
                if ($(this).attr('data-submit') == 'on') {
                    Global_OnSubmit = true;
                }
            });

            if (Global_OnSubmit) {
                //submitting form, do nothing
            } else {
                if (Global_InitialFormValues != currentFormValues) {
                    return Global_LeavePageWarningMessage;
                } else {
                    //no change, and not on submit, do nothing.
                }
            }
        };

        window.onunload = function () {
            //console.log("unload event");
            var currentFormValues = Util_GetAllFormValues();

            //Check if the user is trying to submit a form
            Global_OnSubmit = false;
            $('input:submit').each(function () {
                if ($(this).attr('data-submit') == 'on') {
                    Global_OnSubmit = true;
                }
            });
            $('button.bt-submit').each(function () {
                if ($(this).attr('data-submit') == 'on') {
                    Global_OnSubmit = true;
                }
            });
            $('button.submit').each(function () {
                if ($(this).attr('data-submit') == 'on') {
                    Global_OnSubmit = true;
                }
            });

            if (Global_OnSubmit) {
                //submitting form, do nothing
            } else {
                if (Global_InitialFormValues != currentFormValues) {
                    return Global_LeavePageWarningMessage;
                } else {
                    //no change, and not on submit, do nothing.
                }
            }
        };
    };

    var ResetInitialFormValue = function () {
        Global_InitialFormValues = Util_GetAllFormValues();
    }

    //------------------------------------------------------
    //Automatically append breaklines after each growable formset
    //
    //This function is needed because Django rendered formsets doesn't
    //have breakers between growable sets. resulting in bad presentation.
    //------------------------------------------------------
    var InsertBreakLinesToFormSets = function () {
        console.log('-->[init]InsertBreakLinesToFormSets');
        $('.FormSetGrowable').each(function (index) {
            $(this).attr('formset-num', index);
            var numberOfSetsPresent = parseInt($($(this).children('input[name$="-TOTAL_FORMS"]')[0]).val());
            var numberOfElemPerSet = ($(this).children().length - 3) / numberOfSetsPresent;

            //append a <p class="issf-linebreak"> after each growable set starting from the last growable set in this formset.
            var index = $(this).children().length - 1;
            while (index > 2) {
                $($(this).children()[index]).after("<hr>");
                //$($(this).children()[index]).after("<p class='issf-linebreak'>");
                index -= numberOfElemPerSet;
            }


        });
    }

    //---------------------------------------------------------
    //Allows user to add more form sets to a growable form set
    //
    //Methodology: Iterates all form sets
    //	1. Append a [formset-num]=N attribute to each formset, where 0 <= N <= PositiveInteger
    //---------------------------------------------------------
    var DynamicFormSet = function () {
        console.log('-->[init]DynamicFormSet');
        //Collect the templates for each growable formset, and insert Add FormSet Button
        $('.FormSetGrowable').each(function (index) {
            //Set attribute for this formset (will be used when adding new growing formset)
            $(this).attr('formset-num', index);

            //collect default template
            var numberOfSetsPresent = parseInt($($(this).children('input[name$="-TOTAL_FORMS"]')[0]).val());
            var $formsetTemplate = $('<div>');
            $formsetTemplate.append($(this).children().clone());
            $formsetTemplate.children('input[name$="TOTAL_FORMS"]').remove();
            $formsetTemplate.children('input[name$="INITIAL_FORMS"]').remove();
            $formsetTemplate.children('input[name$="MAX_NUM_FORMS"]').remove();
            if (numberOfSetsPresent > 1) {	//nothing needs to be removed if there is only 1 set
                var setMemberCount = $formsetTemplate.children().length / numberOfSetsPresent;
                for (var i = 0; i < setMemberCount * (numberOfSetsPresent - 1); i++) {
                    $($formsetTemplate.children()[0]).remove();
                }
            }
            //$formsetTemplate.append('<br>');
            Global_FormSetTemplates.push($formsetTemplate);	//store the template in the template list

            //append button
            var button = $('<button class="addFormSetButton blueOrangeButton medium radius" type="button">Add another</button>');
            $(this).append(button);

        });

        //Sepcially handling for HomePage -> Advanced Search -> advancedSearchPanelTab
        //hide all advancedSearchPanelTabRemoveButton by default 
        $('.advancedSearchPanelTabRemoveButton').hide();
        //Apply click handler to advancedSearchPanelTabRemoveButton
        $('.advancedSearchPanelTabRemoveButton').click(advancedSearchPanelTabRemoveButtonHandler);

        // Add Form Set
        $('.addFormSetButton').on('click', function (evt) {
            evt.preventDefault();

            var $thisButton = $(this);

            var numberOfSetsPresent = parseInt($($(this).siblings('input[name$="-TOTAL_FORMS"]')[0]).val());
            console.log("[Add another button click]numberOfSetsPresent: " + numberOfSetsPresent);
            var formsetCount = parseInt($(this).parent().attr('formset-num'));
            var $newFormSet = Global_FormSetTemplates[formsetCount].clone();

            //Special handling for HomePage -> AdvancedSearch -> advancedSearchPanelTab
            if ($(this).parent().hasClass('advancedSearchPanelTab')) {

                //Themes and Issues Tab
                //Apply on change listener to the attribute select
                var $select1 = $newFormSet.find('#ti-attr select').first();
                var attrVals1 = $newFormSet.find('#ti-attr-val select').first();

                attrVals1.hide();

                $select1.on('change', function () {
                    var val = $(this).val(); //$('.advancedSearchPanelTab #ti-attr select option:selected').attr("value");
                    attrVals1.empty();
                    attrVals1.show();
                    themeissueValues.themeissueID.forEach(function (value, i) {
                        if (value == val) {
                            attrVals1.append($('<option></option>').attr("value", (themeissueValues.themeissueValueID[i])).text(themeissueValues.themeissueLabel[i]));
                        }
                    });
                });

                //Characteristics Tab
                //Apply on change listener to the attribute select
                var $select = $newFormSet.find('#char-attr select').first();
                var attrVals = $newFormSet.find('#char-attr-val select').first();

                attrVals.hide();
                $select.on('change', function () {
                    var val = $(this).val(); //$('.advancedSearchPanelTab #char-attr select option:selected').attr("value");
                    attrVals.empty();
                    attrVals.show();
                    attributeValues.attributeID.forEach(function (value, i) {
                        if (value == val) {
                            attrVals.append($('<option></option>').attr("value", (attributeValues.attributeValueID[i])).text(attributeValues.valueLabel[i]));
                        }
                    });
                });

                if (numberOfSetsPresent >= 1) {
                    //Show all advancedSearchPanelTabRemoveButton buttons if there are more than 1 formset
                    $('.advancedSearchPanelTabRemoveButton').show();
                } else {
                    //hide all advancedSearchPanelTabRemoveButton buttons if there is only 1 formset
                    $('.advancedSearchPanelTabRemoveButton').hide();
                }

                //Add click handler to all advancedSearchPanelTabRemoveButton
                $('.advancedSearchPanelTabRemoveButton').unbind().click(advancedSearchPanelTabRemoveButtonHandler);
            }

            Util_SetUpSelectOtherFieldToggleFor($newFormSet);
            Util_SetUpULCheckBoxOtherFieldToggleFor($newFormSet);

            console.log("[Add another button click]newformset children count: " + $newFormSet.children().length);
            //console.log("[Add another button click]newformset html: " + $newFormSet.html());

            if ($newFormSet.children('table.advancedSearchPanelTabTable').length <= 0) {

                //Regular form sets.
                $newFormSet.children().each(function () {
                    Util_FixSetNumber($(this), numberOfSetsPresent);
                    $(this).insertBefore($thisButton);
                });
            } else {
                //Special handling for HomePage -> AdvancedSearch -> Characteristics Tab
                $newFormSet.find('select').each(function () {
                    Util_FixSetNumber($(this), numberOfSetsPresent);
                });
                $newFormSet.children().each(function () {
                    $(this).insertBefore($thisButton);
                });
            }

            //increment the set count
            $($(this).siblings('input[name$="-TOTAL_FORMS"]')[0]).val(numberOfSetsPresent + 1);
        });
    };

    function advancedSearchPanelTabRemoveButtonHandler(evt) {
        var $form = $(this).closest('.FormSetGrowable');
        var numberOfSetsPresent = parseInt($($form.find('input[name$="-TOTAL_FORMS"]')[0]).val());
        if (numberOfSetsPresent > 1) {
            //delete the current set clicked
            $formset = $(this).closest('.advancedSearchPanelTabTable');
            $formset.next('hr').detach();
            $formset.detach();

            //decrease total set count
            $($form.find('input[name$="-TOTAL_FORMS"]')[0]).val(numberOfSetsPresent - 1);

            //re-order every formset in this form.
            $form.find('.advancedSearchPanelTabTable').each(function (index) {
                $(this).find('select').each(function () {
                    Util_FixSetNumber($(this), index);
                });
            });
        }
    }


    //---------------------------------------------------------
    //Profile Page - Main Characteristics: Growable Qualitative Selection
    //Allows user to add more qualitative selections in the form on Profile page
    //---------------------------------------------------------
    var GrowableQualitativeSelection = function () {


        //var $form = $('form[action="/details/profile/main-attributes/"]');
        //var $form = $('form.accordionFormsetGrowable');
        //if( $form.length > 0 ){

        $('form.accordionFormsetGrowable').each(function () {

            var $form = $(this);
            var qualitativeAttributeNameList = [];

            //Parse the qualitative rows to add listeners to select/other fields
            var previousAttributeName = "";
            $form.find('tr.profile-attributes-row').each(function () {
                if ($(this).children('td[data-attr-type="Qualitative"]').length > 0) {

                    //Generate a random ID for this row (for differentiating rows of the same attribute, used when deleting rows)
                    $(this).prop('id', new Date().getTime());

                    //Add Row-On-Hover show attribute name handler
                    $(this).hover(
                        mainCharacteristicsQualitativeRowFocusinHandler,
                        mainCharacteristicsQualitativeRowFocusoutHandler);

                    //Get the Attribute Name of this item.
                    //Add attribute Name to the row
                    //Save attribute Name in a list.
                    var dataAttributeName = $(this).children('td:nth-child(1)').text().trim();
                    if (dataAttributeName.length <= 0) {
                        //CASE: this row has NO attribute name, use attribute name from previous row
                        dataAttributeName = previousAttributeName;
                    }
                    $(this).attr('data-attribute-name', dataAttributeName);
                    if (!qualitativeAttributeNameList.contains(dataAttributeName)) {
                        qualitativeAttributeNameList.push(dataAttributeName);
                    }
                    previousAttributeName = dataAttributeName;

                    //Add a change handler(toggle hidden other field) to the select list
                    //Also move the element to the end of the its container.
                    var $choiceList = $($(this).children('td')[1]).children('select');
                    $choiceList.change(mainCharacteristicsSelectHandler);
                    var selectChoice = $choiceList.children('option:selected').text().trim();
                    //$($(this).children('td')[1]).append($choiceList);

                    //move the hidden input in Characteristics from <tr> to <td>, and place right after the <select>
                    var $hiddenInput = $(this).children('input[type="hidden"][name$="other_value"]').detach();
                    $hiddenInput.attr('placeholder', 'Other Value');
                    $hiddenInput.attr('type', 'text');
                    if (selectChoice != 'Other') {
                        $hiddenInput.addClass('hidden');
                    }
                    $hiddenInput.focusin(mainCharacteristicsOtherInputFocusinHandler);
                    $hiddenInput.focusout(mainCharacteristicsOtherInputFocusoutHandler);
                    //$(this).children('td[data-attr-type="Qualitative"]').append($hiddenInput);
                    $choiceList.after($hiddenInput);

                    //move the hidden input in Themes/Issues from <tr> to <td>, and place right after the <select>
                    var hiddenThemeIssue = $(this).children('input[type="hidden"][name$="other_theme_issue"]').detach();
                    hiddenThemeIssue.attr('placeholder', 'Other Value');
                    hiddenThemeIssue.attr('type', 'text');
                    if (selectChoice != 'Other') {
                        hiddenThemeIssue.addClass('hidden');
                    }
                    hiddenThemeIssue.focusin(mainCharacteristicsOtherInputFocusinHandler);
                    hiddenThemeIssue.focusout(mainCharacteristicsOtherInputFocusoutHandler);
                    //$(this).children('td[data-attr-type="Qualitative"]').append($hiddenInput);
                    $choiceList.after(hiddenThemeIssue);
                }
            });

            //Insert [Add Another]/[Delete] buttons to all the qualitative rows.
            for (i = 0; i < qualitativeAttributeNameList.length; i++) {
                var attrName = qualitativeAttributeNameList[i];
                var matchingRows = $('tr.profile-attributes-row[data-attribute-name="' + attrName + '"]');

                for (j = 0; j < matchingRows.length; j++) {


                    //preserve the text in the Units column, and erase the text
                    var t_Units = $(matchingRows[j]).children('td:nth-child(3)').text().trim();
                    $(matchingRows[j]).children('td:nth-child(3)').text('');

                    //Insert button
                    if (matchingRows.length == 1) {
                        //if only 1 row, then append [add] button
                        var $addbutton = $('<button class="blueOrangeButton QualitativeButton medium radius" type="button">Add another</button>');
                        //$addbutton.click(mainCharacteristicsAddButtonHandler);
                        $addbutton.click($.proxy(mainCharacteristicsAddButtonHandler, null, $form));

                        $(matchingRows[j]).children('td:nth-child(3)').append($addbutton);
                    } else if (j == matchingRows.length - 1) {
                        //last row have [Add] button
                        var $addbutton = $('<button class="blueOrangeButton QualitativeButton medium radius" type="button">Add another</button>');
                        //$addbutton.click(mainCharacteristicsAddButtonHandler);
                        $addbutton.click($.proxy(mainCharacteristicsAddButtonHandler, null, $form));

                        $(matchingRows[j]).children('td:nth-child(3)').append($addbutton);
                    } else {
                        //middle rows have [Delete] button
                        var $deletebutton = $('<button class="orangeRedButton QualitativeButton medium radius" type="button">Delete</button>');
                        //$deletebutton.click(mainCharacteristicsDeleteButtonHandler);
                        $deletebutton.click($.proxy(mainCharacteristicsDeleteButtonHandler, null, $form));

                        $(matchingRows[j]).children('td:nth-child(3)').append($deletebutton);
                    }

                    //Restore the text in the Units column if any
                    if (t_Units.length > 0) {
                        $(matchingRows[j]).children('td:nth-child(3)').append('<div class="mainCharacteristicsUnitsWrapper">' + t_Units + '</div>');
                    }
                }


            }
        });
    };

    function mainCharacteristicsAddButtonHandler() {

        //event object is always the last item in arguments array. 
        //in this case arguments[2] would be the Jquery.Event object
        var $form = arguments[0];

        var $thisRow = $(this).parent().parent();
        var $rowToInsert = $thisRow.clone();     //note: cloning does not clone listeners.
        var $buttonContainer = $(this).parent();

        //Before changing button, preserve the text in the Units column, and erase the text
        $(this).unbind().detach();
        var t_Units = $buttonContainer.text().trim();
        $buttonContainer.html('');

        //Change Add button and change to a Delete button
        var $deletebutton = $('<button class="orangeRedButton QualitativeButton medium radius" type="button">Delete</button>');
        $deletebutton.click($.proxy(mainCharacteristicsDeleteButtonHandler, null, $form));
        $buttonContainer.append($deletebutton);

        //After changing the button, append empty UnitWrapper if "Other" input is in display
        var otherInputField = $thisRow.find('input[placeholder="Other Value"]');
        if (otherInputField.length > 0 && otherInputField.is(':visible')) {
            $buttonContainer.append('<div class="mainCharacteristicsUnitsWrapper">&nbsp;</div>');
        }

        //After changing button, Restore the text in the Units column if any
        if (t_Units.length > 0) {
            $buttonContainer.append('<div class="mainCharacteristicsUnitsWrapper">' + t_Units + '</div>');
        }

        //------------ Preparing the new row to be inserted ---------------

        //Generate a random ID for this row (for differentiating rows of the same attribute, used when deleting rows)
        $rowToInsert.prop('id', new Date().getTime());

        //Erase the attribute text in the row to be appended
        $($rowToInsert.children('td')[0]).text('');

        //Add listeners to the button/select/hidden input for the row to be appended
        //Also clears the value of these select/inputs
        var $choiceList = $($rowToInsert.children('td')[1]).find('select');
        $choiceList.children('option').removeAttr('selected');
        $choiceList.children('option').first().attr('selected', 'selected');
        $choiceList.change(mainCharacteristicsSelectHandler);

        var $hiddenInput = $($rowToInsert.children('td')[1]).children('input[name$="other_value"]');
        $hiddenInput.val('');
        if (!$hiddenInput.hasClass('hidden')) {
            $hiddenInput.addClass('hidden');
        }
        $hiddenInput.focusin(mainCharacteristicsOtherInputFocusinHandler);
        $hiddenInput.focusout(mainCharacteristicsOtherInputFocusoutHandler);

        var $hiddenThemeIssue = $($rowToInsert.children('td')[1]).children('input[name$="other_theme_issue"]');
        $hiddenThemeIssue.val('');
        if (!$hiddenThemeIssue.hasClass('hidden')) {
            $hiddenThemeIssue.addClass('hidden');
        }
        $hiddenThemeIssue.focusin(mainCharacteristicsOtherInputFocusinHandler);
        $hiddenThemeIssue.focusout(mainCharacteristicsOtherInputFocusoutHandler);

        var $addbutton = $($rowToInsert.children('td')[2]).children('button');
        //$addbutton.click(mainCharacteristicsAddButtonHandler);
        $addbutton.click($.proxy(mainCharacteristicsAddButtonHandler, null, $form));

        //Remove any empty UnitWrappers (below the button)
        $rowToInsert.find('.mainCharacteristicsUnitsWrapper').each(function () {
            if ($(this).text().trim().length == 0) {
                $(this).detach();
            }
        });

        //Fix the set count and value for all the Django hidden fields
        var newSetCount = mainCharacteristicsGetSetCount($form);
        var regex_pattern = /[0-9]+/g;
        $rowToInsert.find('input').each(function () {
            var elemName = $(this).attr('name');
            var elemId = $(this).prop('id');

            $(this).attr('name', elemName.replace(regex_pattern, newSetCount));
            $(this).prop('id', elemId.replace(regex_pattern, newSetCount));

            //if this is the input for selected_attribute_id, erase it's value
            if (elemName.indexOf('selected_attribute_id') > 0) {
                $(this).val('');
            }

            //if this is the input for row_number, change the value to setCount+2,000,000 to avoid db conflicts
            if (elemName.indexOf('row_number') > 0) {
                $(this).val(newSetCount + 2000000);
            }
        });
        $rowToInsert.find('select').each(function () {
            var elemName = $(this).attr('name');
            var elemId = $(this).prop('id');

            $(this).attr('name', elemName.replace(regex_pattern, newSetCount));
            $(this).prop('id', elemId.replace(regex_pattern, newSetCount));
        });
        mainCharacteristicsIncrementSetCount($form);

        //Add flags to disregard Django control fields for LeavePageWarning
        $rowToInsert.children('input[type="hidden"]').attr('data-leave-page-exclude', 'true');

        //erase the data in "additional" field
        $rowToInsert.find('input[name$="additional"]').attr('value', '').val('');


        //Add Row-On-Hover show attribute name handler
        $rowToInsert.hover(
            mainCharacteristicsQualitativeRowFocusinHandler,
            mainCharacteristicsQualitativeRowFocusoutHandler);


        //Append the new row
        $thisRow.after($rowToInsert.hide());
        $rowToInsert.slideDown('slow');
    }

    function mainCharacteristicsDeleteButtonHandler() {

        //event object is always the last item in arguments array. 
        //in this case arguments[2] would be the Jquery.Event object
        var $form = arguments[0];
        console.log("form action: " + $form.attr('action'));

        //var $form = $('form.accordionFormsetGrowable');

        var $thisRow = $(this).parent().parent();   //grab the <tr>

        //get the setCount of this row
        var regex_pattern = /[0-9]+/g;
        var setCount = $thisRow.children('input').first().attr('name').match(regex_pattern)[0];

        //On delete action, 
        //IF the row/formset to operate on is pre-populated at fresh page load, then
        //  1. all the input/select should be extracted from this row
        //  2. converted to hidden input (they need to be submitted)
        //  3. remove this row from DOM.
        //  4. check the delete checkbox for this formset
        //ELSE the row is dynamically populated after the page has been loaded, then
        //  1. remove this row from DOM, 
        //  2. remove all formset input/select associated with this setCount
        //  3. check if this setCount is the last set, if not change the setCount of the last formset to this setCount
        //  4. decrement the TOTAL_COUNT
        var initialTotalCount = parseInt($form.find('input[name$="INITIAL_FORMS"][type="hidden"]').val());
        var currentTotalCount = parseInt($form.find('input[name$="TOTAL_FORMS"][type="hidden"]').val());
        if (setCount < initialTotalCount) {
            //CASE: this row is pre-populated

            //hide this row
            $thisRow.slideUp("slow");

            //move all the input/select from this row to the parent form
            $thisRow.find('input').each(function () {
                var $input = $(this).detach();
                $input.attr('type', 'hidden');
                $form.append($input);
            });
            $thisRow.find('select').each(function () {
                var $select = $(this).detach();
                var t_Name = $select.attr('name');
                var t_Id = $select.prop('id');
                var t_Val = $select.val();
                var $input = $('<input type="hidden" id="' + t_Id + '" name="' + t_Name + '" value="' + t_Val + '">');
                $form.append($input);
            });

            //Tranfer the Attribute Name to the following row
            //if this row is the leading row with this AttributeName
            if ($thisRow.prop('id') == $thisRow.parent().children('tr[data-attribute-name="' + $thisRow.attr('data-attribute-name') + '"]').first().prop('id')) {
                $thisRow.next().children('td').first().text($thisRow.attr('data-attribute-name'));
            }

            //remove this row from DOM
            $thisRow.detach();

            //check the delete checkbox for this formset
            $form.find('input[type="checkbox"]').each(function () {
                var elemName = $(this).attr('name');
                if (elemName.indexOf('-' + setCount.toString() + '-DELETE') > 0) {
                    console.log('Checking deletebox for: ' + elemName);
                    $(this).prop('checked', true);
                    return false;
                }
            });

        } else {
            //CASE: this row is dynamically inserted

            //Tranfer the Attribute Name to the following row
            //if this row is the leading row with this AttributeName
            if ($thisRow.prop('id') == $thisRow.parent().children('tr[data-attribute-name="' + $thisRow.attr('data-attribute-name') + '"]').first().prop('id')) {
                $thisRow.next().children('td').first().text($thisRow.attr('data-attribute-name'));
            }
            //if($thisRow.children('td').first().text().trim() == $thisRow.attr('data-attribute-name')){
            //    $thisRow.next().children('td').first().text($thisRow.attr('data-attribute-name'));
            //}

            //delete this row from DOM
            $thisRow.slideUp("slow").detach();

            //remove all select/input associated with this setCount
            //check if this formset is the last set, if not change the setCount of last set to this setCount
            $('input').each(function () {
                var elemName = $(this).attr('name');
                var t_setCount = parseInt(elemName.match(regex_pattern)[0]);    //get setCount of this iterated element

                //remove matching elements
                if (elemName.indexOf('-' + setCount.toString() + '-') > 0) {
                    $(this).detach();
                }

                //swap setCount with last formset elements if the formset to operate on is not the last set
                if (t_setCount == currentTotalCount - 1 && setCount < t_setCount) {
                    var newName = $(this).attr('name').replace(regex_pattern, setCount);
                    var newId = $(this).prop('id').replace(regex_pattern, setCount);
                    $(this).attr('name', newName);
                    $(this).prop('id', newId);
                }
            });
            $('select').each(function () {
                var elemName = $(this).attr('name');
                var t_setCount = parseInt(elemName.match(regex_pattern)[0]);    //get setCount of this iterated element

                //remove matching elements
                if (elemName.indexOf('-' + setCount.toString() + '-') > 0) {
                    $(this).detach();
                }

                //swap setCount with last formset elements if the formset to operate on is not the last set
                if (t_setCount == currentTotalCount - 1 && setCount < t_setCount) {
                    var newName = $(this).attr('name').replace(regex_pattern, setCount);
                    var newId = $(this).prop('id').replace(regex_pattern, setCount);
                    $(this).attr('name', newName);
                    $(this).prop('id', newId);
                }
            });

            //decrement the total_count
            mainCharacteristicsDecrementSetCount($form);
        }

    }

    function mainCharacteristicsSelectHandler() {
        //console.log($(this).children('option:selected').text().trim()==='Other');
        $(this).next('input[type="hidden"][name$="other_value"]').val('');
        if ($(this).children('option:selected').text().trim() == 'Other') {
            //$(this).next('input[name$="other_value"]').css('display', 'block');
            $(this).next('input[name$="other_value"]').removeClass('hidden');

            //If the 2nd column has more than 1 input[type="text"], then append a unitWrapper after the button to preserve alignment
            if ($(this).parent().find('input').length > 1) {
                $(this).parent().next().find('button').after('<div class="mainCharacteristicsUnitsWrapper">&nbsp;</div>');
            }
        } else {
            //$(this).next('input[name$="other_value"]').css('display','none');
            $(this).next('input[name$="other_value"]').addClass('hidden');

            //If the 2nd column has more than 1 input[type="text"], then remove the appended unitWrapper after the button to preserve alignment
            if ($(this).parent().find('input').length > 1) {
                var $unitWrapperAfterButton = $(this).parent().next().find('button').next('.mainCharacteristicsUnitsWrapper');
                if ($unitWrapperAfterButton.text().trim().length == 0) {
                    $unitWrapperAfterButton.detach();
                }
            }
        }

        //console.log($(this).children('option:selected').text().trim()==='Other');
        $(this).next('input[type="hidden"][name$="other_theme_issue"]').val('');
        if ($(this).children('option:selected').text().trim() == 'Other') {
            //$(this).next('input[name$="other_value"]').css('display', 'block');
            $(this).next('input[name$="other_theme_issue"]').removeClass('hidden');

            //If the 2nd column has more than 1 input[type="text"], then append a unitWrapper after the button to preserve alignment
            if ($(this).parent().find('input').length > 1) {
                $(this).parent().next().find('button').after('<div class="mainCharacteristicsUnitsWrapper">&nbsp;</div>');
            }
        } else {
            //$(this).next('input[name$="other_value"]').css('display','none');
            $(this).next('input[name$="other_theme_issue"]').addClass('hidden');

            //If the 2nd column has more than 1 input[type="text"], then remove the appended unitWrapper after the button to preserve alignment
            if ($(this).parent().find('input').length > 1) {
                var $unitWrapperAfterButton = $(this).parent().next().find('button').next('.mainCharacteristicsUnitsWrapper');
                if ($unitWrapperAfterButton.text().trim().length == 0) {
                    $unitWrapperAfterButton.detach();
                }
            }
        }
    }

    function mainCharacteristicsOtherInputFocusinHandler() {
        $(this).addClass('otherInputOnFocus');
        $(this).prev('select').addClass('otherSelectOnFocus');
    }

    function mainCharacteristicsOtherInputFocusoutHandler() {
        $(this).removeClass('otherInputOnFocus');
        $(this).prev('select').removeClass('otherSelectOnFocus');
    }

    function mainCharacteristicsQualitativeRowFocusinHandler() {
        if ($(this).children('td').first().text().trim().length == 0) {
            $(this).children('td').first().text($(this).attr('data-attribute-name'));
            $(this).addClass('mainCharacteristicsRowHover');
        }
    }

    function mainCharacteristicsQualitativeRowFocusoutHandler() {
        if ($(this).hasClass('mainCharacteristicsRowHover')) {
            $(this).children('td').first().text('');
            $(this).removeClass('mainCharacteristicsRowHover');
        }
    }

    function mainCharacteristicsGetSetCount($form) {
        //var $hiddenFormSetCountField = $('form.accordionFormsetGrowable').find('input[type="hidden"][name$="TOTAL_FORMS"]');
        var $hiddenFormSetCountField = $form.find('input[type="hidden"][name$="TOTAL_FORMS"]');
        var count = parseInt($hiddenFormSetCountField.val());
        return count;
    }

    function mainCharacteristicsIncrementSetCount($form) {
        //var $hiddenFormSetCountField = $('form.accordionFormsetGrowable').find('input[type="hidden"][name$="TOTAL_FORMS"]');
        var $hiddenFormSetCountField = $form.find('input[type="hidden"][name$="TOTAL_FORMS"]');
        var count = parseInt($hiddenFormSetCountField.val());
        $hiddenFormSetCountField.val(count + 1);
    }

    function mainCharacteristicsDecrementSetCount($form) {
        //var $hiddenFormSetCountField = $('form.accordionFormsetGrowable').find('input[type="hidden"][name$="TOTAL_FORMS"]');
        var $hiddenFormSetCountField = $form.find('input[type="hidden"][name$="TOTAL_FORMS"]');
        var count = parseInt($hiddenFormSetCountField.val());
        $hiddenFormSetCountField.val(count - 1);
    }


    /******************** Utility functions **********************/

    //Fix Django formset number for Dynamically inserted formsets
    var Util_FixSetNumber = function ($target, newSetCount) {
        var forAttr = $target.attr('for');
        var idAttr = $target.attr('id');
        var nameAttr = $target.attr('name');

        //console.log(forAttr);
        //console.log(idAttr);
        //console.log(nameAttr);

        if (typeof forAttr !== typeof undefined && forAttr !== false) {
            $target.attr('for', forAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-'));
            //console.log(forAttr + ' ---> ' + forAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-'));

            //for Home Page --> Advanced Search --> Char Tab, form id is of format: id_form-0-attribute
            //Need extra handling
            $target.attr('for', forAttr.replace(/form-\d*-/i, 'form-' + newSetCount + '-'));

        }
        if (typeof idAttr !== typeof undefined && idAttr !== false) {
            $target.attr('id', idAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-'));
            //console.log(idAttr + ' ---> ' + idAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-'));

            //for Home Page --> Advanced Search --> Char Tab, form id is of format: id_form-0-attribute
            //Need extra handling
            $target.attr('id', idAttr.replace(/form-\d*-/i, 'form-' + newSetCount + '-'));
        }
        if (typeof nameAttr !== typeof undefined && nameAttr !== false) {
            $target.attr('name', nameAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-'));
            //console.log(nameAttr + ' ---> ' + nameAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-'));

            //for Home Page --> Advanced Search --> Char Tab, form id is of format: id_form-0-attribute
            //Need extra handling
            $target.attr('name', nameAttr.replace(/form-\d*-/i, 'form-' + newSetCount + '-'));
        }
    }

    //Assumes Associated Other Field is on the same Level as the target element
    var Util_HideAssociatedOtherField = function ($target) {
        var elementIndex = $target.index();
        var $parent = $target.parent();
        for (var i = elementIndex; i < $parent.children().length; i++) {
            if ($($parent.children()[i]).hasClass('FormSetOtherInputField')) {
                //console.log($($parent.children()[i]).prop('id'));
                $($parent.children()[i]).hide();
                if ($($parent.children()[i - 1]).hasClass('FormSetOtherInputLabel')) {
                    $($parent.children()[i - 1]).hide();
                }
                if (i + 1 < $parent.children().length && $($parent.children()[i - 1]).hasClass('FormSetOtherInputLabel')) {
                    $($parent.children()[i - 1]).hide();
                }
                break;
            }
        }
    }

    //Assumes Associated Other Field is on the same Level as the target element
    var Util_ShowAssociatedOtherField = function ($target) {
        var elementIndex = $target.index();
        var $parent = $target.parent();

        for (var i = elementIndex; i < $parent.children().length; i++) {
            if ($($parent.children()[i]).hasClass('FormSetOtherInputField')) {
                //console.log($($parent.children()[i]).prop('id'));
                $($parent.children()[i]).show();
                if ($($parent.children()[i - 1]).hasClass('FormSetOtherInputLabel')) {
                    $($parent.children()[i - 1]).show();
                }
                if (i + 1 < $parent.children().length && $($parent.children()[i - 1]).hasClass('FormSetOtherInputLabel')) {
                    $($parent.children()[i - 1]).show();
                }
                break;
            }
        }
    }

    //Used to detect changes made to form elements on the page
    var Util_GetAllFormValues = function () {
        var FormValues = "";
        $('.FormSet').each(function () {
            FormValues += "{";
            //input fields
            //Note: for the case of profile pages -> main characteristics form.
            //      whenever a row of attribute has been added, there are always a few Django control
            //      hidden input fields getting copied. These fields should not be considered
            //      when gathering page changes. Therefore, when adding/inserting the attributes
            //      add a [data-leave-page-exclude="true"] to any hidden input field that should be
            //      disregarded for leavepage warning check.
            $(this).find('input[data-leave-page-exclude!="true"]').each(function () {
                if ($(this) !== typeof undefined && $(this) !== false && $(this).val() != null) {

                    if ($(this).attr('type') == "checkbox" || $(this).attr('type') == "radio") {
                        FormValues += $(this).is(':checked');
                    } else {
                        FormValues += $(this).val().trim();
                    }

                }
            });
            //select boxes
            $(this).find('select').each(function () {
                if ($(this) !== typeof undefined && $(this) !== false && $(this).val() != null) {
                    var tempVal = $(this).val();
                    if (tempVal instanceof Array) {
                        //id_geographic_scope_region_set-0-countries    is a multiple select thus, returns $(this).val() returns an array
                        var t = "";
                        for (var i = 0; i < tempVal.length; i++) {
                            t += tempVal[i];
                        }
                        tempVal = t;
                    }
                    if (!(typeof tempVal == 'undefined') && tempVal !== null) {
                        FormValues += tempVal.trim();
                    }
                }
            });
            $(this).find('textarea').each(function () {
                FormValues += $(this).val();
            });
            FormValues += "}";
        });
        return FormValues;
    }; //end of Util_GetAllFormValues()

    var Util_SetUpSelectOtherFieldToggleFor = function ($target) {
        $target.find('select').each(function () {
            if ($(this).children('option:last-child').text().trim().toLowerCase().indexOf("other") == 0) {
                $(this).on('change', function () {
                    if ($(this).val() == $(this).children('option:last-child').val()) {
                        Util_ShowAssociatedOtherField($(this));
                    } else {
                        Util_HideAssociatedOtherField($(this));
                    }
                });
            }
        });
    };

    var Util_SetUpULCheckBoxOtherFieldToggleFor = function ($target) {
        $target.find('ul').each(function () {
            var text = $(this).children('li:last-child').text().trim().toLowerCase();
            var hasCheckBox = $(this).children('li:last-child').find('input[type="checkbox"]').length > 0;
            var $parentUL = $(this);

            //Check if the last list item has a Other checkbox
            if (text == 'other' && hasCheckBox) {
                $(this).children('li:last-child').find('input[type="checkbox"]').on('change', function () {
                    var isChecked = $(this).is(":checked");
                    if (isChecked) {
                        Util_ShowAssociatedOtherField($parentUL);
                    } else {
                        Util_HideAssociatedOtherField($parentUL);
                    }
                });
            }
        });
    };
}();