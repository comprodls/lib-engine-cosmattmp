(function($) {

  // add the plugin to the jQuery.fn object
  $.fn.unitsComboBox = function(options) {
    // default values 
    var defaults = {
      "unitType": "",
      "unit": "",
      "roundOfNumber": "",
      "value": "",
      "show": "true",
      "enable": {
        "textbox": "true",
        "comboBox": "true"
      },
      "comboBoxWidthRatio": {
        "textBox": "60%",
        "comboBox": "40%"
      },
      callBackFn: function() {}
    }

    // current instance of the object
    var plugin = this;
    var timerId = 0;
    plugin.settings = {}
    var $element = $(this); // reference to the jQuery version of DOM element         

    // the "constructor" method that gets called when the object is created
    plugin.init = function() {
      // the plugin's final properties are the merged default and
      plugin.settings = $.extend({}, defaults, options);

      // function is called to intialze dom element
      createComboBox(plugin.settings.unitType);
    }

    /** public function to update plugin contols based on inputs  **/
    plugin.update = function(options) {
      var newOptions = $.extend({}, plugin.settings, options);

      $element.find('.cosmatt-unitComboBox')[newOptions.show == 'true' ? 'show' : 'hide']();

      newOptions.enable.textbox == 'true' ? $element.find('.cosmatt-unitComboBox').find('input').removeAttr('disabled') :
        $element.find('.cosmatt-unitComboBox').find('input').attr('disabled', 'disabled');

      newOptions.enable.comboBox == 'true' ? $element.find('.cosmatt-unitComboBox').find('select').removeAttr('disabled') :
        $element.find('.cosmatt-unitComboBox').find('select').attr('disabled', 'disabled');

      $element.find('.cosmatt-unitComboBox').find('.unitTextBox')[newOptions.showComboBoxOnly == 'true' ? 'hide' : 'show']();


    };

    /** public function return SI value for provided unit type **/
    plugin.getSIValue = function() {

      var textboxValue = 0;
      var SIUnitObj = '';
      if (typeof COSMATT.UNITCONVERTER === 'object') {
        SIUnitObj = COSMATT.UNITCONVERTER.getSIUnit(plugin.settings.unitType);

        textboxValue = $element.find(".amount_" + plugin.settings.unitType).val();
        var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, textboxValue, plugin.settings.unit, SIUnitObj.id);
        return convertedVal;
      }
    };

    /** public function return value in selected unit type from dropdown **/
    plugin.getValueInSelectedUnit = function(siVal) {



      // var textboxValue = 0;
      var SIUnitObj = '';
      if (typeof COSMATT.UNITCONVERTER === 'object') {
        SIUnitObj = COSMATT.UNITCONVERTER.getSIUnit(plugin.settings.unitType);

        // textboxValue = $element.find(".amount_" + plugin.settings.unitType).val();
        var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, siVal, SIUnitObj.id, plugin.settings.unit);
        return convertedVal;
      }
    };

    /** public function return SI value for provided unit type **/
    plugin.getConversionFactor = function() {

      var textboxValue = 0;
      var conversionfactor = '';
      if (typeof COSMATT.UNITCONVERTER === 'object') {
        conversionfactor = COSMATT.UNITCONVERTER.getConversionFactor(plugin.settings.unitType, plugin.settings.unit);

      }
      return conversionfactor;
    };
    /** public function set DropBox Item **/
    plugin.setDropBoxItem = function(optionId) {
        var $comboBox = $element.find(".unitComboBox");
       // $comboBox.find('option').eq(index).attr("selected", true);
       $element.find('select option').filter( function(ele , option) {
           return $(option).data('id') == optionId
        }).attr("selected", true); 

        var textboxValue = 0;
        textboxValue = plugin.settings.value;
        if (textboxValue === '') {
          plugin.setTextBoxValue(textboxValue);
          plugin.settings.unit = $element.find(":selected").data('id');
          return;
        }

        if (plugin.settings.showComboBoxOnly == 'true') {
          var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, 1, plugin.settings.unit, $element.find(":selected").data('id'));
        } else {
          var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, textboxValue, plugin.settings.unit, $element.find(":selected").data('id'));
        }

        // conversionfactor = COSMATT.UNITCONVERTER.getConversionFactor(plugin.settings.unitType, $(this).val());

        plugin.settings.unit = $element.find(":selected").data('id');
        plugin.setTextBoxValue(convertedVal);
      }
      /** public function set TextboxValue **/
    plugin.setTextBoxValue = function(value) {
    
      var stringToNum;
      if (value === '') {
        stringToNum = value;
      } else {
        stringToNum = Number(value);
      }
      plugin.settings.value = value;
      if (plugin.settings.roundOfNumber !== '' && stringToNum !== '') {
        // stringToNum = (stringToNum).toFixed(plugin.settings.roundOfNumber);
        // stringToNum = (stringToNum).toFixed(plugin.settings.roundOfNumber);
        var decimalPlaces = Math.pow(10, plugin.settings.roundOfNumber);
        stringToNum = Math.round(stringToNum * decimalPlaces) / decimalPlaces;
      }
      $element.find(".amount_" + plugin.settings.unitType).val(stringToNum);
       $element.find(".amount_" + plugin.settings.unitType).attr('title',stringToNum);
    };
    /* private method
     *  createComboBox functions is responsible to create dopdown,textbox and attache event handler 
     *  input value TIME or ANGULARACCELERATION or MASS etc 
     */
    var createComboBox = function(unitType) {
      
      var callbackData = {};
      try {
        if (typeof COSMATT.UNITCONVERTER === 'object' && unitType != '') {
          var dropDownOptions = COSMATT.UNITCONVERTER.getunitsAndIds(unitType);
          //var UNITSI = COSMATT.UNITCONVERTER.getSIUnit(unitType);

          var $unitWrapper = $('<div class="cosmatt-unitComboBox"></div>');
          $element.append($unitWrapper);
          var textBoxType = 'textbox';
          var step ='';
          if(plugin.settings.mode == 'spin'){
            textBoxType = 'number';
            step = plugin.settings.step;
          }
        
          var $textBoxControl = $('<input type ="'+textBoxType+'" value="" class="form-control amount_' + plugin.settings.unitType + ' unitTextBox" step="'+step+'"></input>');
          $unitWrapper.append($textBoxControl);
          plugin.setTextBoxValue(plugin.settings.value);


          if(plugin.settings.max != undefined){
            $textBoxControl.attr('max',plugin.settings.max);
          }
          if(plugin.settings.min != undefined){
            $textBoxControl.attr('min',plugin.settings.min);
          }

          for (var loop1 = 0; loop1 < dropDownOptions.length; loop1++) {           
            if(plugin.settings.unit == dropDownOptions[loop1].id){
              var selectedUnit = dropDownOptions[loop1].name; 
            }
          }
          var $unitDropDown = $('<select id="comboBox' + plugin.settings.unitType + '" class="form-control unitComboBox" title="'+selectedUnit+'"></select');
          $unitWrapper.append($unitDropDown);

          $textBoxControl.css('width', plugin.settings.comboBoxWidthRatio.textBox);
          $unitDropDown.css('width', plugin.settings.comboBoxWidthRatio.comboBox);


          for (var loop = 0; loop < dropDownOptions.length; loop++) {
            var option = $('<option value="' + dropDownOptions[loop].name + '">' + dropDownOptions[loop].name + '</option>');
            option.data('id', dropDownOptions[loop].id);
            $unitDropDown.append(option);
           
          }


          //$element.find('select option[value="' + plugin.settings.unit + '"]').attr("selected", true);
          //$element.find(".unitComboBox").find('option').eq(plugin.settings.unit).attr("selected", true);

          $element.find('select option').filter(function(ele,option){         
           return $(option).data('id') == plugin.settings.unit;
          }).attr("selected", true);                

          plugin.settings.unit = $element.find('#comboBox' + plugin.settings.unitType + ' :selected').data('id');
          comboBoxEventHandler();
          textBoxEventHandler();
          plugin.update({});
          plugin.settings.SIValue = plugin.getSIValue({});


          if (typeof plugin.settings.callBackFn == 'function') { // make sure the callback is a function    

            callbackData.unitName = plugin.settings.unit;
            callbackData.SIValue = plugin.settings.SIValue;
            plugin.settings.callBackFn.call(callbackData); // brings the scope to the callback
          }

        }
      } catch (errorMessage) {
        console.log('Error : ' + errorMessage);
      }
    };
    /** Combo box event handler **/
    var comboBoxEventHandler = function() {
      var textboxValue = 0;
      var callbackData = {};

      $element.find(".unitComboBox").on('change', function(event) {
        // textboxValue = $element.find(".amount_" + plugin.settings.unitType).val();

       
        textboxValue = plugin.settings.value;
        if (textboxValue === '') {
          plugin.setTextBoxValue(textboxValue);
          plugin.settings.unit = $element.find(":selected").data('id');
          return;
        }

        if (plugin.settings.showComboBoxOnly == 'true') {
          var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, 1, plugin.settings.unit, $element.find(":selected").data('id'));
        } else {
          var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, textboxValue, plugin.settings.unit, $element.find(":selected").data('id'));
        }

        conversionfactor = COSMATT.UNITCONVERTER.getConversionFactor(plugin.settings.unitType, $(this).val());

        plugin.settings.unit = $element.find(":selected").data('id');
        $(this).attr('title',$(this).val());
        plugin.setTextBoxValue(convertedVal);

        if (typeof plugin.settings.callBackFn == 'function') { // make sure the callback is a function    
          // callbackData.conversionfactor = conversionfactor;
          callbackData.unit = plugin.settings.unit;
          callbackData.value = plugin.settings.value;
          callbackData.SIValue = plugin.getSIValue({});
          callbackData.type = "dropdown";
          plugin.settings.callBackFn.call(callbackData); // brings the scope to the callback
        }

      });
    };
    /** Text box event handler **/
    var textBoxEventHandler = function() {
      $element.find(".unitTextBox").on('input', function() {

        var self = this;
        var $pluginObj = $element
        var callbackData = {};

        if (timerId > 0) {
          clearTimeout(timerId);
        }

        timerId = setTimeout((function() {
          plugin.setTextBoxValue($(self).val());
          if (typeof plugin.settings.callBackFn == 'function') { // make sure the callback is a function    

            callbackData.value = plugin.settings.value;
            callbackData.unit = plugin.settings.unit;
            callbackData.type = "textbox";
            callbackData.SIValue = plugin.getSIValue();

            plugin.settings.callBackFn.call(callbackData); // brings the scope to the callback
          }
        }), 800);

      });

    };

    // call the "constructor" method
    plugin.init();
    $(this).data('unitsComboBox', plugin);
  }

})(jQuery);