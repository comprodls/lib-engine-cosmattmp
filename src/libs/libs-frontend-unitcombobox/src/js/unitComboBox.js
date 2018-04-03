(function ($) {

  // add the plugin to the jQuery.fn object
  $.fn.unitsComboBox = function (options) {
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
      "step":"0.1",
      "dataRule":"currency",
      "numberFormatterOptions": {
      },
      callBackFn: function () { }
    }

    // current instance of the object
    var plugin = this;
    var timerId = 0;
    plugin.settings = {}
    var $element = $(this); // reference to the jQuery version of DOM element  
    // the plugin's final properties are the merged default and
    plugin.settings = $.extend({}, defaults, options);       
    var numberFormatter = new Cosmatt.NumberFormatter(plugin.settings.numberFormatterOptions);
    
    // the "constructor" method that gets called when the object is created
    plugin.init = function () {
      
      // function is called to intialze dom element
      createComboBox(plugin.settings.unitType);
      
    }

    /** public function to update plugin contols based on inputs  **/
    plugin.update = function (options) {
      var newOptions = $.extend({}, plugin.settings, options);

      $element.find('.cosmatt-unitComboBox')[newOptions.show == 'true' ? 'show' : 'hide']();

      newOptions.enable.textbox == 'true' ? $element.find('.cosmatt-unitComboBox').find('input').removeAttr('disabled') :
        $element.find('.cosmatt-unitComboBox').find('input').attr('disabled', 'disabled');

      newOptions.enable.comboBox == 'true' ? $element.find('.cosmatt-unitComboBox').find('.btn-group').find('button').removeAttr('disabled') :
        $element.find('.cosmatt-unitComboBox').find('.btn-group').find('button').attr('disabled', 'disabled');

      $element.find('.cosmatt-unitComboBox').find('.unitTextBox')[newOptions.showComboBoxOnly == 'true' ? 'hide' : 'show']();

      $element.find('.cosmatt-unitComboBox').find('.unitComboBox')[newOptions.showTextBoxOnly == 'true' ? 'hide' : 'show']();
    };

    /** public function return SI value for provided unit type **/
    plugin.getSIValue = function () {

      var textboxValue = 0;
      var SIUnitObj = '';
      if (typeof COSMATT.UNITCONVERTER === 'object') {
        SIUnitObj = COSMATT.UNITCONVERTER.getSIUnit(plugin.settings.unitType);

        //textboxValue = $element.find(".amount_" + plugin.settings.unitType).val();
        var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, plugin.settings.value, plugin.settings.unit, SIUnitObj.id);
       
        return convertedVal;
      }
    };

    /** public function return value in selected unit type from dropdown **/
    plugin.getValueInSelectedUnit = function (siVal) {



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
    plugin.getConversionFactor = function () {

      var textboxValue = 0;
      var conversionfactor = '';
      if (typeof COSMATT.UNITCONVERTER === 'object') {
        conversionfactor = COSMATT.UNITCONVERTER.getConversionFactor(plugin.settings.unitType, plugin.settings.unit);

      }
      return conversionfactor;
    };
    /** public function set DropBox Item **/
    plugin.setDropBoxItem = function (optionId) {

      $element.find('.dropdown-menu a').filter(function (ele, option) {           
            $element.find('a.selected').removeClass('selected');
            return $(option).data('id') == optionId;
      }).addClass("selected");
     
      $element.find('button.boxSelectedVal').text($element.find('a.selected').text());
      

      var textboxValue = 0;
      textboxValue = plugin.settings.value;
      if (textboxValue === '') {
        plugin.setTextBoxValue(textboxValue);
        plugin.settings.unit = $element.find('a.selected').data('id');
        return;
      }

      if (plugin.settings.showComboBoxOnly == 'true') {
        var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, 1, plugin.settings.unit, $element.find('a.selected').data('id'));
      } else {
        var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, textboxValue, plugin.settings.unit, $element.find('a.selected').data('id'));
      }

      // conversionfactor = COSMATT.UNITCONVERTER.getConversionFactor(plugin.settings.unitType, $(this).val());

      plugin.settings.unit = $element.find('a.selected').data('id');
      plugin.setTextBoxValue(convertedVal);
    }
    /** public function to set Value in SI unit **/
    plugin.setSIValue = function (value) {
      var SIUnit = COSMATT.UNITCONVERTER.getSIUnit(plugin.settings.unitType);
      var currentValue = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType,value,SIUnit.id,plugin.settings.unit); 
      
      plugin.setTextBoxValue(currentValue);
    }
    /** public function set TextboxValue **/
    plugin.setTextBoxValue = function (value) {

      var stringToNum;

      if (value === '') {
        stringToNum = value;
      } else {
        stringToNum = Number(value);
      }
      plugin.settings.value = value;
    
      plugin.formatTextBoxValue(value);
      // if (plugin.settings.roundOfNumber !== '' && stringToNum !== '') {
      //   // stringToNum = (stringToNum).toFixed(plugin.settings.roundOfNumber);
      //   // stringToNum = (stringToNum).toFixed(plugin.settings.roundOfNumber);
      //   var decimalPlaces = Math.pow(10, plugin.settings.roundOfNumber);
      //   stringToNum = Math.round(stringToNum * decimalPlaces) / decimalPlaces;
      // }

      //$element.find(".amount_" + plugin.settings.unitType).val(stringToNum);
      //$element.find(".amount_" + plugin.settings.unitType).attr('title', plugin.settings.value);
    };
    plugin.formatTextBoxValue = function (value) {
      if($element.find(".unitTextBox input").is(":focus")) {
        console.log("input has focus, don't format")
        return;
      }
      if(numberFormatter) {
        value = numberFormatter.format(value, true);
      }
      $element.find(".amount_" + plugin.settings.unitType).val(value);
    };
    /* private method
     *  createComboBox functions is responsible to create dopdown,textbox and attache event handler 
     *  input value TIME or ANGULARACCELERATION or MASS etc 
     */
    var createComboBox = function (unitType) {

      var callbackData = {};
      try {
        if (typeof COSMATT.UNITCONVERTER === 'object' && unitType != '') {
          var dropDownOptions = COSMATT.UNITCONVERTER.getunitsAndIds(unitType);
          //var UNITSI = COSMATT.UNITCONVERTER.getSIUnit(unitType);

          var $unitWrapper = $('<div class="cosmatt-unitComboBox"></div>');
          $element.append($unitWrapper);


          var $textboxContainer = $('<div class="unitTextBox"></div>');
          $unitWrapper.append($textboxContainer);


          var $spinControlWrap = $('<div class="input-group unitComboBoxGrp"></div>');
          $textboxContainer.append($spinControlWrap);

         
          if (plugin.settings.mode == 'spin') {  

            $spinControlWrap.addClass("spinner");

            $spinControlWrap.attr('data-trigger','spinner');

             var $inputBox = $('<input type="text" class="form-control text-left spin-control amount_' + plugin.settings.unitType + '" value="" data-rule="'+plugin.settings.dataRule+'"></div>');
             $spinControlWrap.append($inputBox);

            $inputBox.attr('data-step', plugin.settings.step);
            var $inputGroup = $('<div class="input-group-addon"></div>');
            $spinControlWrap.append($inputGroup);

            var $spinUp = $('<a href="javascript:;" class="spin-up" data-spin="up"><i class="fa fa-caret-up"></i></a>');
            $inputGroup.append($spinUp);

            var $spinDown = $(' <a href="javascript:;" class="spin-down" data-spin="down"><i class="fa fa-caret-down"></i></a>');
            $inputGroup.append($spinDown);

          }
          else{
            $spinControlWrap.addClass("defaultTextBox");

            var $inputBox = $('<input type="text" class="form-control text-left input-control amount_' + plugin.settings.unitType + '" value="" data-rule="'+plugin.settings.dataRule+'"></div>');
            $spinControlWrap.append($inputBox);
          }         
         
          plugin.setTextBoxValue(plugin.settings.value);

          if (plugin.settings.max != undefined) {
            $inputBox.attr('max', plugin.settings.max);
          }
          else {
            $inputBox.attr('max', '9999999999');
          }
          if (plugin.settings.min != undefined) {
            $inputBox.attr('min', plugin.settings.min);
          }
          else {
            $inputBox.attr('min', '0');
          }

          /***********************Drop Box*************************/
           for (var loop1 = 0; loop1 < dropDownOptions.length; loop1++) {
            if (plugin.settings.unit == dropDownOptions[loop1].id) {
              var selectedUnit = dropDownOptions[loop1].name;
              var selectedUnitId = dropDownOptions[loop1].id;
            }
          }

          var $unitDropDown = $('<div class="unitComboBox"></div>');
          $unitWrapper.append($unitDropDown);

          var $buttonGrp = $('<div class="btn-group"></div>');
          $unitDropDown.append($buttonGrp);

          var $btnSecondary = $('<button type="button" data-toggle="dropdown" class="btn btn-default boxSelectedVal" id="comboBox' + plugin.settings.unitType + '">'+selectedUnit+'</button>');
          $buttonGrp.append($btnSecondary);

          var $toggleButton = $('<button type="button" data-toggle="dropdown" class="btn btn-default dropdown-toggle"><span class="caret"></span></button>');
          $buttonGrp.append($toggleButton);

          var $menuItems = $('<ul class="dropdown-menu"></ul>');
          $buttonGrp.append($menuItems);

          for (var loop = 0; loop < dropDownOptions.length; loop++) {
            var $list = $('<li></li>');
            $menuItems.append($list);
            var option = $('<a class="dropdown-item">'+dropDownOptions[loop].name+'</a>');    
            option.data('id', dropDownOptions[loop].id);       
            $list.append(option);
          }

          $textboxContainer.css('width', plugin.settings.comboBoxWidthRatio.textBox);
          $unitDropDown.css('width', plugin.settings.comboBoxWidthRatio.comboBox);

          $element.find('.dropdown-menu a').filter(function (ele, option) {           
            return $(option).data('id') == plugin.settings.unit;
          }).addClass("selected");


          plugin.settings.unit = selectedUnitId;
          comboBoxEventHandler();
          textBoxEventHandler();
          plugin.update({});
          plugin.settings.SIValue = plugin.getSIValue({});
          if (typeof plugin.settings.callBackFn == 'function') { // make sure the callback is a function    

            callbackData.unit = plugin.settings.unit;
            callbackData.SIValue = plugin.settings.SIValue;
            plugin.settings.callBackFn.call(callbackData); // brings the scope to the callback
          }
        }
      } catch (errorMessage) {
        console.log('Error : ' + errorMessage);
      }
    };

    var createComboBox_2 = function (unitType) {

      var callbackData = {};
      try {
        if (typeof COSMATT.UNITCONVERTER === 'object' && unitType != '') {
          var dropDownOptions = COSMATT.UNITCONVERTER.getunitsAndIds(unitType);
          //var UNITSI = COSMATT.UNITCONVERTER.getSIUnit(unitType);

          var $unitWrapper = $('<div class="cosmatt-unitComboBox"></div>');
          $element.append($unitWrapper);
          var textBoxType = 'text';
          var step = '';
          if (plugin.settings.mode == 'spin') {
            textBoxType = 'number';
            step = plugin.settings.step;
            // disabled temporarily
            numberFormatter = null;
          }

          var $textBoxControl = $('<input type ="' + textBoxType + '" value="" class="form-control amount_' + plugin.settings.unitType + ' unitTextBox" step="' + plugin.settings.step + '"></input>');
          $unitWrapper.append($textBoxControl);
          plugin.setTextBoxValue(plugin.settings.value);
          if (plugin.settings.max != undefined) {
            $textBoxControl.attr('max', plugin.settings.max);
          }
          else {
            $textBoxControl.attr('max', '9999999999');
          }
          if (plugin.settings.min != undefined) {
            $textBoxControl.attr('min', plugin.settings.min);
          }
          else {
            $textBoxControl.attr('min', '0');
          }

          for (var loop1 = 0; loop1 < dropDownOptions.length; loop1++) {
            if (plugin.settings.unit == dropDownOptions[loop1].id) {
              var selectedUnit = dropDownOptions[loop1].name;
            }
          }
          var $unitDropDown = $('<select id="comboBox' + plugin.settings.unitType + '" class="form-control unitComboBox"></select');
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

          $element.find('select option').filter(function (ele, option) {
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

    var comboBoxEventHandler = function () {
      var textboxValue = 0;
      var callbackData = {};

      $element.find('.dropdown-menu a').bind("mousedown",function(event){
       
          textboxValue = plugin.settings.value;        

          if (textboxValue === '') {
            plugin.setTextBoxValue(textboxValue);
            plugin.settings.unit = $(this).data('id');
            return;
          }

          if (plugin.settings.showComboBoxOnly == 'true') {
            var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, 1, plugin.settings.unit, $(this).data('id'));
          } else {
          var convertedVal = COSMATT.UNITCONVERTER.getUnitConvertedValue(plugin.settings.unitType, textboxValue, plugin.settings.unit, $(this).data('id'));
          }

          conversionfactor = COSMATT.UNITCONVERTER.getConversionFactor(plugin.settings.unitType, plugin.settings.value);
          plugin.settings.unit = $(this).data('id');
          
          $element.find('button.boxSelectedVal').text($(this).text());
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

    }
    var comboBoxEventHandler_2 = function () {
      var textboxValue = 0;
      var callbackData = {};

      $element.find(".unitComboBox").on('change', function (event) {
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

        conversionfactor = COSMATT.UNITCONVERTER.getConversionFactor(plugin.settings.unitType, plugin.settings.value);

        plugin.settings.unit = $element.find(":selected").data('id');
        //$(this).attr('title',$(this).val());
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

    var textBoxEventHandler = function () {

     $element.find(".unitTextBox input").on('focus', function () {
     
        $(this).val(plugin.settings.value)
      });
      $element.find(".unitTextBox input").on('blur', function () {
       
        plugin.setTextBoxValue(plugin.settings.value);
      });   
      $element.find(".unitTextBox input.input-control").on('input', function () {
         
        var self = this;
        plugin.settings.value = $(self).val();
        var $pluginObj = $element
        var callbackData = {};

        if (timerId > 0) {
          clearTimeout(timerId);
        }

        timerId = setTimeout((function () {
          //plugin.setTextBoxValue($(self).val());

         // if (parseInt(plugin.settings.value) <= parseInt($(self).attr('max')) && parseInt(plugin.settings.value) >= parseInt($(self).attr('min'))) {
            if (typeof plugin.settings.callBackFn == 'function') { // make sure the callback is a function    

              callbackData.value = plugin.settings.value;
              callbackData.unit = plugin.settings.unit;
              callbackData.type = "textbox";
              callbackData.SIValue = plugin.getSIValue();

              plugin.settings.callBackFn.call(callbackData); // brings the scope to the callback
            }
         // }
        }), 800);


      });
      if(plugin.settings.mode == 'spin'){
          $element.find(".unitComboBoxGrp").spinner('changing',function(e, newVal, oldVal){  

        
          var self = this;
          plugin.settings.value = newVal;
          var $pluginObj = $element
          var callbackData = {};
         
            //if (parseInt(plugin.settings.value) <= parseInt($(self).attr('max')) && parseInt(plugin.settings.value) >= parseInt($(self).attr('min'))) {
              
              if (typeof plugin.settings.callBackFn == 'function') { // make sure the callback is a function
                callbackData.value = plugin.settings.value;
                callbackData.unit = plugin.settings.unit;
                callbackData.type = "textbox";
                callbackData.SIValue = plugin.getSIValue();

                plugin.settings.callBackFn.call(callbackData); // brings the scope to the callback
              }
            //}
        });

      }


    };
    var textBoxEventHandler_2 = function () {
      $element.find(".unitTextBox").on('focus', function () {
        $(this).val(plugin.settings.value)
      });
      $element.find(".unitTextBox").on('blur', function () {
        plugin.setTextBoxValue(plugin.settings.value);
      });
      $element.find(".unitTextBox").on('input', function () {
        var self = this;
        plugin.settings.value = $(self).val();
        var $pluginObj = $element
        var callbackData = {};

        if (timerId > 0) {
          clearTimeout(timerId);
        }

        timerId = setTimeout((function () {
          //plugin.setTextBoxValue($(self).val());

          if (parseInt(plugin.settings.value) <= parseInt($(self).attr('max')) && parseInt(plugin.settings.value) >= parseInt($(self).attr('min'))) {
            if (typeof plugin.settings.callBackFn == 'function') { // make sure the callback is a function    

              callbackData.value = plugin.settings.value;
              callbackData.unit = plugin.settings.unit;
              callbackData.type = "textbox";
              callbackData.SIValue = plugin.getSIValue();

              plugin.settings.callBackFn.call(callbackData); // brings the scope to the callback
            }
          }
        }), 800);


      });

    };

    // call the "constructor" method
    plugin.init();
    $(this).data('unitsComboBox', plugin);
  }

})(jQuery);