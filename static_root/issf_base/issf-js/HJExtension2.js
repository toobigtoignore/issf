Array.prototype.contains = function (obj) {
  var i = this.length;
  while (i--) {
    if (this[i] == obj) {
      return true;
    }
  }
  return false;
}

var HJExtension = new function () {
  var Global_OnSubmit = false;
  var Global_LeavePageWarningMessage = "You still have unsaved data.";
  var Global_InitialFormValues = "";
  // Stores an list of formset templates, incase there are more than 1 growable forms on page.
  var Global_FormSetTemplates = [];

  this.init = function () {
    MarkOutEmptyContainers();
    HideOtherFieldsGlobal();
    SetUpSelectOtherFieldToggle();
    SetUpULCheckBoxOtherFieldToggle();//ready
    SetUpFormSetCheckBoxOtherFieldToggle();
    InsertBreakLinesToFormSets(); // Has to come before DynamicFormsets
    DynamicFormSet();
    GrowableQualitativeSelection(); // For profile page
    FormsetToggler();
    LeavePageWarning();
  };

  // Allow custom Leave Page Warning Message
  this.SetLeavePageWarningMessage = function (msg) {
    Global_LeavePageWarningMessage = msg;
  };

  // Any empty <p> or <div> containers will be given a class of "EmptyContainer"
  var MarkOutEmptyContainers = function () {
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

  // Any input field with a name containing "other" will be hidden together with its siblings
  // Condition:  If the associated "other"  select/radio/checkbox has been checked.
  var HideOtherFieldsGlobal = function () {
    // Mark out all other inputfields/labels for easy manipulation
    $('.FormSet input[type="text"][name*=other]').each(function () {
      $(this).addClass("FormSetOtherInputField");
      if ($(this).prev().attr('for') == $(this).prop('id')) {
        $(this).prev().addClass("FormSetOtherInputLabel");
      }
      if ($(this).next().attr('for') == $(this).prop('id')) {
        $(this).next().addClass("FormSetOtherInputLabel");
      }
    });
    // Hide Raw Other Fields: those that are directly under <div class="FormSet">
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
          var isChecked = $(this).is(":checked");
          if (isChecked) {
            // Do nothing, since element is visible by default.
          } else {
            Util_HideAssociatedOtherField($(this));
          }

          // Insert a <br> after this checkbox just to make page look better for Addtional Details FormSet
          $(this).after("<br>");
        }
      });
    });

    // Hide Select Associated Other Fields
    $('.FormSet select').each(function () {
      if ($(this).children('option:last-child').text().trim().toLowerCase().indexOf("other") == 0) {
        // Case: other option is selected
        if ($(this).val() == $(this).children('option:last-child').val()) {
          // Do nothing, since elements are shown by default.
        }
        // Case: other option is not selected
        else {
          Util_HideAssociatedOtherField($(this));
        }
      }
    });

    //Hide UnorderedList-Checkbox Associated Other Fields
    $('.FormSet ul').each(function () {
      var text = $(this).children('li:last-child').text().trim().toLowerCase();
      var hasCheckBox = $(this).children('li:last-child').find('input[type="checkbox"]').length > 0;

      // Check if this list has a Other checkbox
      if (text == 'other' && hasCheckBox) {
        var isChecked = $(this).children('li:last-child').find('input[type="checkbox"]').is(':checked');
        if (isChecked) {
          // Do nothing, since elements are shown by default.
        } else {
          Util_HideAssociatedOtherField($(this));
        }
      }
    });
    // Hide RadioButton Associated Other Fields
  };

  // Toggle [UL-CheckBox] Other Field: this is the case where checkbox is a <UL>
  var SetUpULCheckBoxOtherFieldToggle = function () {
    $('.FormSet ul').each(function () {
      var text = $(this).children('li:last-child').text().trim().toLowerCase();
      var hasCheckBox = $(this).children('li:last-child').find('input[type="checkbox"]').length > 0;
      var $parentUL = $(this);

      // Check if the last list item has a Other checkbox
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

  // Toggle [FormSet-CheckBox] Other Field: this is the case where checkbox is
  // directly under <div class="FormSet"> element (Additional Details formset)
  var SetUpFormSetCheckBoxOtherFieldToggle = function () {
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

  // Toggle [select] Other Field
  var SetUpSelectOtherFieldToggle = function () {
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

  var ToggleRadioOtherField = function () {};

  // Used specifically for Geographic Scope page
  // Hides and show different form sets by selecting from a list
  var FormsetToggler = function () {
    // Click listener for Toggler options
    $('.FormSetToggler > ul').on('click', function (evt) {
      var $itemClicked = $(evt.target);
      if (evt.target.tagName.toLowerCase() == 'input') {
        // Clear existing errors first [caters for the form error handler]
        $(this).parents('form').find('span.error').remove();

        var indexToShow = $($itemClicked.parent().parent()).index();
        $('.FormSetTogglable').hide();
        $($('.FormSetTogglable')[indexToShow]).fadeIn('fast');
      }
    });

    // Page load initial toggle
    $('.FormSetToggler input:radio').each(function () {
      if ($(this).is(':checked')) {
        var indexToShow = $(this).parent().parent().index();
        $('.FormSetTogglable').hide();
        $($('.FormSetTogglable')[indexToShow]).fadeIn('fast');
      }
    });
  };

  // Prompt user when navigating away from page
  var LeavePageWarning = function () {
    Global_InitialFormValues = Util_GetAllFormValues();

    // Forms that has ajax submits prevents the bubbling of
    // submit button click events. therefore attributes will
    // have to be assigned to each submit button rather than
    // relying on a boolean flag variable and click triggers
    $('input:submit').click(function () {
      $(this).attr('data-submit', 'on');
    });
    $('button.bt-submit').click(function () {
      $(this).attr('data-submit', 'on');
    });
    $('button.submit').click(function () {
      $(this).attr('data-submit', 'on');
    });

    window.onbeforeunload = function () {
      var currentFormValues = Util_GetAllFormValues();

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
        // Submitting form, do nothing
      } else {
        if (Global_InitialFormValues != currentFormValues) {
          return Global_LeavePageWarningMessage;
        } else {
          // No change, and not on submit, do nothing.
        }
      }
    };

    window.onunload = function () {
      var currentFormValues = Util_GetAllFormValues();

      // Check if the user is trying to submit a form
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
        // Submitting form, do nothing
      } else {
        if (Global_InitialFormValues != currentFormValues) {
          return Global_LeavePageWarningMessage;
        } else {
          // No change, and not on submit, do nothing.
        }
      }
    };
  };

  var ResetInitialFormValue = function () {
    Global_InitialFormValues = Util_GetAllFormValues();
  }

  // Automatically append breaklines after each growable formset
  // This function is needed because Django rendered formsets doesn't
  // have breakers between growable sets. resulting in bad presentation.
  var InsertBreakLinesToFormSets = function () {
    ('-->[init]InsertBreakLinesToFormSets');
    $('.FormSetGrowable').each(function (index) {
      $(this).attr('formset-num', index);
      var numberOfSetsPresent = parseInt($($(this).children('input[name$="-TOTAL_FORMS"]')[0]).val());
      var numberOfElemPerSet = ($(this).children().length - 3) / numberOfSetsPresent;

      // Append a <p class="issf-linebreak"> after each growable set starting from the last growable set in this formset.
      var index = $(this).children().length - 1;
      while (index > 2) {
        $($(this).children()[index]).after("<hr>");
        index -= numberOfElemPerSet;
      }
    });
  };

  //Allows user to add more form sets to a growable form set
  //Methodology: Iterates all form sets
  //	1. Append a [formset-num]=N attribute to each formset, where 0 <= N <= PositiveInteger
  var DynamicFormSet = function () {
    // Collect the templates for each growable formset, and insert Add FormSet Button
    $('.FormSetGrowable').each(function (index) {
      // Set attribute for this formset (will be used when adding new growing formset)
      $(this).attr('formset-num', index);

      // Collect default template
      var numberOfSetsPresent = parseInt($($(this).children('input[name$="-TOTAL_FORMS"]')[0]).val());
      var $formsetTemplate = $('<div>');
      $formsetTemplate.append($(this).children().clone());
      $formsetTemplate.children('input[name$="TOTAL_FORMS"]').remove();
      $formsetTemplate.children('input[name$="INITIAL_FORMS"]').remove();
      $formsetTemplate.children('input[name$="MAX_NUM_FORMS"]').remove();
      if (numberOfSetsPresent > 1) {	// Nothing needs to be removed if there is only 1 set
        var setMemberCount = $formsetTemplate.children().length / numberOfSetsPresent;
        for (var i = 0; i < setMemberCount * (numberOfSetsPresent - 1); i++) {
          $($formsetTemplate.children()[0]).remove();
        }
      }
      Global_FormSetTemplates.push($formsetTemplate);	//store the template in the template list

      // Append button
      var button = $('<button class="addFormSetButton blueOrangeButton medium radius" type="button">Add another</button>');
      $(this).not("div.GeogScopeForm").append(button);
    });

    // Handling for HomePage -> Advanced Search -> advancedSearchPanelTab
    // Hide all advancedSearchPanelTabRemoveButton by default
    $('.advancedSearchPanelTabRemoveButton').hide();
    // Apply click handler to advancedSearchPanelTabRemoveButton
    $('.advancedSearchPanelTabRemoveButton').each(function () {
      $(this).click(advancedSearchPanelTabRemoveButtonHandler);
    });

    // Add Form Set
    $('.addFormSetButton').on('click', function (evt) {
      evt.preventDefault();

      var $thisButton = $(this);

      var numberOfSetsPresent = parseInt($($(this).siblings('input[name$="-TOTAL_FORMS"]')[0]).val());
      var formsetCount = parseInt($(this).parent().attr('formset-num'));
      var $newFormSet = Global_FormSetTemplates[formsetCount].clone();

      // Special handling for HomePage -> AdvancedSearch -> advancedSearchPanelTab
      if ($(this).parent().hasClass('advancedSearchPanelTab')) {

        // Themes and Issues Tab
        // Apply on change listener to the attribute select
        var $select1 = $newFormSet.find('#ti-attr select').first();
        var attrVals1 = $newFormSet.find('#ti-attr-val select').first();

        attrVals1.hide();

        $select1.on('change', function () {
          var val = $(this).val();
          attrVals1.empty();
          attrVals1.show();
          themeissueValues.themeissueID.forEach(function (value, i) {
            if (value == val) {
              attrVals1.append($('<option></option>').attr("value", (themeissueValues.themeissueValueID[i])).text(themeissueValues.themeissueLabel[i]));
            }
          });
        });

        // Characteristics Tab
        // Apply on change listener to the attribute select
        var $select = $newFormSet.find('#char-attr select').first();
        var attrVals = $newFormSet.find('#char-attr-val select').first();

        attrVals.hide();
        $select.on('change', function () {
          var val = $(this).val();
          attrVals.empty();
          attrVals.show();
          attributeValues.attributeID.forEach(function (value, i) {
            if (value == val) {
              attrVals.append($('<option></option>').attr("value", (attributeValues.attributeValueID[i])).text(attributeValues.valueLabel[i]));
            }
          });
        });
      }

      Util_SetUpSelectOtherFieldToggleFor($newFormSet);
      Util_SetUpULCheckBoxOtherFieldToggleFor($newFormSet);

      if ($newFormSet.children('table.advancedSearchPanelTabTable').length <= 0) {
        // Regular form sets.
        $newFormSet.children().each(function () {
          Util_FixSetNumber($(this), numberOfSetsPresent);
          $(this).insertBefore($thisButton);
        });
      } else {
        // Special handling for HomePage -> AdvancedSearch -> Characteristics Tab
        $newFormSet.find('select').each(function () {
          Util_FixSetNumber($(this), numberOfSetsPresent);
        });
        $newFormSet.children().each(function () {
          $(this).insertBefore($thisButton);
        });
      }

      // Increment the set count
      numberOfSetsPresent++;
      $($(this).siblings('input[name$="-TOTAL_FORMS"]')[0]).val(numberOfSetsPresent);

      if (numberOfSetsPresent > 1) {
        // Show all advancedSearchPanelTabRemoveButton buttons if there are more than 1 formset
        $(this).parent().find('.advancedSearchPanelTabRemoveButton').show();
      } else {
        // Hide all advancedSearchPanelTabRemoveButton buttons if there is only 1 formset
        $(this).parent().find('.advancedSearchPanelTabRemoveButton').hide();
      }

      // Add click handler to all advancedSearchPanelTabRemoveButton
      $('.advancedSearchPanelTabRemoveButton').each(function () {
        $(this).unbind();
        $(this).click(advancedSearchPanelTabRemoveButtonHandler);
      });
    });
  };

  function advancedSearchPanelTabRemoveButtonHandler(evt) {
    var $form = $(this).closest('.FormSetGrowable');
    var numberOfSetsPresent = parseInt($($form.find('input[name$="-TOTAL_FORMS"]')[0]).val());
    if (numberOfSetsPresent > 1) {
      // Delete the current set clicked
      $formset = $(this).closest('.advancedSearchPanelTabTable');
      $formset.next('hr').detach();
      $formset.detach();

      // Decrease total set count
      numberOfSetsPresent--;
      $($form.find('input[name$="-TOTAL_FORMS"]')[0]).val(numberOfSetsPresent);

      // Re-order every formset in this form.
      $form.find('.advancedSearchPanelTabTable').each(function (index) {
        $(this).find('select').each(function () {
          Util_FixSetNumber($(this), index);
        });
      });

      if (numberOfSetsPresent > 1) {
        // Show all advancedSearchPanelTabRemoveButton buttons if there are more than 1 formset
        $form.find('.advancedSearchPanelTabRemoveButton').show();
      } else {
        // Hide all advancedSearchPanelTabRemoveButton buttons if there is only 1 formset
        $form.find('.advancedSearchPanelTabRemoveButton').hide();
      }

      // Add click handler to all advancedSearchPanelTabRemoveButton
      $('.advancedSearchPanelTabRemoveButton').each(function () {
        $(this).unbind();
        $(this).click(advancedSearchPanelTabRemoveButtonHandler);
      });
    }
  }

  // Profile Page - Main Characteristics: Growable Qualitative Selection
  // Allows user to add more qualitative selections in the form on Profile page
  var _gq_addButtonHtml = '<button class="gqAddButton blueOrangeButton QualitativeButton medium radius" style="padding:0 !important; margin:0 !important; height:0 !important; width:0 !important;" type="button">+</button>';
  var _gq_removeButtonHtml = '<button class="gqRemoveButton orangeRedButton QualitativeButton medium radius has-tip" data-tooltip aria-haspopup="true" title="Click here to remove this value." type="button"><i class="step fi-minus"></i></button>'
  var GrowableQualitativeSelection = function () {
    $('form.accordionFormsetGrowable').each(function () {
      var $form = $(this);
      var qualitativeAttributeNameList = [];

      // Parse the qualitative rows to add listeners to select/other fields
      var previousAttributeName = "";
      $form.find('tr.profile-attributes-row').each(function () {
        if ($(this).children('td[data-attr-type="Qualitative"]').length > 0) {
          // Generate a random ID for this row (for differentiating rows of the same attribute, used when deleting rows)
          $(this).prop('id', new Date().getTime());

          // Get the Attribute Name of this item, add attribute Name to the row, save attribute name in a list.
          var dataAttributeName = $(this).prevAll('.profile-label-row:first').text().trim();
          $(this).attr('data-attribute-name', dataAttributeName);
          if (!qualitativeAttributeNameList.contains(dataAttributeName)) {
            qualitativeAttributeNameList.push(dataAttributeName);
          }

          // Add a change handler(toggle hidden other field) to the select list
          // Also move the element to the end of the its container.
          var $choiceList = $(this).children('td:nth-child(1)').children('select');
          $choiceList.change(mainCharacteristicsSelectHandler);
          var selectChoice = $choiceList.children('option:selected').text().trim();

          // Move the  Mdden input from <tr> to <td>, and place right after the <select>
          var $hiddenInput = $(this).children('input[type="hidden"][name$="other_value"]').detach();
          $hiddenInput.attr('placeholder', 'Other Value');
          $hiddenInput.attr('type', 'text');
          if (selectChoice != 'Other') {
            $hiddenInput.addClass('hidden');
          }
          $hiddenInput.focusin(mainCharacteristicsOtherInputFocusinHandler);
          $hiddenInput.focusout(mainCharacteristicsOtherInputFocusoutHandler);
          $choiceList.after($hiddenInput);

          // Move the hidden input in Themes/Issues from <tr> to <td>, and place right after the <select>
          var hiddenThemeIssue = $(this).children('input[type="hidden"][name$="other_theme_issue"]').detach();
          hiddenThemeIssue.attr('placeholder', 'Other Value');
          hiddenThemeIssue.attr('type', 'text');
          if (selectChoice != 'Other') {
            hiddenThemeIssue.addClass('hidden');
          }
          hiddenThemeIssue.focusin(mainCharacteristicsOtherInputFocusinHandler);
          hiddenThemeIssue.focusout(mainCharacteristicsOtherInputFocusoutHandler);
          $choiceList.after(hiddenThemeIssue);
        }
      });

      // Insert [Add Another]/[Delete] buttons to all the qualitative rows.
      for (i = 0; i < qualitativeAttributeNameList.length; i++) {
        var attrName = qualitativeAttributeNameList[i];
        var matchingRows = $form.find('tr.profile-attributes-row[data-attribute-name="' + attrName + '"]');

        var $rowWithAddButton = null;
        for (j = 0; j < matchingRows.length; j++) {
          // Insert button
          if (matchingRows.length == 1) {
            // If only 1 row, then append [add] button
            var $addbutton = $(_gq_addButtonHtml);
            $addbutton.click($.proxy(mainCharacteristicsAddButtonHandler, null, $form));

            $(matchingRows[j]).children('td:nth-child(2)').append($addbutton);
            $rowWithAddButton = $(matchingRows[j]);
          } else if (j == matchingRows.length - 1) {
            // Last row have [Add] button
            var $addbutton = $(_gq_addButtonHtml);
            $addbutton.click($.proxy(mainCharacteristicsAddButtonHandler, null, $form));

            $(matchingRows[j]).children('td:nth-child(2)').append($addbutton);
            $rowWithAddButton = $(matchingRows[j]);
          } else {
            // Middle rows have [Delete] button
            var $deletebutton = $(_gq_removeButtonHtml);
            $deletebutton.click($.proxy(mainCharacteristicsDeleteButtonHandler, null, $form));

            $(matchingRows[j]).children('td:nth-child(2)').append($deletebutton);
          }

          // If the row with add button has value selected, click on add button to bring up another row.
          if ($rowWithAddButton != null && $rowWithAddButton.find('select').val().trim().length > 0) {
            $rowWithAddButton.find('.gqAddButton').click();
          }
        }
      }

      // Insert unitWrappers below buttons
      $form.find('tr.profile-attributes-row').each(function () {
        var $unitWrapper = $('<div class="mainCharacteristicsUnitsWrapper">&nbsp;</div>');
        var $select = $(this).find('select');
        if ($select.length > 0 && $select.find('option:selected').text().trim() == "Other") {
          $(this).find('.QualitativeButton').after($unitWrapper);
        }
        var $additionalValue = $(this).find('input[name$="additional"]');
        if ($additionalValue.length > 0) {
          $(this).find('.QualitativeButton').after($unitWrapper);
        }
        var $additionalValue = $(this).find('input[name$="other_value"]');
        if ($additionalValue.length > 0 && $additionalValue.is(':visible')) {
          $(this).find('.QualitativeButton').after($unitWrapper);
        }
      });
    });
  };

  function mainCharacteristicsAddButtonHandler() {
    // Event object is always the last item in arguments array.
    // in this case arguments[2] would be the Jquery.Event object
    var $form = arguments[0];

    var $thisRow = $(this).parent().parent();
    var $rowToInsert = $thisRow.clone(); // Cloning does not clone listeners.
    var $buttonContainer = $(this).parent();

    $(this).unbind().detach(); // Remove the the button being clicked

    // Change Add button and change to a Delete button
    var $deletebutton = $(_gq_removeButtonHtml);
    $deletebutton.click($.proxy(mainCharacteristicsDeleteButtonHandler, null, $form));
    $buttonContainer.append($deletebutton);

    // After changing the button, append empty UnitWrapper if "Other" input is in display
    $buttonContainer.find('.mainCharacteristicsUnitsWrapper').detach();
    var otherInputField = $thisRow.find('input[placeholder="Other Value"]');
    if (otherInputField.length > 0 && otherInputField.is(':visible')) {
      $buttonContainer.append('<div class="mainCharacteristicsUnitsWrapper">&nbsp;</div>');
    }

    // Preparing the new row to be inserted
    // Generate a random ID for this row (for differentiating rows of the same attribute, used when deleting rows)
    $rowToInsert.prop('id', new Date().getTime());

    // Add listeners to the button/select/hidden input for the row to be appended
    // Also clears the value of these select/inputs
    var $choiceList = $rowToInsert.children('td:nth-child(1)').find('select');
    $choiceList.children('option').removeAttr('selected');
    $choiceList.children('option').first().attr('selected', 'selected');
    $choiceList.change(mainCharacteristicsSelectHandler);

    var $hiddenInput = $rowToInsert.children('td:nth-child(1)').children('input[name$="other_value"]');
    $hiddenInput.val('');
    if (!$hiddenInput.hasClass('hidden')) {
      $hiddenInput.addClass('hidden');
    }
    $hiddenInput.focusin(mainCharacteristicsOtherInputFocusinHandler);
    $hiddenInput.focusout(mainCharacteristicsOtherInputFocusoutHandler);

    var $hiddenThemeIssue = $rowToInsert.children('td:nth-child(1)').children('input[name$="other_theme_issue"]');
    $hiddenThemeIssue.val('');
    if (!$hiddenThemeIssue.hasClass('hidden')) {
      $hiddenThemeIssue.addClass('hidden');
    }
    $hiddenThemeIssue.focusin(mainCharacteristicsOtherInputFocusinHandler);
    $hiddenThemeIssue.focusout(mainCharacteristicsOtherInputFocusoutHandler);

    var $addbutton = $($rowToInsert.children('td:nth-child(2)')).children('button');
    $addbutton.click($.proxy(mainCharacteristicsAddButtonHandler, null, $form));

    // Remove any empty UnitWrappers (below the button)
    $rowToInsert.find('.mainCharacteristicsUnitsWrapper').each(function () {
      if ($(this).text().trim().length == 0) {
        $(this).detach();
      }
    });

    // Fix the set count and value for all the Django hidden fields
    var newSetCount = mainCharacteristicsGetSetCount($form);
    var regex_pattern = /[0-9]+/g;
    $rowToInsert.find('input').each(function () {
      var elemName = $(this).attr('name');
      var elemId = $(this).prop('id');

      $(this).attr('name', elemName.replace(regex_pattern, newSetCount));
      $(this).prop('id', elemId.replace(regex_pattern, newSetCount));

      // If this is the input for selected_attribute_id, erase it's value
      if (elemName.indexOf('selected_attribute_id') > 0) {
        $(this).val('');
      }

      // If this is the input for row_number, change the value to setCount+2,000,000 to avoid db conflicts
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

    // Add flags to disregard Django control fields for LeavePageWarning
    $rowToInsert.children('input[type="hidden"]').attr('data-leave-page-exclude', 'true');

    // Erase the data in "additional" field
    $rowToInsert.find('input[name$="additional"]').attr('value', '').val('');

    // Append the new row
    $thisRow.after($rowToInsert.hide());
    $rowToInsert.slideDown('slow');

    // Append the delete checkbox for this new formset
    var deleteControl = $('<div class="deleteCheckBoxContainer"><input id="id_mainattributeview_set- '+
      newSetCount + '-DELETE" name="mainattributeview_set-' + newSetCount + '-DELETE" type="checkbox"></div>');

    $form.find('.FormSet').first().append(deleteControl);
  }

  function mainCharacteristicsDeleteButtonHandler() {
    // Event object is always the last item in arguments array.
    // in this case arguments[2] would be the Jquery.Event object
    var $form = arguments[0];

    // Hide all tooltips
    $('.tooltip').hide();

    var $thisRow = $(this).parent().parent(); // Grab the <tr>

    // Get the setCount of this row
    var regex_pattern = /[0-9]+/g;
    var setCount = $thisRow.children('input').first().attr('name').match(regex_pattern)[0];

    // Get initial set count
    var initialSetCount = mainCharacteristicsGetInitialSetCount($form);

    // On delete action:
    // 1. all the input/select should be extracted from this row
    // 2. converted to hidden input (they need to be submitted)
    // 3. remove this row from DOM.
    // 4. check the delete checkbox for this formset
    var initialTotalCount = parseInt($form.find('input[name$="INITIAL_FORMS"][type="hidden"]').val());
    var currentTotalCount = parseInt($form.find('input[name$="TOTAL_FORMS"][type="hidden"]').val());

    // Hide this row
    $thisRow.slideUp("slow");

    // Move all the input/select from this row to the parent form
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

    // Remove this row from DOM
    $thisRow.detach();

    // Check the delete checkbox for this formset
    $form.find('input[type="checkbox"]').each(function () {
      var elemName = $(this).attr('name');
      if (elemName.indexOf('-' + setCount + '-DELETE') > 0) {
        $(this).prop('checked', true);
        return false;
      }
    });
  }

  function mainCharacteristicsSelectHandler() {
    $(this).next('input[type="hidden"][name$="other_value"]').val('');
    if ($(this).children('option:selected').text().trim() == 'Other') {
      $(this).next('input[name$="other_value"]').removeClass('hidden');
    } else {
      $(this).next('input[name$="other_value"]').addClass('hidden');
    }

    $(this).next('input[type="hidden"][name$="other_theme_issue"]').val('');
    if ($(this).children('option:selected').text().trim() == 'Other') {
      $(this).next('input[name$="other_theme_issue"]').removeClass('hidden');
    } else {
      $(this).next('input[name$="other_theme_issue"]').addClass('hidden');
    }

    // Append empty unit wrappers
    var $selectElem = $(this);
    $(this).parent().next().find('.mainCharacteristicsUnitsWrapper').detach();
    $(this).parent().find('input').each(function () {
      if ($(this).is(':visible')) {
        $selectElem.parent().next().find('button').after('<div class="mainCharacteristicsUnitsWrapper">&nbsp;</div>');
      }
    });

    // Click on Add button (hidden) on change
    $(this).closest('.profile-attributes-row').find('.gqAddButton').click();
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
    var $hiddenFormSetCountField = $form.find('input[type="hidden"][name$="TOTAL_FORMS"]');
    var count = parseInt($hiddenFormSetCountField.val());
    return count;
  }

  function mainCharacteristicsGetInitialSetCount($form) {
    var $hiddenFormSetCountField = $form.find('input[type="hidden"][name$="INITIAL_FORMS"]');
    var count = parseInt($hiddenFormSetCountField.val());
    return count;
  }

  function mainCharacteristicsIncrementSetCount($form) {
    var $hiddenFormSetCountField = $form.find('input[type="hidden"][name$="TOTAL_FORMS"]');
    var count = parseInt($hiddenFormSetCountField.val());
    $hiddenFormSetCountField.val(count + 1);
  }

  function mainCharacteristicsDecrementSetCount($form) {
    var $hiddenFormSetCountField = $form.find('input[type="hidden"][name$="TOTAL_FORMS"]');
    var count = parseInt($hiddenFormSetCountField.val());
    $hiddenFormSetCountField.val(count - 1);
  }

  /*
    ==== Utility functions ====
  */

  // Fix Django formset number for Dynamically inserted formsets
  var Util_FixSetNumber = function ($target, newSetCount) {
    var forAttr = $target.attr('for');
    var idAttr = $target.attr('id');
    var nameAttr = $target.attr('name');

    if (typeof forAttr !== typeof undefined && forAttr !== false) {
      forAttr = forAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-')
      $target.attr('for', forAttr);

      // For Home Page --> Advanced Search --> Char Tab, form id is of format: id_form-0-attribute
      // Need extra handling
      $target.attr('for', forAttr.replace(/form-\d*-/i, 'form-' + newSetCount + '-'));
    }

    if (typeof idAttr !== typeof undefined && idAttr !== false) {
      idAttr = idAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-')
      $target.attr('id', idAttr);

      // For Home Page --> Advanced Search --> Char Tab, form id is of format: id_form-0-attribute
      // Need extra handling
      $target.attr('id', idAttr.replace(/form-\d*-/i, 'form-' + newSetCount + '-'));
    }
    if (typeof nameAttr !== typeof undefined && nameAttr !== false) {
      nameAttr = nameAttr.replace(/_set-\d*-/i, '_set-' + newSetCount + '-')
      $target.attr('name', nameAttr);

      // For Home Page --> Advanced Search --> Char Tab, form id is of format: id_form-0-attribute
      // Need extra handling
      $target.attr('name', nameAttr.replace(/form-\d*-/i, 'form-' + newSetCount + '-'));
    }
  }

  // Assumes Associated Other Field is on the same Level as the target element
  var Util_HideAssociatedOtherField = function ($target) {
    var elementIndex = $target.index();
    var $parent = $target.parent();
    for (var i = elementIndex; i < $parent.children().length; i++) {
      if ($($parent.children()[i]).hasClass('FormSetOtherInputField')) {
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

  // Assumes Associated Other Field is on the same Level as the target element
  var Util_ShowAssociatedOtherField = function ($target) {
    var elementIndex = $target.index();
    var $parent = $target.parent();

    for (var i = elementIndex; i < $parent.children().length; i++) {
      if ($($parent.children()[i]).hasClass('FormSetOtherInputField')) {
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

  // Used to detect changes made to form elements on the page
  var Util_GetAllFormValues = function () {
    var FormValues = "";
    $('.FormSet').each(function () {
      FormValues += "{";
      // Input fields
      // Note: for the case of profile pages -> main characteristics form.
      // whenever a row of attribute has been added, there are always a few Django control
      // hidden input fields getting copied. These fields should not be considered
      // when gathering page changes. Therefore, when adding/inserting the attributes
      // add a [data-leave-page-exclude="true"] to any hidden input field that should be
      // disregarded for leavepage warning check.
      $(this).find('input[data-leave-page-exclude!="true"]').each(function () {
        if ($(this) !== typeof undefined && $(this) !== false && $(this).val() != null) {
          if ($(this).attr('type') == "checkbox" || $(this).attr('type') == "radio") {
            FormValues += $(this).is(':checked');
          } else {
            FormValues += $(this).val().trim();
          }
        }
      });

      // Select boxes
      $(this).find('select').each(function () {
        if ($(this) !== typeof undefined && $(this) !== false && $(this).val() != null) {
          var tempVal = $(this).val();
          if (tempVal instanceof Array) {
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
  };

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

      // Check if the last list item has a Other checkbox
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
