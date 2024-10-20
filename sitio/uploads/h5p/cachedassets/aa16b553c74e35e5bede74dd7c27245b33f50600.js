var H5P = H5P || {};
/**
 * Transition contains helper function relevant for transitioning
 */
H5P.Transition = (function ($) {

  /**
   * @class
   * @namespace H5P
   */
  Transition = {};

  /**
   * @private
   */
  Transition.transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'transition':       'transitionend',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  /**
   * @private
   */
  Transition.cache = [];

  /**
   * Get the vendor property name for an event
   *
   * @function H5P.Transition.getVendorPropertyName
   * @static
   * @private
   * @param  {string} prop Generic property name
   * @return {string}      Vendor specific property name
   */
  Transition.getVendorPropertyName = function (prop) {

    if (Transition.cache[prop] !== undefined) {
      return Transition.cache[prop];
    }

    var div = document.createElement('div');

    // Handle unprefixed versions (FF16+, for example)
    if (prop in div.style) {
      Transition.cache[prop] = prop;
    }
    else {
      var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
      var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

      if (prop in div.style) {
        Transition.cache[prop] = prop;
      }
      else {
        for (var i = 0; i < prefixes.length; ++i) {
          var vendorProp = prefixes[i] + prop_;
          if (vendorProp in div.style) {
            Transition.cache[prop] = vendorProp;
            break;
          }
        }
      }
    }

    return Transition.cache[prop];
  };

  /**
   * Get the name of the transition end event
   *
   * @static
   * @private
   * @return {string}  description
   */
  Transition.getTransitionEndEventName = function () {
    return Transition.transitionEndEventNames[Transition.getVendorPropertyName('transition')] || undefined;
  };

  /**
   * Helper function for listening on transition end events
   *
   * @function H5P.Transition.onTransitionEnd
   * @static
   * @param  {domElement} $element The element which is transitioned
   * @param  {function} callback The callback to be invoked when transition is finished
   * @param  {number} timeout  Timeout in milliseconds. Fallback if transition event is never fired
   */
  Transition.onTransitionEnd = function ($element, callback, timeout) {
    // Fallback on 1 second if transition event is not supported/triggered
    timeout = timeout || 1000;
    Transition.transitionEndEventName = Transition.transitionEndEventName || Transition.getTransitionEndEventName();
    var callbackCalled = false;

    var doCallback = function () {
      if (callbackCalled) {
        return;
      }
      $element.off(Transition.transitionEndEventName, callback);
      callbackCalled = true;
      clearTimeout(timer);
      callback();
    };

    var timer = setTimeout(function () {
      doCallback();
    }, timeout);

    $element.on(Transition.transitionEndEventName, function () {
      doCallback();
    });
  };

  /**
   * Wait for a transition - when finished, invokes next in line
   *
   * @private
   *
   * @param {Object[]}    transitions             Array of transitions
   * @param {H5P.jQuery}  transitions[].$element  Dom element transition is performed on
   * @param {number=}     transitions[].timeout   Timeout fallback if transition end never is triggered
   * @param {bool=}       transitions[].break     If true, sequence breaks after this transition
   * @param {number}      index                   The index for current transition
   */
  var runSequence = function (transitions, index) {
    if (index >= transitions.length) {
      return;
    }

    var transition = transitions[index];
    H5P.Transition.onTransitionEnd(transition.$element, function () {
      if (transition.end) {
        transition.end();
      }
      if (transition.break !== true) {
        runSequence(transitions, index+1);
      }
    }, transition.timeout || undefined);
  };

  /**
   * Run a sequence of transitions
   *
   * @function H5P.Transition.sequence
   * @static
   * @param {Object[]}    transitions             Array of transitions
   * @param {H5P.jQuery}  transitions[].$element  Dom element transition is performed on
   * @param {number=}     transitions[].timeout   Timeout fallback if transition end never is triggered
   * @param {bool=}       transitions[].break     If true, sequence breaks after this transition
   */
  Transition.sequence = function (transitions) {
    runSequence(transitions, 0);
  };

  return Transition;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * Class responsible for creating a help text dialog
 */
H5P.JoubelHelpTextDialog = (function ($) {

  var numInstances = 0;
  /**
   * Display a pop-up containing a message.
   *
   * @param {H5P.jQuery}  $container  The container which message dialog will be appended to
   * @param {string}      message     The message
   * @param {string}      closeButtonTitle The title for the close button
   * @return {H5P.jQuery}
   */
  function JoubelHelpTextDialog(header, message, closeButtonTitle) {
    H5P.EventDispatcher.call(this);

    var self = this;

    numInstances++;
    var headerId = 'joubel-help-text-header-' + numInstances;
    var helpTextId = 'joubel-help-text-body-' + numInstances;

    var $helpTextDialogBox = $('<div>', {
      'class': 'joubel-help-text-dialog-box',
      'role': 'dialog',
      'aria-labelledby': headerId,
      'aria-describedby': helpTextId
    });

    $('<div>', {
      'class': 'joubel-help-text-dialog-background'
    }).appendTo($helpTextDialogBox);

    var $helpTextDialogContainer = $('<div>', {
      'class': 'joubel-help-text-dialog-container'
    }).appendTo($helpTextDialogBox);

    $('<div>', {
      'class': 'joubel-help-text-header',
      'id': headerId,
      'role': 'header',
      'html': header
    }).appendTo($helpTextDialogContainer);

    $('<div>', {
      'class': 'joubel-help-text-body',
      'id': helpTextId,
      'html': message,
      'role': 'document',
      'tabindex': 0
    }).appendTo($helpTextDialogContainer);

    var handleClose = function () {
      $helpTextDialogBox.remove();
      self.trigger('closed');
    };

    var $closeButton = $('<div>', {
      'class': 'joubel-help-text-remove',
      'role': 'button',
      'title': closeButtonTitle,
      'tabindex': 1,
      'click': handleClose,
      'keydown': function (event) {
        // 32 - space, 13 - enter
        if ([32, 13].indexOf(event.which) !== -1) {
          event.preventDefault();
          handleClose();
        }
      }
    }).appendTo($helpTextDialogContainer);

    /**
     * Get the DOM element
     * @return {HTMLElement}
     */
    self.getElement = function () {
      return $helpTextDialogBox;
    };

    self.focus = function () {
      $closeButton.focus();
    };
  }

  JoubelHelpTextDialog.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelHelpTextDialog.prototype.constructor = JoubelHelpTextDialog;

  return JoubelHelpTextDialog;
}(H5P.jQuery));
;
var H5P = H5P || {};

/**
 * Class responsible for creating auto-disappearing dialogs
 */
H5P.JoubelMessageDialog = (function ($) {

  /**
   * Display a pop-up containing a message.
   *
   * @param {H5P.jQuery} $container The container which message dialog will be appended to
   * @param {string} message The message
   * @return {H5P.jQuery}
   */
  function JoubelMessageDialog ($container, message) {
    var timeout;

    var removeDialog = function () {
      $warning.remove();
      clearTimeout(timeout);
      $container.off('click.messageDialog');
    };

    // Create warning popup:
    var $warning = $('<div/>', {
      'class': 'joubel-message-dialog',
      text: message
    }).appendTo($container);

    // Remove after 3 seconds or if user clicks anywhere in $container:
    timeout = setTimeout(removeDialog, 3000);
    $container.on('click.messageDialog', removeDialog);

    return $warning;
  }

  return JoubelMessageDialog;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * Class responsible for creating a circular progress bar
 */

H5P.JoubelProgressCircle = (function ($) {

  /**
   * Constructor for the Progress Circle
   *
   * @param {Number} number The amount of progress to display
   * @param {string} progressColor Color for the progress meter
   * @param {string} backgroundColor Color behind the progress meter
   */
  function ProgressCircle(number, progressColor, fillColor, backgroundColor) {
    progressColor = progressColor || '#1a73d9';
    fillColor = fillColor || '#f0f0f0';
    backgroundColor = backgroundColor || '#ffffff';
    var progressColorRGB = this.hexToRgb(progressColor);

    //Verify number
    try {
      number = Number(number);
      if (number === '') {
        throw 'is empty';
      }
      if (isNaN(number)) {
        throw 'is not a number';
      }
    } catch (e) {
      number = 'err';
    }

    //Draw circle
    if (number > 100) {
      number = 100;
    }

    // We can not use rgba, since they will stack on top of each other.
    // Instead we create the equivalent of the rgba color
    // and applies this to the activeborder and background color.
    var progressColorString = 'rgb(' + parseInt(progressColorRGB.r, 10) +
      ',' + parseInt(progressColorRGB.g, 10) +
      ',' + parseInt(progressColorRGB.b, 10) + ')';

    // Circle wrapper
    var $wrapper = $('<div/>', {
      'class': "joubel-progress-circle-wrapper"
    });

    //Active border indicates progress
    var $activeBorder = $('<div/>', {
      'class': "joubel-progress-circle-active-border"
    }).appendTo($wrapper);

    //Background circle
    var $backgroundCircle = $('<div/>', {
      'class': "joubel-progress-circle-circle"
    }).appendTo($activeBorder);

    //Progress text/number
    $('<span/>', {
      'text': number + '%',
      'class': "joubel-progress-circle-percentage"
    }).appendTo($backgroundCircle);

    var deg = number * 3.6;
    if (deg <= 180) {
      $activeBorder.css('background-image',
        'linear-gradient(' + (90 + deg) + 'deg, transparent 50%, ' + fillColor + ' 50%),' +
        'linear-gradient(90deg, ' + fillColor + ' 50%, transparent 50%)')
        .css('border', '2px solid' + backgroundColor)
        .css('background-color', progressColorString);
    } else {
      $activeBorder.css('background-image',
        'linear-gradient(' + (deg - 90) + 'deg, transparent 50%, ' + progressColorString + ' 50%),' +
        'linear-gradient(90deg, ' + fillColor + ' 50%, transparent 50%)')
        .css('border', '2px solid' + backgroundColor)
        .css('background-color', progressColorString);
    }

    this.$activeBorder = $activeBorder;
    this.$backgroundCircle = $backgroundCircle;
    this.$wrapper = $wrapper;

    this.initResizeFunctionality();

    return $wrapper;
  }

  /**
   * Initializes resize functionality for the progress circle
   */
  ProgressCircle.prototype.initResizeFunctionality = function () {
    var self = this;

    $(window).resize(function () {
      // Queue resize
      setTimeout(function () {
        self.resize();
      });
    });

    // First resize
    setTimeout(function () {
      self.resize();
    }, 0);
  };

  /**
   * Resize function makes progress circle grow or shrink relative to parent container
   */
  ProgressCircle.prototype.resize = function () {
    var $parent = this.$wrapper.parent();

    if ($parent !== undefined && $parent) {

      // Measurements
      var fontSize = parseInt($parent.css('font-size'), 10);

      // Static sizes
      var fontSizeMultiplum = 3.75;
      var progressCircleWidthPx = parseInt((fontSize / 4.5), 10) % 2 === 0 ? parseInt((fontSize / 4.5), 10) + 4 : parseInt((fontSize / 4.5), 10) + 5;
      var progressCircleOffset = progressCircleWidthPx / 2;

      var width = fontSize * fontSizeMultiplum;
      var height = fontSize * fontSizeMultiplum;
      this.$activeBorder.css({
        'width': width,
        'height': height
      });

      this.$backgroundCircle.css({
        'width': width - progressCircleWidthPx,
        'height': height - progressCircleWidthPx,
        'top': progressCircleOffset,
        'left': progressCircleOffset
      });
    }
  };

  /**
   * Hex to RGB conversion
   * @param hex
   * @returns {{r: Number, g: Number, b: Number}}
   */
  ProgressCircle.prototype.hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return ProgressCircle;

}(H5P.jQuery));
;
var H5P = H5P || {};

H5P.SimpleRoundedButton = (function ($) {

  /**
   * Creates a new tip
   */
  function SimpleRoundedButton(text) {

    var $simpleRoundedButton = $('<div>', {
      'class': 'joubel-simple-rounded-button',
      'title': text,
      'role': 'button',
      'tabindex': '0'
    }).keydown(function (e) {
      // 32 - space, 13 - enter
      if ([32, 13].indexOf(e.which) !== -1) {
        $(this).click();
        e.preventDefault();
      }
    });

    $('<span>', {
      'class': 'joubel-simple-rounded-button-text',
      'html': text
    }).appendTo($simpleRoundedButton);

    return $simpleRoundedButton;
  }

  return SimpleRoundedButton;
}(H5P.jQuery));
;
var H5P = H5P || {};

/**
 * Class responsible for creating speech bubbles
 */
H5P.JoubelSpeechBubble = (function ($) {

  var $currentSpeechBubble;
  var $currentContainer;  
  var $tail;
  var $innerTail;
  var removeSpeechBubbleTimeout;
  var currentMaxWidth;

  var DEFAULT_MAX_WIDTH = 400;

  var iDevice = navigator.userAgent.match(/iPod|iPhone|iPad/g) ? true : false;

  /**
   * Creates a new speech bubble
   *
   * @param {H5P.jQuery} $container The speaking object
   * @param {string} text The text to display
   * @param {number} maxWidth The maximum width of the bubble
   * @return {H5P.JoubelSpeechBubble}
   */
  function JoubelSpeechBubble($container, text, maxWidth) {
    maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
    currentMaxWidth = maxWidth;
    $currentContainer = $container;

    this.isCurrent = function ($tip) {
      return $tip.is($currentContainer);
    };

    this.remove = function () {
      remove();
    };

    var fadeOutSpeechBubble = function ($speechBubble) {
      if (!$speechBubble) {
        return;
      }

      // Stop removing bubble
      clearTimeout(removeSpeechBubbleTimeout);

      $speechBubble.removeClass('show');
      setTimeout(function () {
        if ($speechBubble) {
          $speechBubble.remove();
          $speechBubble = undefined;
        }
      }, 500);
    };

    if ($currentSpeechBubble !== undefined) {
      remove();
    }

    var $h5pContainer = getH5PContainer($container);

    // Make sure we fade out old speech bubble
    fadeOutSpeechBubble($currentSpeechBubble);

    // Create bubble
    $tail = $('<div class="joubel-speech-bubble-tail"></div>');
    $innerTail = $('<div class="joubel-speech-bubble-inner-tail"></div>');
    var $innerBubble = $(
      '<div class="joubel-speech-bubble-inner">' +
      '<div class="joubel-speech-bubble-text">' + text + '</div>' +
      '</div>'
    ).prepend($innerTail);

    $currentSpeechBubble = $(
      '<div class="joubel-speech-bubble" aria-live="assertive">'
    ).append([$tail, $innerBubble])
      .appendTo($h5pContainer);

    // Show speech bubble with transition
    setTimeout(function () {
      $currentSpeechBubble.addClass('show');
    }, 0);

    position($currentSpeechBubble, $currentContainer, maxWidth, $tail, $innerTail);

    // Handle click to close
    H5P.$body.on('mousedown.speechBubble', handleOutsideClick);

    // Handle window resizing
    H5P.$window.on('resize', '', handleResize);

    // Handle clicks when inside IV which blocks bubbling.
    $container.parents('.h5p-dialog')
      .on('mousedown.speechBubble', handleOutsideClick);

    if (iDevice) {
      H5P.$body.css('cursor', 'pointer');
    }

    return this;
  }

  // Remove speechbubble if it belongs to a dom element that is about to be hidden
  H5P.externalDispatcher.on('domHidden', function (event) {
    if ($currentSpeechBubble !== undefined && event.data.$dom.find($currentContainer).length !== 0) {
      remove();
    }
  });

  /**
   * Returns the closest h5p container for the given DOM element.
   * 
   * @param {object} $container jquery element
   * @return {object} the h5p container (jquery element)
   */
  function getH5PContainer($container) {
    var $h5pContainer = $container.closest('.h5p-frame');

    // Check closest h5p frame first, then check for container in case there is no frame.
    if (!$h5pContainer.length) {
      $h5pContainer = $container.closest('.h5p-container');
    }

    return $h5pContainer;
  }

  /**
   * Event handler that is called when the window is resized.
   */
  function handleResize() {
    position($currentSpeechBubble, $currentContainer, currentMaxWidth, $tail, $innerTail);
  }

  /**
   * Repositions the speech bubble according to the position of the container.
   * 
   * @param {object} $currentSpeechbubble the speech bubble that should be positioned   
   * @param {object} $container the container to which the speech bubble should point 
   * @param {number} maxWidth the maximum width of the speech bubble
   * @param {object} $tail the tail (the triangle that points to the referenced container)
   * @param {object} $innerTail the inner tail (the triangle that points to the referenced container)
   */
  function position($currentSpeechBubble, $container, maxWidth, $tail, $innerTail) {
    var $h5pContainer = getH5PContainer($container);

    // Calculate offset between the button and the h5p frame
    var offset = getOffsetBetween($h5pContainer, $container);

    var direction = (offset.bottom > offset.top ? 'bottom' : 'top');
    var tipWidth = offset.outerWidth * 0.9; // Var needs to be renamed to make sense
    var bubbleWidth = tipWidth > maxWidth ? maxWidth : tipWidth;

    var bubblePosition = getBubblePosition(bubbleWidth, offset);
    var tailPosition = getTailPosition(bubbleWidth, bubblePosition, offset, $container.width());
    // Need to set font-size, since element is appended to body.
    // Using same font-size as parent. In that way it will grow accordingly
    // when resizing
    var fontSize = 16;//parseFloat($parent.css('font-size'));

    // Set width and position of speech bubble
    $currentSpeechBubble.css(bubbleCSS(
      direction,
      bubbleWidth,
      bubblePosition,
      fontSize
    ));

    var preparedTailCSS = tailCSS(direction, tailPosition);
    $tail.css(preparedTailCSS);
    $innerTail.css(preparedTailCSS);
  }

  /**
   * Static function for removing the speechbubble
   */
  var remove = function () {
    H5P.$body.off('mousedown.speechBubble');
    H5P.$window.off('resize', '', handleResize);
    $currentContainer.parents('.h5p-dialog').off('mousedown.speechBubble');
    if (iDevice) {
      H5P.$body.css('cursor', '');
    }
    if ($currentSpeechBubble !== undefined) {
      // Apply transition, then remove speech bubble
      $currentSpeechBubble.removeClass('show');

      // Make sure we remove any old timeout before reassignment
      clearTimeout(removeSpeechBubbleTimeout);
      removeSpeechBubbleTimeout = setTimeout(function () {
        $currentSpeechBubble.remove();
        $currentSpeechBubble = undefined;
      }, 500);
    }
    // Don't return false here. If the user e.g. clicks a button when the bubble is visible,
    // we want the bubble to disapear AND the button to receive the event
  };

  /**
   * Remove the speech bubble and container reference
   */
  function handleOutsideClick(event) {
    if (event.target === $currentContainer[0]) {
      return; // Button clicks are not outside clicks
    }

    remove();
    // There is no current container when a container isn't clicked
    $currentContainer = undefined;
  }

  /**
   * Calculate position for speech bubble
   *
   * @param {number} bubbleWidth The width of the speech bubble
   * @param {object} offset
   * @return {object} Return position for the speech bubble
   */
  function getBubblePosition(bubbleWidth, offset) {
    var bubblePosition = {};

    var tailOffset = 9;
    var widthOffset = bubbleWidth / 2;

    // Calculate top position
    bubblePosition.top = offset.top + offset.innerHeight;

    // Calculate bottom position
    bubblePosition.bottom = offset.bottom + offset.innerHeight + tailOffset;

    // Calculate left position
    if (offset.left < widthOffset) {
      bubblePosition.left = 3;
    }
    else if ((offset.left + widthOffset) > offset.outerWidth) {
      bubblePosition.left = offset.outerWidth - bubbleWidth - 3;
    }
    else {
      bubblePosition.left = offset.left - widthOffset + (offset.innerWidth / 2);
    }

    return bubblePosition;
  }

  /**
   * Calculate position for speech bubble tail
   *
   * @param {number} bubbleWidth The width of the speech bubble
   * @param {object} bubblePosition Speech bubble position
   * @param {object} offset
   * @param {number} iconWidth The width of the tip icon
   * @return {object} Return position for the tail
   */
  function getTailPosition(bubbleWidth, bubblePosition, offset, iconWidth) {
    var tailPosition = {};
    // Magic numbers. Tuned by hand so that the tail fits visually within
    // the bounds of the speech bubble.
    var leftBoundary = 9;
    var rightBoundary = bubbleWidth - 20;

    tailPosition.left = offset.left - bubblePosition.left + (iconWidth / 2) - 6;
    if (tailPosition.left < leftBoundary) {
      tailPosition.left = leftBoundary;
    }
    if (tailPosition.left > rightBoundary) {
      tailPosition.left = rightBoundary;
    }

    tailPosition.top = -6;
    tailPosition.bottom = -6;

    return tailPosition;
  }

  /**
   * Return bubble CSS for the desired growth direction
   *
   * @param {string} direction The direction the speech bubble will grow
   * @param {number} width The width of the speech bubble
   * @param {object} position Speech bubble position
   * @param {number} fontSize The size of the bubbles font
   * @return {object} Return CSS
   */
  function bubbleCSS(direction, width, position, fontSize) {
    if (direction === 'top') {
      return {
        width: width + 'px',
        bottom: position.bottom + 'px',
        left: position.left + 'px',
        fontSize: fontSize + 'px',
        top: ''
      };
    }
    else {
      return {
        width: width + 'px',
        top: position.top + 'px',
        left: position.left + 'px',
        fontSize: fontSize + 'px',
        bottom: ''
      };
    }
  }

  /**
   * Return tail CSS for the desired growth direction
   *
   * @param {string} direction The direction the speech bubble will grow
   * @param {object} position Tail position
   * @return {object} Return CSS
   */
  function tailCSS(direction, position) {
    if (direction === 'top') {
      return {
        bottom: position.bottom + 'px',
        left: position.left + 'px',
        top: ''
      };
    }
    else {
      return {
        top: position.top + 'px',
        left: position.left + 'px',
        bottom: ''
      };
    }
  }

  /**
   * Calculates the offset between an element inside a container and the
   * container. Only works if all the edges of the inner element are inside the
   * outer element.
   * Width/height of the elements is included as a convenience.
   *
   * @param {H5P.jQuery} $outer
   * @param {H5P.jQuery} $inner
   * @return {object} Position offset
   */
  function getOffsetBetween($outer, $inner) {
    var outer = $outer[0].getBoundingClientRect();
    var inner = $inner[0].getBoundingClientRect();

    return {
      top: inner.top - outer.top,
      right: outer.right - inner.right,
      bottom: outer.bottom - inner.bottom,
      left: inner.left - outer.left,
      innerWidth: inner.width,
      innerHeight: inner.height,
      outerWidth: outer.width,
      outerHeight: outer.height
    };
  }

  return JoubelSpeechBubble;
})(H5P.jQuery);
;
var H5P = H5P || {};

H5P.JoubelThrobber = (function ($) {

  /**
   * Creates a new tip
   */
  function JoubelThrobber() {

    // h5p-throbber css is described in core
    var $throbber = $('<div/>', {
      'class': 'h5p-throbber'
    });

    return $throbber;
  }

  return JoubelThrobber;
}(H5P.jQuery));
;
H5P.JoubelTip = (function ($) {
  var $conv = $('<div/>');

  /**
   * Creates a new tip element.
   *
   * NOTE that this may look like a class but it doesn't behave like one.
   * It returns a jQuery object.
   *
   * @param {string} tipHtml The text to display in the popup
   * @param {Object} [behaviour] Options
   * @param {string} [behaviour.tipLabel] Set to use a custom label for the tip button (you want this for good A11Y)
   * @param {boolean} [behaviour.helpIcon] Set to 'true' to Add help-icon classname to Tip button (changes the icon)
   * @param {boolean} [behaviour.showSpeechBubble] Set to 'false' to disable functionality (you may this in the editor)
   * @param {boolean} [behaviour.tabcontrol] Set to 'true' if you plan on controlling the tabindex in the parent (tabindex="-1")
   * @return {H5P.jQuery|undefined} Tip button jQuery element or 'undefined' if invalid tip
   */
  function JoubelTip(tipHtml, behaviour) {

    // Keep track of the popup that appears when you click the Tip button
    var speechBubble;

    // Parse tip html to determine text
    var tipText = $conv.html(tipHtml).text().trim();
    if (tipText === '') {
      return; // The tip has no textual content, i.e. it's invalid.
    }

    // Set default behaviour
    behaviour = $.extend({
      tipLabel: tipText,
      helpIcon: false,
      showSpeechBubble: true,
      tabcontrol: false
    }, behaviour);

    // Create Tip button
    var $tipButton = $('<div/>', {
      class: 'joubel-tip-container' + (behaviour.showSpeechBubble ? '' : ' be-quiet'),
      'aria-label': behaviour.tipLabel,
      'aria-expanded': false,
      role: 'button',
      tabindex: (behaviour.tabcontrol ? -1 : 0),
      click: function (event) {
        // Toggle show/hide popup
        toggleSpeechBubble();
        event.preventDefault();
      },
      keydown: function (event) {
        if (event.which === 32 || event.which === 13) { // Space & enter key
          // Toggle show/hide popup
          toggleSpeechBubble();
          event.stopPropagation();
          event.preventDefault();
        }
        else { // Any other key
          // Toggle hide popup
          toggleSpeechBubble(false);
        }
      },
      // Add markup to render icon
      html: '<span class="joubel-icon-tip-normal ' + (behaviour.helpIcon ? ' help-icon': '') + '">' +
              '<span class="h5p-icon-shadow"></span>' +
              '<span class="h5p-icon-speech-bubble"></span>' +
              '<span class="h5p-icon-info"></span>' +
            '</span>'
      // IMPORTANT: All of the markup elements must have 'pointer-events: none;'
    });

    const $tipAnnouncer = $('<div>', {
      'class': 'hidden-but-read',
      'aria-live': 'polite',
      appendTo: $tipButton,
    });

    /**
     * Tip button interaction handler.
     * Toggle show or hide the speech bubble popup when interacting with the
     * Tip button.
     *
     * @private
     * @param {boolean} [force] 'true' shows and 'false' hides.
     */
    var toggleSpeechBubble = function (force) {
      if (speechBubble !== undefined && speechBubble.isCurrent($tipButton)) {
        // Hide current popup
        speechBubble.remove();
        speechBubble = undefined;

        $tipButton.attr('aria-expanded', false);
        $tipAnnouncer.html('');
      }
      else if (force !== false && behaviour.showSpeechBubble) {
        // Create and show new popup
        speechBubble = H5P.JoubelSpeechBubble($tipButton, tipHtml);
        $tipButton.attr('aria-expanded', true);
        $tipAnnouncer.html(tipHtml);
      }
    };

    return $tipButton;
  }

  return JoubelTip;
})(H5P.jQuery);
;
var H5P = H5P || {};

H5P.JoubelSlider = (function ($) {

  /**
   * Creates a new Slider
   *
   * @param {object} [params] Additional parameters
   */
  function JoubelSlider(params) {
    H5P.EventDispatcher.call(this);

    this.$slider = $('<div>', $.extend({
      'class': 'h5p-joubel-ui-slider'
    }, params));

    this.$slides = [];
    this.currentIndex = 0;
    this.numSlides = 0;
  }
  JoubelSlider.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelSlider.prototype.constructor = JoubelSlider;

  JoubelSlider.prototype.addSlide = function ($content) {
    $content.addClass('h5p-joubel-ui-slide').css({
      'left': (this.numSlides*100) + '%'
    });
    this.$slider.append($content);
    this.$slides.push($content);

    this.numSlides++;

    if(this.numSlides === 1) {
      $content.addClass('current');
    }
  };

  JoubelSlider.prototype.attach = function ($container) {
    $container.append(this.$slider);
  };

  JoubelSlider.prototype.move = function (index) {
    var self = this;

    if(index === 0) {
      self.trigger('first-slide');
    }
    if(index+1 === self.numSlides) {
      self.trigger('last-slide');
    }
    self.trigger('move');

    var $previousSlide = self.$slides[this.currentIndex];
    H5P.Transition.onTransitionEnd(this.$slider, function () {
      $previousSlide.removeClass('current');
      self.trigger('moved');
    });
    this.$slides[index].addClass('current');

    var translateX = 'translateX(' + (-index*100) + '%)';
    this.$slider.css({
      '-webkit-transform': translateX,
      '-moz-transform': translateX,
      '-ms-transform': translateX,
      'transform': translateX
    });

    this.currentIndex = index;
  };

  JoubelSlider.prototype.remove = function () {
    this.$slider.remove();
  };

  JoubelSlider.prototype.next = function () {
    if(this.currentIndex+1 >= this.numSlides) {
      return;
    }

    this.move(this.currentIndex+1);
  };

  JoubelSlider.prototype.previous = function () {
    this.move(this.currentIndex-1);
  };

  JoubelSlider.prototype.first = function () {
    this.move(0);
  };

  JoubelSlider.prototype.last = function () {
    this.move(this.numSlides-1);
  };

  return JoubelSlider;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * @module
 */
H5P.JoubelScoreBar = (function ($) {

  /* Need to use an id for the star SVG since that is the only way to reference
     SVG filters  */
  var idCounter = 0;

  /**
   * Creates a score bar
   * @class H5P.JoubelScoreBar
   * @param {number} maxScore  Maximum score
   * @param {string} [label] Makes it easier for readspeakers to identify the scorebar
   * @param {string} [helpText] Score explanation
   * @param {string} [scoreExplanationButtonLabel] Label for score explanation button
   */
  function JoubelScoreBar(maxScore, label, helpText, scoreExplanationButtonLabel) {
    var self = this;

    self.maxScore = maxScore;
    self.score = 0;
    idCounter++;

    /**
     * @const {string}
     */
    self.STAR_MARKUP = '<svg tabindex="-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.77 53.87" aria-hidden="true" focusable="false">' +
        '<title>star</title>' +
        '<filter tabindex="-1" id="h5p-joubelui-score-bar-star-inner-shadow-' + idCounter + '" x0="-50%" y0="-50%" width="200%" height="200%">' +
          '<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"></feGaussianBlur>' +
          '<feOffset dy="2" dx="4"></feOffset>' +
          '<feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>' +
          '<feFlood flood-color="#ffe95c" flood-opacity="1"></feFlood>' +
          '<feComposite in2="shadowDiff" operator="in"></feComposite>' +
          '<feComposite in2="SourceGraphic" operator="over" result="firstfilter"></feComposite>' +
          '<feGaussianBlur in="firstfilter" stdDeviation="3" result="blur2"></feGaussianBlur>' +
          '<feOffset dy="-2" dx="-4"></feOffset>' +
          '<feComposite in2="firstfilter" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>' +
          '<feFlood flood-color="#ffe95c" flood-opacity="1"></feFlood>' +
          '<feComposite in2="shadowDiff" operator="in"></feComposite>' +
          '<feComposite in2="firstfilter" operator="over"></feComposite>' +
        '</filter>' +
        '<path tabindex="-1" class="h5p-joubelui-score-bar-star-shadow" d="M35.08,43.41V9.16H20.91v0L9.51,10.85,9,10.93C2.8,12.18,0,17,0,21.25a11.22,11.22,0,0,0,3,7.48l8.73,8.53-1.07,6.16Z"/>' +
        '<g tabindex="-1">' +
          '<path tabindex="-1" class="h5p-joubelui-score-bar-star-border" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
          '<path tabindex="-1" class="h5p-joubelui-score-bar-star-fill" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
          '<path tabindex="-1" filter="url(#h5p-joubelui-score-bar-star-inner-shadow-' + idCounter + ')" class="h5p-joubelui-score-bar-star-fill-full-score" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
        '</g>' +
      '</svg>';

    /**
     * @function appendTo
     * @memberOf H5P.JoubelScoreBar#
     * @param {H5P.jQuery}  $wrapper  Dom container
     */
    self.appendTo = function ($wrapper) {
      self.$scoreBar.appendTo($wrapper);
    };

    /**
     * Create the text representation of the scorebar .
     *
     * @private
     * @return {string}
     */
    var createLabel = function (score) {
      if (!label) {
        return '';
      }

      return label.replace(':num', score).replace(':total', self.maxScore);
    };

    /**
     * Creates the html for this widget
     *
     * @method createHtml
     * @private
     */
    var createHtml = function () {
      // Container div
      self.$scoreBar = $('<div>', {
        'class': 'h5p-joubelui-score-bar',
      });

      var $visuals = $('<div>', {
        'class': 'h5p-joubelui-score-bar-visuals',
        appendTo: self.$scoreBar
      });

      // The progress bar wrapper
      self.$progressWrapper = $('<div>', {
        'class': 'h5p-joubelui-score-bar-progress-wrapper',
        appendTo: $visuals
      });

      self.$progress = $('<div>', {
        'class': 'h5p-joubelui-score-bar-progress',
        'html': createLabel(self.score),
        appendTo: self.$progressWrapper
      });

      // The star
      $('<div>', {
        'class': 'h5p-joubelui-score-bar-star',
        html: self.STAR_MARKUP
      }).appendTo($visuals);

      // The score container
      var $numerics = $('<div>', {
        'class': 'h5p-joubelui-score-numeric',
        appendTo: self.$scoreBar,
        'aria-hidden': true
      });

      // The current score
      self.$scoreCounter = $('<span>', {
        'class': 'h5p-joubelui-score-number h5p-joubelui-score-number-counter',
        text: 0,
        appendTo: $numerics
      });

      // The separator
      $('<span>', {
        'class': 'h5p-joubelui-score-number-separator',
        text: '/',
        appendTo: $numerics
      });

      // Max score
      self.$maxScore = $('<span>', {
        'class': 'h5p-joubelui-score-number h5p-joubelui-score-max',
        text: self.maxScore,
        appendTo: $numerics
      });

      if (helpText) {
        H5P.JoubelUI.createTip(helpText, {
          tipLabel: scoreExplanationButtonLabel ? scoreExplanationButtonLabel : helpText,
          helpIcon: true
        }).appendTo(self.$scoreBar);
        self.$scoreBar.addClass('h5p-score-bar-has-help');
      }
    };

    /**
     * Set the current score
     * @method setScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number} score
     */
    self.setScore = function (score) {
      // Do nothing if score hasn't changed
      if (score === self.score) {
        return;
      }
      self.score = score > self.maxScore ? self.maxScore : score;
      self.updateVisuals();
    };

    /**
     * Increment score
     * @method incrementScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number=}        incrementBy Optional parameter, defaults to 1
     */
    self.incrementScore = function (incrementBy) {
      self.setScore(self.score + (incrementBy || 1));
    };

    /**
     * Set the max score
     * @method setMaxScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number}    maxScore The max score
     */
    self.setMaxScore = function (maxScore) {
      self.maxScore = maxScore;
    };

    /**
     * Updates the progressbar visuals
     * @memberOf H5P.JoubelScoreBar#
     * @method updateVisuals
     */
    self.updateVisuals = function () {
      self.$progress.html(createLabel(self.score));
      self.$scoreCounter.text(self.score);
      self.$maxScore.text(self.maxScore);

      setTimeout(function () {
        // Start the progressbar animation
        self.$progress.css({
          width: ((self.score / self.maxScore) * 100) + '%'
        });

        H5P.Transition.onTransitionEnd(self.$progress, function () {
          // If fullscore fill the star and start the animation
          self.$scoreBar.toggleClass('h5p-joubelui-score-bar-full-score', self.score === self.maxScore);
          self.$scoreBar.toggleClass('h5p-joubelui-score-bar-animation-active', self.score === self.maxScore);

          // Only allow the star animation to run once
          self.$scoreBar.one("animationend", function() {
            self.$scoreBar.removeClass("h5p-joubelui-score-bar-animation-active");
          });
        }, 600);
      }, 300);
    };

    /**
     * Removes all classes
     * @method reset
     */
    self.reset = function () {
      self.$scoreBar.removeClass('h5p-joubelui-score-bar-full-score');
    };

    createHtml();
  }

  return JoubelScoreBar;
})(H5P.jQuery);
;
var H5P = H5P || {};

H5P.JoubelProgressbar = (function ($) {

  /**
   * Joubel progressbar class
   * @method JoubelProgressbar
   * @constructor
   * @param  {number}          steps Number of steps
   * @param {Object} [options] Additional options
   * @param {boolean} [options.disableAria] Disable readspeaker assistance
   * @param {string} [options.progressText] A progress text for describing
   *  current progress out of total progress for readspeakers.
   *  e.g. "Slide :num of :total"
   */
  function JoubelProgressbar(steps, options) {
    H5P.EventDispatcher.call(this);
    var self = this;
    this.options = $.extend({
      progressText: 'Slide :num of :total'
    }, options);
    this.currentStep = 0;
    this.steps = steps;

    this.$progressbar = $('<div>', {
      'class': 'h5p-joubelui-progressbar'
    });
    this.$background = $('<div>', {
      'class': 'h5p-joubelui-progressbar-background'
    }).appendTo(this.$progressbar);
  }

  JoubelProgressbar.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelProgressbar.prototype.constructor = JoubelProgressbar;

  JoubelProgressbar.prototype.updateAria = function () {
    var self = this;
    if (this.options.disableAria) {
      return;
    }

    if (!this.$currentStatus) {
      this.$currentStatus = $('<div>', {
        'class': 'h5p-joubelui-progressbar-slide-status-text',
        'aria-live': 'assertive'
      }).appendTo(this.$progressbar);
    }
    var interpolatedProgressText = self.options.progressText
      .replace(':num', self.currentStep)
      .replace(':total', self.steps);
    this.$currentStatus.html(interpolatedProgressText);
  };

  /**
   * Appends to a container
   * @method appendTo
   * @param  {H5P.jquery} $container
   */
  JoubelProgressbar.prototype.appendTo = function ($container) {
    this.$progressbar.appendTo($container);
  };

  /**
   * Update progress
   * @method setProgress
   * @param  {number}    step
   */
  JoubelProgressbar.prototype.setProgress = function (step) {
    // Check for valid value:
    if (step > this.steps || step < 0) {
      return;
    }
    this.currentStep = step;
    this.$background.css({
      width: ((this.currentStep/this.steps)*100) + '%'
    });

    this.updateAria();
  };

  /**
   * Increment progress with 1
   * @method next
   */
  JoubelProgressbar.prototype.next = function () {
    this.setProgress(this.currentStep+1);
  };

  /**
   * Reset progressbar
   * @method reset
   */
  JoubelProgressbar.prototype.reset = function () {
    this.setProgress(0);
  };

  /**
   * Check if last step is reached
   * @method isLastStep
   * @return {Boolean}
   */
  JoubelProgressbar.prototype.isLastStep = function () {
    return this.steps === this.currentStep;
  };

  return JoubelProgressbar;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * H5P Joubel UI library.
 *
 * This is a utility library, which does not implement attach. I.e, it has to bee actively used by
 * other libraries
 * @module
 */
H5P.JoubelUI = (function ($) {

  /**
   * The internal object to return
   * @class H5P.JoubelUI
   * @static
   */
  function JoubelUI() {}

  /* Public static functions */

  /**
   * Create a tip icon
   * @method H5P.JoubelUI.createTip
   * @param  {string}  text   The textual tip
   * @param  {Object}  params Parameters
   * @return {H5P.JoubelTip}
   */
  JoubelUI.createTip = function (text, params) {
    return new H5P.JoubelTip(text, params);
  };

  /**
   * Create message dialog
   * @method H5P.JoubelUI.createMessageDialog
   * @param  {H5P.jQuery}               $container The dom container
   * @param  {string}                   message    The message
   * @return {H5P.JoubelMessageDialog}
   */
  JoubelUI.createMessageDialog = function ($container, message) {
    return new H5P.JoubelMessageDialog($container, message);
  };

  /**
   * Create help text dialog
   * @method H5P.JoubelUI.createHelpTextDialog
   * @param  {string}             header  The textual header
   * @param  {string}             message The textual message
   * @param  {string}             closeButtonTitle The title for the close button
   * @return {H5P.JoubelHelpTextDialog}
   */
  JoubelUI.createHelpTextDialog = function (header, message, closeButtonTitle) {
    return new H5P.JoubelHelpTextDialog(header, message, closeButtonTitle);
  };

  /**
   * Create progress circle
   * @method H5P.JoubelUI.createProgressCircle
   * @param  {number}             number          The progress (0 to 100)
   * @param  {string}             progressColor   The progress color in hex value
   * @param  {string}             fillColor       The fill color in hex value
   * @param  {string}             backgroundColor The background color in hex value
   * @return {H5P.JoubelProgressCircle}
   */
  JoubelUI.createProgressCircle = function (number, progressColor, fillColor, backgroundColor) {
    return new H5P.JoubelProgressCircle(number, progressColor, fillColor, backgroundColor);
  };

  /**
   * Create throbber for loading
   * @method H5P.JoubelUI.createThrobber
   * @return {H5P.JoubelThrobber}
   */
  JoubelUI.createThrobber = function () {
    return new H5P.JoubelThrobber();
  };

  /**
   * Create simple rounded button
   * @method H5P.JoubelUI.createSimpleRoundedButton
   * @param  {string}                  text The button label
   * @return {H5P.SimpleRoundedButton}
   */
  JoubelUI.createSimpleRoundedButton = function (text) {
    return new H5P.SimpleRoundedButton(text);
  };

  /**
   * Create Slider
   * @method H5P.JoubelUI.createSlider
   * @param  {Object} [params] Parameters
   * @return {H5P.JoubelSlider}
   */
  JoubelUI.createSlider = function (params) {
    return new H5P.JoubelSlider(params);
  };

  /**
   * Create Score Bar
   * @method H5P.JoubelUI.createScoreBar
   * @param  {number=}       maxScore The maximum score
   * @param {string} [label] Makes it easier for readspeakers to identify the scorebar
   * @return {H5P.JoubelScoreBar}
   */
  JoubelUI.createScoreBar = function (maxScore, label, helpText, scoreExplanationButtonLabel) {
    return new H5P.JoubelScoreBar(maxScore, label, helpText, scoreExplanationButtonLabel);
  };

  /**
   * Create Progressbar
   * @method H5P.JoubelUI.createProgressbar
   * @param  {number=}       numSteps The total numer of steps
   * @param {Object} [options] Additional options
   * @param {boolean} [options.disableAria] Disable readspeaker assistance
   * @param {string} [options.progressText] A progress text for describing
   *  current progress out of total progress for readspeakers.
   *  e.g. "Slide :num of :total"
   * @return {H5P.JoubelProgressbar}
   */
  JoubelUI.createProgressbar = function (numSteps, options) {
    return new H5P.JoubelProgressbar(numSteps, options);
  };

  /**
   * Create standard Joubel button
   *
   * @method H5P.JoubelUI.createButton
   * @param {object} params
   *  May hold any properties allowed by jQuery. If href is set, an A tag
   *  is used, if not a button tag is used.
   * @return {H5P.jQuery} The jquery element created
   */
  JoubelUI.createButton = function(params) {
    var type = 'button';
    if (params.href) {
      type = 'a';
    }
    else {
      params.type = 'button';
    }
    if (params.class) {
      params.class += ' h5p-joubelui-button';
    }
    else {
      params.class = 'h5p-joubelui-button';
    }
    return $('<' + type + '/>', params);
  };

  /**
   * Fix for iframe scoll bug in IOS. When focusing an element that doesn't have
   * focus support by default the iframe will scroll the parent frame so that
   * the focused element is out of view. This varies dependening on the elements
   * of the parent frame.
   */
  if (H5P.isFramed && !H5P.hasiOSiframeScrollFix &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    H5P.hasiOSiframeScrollFix = true;

    // Keep track of original focus function
    var focus = HTMLElement.prototype.focus;

    // Override the original focus
    HTMLElement.prototype.focus = function () {
      // Only focus the element if it supports it natively
      if ( (this instanceof HTMLAnchorElement ||
            this instanceof HTMLInputElement ||
            this instanceof HTMLSelectElement ||
            this instanceof HTMLTextAreaElement ||
            this instanceof HTMLButtonElement ||
            this instanceof HTMLIFrameElement ||
            this instanceof HTMLAreaElement) && // HTMLAreaElement isn't supported by Safari yet.
          !this.getAttribute('role')) { // Focus breaks if a different role has been set
          // In theory this.isContentEditable should be able to recieve focus,
          // but it didn't work when tested.

        // Trigger the original focus with the proper context
        focus.call(this);
      }
    };
  }

  return JoubelUI;
})(H5P.jQuery);
;
H5P.Tooltip = H5P.Tooltip || function() {};

H5P.Question = (function ($, EventDispatcher, JoubelUI) {

  /**
   * Extending this class make it alot easier to create tasks for other
   * content types.
   *
   * @class H5P.Question
   * @extends H5P.EventDispatcher
   * @param {string} type
   */
  function Question(type) {
    var self = this;

    // Inheritance
    EventDispatcher.call(self);

    // Register default section order
    self.order = ['video', 'image', 'audio', 'introduction', 'content', 'explanation', 'feedback', 'scorebar', 'buttons', 'read'];

    // Keep track of registered sections
    var sections = {};

    // Buttons
    var buttons = {};
    var buttonOrder = [];

    // Wrapper when attached
    var $wrapper;

    // Click element
    var clickElement;

    // ScoreBar
    var scoreBar;

    // Keep track of the feedback's visual status.
    var showFeedback;

    // Keep track of which buttons are scheduled for hiding.
    var buttonsToHide = [];

    // Keep track of which buttons are scheduled for showing.
    var buttonsToShow = [];

    // Keep track of the hiding and showing of buttons.
    var toggleButtonsTimer;
    var toggleButtonsTransitionTimer;
    var buttonTruncationTimer;

    // Keeps track of initialization of question
    var initialized = false;

    /**
     * @type {Object} behaviour Behaviour of Question
     * @property {Boolean} behaviour.disableFeedback Set to true to disable feedback section
     */
    var behaviour = {
      disableFeedback: false,
      disableReadSpeaker: false
    };

    // Keeps track of thumb state
    var imageThumb = true;

    // Keeps track of image transitions
    var imageTransitionTimer;

    // Keep track of whether sections is transitioning.
    var sectionsIsTransitioning = false;

    // Keep track of auto play state
    var disableAutoPlay = false;

    // Feedback transition timer
    var feedbackTransitionTimer;

    // Used when reading messages to the user
    var $read, readText;

    /**
     * Register section with given content.
     *
     * @private
     * @param {string} section ID of the section
     * @param {(string|H5P.jQuery)} [content]
     */
    var register = function (section, content) {
      sections[section] = {};
      var $e = sections[section].$element = $('<div/>', {
        'class': 'h5p-question-' + section,
      });
      if (content) {
        $e[content instanceof $ ? 'append' : 'html'](content);
      }
    };

    /**
     * Update registered section with content.
     *
     * @private
     * @param {string} section ID of the section
     * @param {(string|H5P.jQuery)} content
     */
    var update = function (section, content) {
      if (content instanceof $) {
        sections[section].$element.html('').append(content);
      }
      else {
        sections[section].$element.html(content);
      }
    };

    /**
     * Insert element with given ID into the DOM.
     *
     * @private
     * @param {array|Array|string[]} order
     * List with ordered element IDs
     * @param {string} id
     * ID of the element to be inserted
     * @param {Object} elements
     * Maps ID to the elements
     * @param {H5P.jQuery} $container
     * Parent container of the elements
     */
    var insert = function (order, id, elements, $container) {
      // Try to find an element id should be after
      for (var i = 0; i < order.length; i++) {
        if (order[i] === id) {
          // Found our pos
          while (i > 0 &&
          (elements[order[i - 1]] === undefined ||
          !elements[order[i - 1]].isVisible)) {
            i--;
          }
          if (i === 0) {
            // We are on top.
            elements[id].$element.prependTo($container);
          }
          else {
            // Add after element
            elements[id].$element.insertAfter(elements[order[i - 1]].$element);
          }
          elements[id].isVisible = true;
          break;
        }
      }
    };

    /**
     * Make feedback into a popup and position relative to click.
     *
     * @private
     * @param {string} [closeText] Text for the close button
     */
    var makeFeedbackPopup = function (closeText) {
      var $element = sections.feedback.$element;
      var $parent = sections.content.$element;
      var $click = (clickElement != null ? clickElement.$element : null);

      $element.appendTo($parent).addClass('h5p-question-popup');

      if (sections.scorebar) {
        sections.scorebar.$element.appendTo($element);
      }

      $parent.addClass('h5p-has-question-popup');

      // Draw the tail
      var $tail = $('<div/>', {
        'class': 'h5p-question-feedback-tail'
      }).hide()
        .appendTo($parent);

      // Draw the close button
      var $close = $('<div/>', {
        'class': 'h5p-question-feedback-close',
        'tabindex': 0,
        'title': closeText,
        on: {
          click: function (event) {
            $element.remove();
            $tail.remove();
            event.preventDefault();
          },
          keydown: function (event) {
            switch (event.which) {
              case 13: // Enter
              case 32: // Space
                $element.remove();
                $tail.remove();
                event.preventDefault();
            }
          }
        }
      }).hide().appendTo($element);

      if ($click != null) {
        if ($click.hasClass('correct')) {
          $element.addClass('h5p-question-feedback-correct');
          $close.show();
          sections.buttons.$element.hide();
        }
        else {
          sections.buttons.$element.appendTo(sections.feedback.$element);
        }
      }

      positionFeedbackPopup($element, $click);
    };

    /**
     * Position the feedback popup.
     *
     * @private
     * @param {H5P.jQuery} $element Feedback div
     * @param {H5P.jQuery} $click Visual click div
     */
    var positionFeedbackPopup = function ($element, $click) {
      var $container = $element.parent();
      var $tail = $element.siblings('.h5p-question-feedback-tail');
      var popupWidth = $element.outerWidth();
      var popupHeight = setElementHeight($element);
      var space = 15;
      var disableTail = false;
      var positionY = $container.height() / 2 - popupHeight / 2;
      var positionX = $container.width() / 2 - popupWidth / 2;
      var tailX = 0;
      var tailY = 0;
      var tailRotation = 0;

      if ($click != null) {
        // Edge detection for click, takes space into account
        var clickNearTop = ($click[0].offsetTop < space);
        var clickNearBottom = ($click[0].offsetTop + $click.height() > $container.height() - space);
        var clickNearLeft = ($click[0].offsetLeft < space);
        var clickNearRight = ($click[0].offsetLeft + $click.width() > $container.width() - space);

        // Click is not in a corner or close to edge, calculate position normally
        positionX = $click[0].offsetLeft - popupWidth / 2  + $click.width() / 2;
        positionY = $click[0].offsetTop - popupHeight - space;
        tailX = positionX + popupWidth / 2 - $tail.width() / 2;
        tailY = positionY + popupHeight - ($tail.height() / 2);
        tailRotation = 225;

        // If popup is outside top edge, position under click instead
        if (popupHeight + space > $click[0].offsetTop) {
          positionY = $click[0].offsetTop + $click.height() + space;
          tailY = positionY - $tail.height() / 2 ;
          tailRotation = 45;
        }

        // If popup is outside left edge, position left
        if (positionX < 0) {
          positionX = 0;
        }

        // If popup is outside right edge, position right
        if (positionX + popupWidth > $container.width()) {
          positionX = $container.width() - popupWidth;
        }

        // Special cases such as corner clicks, or close to an edge, they override X and Y positions if met
        if (clickNearTop && (clickNearLeft || clickNearRight)) {
          positionX = $click[0].offsetLeft + (clickNearLeft ? $click.width() : -popupWidth);
          positionY = $click[0].offsetTop + $click.height();
          disableTail = true;
        }
        else if (clickNearBottom && (clickNearLeft || clickNearRight)) {
          positionX = $click[0].offsetLeft + (clickNearLeft ? $click.width() : -popupWidth);
          positionY = $click[0].offsetTop - popupHeight;
          disableTail = true;
        }
        else if (!clickNearTop && !clickNearBottom) {
          if (clickNearLeft || clickNearRight) {
            positionY = $click[0].offsetTop - popupHeight / 2 + $click.width() / 2;
            positionX = $click[0].offsetLeft + (clickNearLeft ? $click.width() + space : -popupWidth + -space);
            // Make sure this does not position the popup off screen
            if (positionX < 0) {
              positionX = 0;
              disableTail = true;
            }
            else {
              tailX = positionX + (clickNearLeft ? - $tail.width() / 2 : popupWidth - $tail.width() / 2);
              tailY = positionY + popupHeight / 2 - $tail.height() / 2;
              tailRotation = (clickNearLeft ? 315 : 135);
            }
          }
        }

        // Contain popup from overflowing bottom edge
        if (positionY + popupHeight > $container.height()) {
          positionY = $container.height() - popupHeight;

          if (popupHeight > $container.height() - ($click[0].offsetTop + $click.height() + space)) {
            disableTail = true;
          }
        }
      }
      else {
        disableTail = true;
      }

      // Contain popup from ovreflowing top edge
      if (positionY < 0) {
        positionY = 0;
      }

      $element.css({top: positionY, left: positionX});
      $tail.css({top: tailY, left: tailX});

      if (!disableTail) {
        $tail.css({
          'left': tailX,
          'top': tailY,
          'transform': 'rotate(' + tailRotation + 'deg)'
        }).show();
      }
      else {
        $tail.hide();
      }
    };

    /**
     * Set element max height, used for animations.
     *
     * @param {H5P.jQuery} $element
     */
    var setElementHeight = function ($element) {
      if (!$element.is(':visible')) {
        // No animation
        $element.css('max-height', 'none');
        return;
      }

      // If this element is shown in the popup, we can't set width to 100%,
      // since it already has a width set in CSS
      var isFeedbackPopup = $element.hasClass('h5p-question-popup');

      // Get natural element height
      var $tmp = $element.clone()
        .css({
          'position': 'absolute',
          'max-height': 'none',
          'width': isFeedbackPopup ? '' : '100%'
        })
        .appendTo($element.parent());

      // Need to take margins into account when calculating available space
      var sideMargins = parseFloat($element.css('margin-left'))
        + parseFloat($element.css('margin-right'));
      var tmpElWidth = $tmp.css('width') ? $tmp.css('width') : '100%';
      $tmp.css('width', 'calc(' + tmpElWidth + ' - ' + sideMargins + 'px)');

      // Apply height to element
      var h = Math.round($tmp.get(0).getBoundingClientRect().height);
      var fontSize = parseFloat($element.css('fontSize'));
      var relativeH = h / fontSize;
      $element.css('max-height', relativeH + 'em');
      $tmp.remove();

      if (h > 0 && sections.buttons && sections.buttons.$element === $element) {
        // Make sure buttons section is visible
        showSection(sections.buttons);

        // Resize buttons after resizing button section
        setTimeout(resizeButtons, 150);
      }
      return h;
    };

    /**
     * Does the actual job of hiding the buttons scheduled for hiding.
     *
     * @private
     * @param {boolean} [relocateFocus] Find a new button to focus
     */
    var hideButtons = function (relocateFocus) {
      for (var i = 0; i < buttonsToHide.length; i++) {
        hideButton(buttonsToHide[i].id);
      }
      buttonsToHide = [];

      if (relocateFocus) {
        self.focusButton();
      }
    };

    /**
     * Does the actual hiding.
     * @private
     * @param {string} buttonId
     */
    var hideButton = function (buttonId) {
      // Using detach() vs hide() makes it harder to cheat.
      buttons[buttonId].$element.detach();
      buttons[buttonId].isVisible = false;
    };

    /**
     * Shows the buttons on the next tick. This is to avoid buttons flickering
     * If they're both added and removed on the same tick.
     *
     * @private
     */
    var toggleButtons = function () {
      // If no buttons section, return
      if (sections.buttons === undefined) {
        return;
      }

      // Clear transition timer, reevaluate if buttons will be detached
      clearTimeout(toggleButtonsTransitionTimer);

      // Show buttons
      for (var i = 0; i < buttonsToShow.length; i++) {
        insert(buttonOrder, buttonsToShow[i].id, buttons, sections.buttons.$element);
        buttons[buttonsToShow[i].id].isVisible = true;
      }
      buttonsToShow = [];

      // Hide buttons
      var numToHide = 0;
      var relocateFocus = false;
      for (var j = 0; j < buttonsToHide.length; j++) {
        var button = buttons[buttonsToHide[j].id];
        if (button.isVisible) {
          numToHide += 1;
        }
        if (button.$element.is(':focus')) {
          // Move focus to the first visible button.
          relocateFocus = true;
        }
      }

      var animationTimer = 150;
      if (sections.feedback && sections.feedback.$element.hasClass('h5p-question-popup')) {
        animationTimer = 0;
      }

      if (numToHide === sections.buttons.$element.children().length) {
        // All buttons are going to be hidden. Hide container using transition.
        hideSection(sections.buttons);
        // Detach buttons
        hideButtons(relocateFocus);
      }
      else {
        hideButtons(relocateFocus);

        // Show button section
        if (!sections.buttons.$element.is(':empty')) {
          showSection(sections.buttons);
          setElementHeight(sections.buttons.$element);

          // Trigger resize after animation
          toggleButtonsTransitionTimer = setTimeout(function () {
            self.trigger('resize');
          }, animationTimer);
        }

        // Resize buttons to fit container
        resizeButtons();
      }

      toggleButtonsTimer = undefined;
    };

    /**
     * Allows for scaling of the question image.
     */
    var scaleImage = function () {
      var $imgSection = sections.image.$element;
      clearTimeout(imageTransitionTimer);

      // Add this here to avoid initial transition of the image making
      // content overflow. Alternatively we need to trigger a resize.
      $imgSection.addClass('animatable');

      if (imageThumb) {

        // Expand image
        $(this).attr('aria-expanded', true);
        $imgSection.addClass('h5p-question-image-fill-width');
        imageThumb = false;

        imageTransitionTimer = setTimeout(function () {
          self.trigger('resize');
        }, 600);
      }
      else {

        // Scale down image
        $(this).attr('aria-expanded', false);
        $imgSection.removeClass('h5p-question-image-fill-width');
        imageThumb = true;

        imageTransitionTimer = setTimeout(function () {
          self.trigger('resize');
        }, 600);
      }
    };

    /**
     * Get scrollable ancestor of element
     *
     * @private
     * @param {H5P.jQuery} $element
     * @param {Number} [currDepth=0] Current recursive calls to ancestor, stop at maxDepth
     * @param {Number} [maxDepth=5] Maximum depth for finding ancestor.
     * @returns {H5P.jQuery} Parent element that is scrollable
     */
    var findScrollableAncestor = function ($element, currDepth, maxDepth) {
      if (!currDepth) {
        currDepth = 0;
      }
      if (!maxDepth) {
        maxDepth = 5;
      }
      // Check validation of element or if we have reached document root
      if (!$element || !($element instanceof $) || document === $element.get(0) || currDepth >= maxDepth) {
        return;
      }

      if ($element.css('overflow-y') === 'auto') {
        return $element;
      }
      else {
        return findScrollableAncestor($element.parent(), currDepth + 1, maxDepth);
      }
    };

    /**
     * Scroll to bottom of Question.
     *
     * @private
     */
    var scrollToBottom = function () {
      if (!$wrapper || ($wrapper.hasClass('h5p-standalone') && !H5P.isFullscreen)) {
        return; // No scroll
      }

      var scrollableAncestor = findScrollableAncestor($wrapper);

      // Scroll to bottom of scrollable ancestor
      if (scrollableAncestor) {
        scrollableAncestor.animate({
          scrollTop: $wrapper.css('height')
        }, "slow");
      }
    };

    /**
     * Resize buttons to fit container width
     *
     * @private
     */
    var resizeButtons = function () {
      if (!buttons || !sections.buttons) {
        return;
      }

      var go = function () {
        // Don't do anything if button elements are not visible yet
        if (!sections.buttons.$element.is(':visible')) {
          return;
        }

        // Width of all buttons
        var buttonsWidth = {
          max: 0,
          min: 0,
          current: 0
        };

        for (var i in buttons) {
          var button = buttons[i];
          if (button.isVisible) {
            setButtonWidth(buttons[i]);
            buttonsWidth.max += button.width.max;
            buttonsWidth.min += button.width.min;
            buttonsWidth.current += button.isTruncated ? button.width.min : button.width.max;
          }
        }

        var makeButtonsFit = function (availableWidth) {
          if (buttonsWidth.max < availableWidth) {
            // It is room for everyone on the right side of the score bar (without truncating)
            if (buttonsWidth.max !== buttonsWidth.current) {
              // Need to make everyone big
              restoreButtonLabels(buttonsWidth.current, availableWidth);
            }
            return true;
          }
          else if (buttonsWidth.min < availableWidth) {
            // Is it room for everyone on the right side of the score bar with truncating?
            if (buttonsWidth.current > availableWidth) {
              removeButtonLabels(buttonsWidth.current, availableWidth);
            }
            else {
              restoreButtonLabels(buttonsWidth.current, availableWidth);
            }
            return true;
          }
          return false;
        };

        toggleFullWidthScorebar(false);

        var buttonSectionWidth = Math.floor(sections.buttons.$element.width()) - 1;

        if (!makeButtonsFit(buttonSectionWidth)) {
          // If we get here we need to wrap:
          toggleFullWidthScorebar(true);
          buttonSectionWidth = Math.floor(sections.buttons.$element.width()) - 1;
          makeButtonsFit(buttonSectionWidth);
        }
      };

      // If visible, resize right away
      if (sections.buttons.$element.is(':visible')) {
        go();
      }
      else { // If not visible, try on the next tick
        // Clear button truncation timer if within a button truncation function
        if (buttonTruncationTimer) {
          clearTimeout(buttonTruncationTimer);
        }
        buttonTruncationTimer = setTimeout(function () {
          buttonTruncationTimer = undefined;
          go();
        }, 0);
      }
    };

    var toggleFullWidthScorebar = function (enabled) {
      if (sections.scorebar &&
          sections.scorebar.$element &&
          sections.scorebar.$element.hasClass('h5p-question-visible')) {
        sections.buttons.$element.addClass('has-scorebar');
        sections.buttons.$element.toggleClass('wrap', enabled);
        sections.scorebar.$element.toggleClass('full-width', enabled);
      }
      else {
        sections.buttons.$element.removeClass('has-scorebar');
      }
    };

    /**
     * Remove button labels until they use less than max width.
     *
     * @private
     * @param {Number} buttonsWidth Total width of all buttons
     * @param {Number} maxButtonsWidth Max width allowed for buttons
     */
    var removeButtonLabels = function (buttonsWidth, maxButtonsWidth) {
      // Reverse traversal
      for (var i = buttonOrder.length - 1; i >= 0; i--) {
        var buttonId = buttonOrder[i];
        var button = buttons[buttonId];
        if (!button.isTruncated && button.isVisible) {
          var $button = button.$element;
          buttonsWidth -= button.width.max - button.width.min;
          // Set tooltip (needed by H5P.Tooltip)
          let buttonText = $button.text();
          $button.attr('data-tooltip', buttonText);

          // Use button text as aria label if a specific one isn't provided
          if (!button.ariaLabel) {
            $button.attr('aria-label', buttonText);
          }
          // Remove label
          $button.html('').addClass('truncated');
          button.isTruncated = true;
          if (buttonsWidth <= maxButtonsWidth) {
            // Buttons are small enough.
            return;
          }
        }
      }
    };

    /**
     * Restore button labels until it fills maximum possible width without exceeding the max width.
     *
     * @private
     * @param {Number} buttonsWidth Total width of all buttons
     * @param {Number} maxButtonsWidth Max width allowed for buttons
     */
    var restoreButtonLabels = function (buttonsWidth, maxButtonsWidth) {
      for (var i = 0; i < buttonOrder.length; i++) {
        var buttonId = buttonOrder[i];
        var button = buttons[buttonId];
        if (button.isTruncated && button.isVisible) {
          // Calculate new total width of buttons with a static pixel for consistency cross-browser
          buttonsWidth += button.width.max - button.width.min + 1;

          if (buttonsWidth > maxButtonsWidth) {
            return;
          }
          // Restore label
          button.$element.html(button.text);

          // Remove tooltip (used by H5P.Tooltip)
          button.$element.removeAttr('data-tooltip');

          // Remove aria-label if a specific one isn't provided
          if (!button.ariaLabel) {
            button.$element.removeAttr('aria-label');
          }

          button.$element.removeClass('truncated');
          button.isTruncated = false;
        }
      }
    };

    /**
     * Helper function for finding index of keyValue in array
     *
     * @param {String} keyValue Value to be found
     * @param {String} key In key
     * @param {Array} array In array
     * @returns {number}
     */
    var existsInArray = function (keyValue, key, array) {
      var i;
      for (i = 0; i < array.length; i++) {
        if (array[i][key] === keyValue) {
          return i;
        }
      }
      return -1;
    };

    /**
     * Show a section
     * @param {Object} section
     */
    var showSection = function (section) {
      section.$element.addClass('h5p-question-visible');
      section.isVisible = true;
    };

    /**
     * Hide a section
     * @param {Object} section
     */
    var hideSection = function (section) {
      section.$element.css('max-height', '');
      section.isVisible = false;

      setTimeout(function () {
        // Only hide if section hasn't been set to visible in the meantime
        if (!section.isVisible) {
          section.$element.removeClass('h5p-question-visible');
        }
      }, 150);
    };

    /**
     * Set behaviour for question.
     *
     * @param {Object} options An object containing behaviour that will be extended by Question
     */
    self.setBehaviour = function (options) {
      $.extend(behaviour, options);
    };

    /**
     * A video to display above the task.
     *
     * @param {object} params
     */
    self.setVideo = function (params) {
      sections.video = {
        $element: $('<div/>', {
          'class': 'h5p-question-video'
        })
      };

      if (disableAutoPlay && params.params.playback) {
        params.params.playback.autoplay = false;
      }

      // Never fit to wrapper
      if (!params.params.visuals) {
        params.params.visuals = {};
      }
      params.params.visuals.fit = false;
      sections.video.instance = H5P.newRunnable(params, self.contentId, sections.video.$element, true);
      var fromVideo = false; // Hack to avoid never ending loop
      sections.video.instance.on('resize', function () {
        fromVideo = true;
        self.trigger('resize');
        fromVideo = false;
      });
      self.on('resize', function () {
        if (!fromVideo) {
          sections.video.instance.trigger('resize');
        }
      });

      return self;
    };

    /**
     * An audio player to display above the task.
     *
     * @param {object} params
     */
    self.setAudio = function (params) {
      params.params = params.params || {};

      sections.audio = {
        $element: $('<div/>', {
          'class': 'h5p-question-audio',
        })
      };

      if (disableAutoPlay) {
        params.params.autoplay = false;
      }
      else if (params.params.playerMode === 'transparent') {
        params.params.autoplay = true; // false doesn't make sense for transparent audio
      }

      sections.audio.instance = H5P.newRunnable(params, self.contentId, sections.audio.$element, true);
      // The height value that is set by H5P.Audio is counter-productive here.
      if (sections.audio.instance.audio) {
        sections.audio.instance.audio.style.height = '';
      }

      return self;
    };

    /**
     * Will stop any playback going on in the task.
     */
    self.pause = function () {
      if (sections.video && sections.video.isVisible) {
        sections.video.instance.pause();
      }
      if (sections.audio && sections.audio.isVisible) {
        sections.audio.instance.pause();
      }
    };

    /**
     * Start playback of video
     */
    self.play = function () {
      if (sections.video && sections.video.isVisible) {
        sections.video.instance.play();
      }
      if (sections.audio && sections.audio.isVisible) {
        sections.audio.instance.play();
      }
    };

    /**
     * Disable auto play, useful in editors.
     */
    self.disableAutoPlay = function () {
      disableAutoPlay = true;
    };

    /**
     * Process HTML escaped string for use as attribute value,
     * e.g. for alt text or title attributes.
     *
     * @param {string} value
     * @return {string} WARNING! Do NOT use for innerHTML.
     */
    self.massageAttributeOutput = function (value) {
      const dparser = new DOMParser().parseFromString(value, 'text/html');
      const div = document.createElement('div');
      div.innerHTML = dparser.documentElement.textContent;;
      return div.textContent || div.innerText || '';
    };

    /**
     * Add task image.
     *
     * @param {string} path Relative
     * @param {Object} [options] Options object
     * @param {string} [options.alt] Text representation
     * @param {string} [options.title] Hover text
     * @param {Boolean} [options.disableImageZooming] Set as true to disable image zooming
     * @param {string} [options.expandImage] Localization strings
     * @param {string} [options.minimizeImage] Localization string

     */
    self.setImage = function (path, options) {
      options = options ? options : {};
      sections.image = {};
      // Image container
      sections.image.$element = $('<div/>', {
        'class': 'h5p-question-image h5p-question-image-fill-width'
      });

      // Inner wrap
      var $imgWrap = $('<div/>', {
        'class': 'h5p-question-image-wrap',
        appendTo: sections.image.$element
      });

      // Image element
      var $img = $('<img/>', {
        src: H5P.getPath(path, self.contentId),
        alt: (options.alt === undefined ? '' : self.massageAttributeOutput(options.alt)),
        title: (options.title === undefined ? '' : self.massageAttributeOutput(options.title)),
        on: {
          load: function () {
            self.trigger('imageLoaded', this);
            self.trigger('resize');
          }
        },
        appendTo: $imgWrap
      });

      // Disable image zooming
      if (options.disableImageZooming) {
        $img.css('maxHeight', 'none');

        // Make sure we are using the correct amount of width at all times
        var determineImgWidth = function () {

          // Remove margins if natural image width is bigger than section width
          var imageSectionWidth = sections.image.$element.get(0).getBoundingClientRect().width;

          // Do not transition, for instant measurements
          $imgWrap.css({
            '-webkit-transition': 'none',
            'transition': 'none'
          });

          // Margin as translateX on both sides of image.
          var diffX = 2 * ($imgWrap.get(0).getBoundingClientRect().left -
            sections.image.$element.get(0).getBoundingClientRect().left);

          if ($img.get(0).naturalWidth >= imageSectionWidth - diffX) {
            sections.image.$element.addClass('h5p-question-image-fill-width');
          }
          else { // Use margin for small res images
            sections.image.$element.removeClass('h5p-question-image-fill-width');
          }

          // Reset transition rules
          $imgWrap.css({
            '-webkit-transition': '',
            'transition': ''
          });
        };

        // Determine image width
        if ($img.is(':visible')) {
          determineImgWidth();
        }
        else {
          $img.on('load', determineImgWidth);
        }

        // Skip adding zoom functionality
        return;
      }

      const setAriaLabel = () => {
        const ariaLabel = $imgWrap.attr('aria-expanded') === 'true'
          ? options.minimizeImage 
          : options.expandImage;
          
          $imgWrap.attr('aria-label', `${ariaLabel} ${options.alt}`);
        };

      var sizeDetermined = false;
      var determineSize = function () {
        if (sizeDetermined || !$img.is(':visible')) {
          return; // Try again next time.
        }

        $imgWrap.addClass('h5p-question-image-scalable')
          .attr('aria-expanded', false)
          .attr('role', 'button')
          .attr('tabIndex', '0')
          .on('click', function (event) {
            if (event.which === 1) {
              scaleImage.apply(this); // Left mouse button click
              setAriaLabel();
            }
          }).on('keypress', function (event) {
            if (event.which === 32) {
              event.preventDefault(); // Prevent default behaviour; page scroll down
              scaleImage.apply(this); // Space bar pressed
              setAriaLabel();
            }
          });

        setAriaLabel();

        sections.image.$element.removeClass('h5p-question-image-fill-width');

        sizeDetermined  = true; // Prevent any futher events
      };

      self.on('resize', determineSize);

      return self;
    };

    /**
     * Add the introduction section.
     *
     * @param {(string|H5P.jQuery)} content
     */
    self.setIntroduction = function (content) {
      register('introduction', content);

      return self;
    };

    /**
     * Add the content section.
     *
     * @param {(string|H5P.jQuery)} content
     * @param {Object} [options]
     * @param {string} [options.class]
     */
    self.setContent = function (content, options) {
      register('content', content);

      if (options && options.class) {
        sections.content.$element.addClass(options.class);
      }

      return self;
    };

    /**
     * Force readspeaker to read text. Useful when you have to use
     * setTimeout for animations.
     */
    self.read = function (content) {
      if (!$read) {
        return; // Not ready yet
      }

      if (readText) {
        // Combine texts if called multiple times
        readText += (readText.substr(-1, 1) === '.' ? ' ' : '. ') + content;
      }
      else {
        readText = content;
      }

      // Set text
      $read.html(readText);

      setTimeout(function () {
        // Stop combining when done reading
        readText = null;
        $read.html('');
      }, 100);
    };

    /**
     * Read feedback
     */
    self.readFeedback = function () {
      var invalidFeedback =
        behaviour.disableReadSpeaker ||
        !showFeedback ||
        !sections.feedback ||
        !sections.feedback.$element;

      if (invalidFeedback) {
        return;
      }

      var $feedbackText = $('.h5p-question-feedback-content-text', sections.feedback.$element);
      if ($feedbackText && $feedbackText.html() && $feedbackText.html().length) {
        self.read($feedbackText.html());
      }
    };

    /**
     * Remove feedback
     *
     * @return {H5P.Question}
     */
    self.removeFeedback = function () {

      clearTimeout(feedbackTransitionTimer);

      if (sections.feedback && showFeedback) {

        showFeedback = false;

        // Hide feedback & scorebar
        hideSection(sections.scorebar);
        hideSection(sections.feedback);

        sectionsIsTransitioning = true;

        // Detach after transition
        feedbackTransitionTimer = setTimeout(function () {
          // Avoiding Transition.onTransitionEnd since it will register multiple events, and there's no way to cancel it if the transition changes back to "show" while the animation is happening.
          if (!showFeedback) {
            sections.feedback.$element.children().detach();
            sections.scorebar.$element.children().detach();

            // Trigger resize after animation
            self.trigger('resize');
          }
          sectionsIsTransitioning = false;
          scoreBar.setScore(0);
        }, 150);

        if ($wrapper) {
          $wrapper.find('.h5p-question-feedback-tail').remove();
        }
      }

      return self;
    };

    /**
     * Set feedback message.
     *
     * @param {string} [content]
     * @param {number} score The score
     * @param {number} maxScore The maximum score for this question
     * @param {string} [scoreBarLabel] Makes it easier for readspeakers to identify the scorebar
     * @param {string} [helpText] Help text that describes the score inside a tip icon
     * @param {object} [popupSettings] Extra settings for popup feedback
     * @param {boolean} [popupSettings.showAsPopup] Should the feedback display as popup?
     * @param {string} [popupSettings.closeText] Translation for close button text
     * @param {object} [popupSettings.click] Element representing where user clicked on screen
     */
    self.setFeedback = function (content, score, maxScore, scoreBarLabel, helpText, popupSettings, scoreExplanationButtonLabel) {
      // Feedback is disabled
      if (behaviour.disableFeedback) {
        return self;
      }

      // Need to toggle buttons right away to avoid flickering/blinking
      // Note: This means content types should invoke hide/showButton before setFeedback
      toggleButtons();

      clickElement = (popupSettings != null && popupSettings.click != null ? popupSettings.click : null);
      clearTimeout(feedbackTransitionTimer);

      var $feedback = $('<div>', {
        'class': 'h5p-question-feedback-container'
      });

      var $feedbackContent = $('<div>', {
        'class': 'h5p-question-feedback-content'
      }).appendTo($feedback);

      // Feedback text
      $('<div>', {
        'class': 'h5p-question-feedback-content-text',
        'html': content
      }).appendTo($feedbackContent);

      var $scorebar = $('<div>', {
        'class': 'h5p-question-scorebar-container'
      });
      if (scoreBar === undefined) {
        scoreBar = JoubelUI.createScoreBar(maxScore, scoreBarLabel, helpText, scoreExplanationButtonLabel);
      }
      scoreBar.appendTo($scorebar);

      $feedbackContent.toggleClass('has-content', content !== undefined && content.length > 0);

      // Feedback for readspeakers
      if (!behaviour.disableReadSpeaker && scoreBarLabel) {
        self.read(scoreBarLabel.replace(':num', score).replace(':total', maxScore) + '. ' + (content ? content : ''));
      }

      showFeedback = true;
      if (sections.feedback) {
        // Update section
        update('feedback', $feedback);
        update('scorebar', $scorebar);
      }
      else {
        // Create section
        register('feedback', $feedback);
        register('scorebar', $scorebar);
        if (initialized && $wrapper) {
          insert(self.order, 'feedback', sections, $wrapper);
          insert(self.order, 'scorebar', sections, $wrapper);
        }
      }

      showSection(sections.feedback);
      showSection(sections.scorebar);

      resizeButtons();

      if (popupSettings != null && popupSettings.showAsPopup == true) {
        makeFeedbackPopup(popupSettings.closeText);
        scoreBar.setScore(score);
      }
      else {
        // Show feedback section
        feedbackTransitionTimer = setTimeout(function () {
          setElementHeight(sections.feedback.$element);
          setElementHeight(sections.scorebar.$element);
          sectionsIsTransitioning = true;

          // Scroll to bottom after showing feedback
          scrollToBottom();

          // Trigger resize after animation
          feedbackTransitionTimer = setTimeout(function () {
            sectionsIsTransitioning = false;
            self.trigger('resize');
            scoreBar.setScore(score);
          }, 150);
        }, 0);
      }

      return self;
    };

    /**
     * Set feedback content (no animation).
     *
     * @param {string} content
     * @param {boolean} [extendContent] True will extend content, instead of replacing it
     */
    self.updateFeedbackContent = function (content, extendContent) {
      if (sections.feedback && sections.feedback.$element) {

        if (extendContent) {
          content = $('.h5p-question-feedback-content', sections.feedback.$element).html() + ' ' + content;
        }

        // Update feedback content html
        $('.h5p-question-feedback-content', sections.feedback.$element).html(content).addClass('has-content');

        // Make sure the height is correct
        setElementHeight(sections.feedback.$element);

        // Need to trigger resize when feedback has finished transitioning
        setTimeout(self.trigger.bind(self, 'resize'), 150);
      }

      return self;
    };

    /**
     * Set the content of the explanation / feedback panel
     *
     * @param {Object} data
     * @param {string} data.correct
     * @param {string} data.wrong
     * @param {string} data.text
     * @param {string} title Title for explanation panel
     *
     * @return {H5P.Question}
     */
    self.setExplanation = function (data, title) {
      if (data) {
        var explainer = new H5P.Question.Explainer(title, data);

        if (sections.explanation) {
          // Update section
          update('explanation', explainer.getElement());
        }
        else {
          register('explanation', explainer.getElement());

          if (initialized && $wrapper) {
            insert(self.order, 'explanation', sections, $wrapper);
          }
        }
      }
      else if (sections.explanation) {
        // Hide explanation section
        sections.explanation.$element.children().detach();
      }

      return self;
    };

    /**
     * Checks to see if button is registered.
     *
     * @param {string} id
     * @returns {boolean}
     */
    self.hasButton = function (id) {
      return (buttons[id] !== undefined);
    };

    /**
     * @typedef {Object} ConfirmationDialog
     * @property {boolean} [enable] Must be true to show confirmation dialog
     * @property {Object} [instance] Instance that uses confirmation dialog
     * @property {jQuery} [$parentElement] Append to this element.
     * @property {Object} [l10n] Translatable fields
     * @property {string} [l10n.header] Header text
     * @property {string} [l10n.body] Body text
     * @property {string} [l10n.cancelLabel]
     * @property {string} [l10n.confirmLabel]
     */

    /**
     * Register buttons for the task.
     *
     * @param {string} id
     * @param {string} text label
     * @param {function} clicked
     * @param {boolean} [visible=true]
     * @param {Object} [options] Options for button
     * @param {Object} [extras] Extra options
     * @param {ConfirmationDialog} [extras.confirmationDialog] Confirmation dialog
     * @param {Object} [extras.contentData] Content data
     * @params {string} [extras.textIfSubmitting] Text to display if submitting
     */
    self.addButton = function (id, text, clicked, visible, options, extras) {
      if (buttons[id]) {
        return self; // Already registered
      }

      if (sections.buttons === undefined)  {
        // We have buttons, register wrapper
        register('buttons');
        if (initialized) {
          insert(self.order, 'buttons', sections, $wrapper);
        }
      }

      extras = extras || {};
      extras.confirmationDialog = extras.confirmationDialog || {};
      options = options || {};

      var confirmationDialog =
        self.addConfirmationDialogToButton(extras.confirmationDialog, clicked);

      /**
       * Handle button clicks through both mouse and keyboard
       * @private
       */
      var handleButtonClick = function () {
        if (extras.confirmationDialog.enable && confirmationDialog) {
          // Show popups section if used
          if (!extras.confirmationDialog.$parentElement) {
            sections.popups.$element.removeClass('hidden');
          }
          confirmationDialog.show($e.position().top);
        }
        else {
          clicked();
        }
      };

      const isSubmitting = extras.contentData && extras.contentData.standalone
        && (extras.contentData.isScoringEnabled || extras.contentData.isReportingEnabled);

      if (isSubmitting && extras.textIfSubmitting) {
        text = extras.textIfSubmitting;
      }

      buttons[id] = {
        isTruncated: false,
        text: text,
        isVisible: false,
        ariaLabel: options['aria-label']
      };

      // The button might be <button> or <a>
      // (dependent on options.href set or not)
      var isAnchorTag = (options.href !== undefined);
      var $e = buttons[id].$element = JoubelUI.createButton($.extend({
        'class': 'h5p-question-' + id,
        html: text,
        on: {
          click: function (event) {
            handleButtonClick();
            if (isAnchorTag) {
              event.preventDefault();
            }
          }
        }
      }, options));
      buttonOrder.push(id);

      H5P.Tooltip($e.get(0), {tooltipSource: 'data-tooltip'});

      // The button might be <button> or <a>. If <a>, the space key is not
      // triggering the click event, must therefore handle this here:
      if (isAnchorTag) {
        $e.on('keypress', function (event) {
          if (event.which === 32) { // Space
            handleButtonClick();
            event.preventDefault();
          }
        });
      }

      if (visible === undefined || visible) {
        // Button should be visible
        $e.appendTo(sections.buttons.$element);
        buttons[id].isVisible = true;
        showSection(sections.buttons);
      }

      return self;
    };

    var setButtonWidth = function (button) {
      var $button = button.$element;
      var $tmp = $button.clone()
        .css({
          'position': 'absolute',
          'white-space': 'nowrap',
          'max-width': 'none'
        }).removeClass('truncated')
        .html(button.text)
        .appendTo($button.parent());

      // Calculate max width (button including text)
      button.width = {
        max: Math.ceil($tmp.outerWidth() + parseFloat($tmp.css('margin-left')) + parseFloat($tmp.css('margin-right')))
      };

      // Calculate min width (truncated, icon only)
      $tmp.html('').addClass('truncated');
      button.width.min = Math.ceil($tmp.outerWidth() + parseFloat($tmp.css('margin-left')) + parseFloat($tmp.css('margin-right')));
      $tmp.remove();
    };

    /**
     * Add confirmation dialog to button
     * @param {ConfirmationDialog} options
     *  A confirmation dialog that will be shown before click handler of button
     *  is triggered
     * @param {function} clicked
     *  Click handler of button
     * @return {H5P.ConfirmationDialog|undefined}
     *  Confirmation dialog if enabled
     */
    self.addConfirmationDialogToButton = function (options, clicked) {
      options = options || {};

      if (!options.enable) {
        return;
      }

      // Confirmation dialog
      var confirmationDialog = new H5P.ConfirmationDialog({
        instance: options.instance,
        headerText: options.l10n.header,
        dialogText: options.l10n.body,
        cancelText: options.l10n.cancelLabel,
        confirmText: options.l10n.confirmLabel
      });

      // Determine parent element
      if (options.$parentElement) {
        const parentElement = options.$parentElement.get(0);
        let dialogParent;
        // If using h5p-content, dialog will not appear on embedded fullscreen
        if (parentElement.classList.contains('h5p-content')) {
          dialogParent = parentElement.querySelector('.h5p-container');
        }

        confirmationDialog.appendTo(dialogParent ?? parentElement);
      }
      else {

        // Create popup section and append to that
        if (sections.popups === undefined) {
          register('popups');
          if (initialized) {
            insert(self.order, 'popups', sections, $wrapper);
          }
          sections.popups.$element.addClass('hidden');
          self.order.push('popups');
        }
        confirmationDialog.appendTo(sections.popups.$element.get(0));
      }

      // Add event listeners
      confirmationDialog.on('confirmed', function () {
        if (!options.$parentElement) {
          sections.popups.$element.addClass('hidden');
        }
        clicked();

        // Trigger to content type
        self.trigger('confirmed');
      });

      confirmationDialog.on('canceled', function () {
        if (!options.$parentElement) {
          sections.popups.$element.addClass('hidden');
        }
        // Trigger to content type
        self.trigger('canceled');
      });

      return confirmationDialog;
    };

    /**
     * Show registered button with given identifier.
     *
     * @param {string} id
     * @param {Number} [priority]
     */
    self.showButton = function (id, priority) {
      var aboutToBeHidden = existsInArray(id, 'id', buttonsToHide) !== -1;
      if (buttons[id] === undefined || (buttons[id].isVisible === true && !aboutToBeHidden)) {
        return self;
      }

      priority = priority || 0;

      // Skip if already being shown
      var indexToShow = existsInArray(id, 'id', buttonsToShow);
      if (indexToShow !== -1) {

        // Update priority
        if (buttonsToShow[indexToShow].priority < priority) {
          buttonsToShow[indexToShow].priority = priority;
        }

        return self;
      }

      // Check if button is going to be hidden on next tick
      var exists = existsInArray(id, 'id', buttonsToHide);
      if (exists !== -1) {

        // Skip hiding if higher priority
        if (buttonsToHide[exists].priority <= priority) {
          buttonsToHide.splice(exists, 1);
          buttonsToShow.push({id: id, priority: priority});
        }

      } // If button is not shown
      else if (!buttons[id].$element.is(':visible')) {

        // Show button on next tick
        buttonsToShow.push({id: id, priority: priority});
      }

      if (!toggleButtonsTimer) {
        toggleButtonsTimer = setTimeout(toggleButtons, 0);
      }

      return self;
    };

    /**
     * Hide registered button with given identifier.
     *
     * @param {string} id
     * @param {number} [priority]
     */
    self.hideButton = function (id, priority) {
      var aboutToBeShown = existsInArray(id, 'id', buttonsToShow) !== -1;
      if (buttons[id] === undefined || (buttons[id].isVisible === false && !aboutToBeShown)) {
        return self;
      }

      priority = priority || 0;

      // Skip if already being hidden
      var indexToHide = existsInArray(id, 'id', buttonsToHide);
      if (indexToHide !== -1) {

        // Update priority
        if (buttonsToHide[indexToHide].priority < priority) {
          buttonsToHide[indexToHide].priority = priority;
        }

        return self;
      }

      // Check if buttons is going to be shown on next tick
      var exists = existsInArray(id, 'id', buttonsToShow);
      if (exists !== -1) {

        // Skip showing if higher priority
        if (buttonsToShow[exists].priority <= priority) {
          buttonsToShow.splice(exists, 1);
          buttonsToHide.push({id: id, priority: priority});
        }
      }
      else if (!buttons[id].$element.is(':visible')) {

        // Make sure it is detached in case the container is hidden.
        hideButton(id);
      }
      else {

        // Hide button on next tick.
        buttonsToHide.push({id: id, priority: priority});
      }

      if (!toggleButtonsTimer) {
        toggleButtonsTimer = setTimeout(toggleButtons, 0);
      }

      return self;
    };

    /**
     * Set focus to the given button. If no button is given the first visible
     * button gets focused. This is useful if you lose focus.
     *
     * @param {string} [id]
     */
    self.focusButton = function (id) {
      if (id === undefined) {
        // Find first button that is visible.
        for (var i = 0; i < buttonOrder.length; i++) {
          var button = buttons[buttonOrder[i]];
          if (button && button.isVisible) {
            // Give that button focus
            button.$element.focus();
            break;
          }
        }
      }
      else if (buttons[id] && buttons[id].$element.is(':visible')) {
        // Set focus to requested button
        buttons[id].$element.focus();
      }

      return self;
    };

    /**
     * Toggle readspeaker functionality
     * @param {boolean} [disable] True to disable, false to enable.
     */
    self.toggleReadSpeaker = function (disable) {
      behaviour.disableReadSpeaker = disable || !behaviour.disableReadSpeaker;
    };

    /**
     * Set new element for section.
     *
     * @param {String} id
     * @param {H5P.jQuery} $element
     */
    self.insertSectionAtElement = function (id, $element) {
      if (sections[id] === undefined) {
        register(id);
      }
      sections[id].parent = $element;

      // Insert section if question is not initialized
      if (!initialized) {
        insert([id], id, sections, $element);
      }

      return self;
    };

    /**
     * Attach content to given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      if (self.isRoot()) {
        self.setActivityStarted();
      }

      // The first time we attach we also create our DOM elements.
      if ($wrapper === undefined) {
        if (self.registerDomElements !== undefined &&
           (self.registerDomElements instanceof Function ||
           typeof self.registerDomElements === 'function')) {

          // Give the question type a chance to register before attaching
          self.registerDomElements();
        }

        // Create section for reading messages
        $read = $('<div/>', {
          'aria-live': 'polite',
          'class': 'h5p-hidden-read'
        });
        register('read', $read);
        self.trigger('registerDomElements');
      }

      // Prepare container
      $wrapper = $container;
      $container.html('')
        .addClass('h5p-question h5p-' + type);

      // Add sections in given order
      var $sections = [];
      for (var i = 0; i < self.order.length; i++) {
        var section = self.order[i];
        if (sections[section]) {
          if (sections[section].parent) {
            // Section has a different parent
            sections[section].$element.appendTo(sections[section].parent);
          }
          else {
            $sections.push(sections[section].$element);
          }
          sections[section].isVisible = true;
        }
      }

      // Only append once to DOM for optimal performance
      $container.append($sections);

      // Let others react to dom changes
      self.trigger('domChanged', {
        '$target': $container,
        'library': self.libraryInfo.machineName,
        'contentId': self.contentId,
        'key': 'newLibrary'
      }, {'bubbles': true, 'external': true});

      // ??
      initialized = true;

      return self;
    };

    /**
     * Detach all sections from their parents
     */
    self.detachSections = function () {
      // Deinit Question
      initialized = false;

      // Detach sections
      for (var section in sections) {
        sections[section].$element.detach();
      }

      return self;
    };

    // Listen for resize
    self.on('resize', function () {
      // Allow elements to attach and set their height before resizing
      if (!sectionsIsTransitioning && sections.feedback && showFeedback) {
        // Resize feedback to fit
        setElementHeight(sections.feedback.$element);
      }

      // Re-position feedback popup if in use
      var $element = sections.feedback;
      var $click = clickElement;

      if ($element != null && $element.$element != null && $click != null && $click.$element != null) {
        setTimeout(function () {
          positionFeedbackPopup($element.$element, $click.$element);
        }, 10);
      }

      resizeButtons();
    });
  }

  // Inheritance
  Question.prototype = Object.create(EventDispatcher.prototype);
  Question.prototype.constructor = Question;

  /**
   * Determine the overall feedback to display for the question.
   * Returns empty string if no matching range is found.
   *
   * @param {Object[]} feedbacks
   * @param {number} scoreRatio
   * @return {string}
   */
  Question.determineOverallFeedback = function (feedbacks, scoreRatio) {
    scoreRatio = Math.floor(scoreRatio * 100);

    for (var i = 0; i < feedbacks.length; i++) {
      var feedback = feedbacks[i];
      var hasFeedback = (feedback.feedback !== undefined && feedback.feedback.trim().length !== 0);

      if (feedback.from <= scoreRatio && feedback.to >= scoreRatio && hasFeedback) {
        return feedback.feedback;
      }
    }

    return '';
  };

  return Question;
})(H5P.jQuery, H5P.EventDispatcher, H5P.JoubelUI);
;
H5P.Question.Explainer = (function ($) {
  /**
   * Constructor
   *
   * @class
   * @param {string} title
   * @param {array} explanations
   */
  function Explainer(title, explanations) {
    var self = this;

    /**
     * Create the DOM structure
     */
    var createHTML = function () {
      self.$explanation = $('<div>', {
        'class': 'h5p-question-explanation-container'
      });

      // Add title:
      $('<div>', {
        'class': 'h5p-question-explanation-title',
        role: 'heading',
        html: title,
        appendTo: self.$explanation
      });

      var $explanationList = $('<ul>', {
        'class': 'h5p-question-explanation-list',
        appendTo: self.$explanation
      });

      for (var i = 0; i < explanations.length; i++) {
        var feedback = explanations[i];
        var $explanationItem = $('<li>', {
          'class': 'h5p-question-explanation-item',
          appendTo: $explanationList
        });

        var $content = $('<div>', {
          'class': 'h5p-question-explanation-status'
        });

        if (feedback.correct) {
          $('<span>', {
            'class': 'h5p-question-explanation-correct',
            html: feedback.correct,
            appendTo: $content
          });
        }
        if (feedback.wrong) {
          $('<span>', {
            'class': 'h5p-question-explanation-wrong',
            html: feedback.wrong,
            appendTo: $content
          });
        }
        $content.appendTo($explanationItem);

        if (feedback.text) {
          $('<div>', {
            'class': 'h5p-question-explanation-text',
            html: feedback.text,
            appendTo: $explanationItem
          });
        }
      }
    };

    createHTML();

    /**
     * Return the container HTMLElement
     *
     * @return {HTMLElement}
     */
    self.getElement = function () {
      return self.$explanation;
    };
  }

  return Explainer;

})(H5P.jQuery);
;
(function (Question) {

  /**
   * Makes it easy to add animated score points for your question type.
   *
   * @class H5P.Question.ScorePoints
   */
  Question.ScorePoints = function () {
    var self = this;

    var elements = [];
    var showElementsTimer;

    /**
     * Create the element that displays the score point element for questions.
     *
     * @param {boolean} isCorrect
     * @return {HTMLElement}
     */
    self.getElement = function (isCorrect) {
      var element = document.createElement('div');
      element.classList.add(isCorrect ? 'h5p-question-plus-one' : 'h5p-question-minus-one');
      element.classList.add('h5p-question-hidden-one');
      elements.push(element);

      // Schedule display animation of all added elements
      if (showElementsTimer) {
        clearTimeout(showElementsTimer);
      }
      showElementsTimer = setTimeout(showElements, 0);

      return element;
    };

    /**
     * @private
     */
    var showElements = function () {
      // Determine delay between triggering animations
      var delay = 0;
      var increment = 150;
      var maxTime = 1000;

      if (elements.length && elements.length > Math.ceil(maxTime / increment)) {
        // Animations will run for more than ~1 second, reduce it.
        increment = maxTime / elements.length;
      }

      for (var i = 0; i < elements.length; i++) {
        // Use timer to trigger show
        setTimeout(showElement(elements[i]), delay);

        // Increse delay for next element
        delay += increment;
      }
    };

    /**
     * Trigger transition animation for the given element
     *
     * @private
     * @param {HTMLElement} element
     * @return {function}
     */
    var showElement = function (element) {
      return function () {
        element.classList.remove('h5p-question-hidden-one');
      };
    };
  };

})(H5P.Question);
;
var H5P = H5P || {};

/**
 * H5P-Text Utilities
 *
 * Some functions that can be useful when dealing with texts in H5P.
 *
 * @param {H5P.jQuery} $
 */
H5P.TextUtilities = function () {
  'use strict';
  /**
   * Create Text Utilities.
   *
   * Might be needed later.
   *
   * @constructor
   */
  function TextUtilities () {
  }

  // Inheritance
  TextUtilities.prototype = Object.create(H5P.EventDispatcher.prototype);
  TextUtilities.prototype.constructor = TextUtilities;

  /** @constant {object} */
  TextUtilities.WORD_DELIMITER = /[\s.?!,\';\"]/g;

  /**
   * Check if a candidate string is considered isolated (in a larger string) by
   * checking the symbol before and after the candidate.
   *
   * @param {string} candidate - String to be looked for.
   * @param {string} text - (Larger) string that should contain candidate.
   * @param {object} params - Parameters.
   * @param {object} params.delimiter - Regular expression containing symbols used to isolate the candidate.
   * @return {boolean} True if string is isolated.
   */
  TextUtilities.isIsolated = function (candidate, text, params) {
    // Sanitization
    if (!candidate || !text) {
      return;
    }
    var delimiter = (!!params && !!params.delimiter) ? params.delimiter : TextUtilities.WORD_DELIMITER;

    var pos = (!!params && !!params.index && typeof params.index === 'number') ? params.index : text.indexOf(candidate);
    if (pos < 0 || pos > text.length-1) {
      return false;
    }

    var pred = (pos === 0 ? '' : text[pos - 1].replace(delimiter, ''));
    var succ = (pos + candidate.length === text.length ? '' : text[pos + candidate.length].replace(delimiter, ''));

    if (pred !== '' || succ !== '') {
      return false;
    }
    return true;
  };

  /**
   * Check whether two strings are considered to be similar.
   * The similarity is temporarily computed by word length and number of number of operations
   * required to change one word into the other (Damerau-Levenshtein). It's subject to
   * change, cmp. https://github.com/otacke/udacity-machine-learning-engineer/blob/master/submissions/capstone_proposals/h5p_fuzzy_blanks.md
   *
   * @param {String} string1 - String #1.
   * @param {String} string2 - String #2.
   * @param {object} params - Parameters.
   * @return {boolean} True, if strings are considered to be similar.
   */
  TextUtilities.areSimilar = function (string1, string2) {
    // Sanitization
    if (!string1 || typeof string1 !== 'string') {
      return;
    }
    if (!string2 || typeof string2 !== 'string') {
      return;
    }

    // Just temporariliy this unflexible. Will be configurable via params.
    var length = Math.min(string1.length, string2.length);
    var levenshtein = H5P.TextUtilities.computeLevenshteinDistance(string1, string2, true);
    if (levenshtein === 0) {
      return true;
    }
    if ((length > 9) && (levenshtein <= 2)) {
      return true;
    }
    if ((length > 3) && (levenshtein <= 1)) {
      return true;
    }
    return false;
  };

  /**
   * Compute the (Damerau-)Levenshtein distance for two strings.
   *
   * The (Damerau-)Levenshtein distance that is returned is equivalent to the
   * number of operations that are necessary to transform one string into the
   * other. Consequently, lower numbers indicate higher similarity between the
   * two strings.
   *
   * While the Levenshtein distance counts deletions, insertions and mismatches,
   * the Damerau-Levenshtein distance also counts swapping two characters as
   * only one operation (instead of two mismatches), because this seems to
   * happen quite often.
   *
   * See http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance for details
   *
   * @public
   * @param {string} str1 - String no. 1.
   * @param {string} str2 - String no. 2.
   * @param {boolean} [countSwapping=false] - If true, swapping chars will count as operation.
   * @returns {number} Distance.
   */
  TextUtilities.computeLevenshteinDistance = function(str1, str2, countSwapping) {
    // sanity checks
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return undefined;
    }
    if (countSwapping && typeof countSwapping !== 'boolean') {
      countSwapping = false;
    }

    // degenerate cases
    if (str1 === str2) {
      return 0;
    }
    if (str1.length === 0) {
      return str2.length;
    }
    if (str2.length === 0) {
      return str1.length;
    }

    // counter variables
    var i, j;

    // indicates characters that don't match
    var cost;

    // matrix for storing distances
    var distance = [];

    // initialization
    for (i = 0; i <= str1.length; i++) {
      distance[i] = [i];
    }
    for (j = 0; j <= str2.length; j++) {
      distance[0][j] = j;
    }

    // computation
    for (i = 1; i <= str1.length; i++) {
      for (j = 1; j <= str2.length; j++) {
        cost = (str1[i-1] === str2[j-1]) ? 0 : 1;
        distance[i][j] = Math.min(
          distance[i-1][j] + 1,     // deletion
          distance[i][j-1] + 1,     // insertion
          distance[i-1][j-1] + cost // mismatch
        );
        // in Damerau-Levenshtein distance, transpositions are operations
        if (countSwapping) {
          if (i > 1 && j > 1 && str1[i-1] === str2[j-2] && str1[i-2] === str2[j-1]) {
            distance[i][j] = Math.min(distance[i][j], distance[i-2][j-2] + cost);
          }
        }
      }
    }
    return distance[str1.length][str2.length];
  };

  /**
   * Compute the Jaro(-Winkler) distance for two strings.
   *
   * The Jaro(-Winkler) distance will return a value between 0 and 1 indicating
   * the similarity of two strings. The higher the value, the more similar the
   * strings are.
   *
   * See https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance for details
   *
   * It seems that a more generalized implementation of Winkler's modification
   * can improve the results. This might be implemented later.
   * http://disi.unitn.it/~p2p/RelatedWork/Matching/Hermans_bnaic-2012.pdf
   *
   * @public
   * @param {string} str1 - String no. 1.
   * @param {string} str2 - String no. 2.
   * @param {boolean} [favorSameStart=false] - If true, strings with same start get higher distance value.
   * @param {boolean} [longTolerance=false] - If true, Winkler's tolerance for long words will be used.
   * @returns {number} Distance.
   */
  TextUtilities.computeJaroDistance = function(str1, str2, favorSameStart, longTolerance) {
    // sanity checks
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return undefined;
    }
    if (favorSameStart && typeof favorSameStart !== 'boolean') {
      favorSameStart = false;
    }
    if (longTolerance && typeof longTolerance !== 'boolean') {
      longTolerance = false;
    }

    // degenerate cases
    if (str1.length === 0 || str2.length === 0) {
      return 0;
    }
    if (str1 === str2) {
      return 1;
    }

    // counter variables
    var i, j, k;

    // number of matches between both strings
    var matches = 0;

    // number of transpositions between both strings
    var transpositions = 0;

    // The Jaro-Winkler distance
    var distance = 0;

    // length of common prefix up to 4 chars
    var l = 0;

    // scaling factor, should not exceed 0.25 (Winkler default = 0.1)
    var p = 0.1;

    // will be used often
    var str1Len = str1.length;
    var str2Len = str2.length;

    // determines the distance that still counts as a match
    var matchWindow = Math.floor(Math.max(str1Len, str2Len) / 2)- 1;

    // will store matches
    var str1Flags = new Array(str1Len);
    var str2Flags = new Array(str2Len);

    // count matches
    for (i = 0; i < str1Len; i++) {
      var start  = (i >= matchWindow) ? i - matchWindow : 0;
      var end = (i + matchWindow <= (str2Len - 1)) ? (i + matchWindow) : (str2Len - 1);

      for (j = start; j <= end; j++) {
        if (str1Flags[i] !== true && str2Flags[j] !== true && str1[i] === str2[j]) {
          str1Flags[i] = str2Flags[j] = true;
          matches += 1;
          break;
        }
      }
    }
    if (matches === 0) {
      return 0;
    }

    // count transpositions
    k = 0;
    for (i = 0; i < str1Len; i++) {
      if (!str1Flags[i]) {
        continue;
      }
      while (!str2Flags[k]) {
        k += 1;
      }
      if (str1[i] !== str2[k]) {
        transpositions += 1;
      }
      k += 1;
    }
    transpositions = transpositions / 2;

    // compute Jaro distance
    distance = (matches/str1Len + matches/str2Len + (matches - transpositions) / matches) / 3;

    // modification used by Winkler
    if (favorSameStart) {
      if (distance > 0.7 && str1Len > 3 && str2Len > 3) {
        while (str1[l] === str2[l] && l < 4) {
          l += 1;
        }
        distance = distance + l * p * (1 - distance);

        // modification for long words
        if (longTolerance) {
          if (Math.max(str1Len, str2Len) > 4 && matches > l + 1 && 2 * matches >= Math.max(str1Len, str2Len) + l) {
            distance += ((1.0 - distance) * ((matches - l - 1) / (str1Len + str2Len - 2 * l + 2)));
          }
        }
      }
    }

    return distance;
  };


  /**
   * Check whether a text contains a string, but fuzzy.
   *
   * This function is naive. It moves a window of needle's length (+2)
   * over the haystack's text and each move compares for similarity using
   * a given string metric. This will be slow for long texts!!!
   *
   * TODO: You might want to look into the bitap algorithm or experiment
   *       with regexps
   *
   * @param {String} needle - String to look for.
   * @param {String} haystack - Text to look in.
   */
  TextUtilities.fuzzyContains = function (needle, haystack) {
    return this.fuzzyFind(needle, haystack).contains;
  };

  /**
   * Find the first position of a fuzzy string within a text
   * @param {String} needle - String to look for.
   * @param {String} haystack - Text to look in.
   */
  TextUtilities.fuzzyIndexOf = function (needle, haystack) {
    return this.fuzzyFind(needle, haystack).indexOf;
  };

  /**
   * Find the first fuzzy match of a string within a text
   * @param {String} needle - String to look for.
   * @param {String} haystack - Text to look in.
   */
  TextUtilities.fuzzyMatch = function (needle, haystack) {
    return this.fuzzyFind(needle, haystack).match;
  };

  /**
   * Find a fuzzy string with in a text.
   * TODO: This could be cleaned ...
   * @param {String} needle - String to look for.
   * @param {String} haystack - Text to look in.
   * @param {object} params - Parameters.
   */
  TextUtilities.fuzzyFind = function (needle, haystack, params) {
    // Sanitization
    if (!needle || typeof needle !== 'string') {
      return false;
    }
    if (!haystack || typeof haystack !== 'string') {
      return false;
    }
    if (params === undefined || params.windowSize === undefined || typeof params.windowSize !== 'number') {
      params = {'windowSize': 3};
    }

    var match;

    var found = haystack.split(' ').some(function(hay) {
      match = hay;
      return H5P.TextUtilities.areSimilar(needle, hay);
    });
    if (found) {
      return {'contains' : found, 'match': match, 'index': haystack.indexOf(match)};
    }

    // This is not used for single words but for phrases
    for (var i = 0; i < haystack.length - needle.length + 1; i++) {
      var hay = [];
      for (var j = 0; j < params.windowSize; j++) {
        hay[j] = haystack.substr(i, needle.length + j);
      }

      // Checking isIsolated will e.g. prevent finding beginnings of words
      for (var j = 0; j < hay.length; j++) {
        if (TextUtilities.isIsolated(hay[j], haystack) && TextUtilities.areSimilar(hay[j], needle)) {
          match = hay[j];
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    if (!found) {
      match = undefined;
    }
    return {'contains' : found, 'match': match, 'index': haystack.indexOf(match)};
  };

  return TextUtilities;
}();
;
var H5P = H5P || {};

/**
 * TODO: This content type needs refactoring. Badly!
 */
H5P.Essay = function ($, Question) {
  'use strict';

  // CSS Classes
  const SOLUTION_CONTAINER = 'h5p-essay-solution-container';
  const SOLUTION_TITLE = 'h5p-essay-solution-title';
  const SOLUTION_INTRODUCTION = 'h5p-essay-solution-introduction';
  const SOLUTION_SAMPLE = 'h5p-essay-solution-sample';
  const SOLUTION_SAMPLE_TEXT = 'h5p-essay-solution-sample-text';

  // The H5P feedback right now only expects true (green)/false (red) feedback, not neutral feedback
  const FEEDBACK_EMPTY = '<span class="h5p-essay-feedback-empty">...</span>';

  /**
   * @constructor
   * @param {Object} config - Config from semantics.json.
   * @param {string} contentId - ContentId.
   * @param {Object} [contentData] - contentData.
   */
  function Essay(config, contentId, contentData) {
    // Initialize
    if (!config) {
      return;
    }

    // Inheritance
    Question.call(this, 'essay');

    // Sanitize defaults
    this.params = Essay.extend(
      {
        media: {},
        taskDescription: '',
        solution: {},
        keywords: [],
        overallFeedback: [],
        behaviour: {
          minimumLength: 0,
          inputFieldSize: 10,
          enableCheckButton: true,
          enableRetry: true,
          enableSolutionsButton: true,
          ignoreScoring: false,
          pointsHost: 1,
          linebreakReplacement: ' '
        },
        checkAnswer: 'Check',
        submitAnswer: 'Submit',
        tryAgain: 'Retry',
        showSolution: 'Show solution',
        feedbackHeader: 'Feedback',
        solutionTitle: 'Sample solution',
        remainingChars: 'Remaining characters: @chars',
        notEnoughChars: 'You must enter at least @chars characters!',
        messageSave: 'saved',
        ariaYourResult: 'You got @score out of @total points',
        ariaNavigatedToSolution: 'Navigated to newly included sample solution after textarea.',
        ariaCheck: 'Check the answers.',
        ariaShowSolution: 'Show the solution. You will be provided with a sample solution.',
        ariaRetry: 'Retry the task. You can improve your previous answer if the author allowed that.'
      },
      config);
    this.contentId = contentId;
    this.extras = contentData;

    const defaultLanguage = (this.extras && this.extras.metadata) ? this.extras.metadata.defaultLanguage || 'en' : 'en';
    this.languageTag = Essay.formatLanguageCode(defaultLanguage);

    this.score = 0;
    this.internalShowSolutionsCall = false;

    // Sanitize HTML encoding
    this.params.placeholderText = this.htmlDecode(this.params.placeholderText || '');

    // Get previous state from content data
    if (typeof contentData !== 'undefined' && typeof contentData.previousState !== 'undefined' && contentData.previousState !== null) {
      this.previousState = contentData.previousState;
    }

    this.isAnswered = this.previousState && this.previousState.inputField && this.previousState.inputField !== '' || false;
    /*
     * this.params.behaviour.enableSolutionsButton and this.params.behaviour.enableRetry are used by
     * contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-8} and
     * {@link https://h5p.org/documentation/developers/contracts#guides-header-9}
     */
    this.params.behaviour.enableSolutionsButton =
      this.params.behaviour.enableSolutionsButton &&
      (
        typeof this.params.solution.sample !== 'undefined' &&
        this.params.solution.sample !== ''
      );
    this.params.behaviour.enableRetry = this.params.behaviour.enableRetry || false;

    // Determine the minimum number of characters that should be entered
    this.params.behaviour.minimumLength = this.params.behaviour.minimumLength || 0;
    if (this.params.behaviour.maximumLength !== undefined) {
      this.params.behaviour.minimumLength = Math.min(this.params.behaviour.minimumLength, this.params.behaviour.maximumLength);
    }

    // map function
    const toPoints = function (keyword) {
      return (keyword.keyword && keyword.options && keyword.options.points || 0) * (keyword.options.occurrences || 1);
    };

    // reduce function
    const sum = function (a, b) {
      return a + b;
    };

    // scoreMax = Maximum number of points available by all keyword groups
    const scoreMax = this.params.keywords
      .map(toPoints)
      .reduce(sum, 0);

    // scoreMastering: score indicating mastery and maximum number on progress bar (can be < scoreMax)
    this.scoreMastering = this.params.behaviour.percentageMastering === undefined ?
      scoreMax :
      this.params.behaviour.percentageMastering * scoreMax / 100;

    // scorePassing: score to pass the task (<= scoreMastering)
    this.scorePassing = Math.min(
      this.getMaxScore(),
      this.params.behaviour.percentagePassing * scoreMax / 100 || 0);

    this.solution = this.buildSolution();

    // Re-create score
    if (typeof this.previousState === 'object' && Object.keys(this.previousState).length) {
      this.updateScore();
    }
  }

  // Extends Question
  Essay.prototype = Object.create(Question.prototype);
  Essay.prototype.constructor = Essay;

  /**
   * Register the DOM elements with H5P.Question.
   */
  Essay.prototype.registerDomElements = function () {
    const that = this;

    // Set optional media
    const media = (this.params.media) ? this.params.media.type : undefined;
    if (media && media.library) {
      const type = media.library.split(' ')[0];
      if (type === 'H5P.Image') {
        if (media.params.file) {
          this.setImage(media.params.file.path, {
            disableImageZooming: this.params.media.disableImageZooming,
            alt: media.params.alt,
            title: media.params.title,
            expandImage: media.params.expandImage,
            minimizeImage: media.params.minimizeImage
          });
        }
      }
      else if (type === 'H5P.Video') {
        if (media.params.sources) {
          this.setVideo(media);
        }
      }
      else if (type === 'H5P.Audio') {
        if (media.params.files) {
          this.setAudio(media);
        }
      }
    }

    // Check whether status bar is needed, no "saved" message when subcontent
    const statusBar = !!(
      this.params.behaviour.minimumLength ||
      this.params.behaviour.maximumLength ||
      (H5PIntegration && H5PIntegration.saveFreq && this.isRoot())
    );

    // Create InputField
    this.inputField = new H5P.Essay.InputField({
      taskDescription: this.params.taskDescription,
      placeholderText: this.params.placeholderText,
      maximumLength: this.params.behaviour.maximumLength,
      remainingChars: this.params.remainingChars,
      inputFieldSize: this.params.behaviour.inputFieldSize,
      previousState: this.previousState,
      statusBar: statusBar
    }, {
      onInteracted: (function (params) {
        that.handleInteracted(params);
      }),
      onInput: (function () {
        that.handleInput();
      })
    });

    this.setViewState(this.previousState && this.previousState.viewState || 'task');
    if (this.viewState === 'results') {
      // Need to wait until DOM is ready for us
      H5P.externalDispatcher.on('initialized', function () {
        that.handleCheckAnswer({ skipXAPI: true });
      });
    }
    else if (this.viewState === 'solutions') {
      // Need to wait until DOM is ready for us
      H5P.externalDispatcher.on('initialized', function () {
        that.handleCheckAnswer({ skipXAPI: true });
        that.showSolutions();
        // We need the retry button if the mastering score has not been reached or scoring is irrelevant
        if (that.getScore() < that.getMaxScore() || that.params.behaviour.ignoreScoring || that.getMaxScore() === 0) {
          if (that.params.behaviour.enableRetry) {
            that.showButton('try-again');
          }
        }
        else {
          that.hideButton('try-again');
        }
      });
    }

    // Register task introduction text
    this.setIntroduction(this.inputField.getIntroduction());

    // Register content
    this.content = this.inputField.getContent();
    this.setContent(this.content);

    // Register Buttons
    this.addButtons();
  };

  /**
   * Add all the buttons that shall be passed to H5P.Question.
   */
  Essay.prototype.addButtons = function () {
    const that = this;

    // Show solution button
    that.addButton('show-solution', that.params.showSolution, function () {
      // Not using a parameter for showSolutions to not mess with possibe future contract changes
      that.internalShowSolutionsCall = true;
      that.showSolutions();
      that.internalShowSolutionsCall = false;
    }, false, {
      'aria-label': this.params.ariaShowSolution
    }, {});

    // Check answer button
    that.addButton('check-answer', that.params.checkAnswer, function () {
      that.handleCheckAnswer();
    }, this.params.behaviour.enableCheckButton, {
      'aria-label': this.params.ariaCheck
    }, {
      contentData: this.extras,
      textIfSubmitting: this.params.submitAnswer,
    });

    // Retry button
    that.addButton('try-again', that.params.tryAgain, function () {
      that.resetTask({ skipClear: true });
    }, false, {
      'aria-label': this.params.ariaRetry
    }, {});
  };

  /**
   * Handle the evaluation.
   * @param {object} [params = {}] Parameters.
   * @param {boolean} [params.skipXAPI = false] If true, don't trigger xAPI.
   */
  Essay.prototype.handleCheckAnswer = function (params) {
    const that = this;

    params = Essay.extend({
      skipXAPI: false
    }, params);

    // Show message if the minimum number of characters has not been met
    if (that.inputField.getText().length < that.params.behaviour.minimumLength) {
      const message = that.params.notEnoughChars.replace(/@chars/g, that.params.behaviour.minimumLength);
      that.inputField.setMessageChars(message, true);
      that.read(message);
      return;
    }

    that.setViewState('results');

    that.inputField.disable();
    /*
     * Only set true on "check". Result computation may take some time if
     * there are many keywords due to the fuzzy match checking, so it's not
     * a good idea to do this while typing.
     */
    that.isAnswered = true;
    that.handleEvaluation(params);

    if (that.params.behaviour.enableSolutionsButton === true) {
      that.showButton('show-solution');
    }
    that.hideButton('check-answer');
  };

  /**
   * Get the user input from DOM.
   * @param {string} [linebreakReplacement=' '] Replacement for line breaks.
   * @return {string} Cleaned input.
   */
  Essay.prototype.getInput = function (linebreakReplacement) {
    linebreakReplacement = linebreakReplacement || ' ';

    let userText = '';
    if (this.inputField) {
      userText = this.inputField.getText();
    }
    else if (this.previousState && this.previousState.inputField) {
      userText = this.previousState.inputField;
    }

    return userText
      .replace(/(\r\n|\r|\n)/g, linebreakReplacement)
      .replace(/\s\s/g, ' ');
  };

  /**
   * Handle user interacted.
   * @param {object} params Parameters.
   * @param {boolean} [params.updateScore] If true, will trigger score computation.
   */
  Essay.prototype.handleInteracted = function (params) {
    params = params || {};

    // Deliberately keeping the state once answered
    this.isAnswered = this.isAnswered || this.inputField.getText().length > 0;
    if (params.updateScore) {
      // Only triggered when explicitly requested due to potential complexity
      this.updateScore();
    }

    this.triggerXAPI('interacted');
  };

  /**
   * Check if Essay has been submitted/minimum length met.
   * @return {boolean} True, if answer was given.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
   */
  Essay.prototype.getAnswerGiven = function () {
    return this.isAnswered;
  };

  /**
   * Get latest score.
   * @return {number} latest score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
   */
  Essay.prototype.getScore = function () {
    // Return value is rounded because reporting module for moodle's H5P plugin expects integers
    return (this.params.behaviour.ignoreScoring) ?
      this.getMaxScore() :
      this.score;
  };

  /**
   * Get maximum possible score.
   * @return {number} Score necessary for mastering.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
   */
  Essay.prototype.getMaxScore = function () {
    // Return value is rounded because reporting module for moodle's H5P plugin expects integers
    return (this.params.behaviour.ignoreScoring) ?
      this.params.behaviour.pointsHost || 1 : // moodle requires 1 for task completion
      Math.max(1, this.scoreMastering);
  };

  /**
   * Show solution.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
   */
  Essay.prototype.showSolutions = function () {
    this.setViewState('solutions');

    this.inputField.disable();

    if (typeof this.params.solution.sample !== 'undefined' && this.params.solution.sample !== '') {
      // We add the sample solution here to make cheating at least a little more difficult
      if (this.solution.getElementsByClassName(SOLUTION_SAMPLE)[0].children.length === 0) {
        const text = document.createElement('div');
        text.classList.add(SOLUTION_SAMPLE_TEXT);
        text.innerHTML = this.params.solution.sample;
        this.solution.getElementsByClassName(SOLUTION_SAMPLE)[0].appendChild(text);
      }

      // Insert solution after explanations or content.
      const predecessor = this.content.parentNode;

      predecessor.parentNode.insertBefore(this.solution, predecessor.nextSibling);

      // Useful for accessibility, but seems to jump to wrong position on some Safari versions
      this.solutionAnnouncer.focus();
    }

    this.hideButton('show-solution');

    // Handle calls from the outside
    if (!this.internalShowSolutionsCall) {
      this.hideButton('check-answer');
      this.hideButton('try-again');
    }

    this.trigger('resize');
  };

  /**
   * Reset task.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  Essay.prototype.resetTask = function (params) {
    params = params || {};
    this.setViewState('task');

    this.setExplanation();
    this.removeFeedback();
    this.hideSolution();

    this.hideButton('show-solution');
    this.hideButton('try-again');

    // QuestionSet can control check button despite not in Question Type contract
    if (this.params.behaviour.enableCheckButton) {
      this.showButton('check-answer');
    }

    if (!params.skipClear) {
      this.inputField.setText('');
    }
    this.inputField.enable();
    this.inputField.focus();

    this.isAnswered = false;
  };

  /**
   * Get xAPI data.
   * @return {Object} xAPI statement.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  Essay.prototype.getXAPIData = function () {
    return {
      statement: this.getXAPIAnswerEvent().data.statement
    };
  };

  /**
   * Determine whether the task has been passed by the user.
   * @return {boolean} True if user passed or task is not scored.
   */
  Essay.prototype.isPassed = function () {
    return (this.params.behaviour.ignoreScoring || this.getScore() >= this.scorePassing);
  };

  /**
   * Update score.
   * @param {object} results Results.
   */
  Essay.prototype.updateScore = function (results) {
    results = results || this.computeResults();
    this.score = Math.min(this.computeScore(results), this.getMaxScore());
  };

  /**
   * Handle the evaluation.
   * @param {object} [params = {}] Parameters.
   * @param {boolean} [params.skipXAPI = false] If true, don't trigger xAPI.
   */
  Essay.prototype.handleEvaluation = function (params) {
    params = Essay.extend({
      skipXAPI: false
    }, params);
    const results = this.computeResults();

    // Build explanations
    const explanations = this.buildExplanation(results);

    // Show explanations
    if (explanations.length > 0) {
      this.setExplanation(explanations, this.params.feedbackHeader);
    }

    // Not all keyword groups might be necessary for mastering
    this.updateScore(results);
    const textScore = H5P.Question
      .determineOverallFeedback(this.params.overallFeedback, this.getScore() / this.getMaxScore())
      .replace('@score', this.getScore())
      .replace('@total', this.getMaxScore());

    if (!this.params.behaviour.ignoreScoring && this.getMaxScore() > 0) {
      const ariaMessage = (this.params.ariaYourResult)
        .replace('@score', ':num')
        .replace('@total', ':total');
      this.setFeedback(textScore, this.getScore(), this.getMaxScore(), ariaMessage);
    }

    // Show and hide buttons as necessary
    this.handleButtons(this.getScore());

    if (!params.skipXAPI) {
      // Trigger xAPI statements as necessary
      this.handleXAPI();
    }

    this.trigger('resize');
  };

  /**
   * Build solution DOM object.
   * @return {Object} DOM object.
   */
  Essay.prototype.buildSolution = function () {
    const solution = document.createElement('div');
    solution.classList.add(SOLUTION_CONTAINER);

    this.solutionAnnouncer = document.createElement('div');
    this.solutionAnnouncer.setAttribute('tabindex', '0');
    this.solutionAnnouncer.setAttribute('aria-label', this.params.ariaNavigatedToSolution);
    this.solutionAnnouncer.addEventListener('focus', function (event) {
      // Just temporary tabbable element. Will be announced by readspaker.
      event.target.blur();
      event.target.setAttribute('tabindex', '-1');
    });
    solution.appendChild(this.solutionAnnouncer);

    const solutionTitle = document.createElement('div');
    solutionTitle.classList.add(SOLUTION_TITLE);
    solutionTitle.innerHTML = this.params.solutionTitle;
    solution.appendChild(solutionTitle);

    const solutionIntroduction = document.createElement('div');
    solutionIntroduction.classList.add(SOLUTION_INTRODUCTION);
    solutionIntroduction.innerHTML = this.params.solution.introduction;
    solution.appendChild(solutionIntroduction);

    const solutionSample = document.createElement('div');
    solutionSample.classList.add(SOLUTION_SAMPLE);
    solution.appendChild(solutionSample);

    return solution;
  };

  /**
   * Hide the solution.
   */
  Essay.prototype.hideSolution = function () {
    if (this.solution.parentNode !== null) {
      this.solution.parentNode.removeChild(this.solution);
    }
  };

  /**
   * Compute results.
   * @return {Object[]} Results: [[{"keyword": keyword, "match": match, "index": index}*]*].
   */
  Essay.prototype.computeResults = function () {
    const that = this;
    const results = [];

    // Should not happen, but just to be sure ...
    this.params.keywords = this.params.keywords || [];

    // Filter out keywords that have not been set.
    this.params.keywords = this.params.keywords.filter(function (element) {
      return typeof element.keyword !== 'undefined';
    });

    this.params.keywords.forEach(function (alternativeGroup) {
      const resultsGroup = [];
      const options = alternativeGroup.options;
      const caseSensitive = (that.params.behaviour.overrideCaseSensitive !== 'off') &&
        (that.params.behaviour.overrideCaseSensitive === 'on' || options.caseSensitive);

      let alternatives = [alternativeGroup.keyword || []]
        .concat(alternativeGroup.alternatives || [])
        .map(function (alternative) {
          return that.htmlDecode(alternative);
        });

      /*
       * Get all matches to regular expressions and pretend the matches were
       * given as alternative answers in order to be able to detect them.
       * This result computation might need a rewrite ...
       */
      const regularExpressionMatches = that
        .getRegExpAlternatives(
          alternatives,
          that.getInput(that.params.behaviour.linebreakReplacement),
          caseSensitive
        )
        .map(function (match) {
          // Allow to differentiate from wildcard asterisk
          return match = match.replace(/\*/, Essay.REGULAR_EXPRESSION_ASTERISK);
        });

      // Not chained, because we still need the old value inside
      alternatives = alternatives
        // only "normal" alternatives
        .filter(function (alternative) {
          return (alternative[0] !== '/' || alternative[alternative.length - 1] !== '/');
        })
        // regular matches found in text for alternatives
        .concat(regularExpressionMatches)
        // regular matches could match empty string
        .filter(function (alternative) {
          return alternative !== '';
        });

      // Detect all matches
      alternatives.forEach(function (alternative) {
        let inputTest = that.getInput(that.params.behaviour.linebreakReplacement);

        if (!caseSensitive) {
          alternative = alternative.toLowerCase();
          inputTest = inputTest.toLowerCase();
        }

        // Build array of matches for each type of match
        const matchesExact = that.detectExactMatches(alternative, inputTest);
        const matchesWildcard = alternative.indexOf('*') !== -1 ? that.detectWildcardMatches(alternative, inputTest, caseSensitive) : [];

        const forgiveMistakes =
          (that.params.behaviour.overrideForgiveMistakes !== 'off') &&
          (
            that.params.behaviour.overrideForgiveMistakes === 'on' ||
            options.forgiveMistakes
          );

        const matchesFuzzy = forgiveMistakes ?
          that.detectFuzzyMatches(alternative, inputTest) :
          [];

        // Merge matches without duplicates
        that.mergeMatches(matchesExact, matchesWildcard, matchesFuzzy).forEach(function (item) {
          resultsGroup.push(item);
        });
      });
      results.push(resultsGroup);
    });
    return results;
  };

  /**
   * Compute the score for the results.
   * @param {Object[]} results - Results from the task.
   * @return {number} Score.
   */
  Essay.prototype.computeScore = function (results) {
    let score = 0;
    this.params.keywords.forEach(function (keyword, i) {
      score += Math.min(results[i].length, keyword.options.occurrences) * keyword.options.points;
    });
    return score;
  };

  /**
   * Build the explanations for H5P.Question.setExplanation.
   * @param {Object} results - Results from the task.
   * @return {Object[]} Explanations for H5P.Question.
   */
  Essay.prototype.buildExplanation = function (results) {
    const explanations = [];

    let word;
    this.params.keywords.forEach(function (keyword, i) {
      word = FEEDBACK_EMPTY;
      // Keyword was not found and feedback is provided for this case
      if (results[i].length === 0 && keyword.options.feedbackMissed) {
        if (keyword.options.feedbackMissedWord === 'keyword') {
          // Main keyword defined
          word = keyword.keyword;
        }
        explanations.push({correct: word, text: keyword.options.feedbackMissed});
      }

      // Keyword found and feedback is provided for this case
      if (results[i].length > 0 && keyword.options.feedbackIncluded) {
        // Set word in front of feedback
        switch (keyword.options.feedbackIncludedWord) {
          case 'keyword':
            // Main keyword defined
            word = keyword.keyword;
            break;
          case 'alternative':
            // Alternative that was found
            word = results[i][0].keyword;
            break;
          case 'answer':
            // Answer matching an alternative at the learner typed it
            word = results[i][0].match;
            break;
        }
        explanations.push({correct: word, text: keyword.options.feedbackIncluded});
      }
    });

    if (explanations.length > 0) {
      // Sort "included" before "not included", but keep order otherwise
      explanations.sort(function (a, b) {
        return a.correct === FEEDBACK_EMPTY && b.correct !== FEEDBACK_EMPTY;
      });
    }
    return explanations;
  };

  /**
   * Handle buttons' visibility.
   * @param {number} score - Score the user received.
   */
  Essay.prototype.handleButtons = function (score) {
    if (this.params.solution.sample && !this.solution) {
      this.showButton('show-solution');
    }

    // We need the retry button if the mastering score has not been reached or scoring is irrelevant
    if (score < this.getMaxScore() || this.params.behaviour.ignoreScoring || this.getMaxScore() === 0) {
      if (this.params.behaviour.enableRetry) {
        this.showButton('try-again');
      }
    }
    else {
      this.hideButton('try-again');
    }
  };

  /**
   * Handle xAPI event triggering
   * @param {number} score - Score the user received.
   */
  Essay.prototype.handleXAPI = function () {
    this.trigger(this.getXAPIAnswerEvent());

    // Additional xAPI verbs that might be useful for making analytics easier
    if (!this.params.behaviour.ignoreScoring && this.getMaxScore() > 0) {
      if (this.getScore() < this.scorePassing) {
        this.trigger(this.createEssayXAPIEvent('failed'));
      }
      else {
        this.trigger(this.createEssayXAPIEvent('passed'));
      }
      if (this.getScore() >= this.getMaxScore()) {
        this.trigger(this.createEssayXAPIEvent('mastered'));
      }
    }
  };

  /**
   * Create an xAPI event for Essay.
   * @param {string} verb - Short id of the verb we want to trigger.
   * @return {H5P.XAPIEvent} Event template.
   */
  Essay.prototype.createEssayXAPIEvent = function (verb) {
    const xAPIEvent = this.createXAPIEventTemplate(verb);
    Essay.extend(
      xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
      this.getxAPIDefinition());
    return xAPIEvent;
  };

  /**
   * Get the xAPI definition for the xAPI object.
   * return {Object} XAPI definition.
   */
  Essay.prototype.getxAPIDefinition = function () {
    const definition = {};
    definition.name = {};
    definition.name[this.languageTag] = this.getTitle();
    // Fallback for h5p-php-reporting, expects en-US
    definition.name['en-US'] = definition.name[this.languageTag];
    // The H5P reporting module expects the "blanks" to be added to the description
    definition.description = {};
    definition.description[this.languageTag] = this.params.taskDescription + Essay.FILL_IN_PLACEHOLDER;
    // Fallback for h5p-php-reporting, expects en-US
    definition.description['en-US'] = definition.description[this.languageTag];
    definition.type = 'http://id.tincanapi.com/activitytype/essay';
    definition.interactionType = 'long-fill-in';
    /*
     * The official xAPI documentation discourages to use a correct response
     * pattern it if the criteria for a question are complex and correct
     * responses cannot be exhaustively listed. They can't.
     */
    return definition;
  };

  /**
   * Build xAPI answer event.
   * @return {H5P.XAPIEvent} xAPI answer event.
   */
  Essay.prototype.getXAPIAnswerEvent = function () {
    const xAPIEvent = this.createEssayXAPIEvent('answered');

    xAPIEvent.setScoredResult(this.getScore(), this.getMaxScore(), this, true, this.isPassed());
    xAPIEvent.data.statement.result.response = this.inputField.getText();

    return xAPIEvent;
  };

  /**
   * Detect exact matches of needle in haystack.
   * @param {string} needle - Word or phrase to find.
   * @param {string} haystack - Text to find the word or phrase in.
   * @return {Object[]} Results: [{'keyword': needle, 'match': needle, 'index': front + pos}*].
   */
  Essay.prototype.detectExactMatches = function (needle, haystack) {
    // Simply detect all exact matches and its positions in the haystack
    const result = [];
    let pos = -1;
    let front = 0;

    needle = needle
      .replace(/\*/, '') // Wildcards checked separately
      .replace(new RegExp(Essay.REGULAR_EXPRESSION_ASTERISK, 'g'), '*'); // Asterisk from regexp

    while (((pos = haystack.indexOf(needle))) !== -1 && needle !== '') {
      if (H5P.TextUtilities.isIsolated(needle, haystack)) {
        result.push({'keyword': needle, 'match': needle, 'index': front + pos});
      }
      front += pos + needle.length;
      haystack = haystack.substr(pos + needle.length);
    }
    return result;
  };

  /**
   * Detect wildcard matches of needle in haystack.
   * @param {string} needle - Word or phrase to find.
   * @param {string} haystack - Text to find the word or phrase in.
   * @param {boolean} caseSensitive - If true, alternative is case sensitive.
   * @return {Object[]} Results: [{'keyword': needle, 'match': needle, 'index': front + pos}*].
   */
  Essay.prototype.detectWildcardMatches = function (needle, haystack, caseSensitive) {
    if (needle.indexOf('*') === -1) {
      return [];
    }

    // Clean needle from successive wildcards
    needle = needle.replace(/[*]{2,}/g, '*');

    // Clean needle from regular expression characters, * needed for wildcard
    const regexpChars = ['\\', '.', '[', ']', '?', '+', '(', ')', '{', '}', '|', '!', '^', '-'];
    regexpChars.forEach(function (char) {
      needle = needle.split(char).join('\\' + char);
    });

    // We accept only characters for the wildcard
    const regexp = new RegExp(needle.replace(/\*/g, Essay.CHARS_WILDCARD + '+'), this.getRegExpModifiers(caseSensitive));
    const result = [];
    let match;
    while ((match = regexp.exec(haystack)) !== null ) {
      if (H5P.TextUtilities.isIsolated(match[0], haystack, {'index': match.index})) {
        result.push({'keyword': needle, 'match': match[0], 'index': match.index});
      }
    }
    return result;
  };

  /**
   * Detect fuzzy matches of needle in haystack.
   * @param {string} needle - Word or phrase to find.
   * @param {string} haystack - Text to find the word or phrase in.
   * @param {Object[]} Results.
   */
  Essay.prototype.detectFuzzyMatches = function (needle, haystack) {
    // Ideally, this should be the maximum number of allowed transformations for the Levenshtein disctance.
    const windowSize = 2;
    /*
     * We cannot simple split words because we're also looking for phrases.
     * If we were just looking for exact matches, we could use something smarter
     * such as the KMP algorithm. Because we're dealing with fuzzy matches, using
     * this intuitive exhaustive approach might be the best way to go.
     */
    const results = [];
    // Without looking at the surroundings we'd miss words that have additional or missing chars
    for (let size = -windowSize; size <= windowSize; size++) {
      for (let pos = 0; pos < haystack.length; pos++) {
        const straw = haystack.substr(pos, needle.length + size);
        if (H5P.TextUtilities.areSimilar(needle, straw) && H5P.TextUtilities.isIsolated(straw, haystack, {'index': pos})) {
          // This will only add the match if it's not a duplicate that we found already in the proximity of pos
          if (!this.contains(results, pos)) {
            results.push({'keyword': needle, 'match': straw, 'index': pos});
          }
        }
      }
    }
    return results;
  };

  /**
   * Get all the matches found to a regular expression alternative.
   * @param {string[]} alternatives - Alternatives.
   * @param {string} inputTest - Original text by student.
   * @param {boolean} caseSensitive - If true, alternative is case sensitive.
   * @return {string[]} Matches by regular expressions.
   */
  Essay.prototype.getRegExpAlternatives = function (alternatives, inputTest, caseSensitive) {
    const that = this;

    return alternatives
      .filter(function (alternative) {
        return (alternative[0] === '/' && alternative[alternative.length - 1] === '/');
      })
      .map(function (alternative) {
        const regNeedle = new RegExp(alternative.slice(1, -1), that.getRegExpModifiers(caseSensitive));
        return inputTest.match(regNeedle);
      })
      .reduce(function (a, b) {
        return a.concat(b);
      }, [])
      .filter(function (item) {
        return item !== null;
      });
  };

  /**
   * Get modifiers for regular expressions.
   * @param {boolean} caseSensitive - If true, alternative is case sensitive.
   * @return {string} Modifiers for regular expressions.
   */
  Essay.prototype.getRegExpModifiers = function (caseSensitive) {
    const modifiers = ['g'];
    if (!caseSensitive) {
      modifiers.push('i');
    }

    return modifiers.join('');
  };

  /**
   * Merge the matches.
   * @param {...Object[]} matches - Detected matches.
   * @return {Object[]} Merged matches.
   */
  Essay.prototype.mergeMatches = function () {
    // Sanitization
    if (arguments.length === 0) {
      return [];
    }
    if (arguments.length === 1) {
      return arguments[0];
    }

    // Add all elements from args[1+] to args[0] if not already there close by.
    const results = (arguments[0] || []).slice();
    for (let i = 1; i < arguments.length; i++) {
      const match2 = arguments[i] || [];
      for (let j = 0; j < match2.length; j++) {
        if (!this.contains(results, match2[j].index)) {
          results.push(match2[j]);
        }
      }
    }
    return results.sort(function (a, b) {
      return a.index > b.index;
    });
  };

  /**
   * Check if an array of detected results contains the same match in the word's proximity.
   * Used to prevent double entries that can be caused by fuzzy matching.
   * @param {Object} results - Preliminary results.
   * @param {string} results.match - Match that was found before at a particular position.
   * @param {number} results.index - Starting position of the match.
   * @param {number} index - Index of solution to be checked for double entry.
   */
  Essay.prototype.contains = function (results, index) {
    return results.some(function (result) {
      return Math.abs(result.index - index) <= result.match.length;
    });
  };

  /**
   * Extend an array just like JQuery's extend.
   * @param {...Object} arguments - Objects to be merged.
   * @return {Object} Merged objects.
   */
  Essay.extend = function () {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          if (typeof arguments[0][key] === 'object' &&
              typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  };

  /**
   * Get task title.
   * @return {string} Title.
   */
  Essay.prototype.getTitle = function () {
    let raw;
    if (this.extras.metadata) {
      raw = this.extras.metadata.title;
    }
    raw = raw || Essay.DEFAULT_DESCRIPTION;

    // H5P Core function: createTitle
    return H5P.createTitle(raw);
  };

  /**
   * Format language tag (RFC 5646). Assuming "language-coutry". No validation.
   * Cmp. https://tools.ietf.org/html/rfc5646
   * @param {string} languageTag Language tag.
   * @return {string} Formatted language tag.
   */
  Essay.formatLanguageCode = function (languageCode) {
    if (typeof languageCode !== 'string') {
      return languageCode;
    }

    /*
     * RFC 5646 states that language tags are case insensitive, but
     * recommendations may be followed to improve human interpretation
     */
    const segments = languageCode.split('-');
    segments[0] = segments[0].toLowerCase(); // ISO 639 recommendation
    if (segments.length > 1) {
      segments[1] = segments[1].toUpperCase(); // ISO 3166-1 recommendation
    }
    languageCode = segments.join('-');

    return languageCode;
  };

  /**
   * Retrieve true string from HTML encoded string
   * @param {string} input - Input string.
   * @return {string} Output string.
   */
  Essay.prototype.htmlDecode = function (input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent;
  };

  /**
   * Get current state for H5P.Question.
   * @return {Object} Current state.
   */
  Essay.prototype.getCurrentState = function () {
    if (!this.inputField) {
      return; // may not be attached to the DOM yet
    }

    // No "saved" message when subcontent, requested by H5P core team
    if (this.isRoot()) {
      this.inputField.updateMessageSaved(this.params.messageSave);
    }

    const inputFieldText = this.inputField.getText();
    /*
     * H5P integrations may (for instance) show a restart button if there is
     * a previous state set, so here not storing the state if no answer has been
     * given by the user and there's no order stored previously - preventing
     * to show up that restart button without the need to.
     */
    if (!inputFieldText) {
      return;
    }
    
    return {
      inputField: inputFieldText,
      viewState: this.viewState
    };
  };

  /**
   * Set view state.
   * @param {string} state View state.
   */
  Essay.prototype.setViewState = function (state) {
    if (Essay.VIEW_STATES.indexOf(state) === -1) {
      return;
    }

    this.viewState = state;
  };

  /** @constant {string}
   * latin special chars: \u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF
   * greek chars: \u0370-\u03FF
   * kyrillic chars: \u0400-\u04FF
   * hiragana + katakana: \u3040-\u30FF
   * common CJK characters: \u4E00-\u62FF\u6300-\u77FF\u7800-\u8CFF\u8D00-\u9FFF
   * thai chars: \u0E00-\u0E7F
   */
  Essay.CHARS_WILDCARD = '[A-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0370-\u03FF\u0400-\u04FF\u3040-\u309F\u3040-\u30FF\u4E00-\u62FF\u6300-\u77FF\u7800-\u8CFF\u8D00-\u9FFF\u0E00-\u0E7F]';

  /** @constant {string}
   * Required to be added to xAPI object description for H5P reporting
   */
  Essay.FILL_IN_PLACEHOLDER = '__________';

  /** @constant {string} */
  Essay.DEFAULT_DESCRIPTION = 'Essay';

  /** @constant {string} */
  Essay.REGULAR_EXPRESSION_ASTERISK = ':::H5P-Essay-REGEXP-ASTERISK:::';

  /** @constant {string[]} view state names*/
  Essay.VIEW_STATES = ['task', 'results', 'solutions'];

  return Essay;
}(H5P.jQuery, H5P.Question);
;
var H5P = H5P || {};

(function (Essay) {
  'use strict';

  // CSS Classes
  var MAIN_CONTAINER = 'h5p-essay-input-field';
  var INPUT_LABEL = 'h5p-essay-input-field-label';
  var INPUT_FIELD = 'h5p-essay-input-field-textfield';
  var WRAPPER_MESSAGE = 'h5p-essay-input-field-message-wrapper';
  var CHAR_MESSAGE = 'h5p-essay-input-field-message-char';
  var CHAR_MESSAGE_IMPORTANT = 'h5p-essay-input-field-message-char-important';
  var SAVE_MESSAGE = 'h5p-essay-input-field-message-save';
  var ANIMATION_MESSAGE = 'h5p-essay-input-field-message-save-animation';
  var EMPTY_MESSAGE = '&nbsp;';

  /**
   * @constructor
   * @param {object} params - Parameters.
   * @param {number} [params.inputFieldSize] - Number of rows for inputfield.
   * @param {number} [params.maximumLength] - Maximum text length.
   * @param {string} [params.placeholderText] - Placeholder text for input field.
   * @param {string} [params.remainingChars] - Label for remaining chars information.
   * @param {string} [params.taskDescription] - Task description (HTML).
   * @param {object} [params.previousState] - Content state of previous attempt.
   * @param {object} [callbacks] - Callbacks.
   * @param {function} [callbacks.onInteracted] - Interacted callback.
   */
  Essay.InputField = function (params, callbacks) {
    var that = this;

    this.params = params;
    this.previousState = params.previousState || '';

    // Callbacks
    this.callbacks = callbacks || {};
    this.callbacks.onInteracted = this.callbacks.onInteracted || (function () {});

    // Sanitization
    this.params.taskDescription = this.params.taskDescription || '';
    this.params.placeholderText = this.params.placeholderText || '';

    // Task description
    this.taskDescription = document.createElement('div');
    this.taskDescription.classList.add(INPUT_LABEL);
    this.taskDescription.innerHTML = this.params.taskDescription;

    // InputField
    this.inputField = document.createElement('textarea');
    this.inputField.classList.add(INPUT_FIELD);
    this.inputField.setAttribute('rows', this.params.inputFieldSize);
    if (this.params.maximumLength) {
      this.inputField.setAttribute('maxlength', this.params.maximumLength);
    }
    if (this.params.placeholderText) {
      this.inputField.setAttribute('placeholder', this.params.placeholderText);
    }
    this.setText(this.previousState);
    this.oldValue = this.previousState;

    this.containsText = this.oldValue.length > 0;

    // Interacted listener
    this.inputField.addEventListener('blur', function () {
      if (that.oldValue !== that.getText()) {
        that.callbacks.onInteracted({ updateScore: true });
      }

      that.oldValue = that.getText();
    });

    /*
     * Extra listener required to be used in QuestionSet properly
     */
    this.inputField.addEventListener('input', function () {
      if (
        that.containsText && that.getText().length === 0 ||
        !that.containsText && that.getText().length > 0
      ) {
        that.callbacks.onInteracted();
      }

      that.containsText = that.getText().length > 0;
    });

    this.content = document.createElement('div');
    this.content.appendChild(this.inputField);

    // Container
    this.container = document.createElement('div');
    this.container.classList.add(MAIN_CONTAINER);
    this.container.appendChild(this.taskDescription);
    this.container.appendChild(this.content);

    if (params.statusBar) {
      var statusWrapper = document.createElement('div');
      statusWrapper.classList.add(WRAPPER_MESSAGE);

      this.statusChars = document.createElement('div');
      this.statusChars.classList.add(CHAR_MESSAGE);

      statusWrapper.appendChild(this.statusChars);

      ['change', 'keyup', 'paste'].forEach(function (event) {
        that.inputField.addEventListener(event, function () {
          that.updateMessageSaved('');
          that.updateMessageChars();
        });
      });

      this.statusSaved = document.createElement('div');
      this.statusSaved.classList.add(SAVE_MESSAGE);
      statusWrapper.appendChild(this.statusSaved);

      this.content.appendChild(statusWrapper);

      this.updateMessageChars();
    }
  };

  /**
   * Get introduction for H5P.Question.
   * @return {Object} DOM elements for introduction.
   */
  Essay.InputField.prototype.getIntroduction = function () {
    return this.taskDescription;
  };

  /**
   * Get content for H5P.Question.
   * @return {Object} DOM elements for content.
   */
  Essay.InputField.prototype.getContent = function () {
    return this.content;
  };

  /**
   * Get current text in InputField.
   * @return {string} Current text.
   */
  Essay.InputField.prototype.getText = function () {
    return this.inputField.value;
  };

  /**
   * Disable the inputField.
   */
  Essay.InputField.prototype.disable = function () {
    this.inputField.disabled = true;
  };

  /**
   * Enable the inputField.
   */
  Essay.InputField.prototype.enable = function () {
    this.inputField.disabled = false;
  };

  /**
   * Enable the inputField.
   */
  Essay.InputField.prototype.focus = function () {
    this.inputField.focus();
  };

  /**
   * Set the text for the InputField.
   * @param {string|Object} value - Previous state that was saved.
   */
  Essay.InputField.prototype.setText = function (value) {
    const type = (typeof value);

    if (type === 'undefined') {
      return;
    }

    if (type === 'string') {
      this.inputField.value = value;
    }
    else if (type === 'object' && !Array.isArray(value)) {
      this.inputField.value = value.inputField || '';
    }
  };

  /**
   * Compute the remaining number of characters.
   * @return {number} Number of characters left.
   */
  Essay.InputField.prototype.computeRemainingChars = function () {
    return this.params.maximumLength - this.inputField.value.length;
  };

  /**
   * Update character message field.
   */
  Essay.InputField.prototype.updateMessageChars = function () {
    if (!this.params.statusBar) {
      return;
    }

    if (typeof this.params.maximumLength !== 'undefined') {
      this.setMessageChars(this.params.remainingChars.replace(/@chars/g, this.computeRemainingChars()), false);
    }
    else {
      // Use EMPTY_MESSAGE to keep height
      this.setMessageChars(EMPTY_MESSAGE, false);
    }
  };

  /**
   * Update the indicator message for saved text.
   * @param {string} saved - Message to indicate the text was saved.
   */
  Essay.InputField.prototype.updateMessageSaved = function (saved) {
    if (!this.params.statusBar) {
      return;
    }

    // Add/remove blending effect
    if (typeof saved === 'undefined' || saved === '') {
      this.statusSaved.classList.remove(ANIMATION_MESSAGE);
      //this.statusSaved.removeAttribute('tabindex');
    }
    else {
      this.statusSaved.classList.add(ANIMATION_MESSAGE);
      //this.statusSaved.setAttribute('tabindex', 0);
    }
    this.statusSaved.innerHTML = saved;
  };

  /**
   * Set the text for the character message.
   * @param {string} message - Message text.
   * @param {boolean} important - If true, message will added a particular CSS class.
   */
  Essay.InputField.prototype.setMessageChars = function (message, important) {
    if (!this.params.statusBar) {
      return;
    }

    if (typeof message !== 'string') {
      return;
    }

    if (message === EMPTY_MESSAGE || important) {
      /*
       * Important messages should be read for a readspeaker by caller and need
       * not be accessible when tabbing back again.
       */
      this.statusChars.removeAttribute('tabindex');
    }
    else {
      this.statusChars.setAttribute('tabindex', 0);
    }

    this.statusChars.innerHTML = message;
    if (important) {
      this.statusChars.classList.add(CHAR_MESSAGE_IMPORTANT);
    }
    else {
      this.statusChars.classList.remove(CHAR_MESSAGE_IMPORTANT);
    }
  };

})(H5P.Essay);
;
/** @namespace H5P */
H5P.VideoVimeo = (function ($) {

  let numInstances = 0;

  /**
   * Vimeo video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   * @param {Object} l10n Localization strings
   */
  function VimeoPlayer(sources, options, l10n) {
    const self = this;

    let player;

    // Since all the methods of the Vimeo Player SDK are promise-based, we keep
    // track of all relevant state variables so that we can implement the
    // H5P.Video API where all methods return synchronously.
    let buffered = 0;
    let currentQuality;
    let currentTextTrack;
    let currentTime = 0;
    let duration = 0;
    let isMuted = 0;
    let volume = 0;
    let playbackRate = 1;
    let qualities = [];
    let loadingFailedTimeout;
    let failedLoading = false;
    let ratio = 9/16;
    let isLoaded = false;

    const LOADING_TIMEOUT_IN_SECONDS = 8;

    const id = `h5p-vimeo-${++numInstances}`;
    const $wrapper = $('<div/>');
    const $placeholder = $('<div/>', {
      id: id,
      html: `<div class="h5p-video-loading" style="height: 100%; min-height: 200px; display: block; z-index: 100;" aria-label="${l10n.loading}"></div>`
    }).appendTo($wrapper);

    /**
     * Create a new player with the Vimeo Player SDK.
     *
     * @private
     */
    const createVimeoPlayer = async () => {
      if (!$placeholder.is(':visible') || player !== undefined) {
        return;
      }

      // Since the SDK is loaded asynchronously below, explicitly set player to
      // null (unlike undefined) which indicates that creation has begun. This
      // allows the guard statement above to be hit if this function is called
      // more than once.
      player = null;

      const Vimeo = await loadVimeoPlayerSDK();

      const MIN_WIDTH = 200;
      const width = Math.max($wrapper.width(), MIN_WIDTH);

      const canHasControls = options.controls || self.pressToPlay;
      const embedOptions = {
        url: sources[0].path,
        controls: canHasControls,
        responsive: true,
        dnt: true,
        // Hardcoded autoplay to false to avoid playing videos on init
        autoplay: false,
        loop: options.loop ? true : false,
        playsinline: true,
        quality: 'auto',
        width: width,
        muted: false,
        keyboard: canHasControls,
      };

      // Create a new player
      player = new Vimeo.Player(id, embedOptions);

      registerVimeoPlayerEventListeneners(player);

      // Failsafe timeout to handle failed loading of videos.
      // This seems to happen for private videos even though the SDK docs
      // suggests to catch PrivacyError when attempting play()
      loadingFailedTimeout = setTimeout(() => {
        failedLoading = true;
        removeLoadingIndicator();
        $wrapper.html(`<p class="vimeo-failed-loading">${l10n.vimeoLoadingError}</p>`);
        $wrapper.css({
          width: null,
          height: null
        });
        self.trigger('resize');
        self.trigger('error', l10n.vimeoLoadingError);
      }, LOADING_TIMEOUT_IN_SECONDS * 1000);
    }

    const removeLoadingIndicator = () => {
      $placeholder.find('div.h5p-video-loading').remove();
    };

    /**
     * Register event listeners on the given Vimeo player.
     *
     * @private
     * @param {Vimeo.Player} player
     */
    const registerVimeoPlayerEventListeneners = (player) => {
      let isFirstPlay, tracks;
      player.on('loaded', async () => {
        isFirstPlay = true;
        isLoaded = true;
        clearTimeout(loadingFailedTimeout);

        const videoDetails = await getVimeoVideoMetadata(player);
        tracks = videoDetails.tracks.options;
        currentTextTrack = tracks.current;
        duration = videoDetails.duration;
        qualities = videoDetails.qualities;
        currentQuality = 'auto';
        try {
          ratio = videoDetails.dimensions.height / videoDetails.dimensions.width;
        }
        catch (e) { /* Intentionally ignore this, and fallback on the default ratio */ }

        removeLoadingIndicator();

        if (options.startAt) {
          // Vimeo.Player doesn't have an option for setting start time upon
          // instantiation, so we instead perform an initial seek here.
          currentTime = await self.seek(options.startAt);
        }

        self.trigger('ready');
        self.trigger('loaded');
        self.trigger('qualityChange', currentQuality);
        self.trigger('resize');
      });

      player.on('play', () => {
        if (isFirstPlay) {
          isFirstPlay = false;
          if (tracks.length) {
            self.trigger('captions', tracks);
          }
        }
      });

      // Handle playback state changes.
      player.on('playing', () => self.trigger('stateChange', H5P.Video.PLAYING));
      player.on('pause', () => self.trigger('stateChange', H5P.Video.PAUSED));
      player.on('ended', () => self.trigger('stateChange', H5P.Video.ENDED));

      // Track the percentage of video that has finished loading (buffered).
      player.on('progress', (data) => {
        buffered = data.percent * 100;
      });

      // Track the current time. The update frequency may be browser-dependent,
      // according to the official docs:
      // https://developer.vimeo.com/player/sdk/reference#timeupdate
      player.on('timeupdate', (time) => {
        currentTime = time.seconds;
      });
    };

    /**
     * Get metadata about the video loaded in the given Vimeo player.
     *
     * Example resolved value:
     *
     * ```
     * {
     *   "duration": 39,
     *   "qualities": [
     *     {
     *       "name": "auto",
     *       "label": "Auto"
     *     },
     *     {
     *       "name": "1080p",
     *       "label": "1080p"
     *     },
     *     {
     *       "name": "720p",
     *       "label": "720p"
     *     }
     *   ],
     *   "dimensions": {
     *     "width": 1920,
     *     "height": 1080
     *   },
     *   "tracks": {
     *     "current": {
     *       "label": "English",
     *       "value": "en"
     *     },
     *     "options": [
     *       {
     *         "label": "English",
     *         "value": "en"
     *       },
     *       {
     *         "label": "Norsk bokmål",
     *         "value": "nb"
     *       }
     *     ]
     *   }
     * }
     * ```
     *
     * @private
     * @param {Vimeo.Player} player
     * @returns {Promise}
     */
    const getVimeoVideoMetadata = (player) => {
      // Create an object for easy lookup of relevant metadata
      const massageVideoMetadata = (data) => {
        const duration = data[0];
        const qualities = data[1].map(q => ({
          name: q.id,
          label: q.label
        }));
        const tracks = data[2].reduce((tracks, current) => {
          const h5pVideoTrack = new H5P.Video.LabelValue(current.label, current.language);
          tracks.options.push(h5pVideoTrack);
          if (current.mode === 'showing') {
            tracks.current = h5pVideoTrack;
          }
          return tracks;
        }, { current: undefined, options: [] });
        const dimensions = { width: data[3], height: data[4] };

        return {
          duration,
          qualities,
          tracks,
          dimensions
        };
      };

      return Promise.all([
        player.getDuration(),
        player.getQualities(),
        player.getTextTracks(),
        player.getVideoWidth(),
        player.getVideoHeight(),
      ]).then(data => massageVideoMetadata(data));
    }

    try {
      if (document.featurePolicy.allowsFeature('autoplay') === false) {
        self.pressToPlay = true;
      }
    }
    catch (err) {}

    /**
     * Appends the video player to the DOM.
     *
     * @public
     * @param {jQuery} $container
     */
    self.appendTo = ($container) => {
      $container.addClass('h5p-vimeo').append($wrapper);
      createVimeoPlayer();
    };

    /**
     * Get list of available qualities.
     *
     * @public
     * @returns {Array}
     */
    self.getQualities = () => {
      return qualities;
    };

    /**
     * Get the current quality.
     *
     * @returns {String} Current quality identifier
     */
    self.getQuality = () => {
      return currentQuality;
    };

    /**
     * Set the playback quality.
     *
     * @public
     * @param {String} quality
     */
    self.setQuality = async (quality) => {
      currentQuality = await player.setQuality(quality);
      self.trigger('qualityChange', currentQuality);
    };

    /**
     * Start the video.
     *
     * @public
     */
    self.play = async () => {
      if (!player) {
        self.on('ready', self.play);
        return;
      }

      try {
        await player.play();
      }
      catch (error) {
        switch (error.name) {
          case 'PasswordError': // The video is password-protected
            self.trigger('error', l10n.vimeoPasswordError);
            break;

          case 'PrivacyError': // The video is private
            self.trigger('error', l10n.vimeoPrivacyError);
            break;

          default:
            self.trigger('error', l10n.unknownError);
            break;
        }
      }
    };

    /**
     * Pause the video.
     *
     * @public
     */
    self.pause = () => {
      if (player) {
        player.pause();
      }
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    self.seek = async (time) => {
      if (!player) {
        return;
      }

      currentTime = time;
      await player.setCurrentTime(time);
    };

    /**
     * @public
     * @returns {Number} Seconds elapsed since beginning of video
     */
    self.getCurrentTime = () => {
      return currentTime;
    };

    /**
     * @public
     * @returns {Number} Video duration in seconds
     */
    self.getDuration = () => {
      return duration;
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    self.getBuffered = () => {
      return buffered;
    };

    /**
     * Mute the video.
     *
     * @public
     */
    self.mute = async () => {
      isMuted = await player.setMuted(true);
    };

    /**
     * Unmute the video.
     *
     * @public
     */
    self.unMute = async () => {
      isMuted = await player.setMuted(false);
    };

    /**
     * Whether the video is muted.
     *
     * @public
     * @returns {Boolean} True if the video is muted, false otherwise
     */
    self.isMuted = () => {
      return isMuted;
    };

    /**
     * Whether the video is loaded.
     *
     * @public
     * @returns {Boolean} True if the video is muted, false otherwise
     */
    self.isLoaded = () => {
      return isLoaded;
    };

    /**
     * Get the video player's current sound volume.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    self.getVolume = () => {
      return volume;
    };

    /**
     * Set the video player's sound volume.
     *
     * @public
     * @param {Number} level
     */
    self.setVolume = async (level) => {
      volume = await player.setVolume(level);
    };

    /**
     * Get list of available playback rates.
     *
     * @public
     * @returns {Array} Available playback rates
     */
    self.getPlaybackRates = () => {
      return [0.5, 1, 1.5, 2];
    };

    /**
     * Get the current playback rate.
     *
     * @public
     * @returns {Number} e.g. 0.5, 1, 1.5 or 2
     */
    self.getPlaybackRate = () => {
      return playbackRate;
    };

    /**
     * Set the current playback rate.
     *
     * @public
     * @param {Number} rate Must be one of available rates from getPlaybackRates
     */
    self.setPlaybackRate = async (rate) => {
      playbackRate = await player.setPlaybackRate(rate);
      self.trigger('playbackRateChange', rate);
    };

    /**
     * Set current captions track.
     *
     * @public
     * @param {H5P.Video.LabelValue} track Captions to display
     */
    self.setCaptionsTrack = (track) => {
      if (!track) {
        return player.disableTextTrack().then(() => {
          currentTextTrack = null;
        });
      }

      player.enableTextTrack(track.value).then(() => {
        currentTextTrack = track;
      });
    };

    /**
     * Get current captions track.
     *
     * @public
     * @returns {H5P.Video.LabelValue}
     */
    self.getCaptionsTrack = () => {
      return currentTextTrack;
    };

    self.on('resize', () => {
      if (failedLoading || !$wrapper.is(':visible')) {
        return;
      }

      if (player === undefined) {
        // Player isn't created yet. Try again.
        createVimeoPlayer();
        return;
      }

      // Use as much space as possible
      $wrapper.css({
        width: '100%',
        height: 'auto'
      });

      const width = $wrapper[0].clientWidth;
      const height = options.fit ? $wrapper[0].clientHeight : (width * (ratio));

      // Validate height before setting
      if (height > 0) {
        // Set size
        $wrapper.css({
          width: width + 'px',
          height: height + 'px'
        });
      }
    });
  }

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  VimeoPlayer.canPlay = (sources) => {
    return getId(sources[0].path);
  };

  /**
   * Find id of Vimeo video from given URL.
   *
   * @private
   * @param {String} url
   * @returns {String} Vimeo video ID
   */
  const getId = (url) => {
    // https://stackoverflow.com/a/11660798
    const matches = url.match(/^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/);
    if (matches && matches[5]) {
      return matches[5];
    }
  };

  /**
   * Load the Vimeo Player SDK asynchronously.
   *
   * @private
   * @returns {Promise} Vimeo Player SDK object
   */
  const loadVimeoPlayerSDK = async () => {
    if (window.Vimeo) {
      return await Promise.resolve(window.Vimeo);
    }

    return await new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = 'https://player.vimeo.com/api/player.js';
      tag.onload = () => resolve(window.Vimeo);
      tag.onerror = reject;
      document.querySelector('script').before(tag);
    });
  };

  return VimeoPlayer;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(H5P.VideoVimeo);
;
/** @namespace H5P */
H5P.VideoYouTube = (function ($) {

  /**
   * YouTube video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   * @param {Object} l10n Localization strings
   */
  function YouTube(sources, options, l10n) {
    var self = this;

    var player;
    var playbackRate = 1;
    var id = 'h5p-youtube-' + numInstances;
    numInstances++;

    var $wrapper = $('<div/>');
    var $placeholder = $('<div/>', {
      id: id,
      text: l10n.loading
    }).appendTo($wrapper);

    // Optional placeholder
    // var $placeholder = $('<iframe id="' + id + '" type="text/html" width="640" height="360" src="https://www.youtube.com/embed/' + getId(sources[0].path) + '?enablejsapi=1&origin=' + encodeURIComponent(ORIGIN) + '&autoplay=' + (options.autoplay ? 1 : 0) + '&controls=' + (options.controls ? 1 : 0) + '&disabledkb=' + (options.controls ? 0 : 1) + '&fs=0&loop=' + (options.loop ? 1 : 0) + '&rel=0&showinfo=0&iv_load_policy=3" frameborder="0"></iframe>').appendTo($wrapper);

    /**
     * Use the YouTube API to create a new player
     *
     * @private
     */
    var create = function () {
      if (!$placeholder.is(':visible') || player !== undefined) {
        return;
      }

      if (window.YT === undefined) {
        // Load API first
        loadAPI(create);
        return;
      }
      if (YT.Player === undefined) {
        return;
      }

      var width = $wrapper.width();
      if (width < 200) {
        width = 200;
      }

      var loadCaptionsModule = true;

      var videoId = getId(sources[0].path);

      player = new YT.Player(id, {
        width: width,
        height: width * (9/16),
        videoId: videoId,
        playerVars: {
          origin: ORIGIN,
          // Hardcoded autoplay to false to avoid playing videos on init
          autoplay: 0,
          controls: options.controls ? 1 : 0,
          disablekb: options.controls ? 0 : 1,
          fs: 0,
          loop: options.loop ? 1 : 0,
          playlist: options.loop ? videoId : undefined,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          wmode: "opaque",
          start: Math.floor(options.startAt),
          playsinline: 1
        },
        events: {
          onReady: function () {
            self.trigger('ready');
            self.trigger('loaded');

            if (!options.autoplay) {
              self.toPause = true;
            }
            
            if (options.deactivateSound) {
              self.mute();
            }
          },
          onApiChange: function () {
            if (loadCaptionsModule) {
              loadCaptionsModule = false;

              // Always load captions
              player.loadModule('captions');
            }

            var trackList;
            try {
              // Grab tracklist from player
              trackList = player.getOption('captions', 'tracklist');
            }
            catch (err) {}
            if (trackList && trackList.length) {

              // Format track list into valid track options
              var trackOptions = [];
              for (var i = 0; i < trackList.length; i++) {
                trackOptions.push(new H5P.Video.LabelValue(trackList[i].displayName, trackList[i].languageCode));
              }

              // Captions are ready for loading
              self.trigger('captions', trackOptions);
            }
          },
          onStateChange: function (state) {
            if (state.data > -1 && state.data < 4) {
              if (self.toPause) {
                // if video buffering, was likely paused already - skip
                if (state.data === H5P.Video.BUFFERING) {
                  delete self.toPause;
                }
                else {
                  self.pause();
                }
              }

              // Fix for keeping playback rate in IE11
              if (H5P.Video.IE11_PLAYBACK_RATE_FIX && state.data === H5P.Video.PLAYING && playbackRate !== 1) {
                // YT doesn't know that IE11 changed the rate so it must be reset before it's set to the correct value
                player.setPlaybackRate(1);
                player.setPlaybackRate(playbackRate);
              }
              // End IE11 fix

              self.trigger('stateChange', state.data);
            }
          },
          onPlaybackQualityChange: function (quality) {
            self.trigger('qualityChange', quality.data);
          },
          onPlaybackRateChange: function (playbackRate) {
            self.trigger('playbackRateChange', playbackRate.data);
          },
          onError: function (error) {
            var message;
            switch (error.data) {
              case 2:
                message = l10n.invalidYtId;
                break;

              case 100:
                message = l10n.unknownYtId;
                break;

              case 101:
              case 150:
                message = l10n.restrictedYt;
                break;

              default:
                message = l10n.unknownError + ' ' + error.data;
                break;
            }
            self.trigger('error', message);
          }
        }
      });
    };

    /**
     * Indicates if the video must be clicked for it to start playing.
     * For instance YouTube videos on iPad must be pressed to start playing.
     *
     * @public
     */
    if (navigator.userAgent.match(/iPad/i)) {
      self.pressToPlay = true;
    }
    else {
      try {
        if (document.featurePolicy.allowsFeature('autoplay') === false) {
          self.pressToPlay = true;
        }
      }
      catch (err) {}
    }

    /**
    * Appends the video player to the DOM.
    *
    * @public
    * @param {jQuery} $container
    */
    self.appendTo = function ($container) {
      $container.addClass('h5p-youtube').append($wrapper);
      create();
    };

    /**
     * Get list of available qualities. Not available until after play.
     *
     * @public
     * @returns {Array}
     */
    self.getQualities = function () {
      if (!player || !player.getAvailableQualityLevels) {
        return;
      }

      var qualities = player.getAvailableQualityLevels();
      if (!qualities.length) {
        return; // No qualities
      }

      // Add labels
      for (var i = 0; i < qualities.length; i++) {
        var quality = qualities[i];
        var label = (LABELS[quality] !== undefined ? LABELS[quality] : 'Unknown'); // TODO: l10n
        qualities[i] = {
          name: quality,
          label: LABELS[quality]
        };
      }

      return qualities;
    };

    /**
     * Get current playback quality. Not available until after play.
     *
     * @public
     * @returns {String}
     */
    self.getQuality = function () {
      if (!player || !player.getPlaybackQuality) {
        return;
      }

      var quality = player.getPlaybackQuality();
      return quality === 'unknown' ? undefined : quality;
    };

    /**
     * Set current playback quality. Not available until after play.
     * Listen to event "qualityChange" to check if successful.
     *
     * @public
     * @params {String} [quality]
     */
    self.setQuality = function (quality) {
      if (!player || !player.setPlaybackQuality) {
        return;
      }

      player.setPlaybackQuality(quality);
    };

    /**
     * Start the video.
     *
     * @public
     */
    self.play = function () {
      if (!player || !player.playVideo) {
        self.on('ready', self.play);
        return;
      }
      player.playVideo();
    };

    /**
     * Pause the video.
     *
     * @public
     */
    self.pause = function () {
      delete self.toPause;
      self.off('ready', self.play);
      if (!player || !player.pauseVideo) {
        return;
      }
      player.pauseVideo();
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    self.seek = function (time) {
      if (!player || !player.seekTo) {
        return;
      }

      player.seekTo(time, true);
    };

    /**
     * Recreate player with initial time
     *
     * @public
     * @param {Number} time
     */
    self.resetPlayback = function (time) {
      options.startAt = time;

      if (player) {
        if (player.getPlayerState() === H5P.Video.PLAYING) {
          player.pauseVideo();
          self.trigger('stateChange', H5P.Video.PAUSED);
        }
        player.destroy();
        player = undefined;
      }

      create();
    }
    /**
     * Get elapsed time since video beginning.
     *
     * @public
     * @returns {Number}
     */
    self.getCurrentTime = function () {
      if (!player || !player.getCurrentTime) {
        return;
      }

      return player.getCurrentTime();
    };

    /**
     * Get total video duration time.
     *
     * @public
     * @returns {Number}
     */
    self.getDuration = function () {
      if (!player || !player.getDuration) {
        return;
      }

      return player.getDuration();
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    self.getBuffered = function () {
      if (!player || !player.getVideoLoadedFraction) {
        return;
      }

      return player.getVideoLoadedFraction() * 100;
    };

    /**
     * Turn off video sound.
     *
     * @public
     */
    self.mute = function () {
      if (!player || !player.mute) {
        return;
      }

      player.mute();
    };

    /**
     * Turn on video sound.
     *
     * @public
     */
    self.unMute = function () {
      if (!player || !player.unMute) {
        return;
      }

      player.unMute();
    };

    /**
     * Check if video sound is turned on or off.
     *
     * @public
     * @returns {Boolean}
     */
    self.isMuted = function () {
      if (!player || !player.isMuted) {
        return;
      }

      return player.isMuted();
    };

    /**
     * Check if video is loaded and ready to play.
     *
     * @public
     * @returns {Boolean}
     */
    self.isLoaded = function () {
      if (!player || !player.getPlayerState) {
        return;
      }

      return player.getPlayerState() === 5;
    };

    /**
     * Return the video sound level.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    self.getVolume = function () {
      if (!player || !player.getVolume) {
        return;
      }

      return player.getVolume();
    };

    /**
     * Set video sound level.
     *
     * @public
     * @param {Number} level Between 0 and 100.
     */
    self.setVolume = function (level) {
      if (!player || !player.setVolume) {
        return;
      }

      player.setVolume(level);
    };

    /**
     * Get list of available playback rates.
     *
     * @public
     * @returns {Array} available playback rates
     */
    self.getPlaybackRates = function () {
      if (!player || !player.getAvailablePlaybackRates) {
        return;
      }

      var playbackRates = player.getAvailablePlaybackRates();
      if (!playbackRates.length) {
        return; // No rates, but the array should contain at least 1
      }

      return playbackRates;
    };

    /**
     * Get current playback rate.
     *
     * @public
     * @returns {Number} such as 0.25, 0.5, 1, 1.25, 1.5 and 2
     */
    self.getPlaybackRate = function () {
      if (!player || !player.getPlaybackRate) {
        return;
      }

      return player.getPlaybackRate();
    };

    /**
     * Set current playback rate.
     * Listen to event "playbackRateChange" to check if successful.
     *
     * @public
     * @params {Number} suggested rate that may be rounded to supported values
     */
    self.setPlaybackRate = function (newPlaybackRate) {
      if (!player || !player.setPlaybackRate) {
        return;
      }

      playbackRate = Number(newPlaybackRate);
      player.setPlaybackRate(playbackRate);
    };

    /**
     * Set current captions track.
     *
     * @param {H5P.Video.LabelValue} Captions track to show during playback
     */
    self.setCaptionsTrack = function (track) {
      player.setOption('captions', 'track', track ? {languageCode: track.value} : {});
    };

    /**
     * Figure out which captions track is currently used.
     *
     * @return {H5P.Video.LabelValue} Captions track
     */
    self.getCaptionsTrack = function () {
      var track = player.getOption('captions', 'track');
      return (track.languageCode ? new H5P.Video.LabelValue(track.displayName, track.languageCode) : null);
    };

    // Respond to resize events by setting the YT player size.
    self.on('resize', function () {
      if (!$wrapper.is(':visible')) {
        return;
      }

      if (!player) {
        // Player isn't created yet. Try again.
        create();
        return;
      }

      // Use as much space as possible
      $wrapper.css({
        width: '100%',
        height: '100%'
      });

      var width = $wrapper[0].clientWidth;
      var height = options.fit ? $wrapper[0].clientHeight : (width * (9/16));

      // Validate height before setting
      if (height > 0) {
        // Set size
        $wrapper.css({
          width: width + 'px',
          height: height + 'px'
        });

        player.setSize(width, height);
      }
    });
  }

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  YouTube.canPlay = function (sources) {
    return getId(sources[0].path);
  };

  /**
   * Find id of YouTube video from given URL.
   *
   * @private
   * @param {String} url
   * @returns {String} YouTube video identifier
   */

  var getId = function (url) {
    // Has some false positives, but should cover all regular URLs that people can find
    var matches = url.match(/(?:(?:youtube.com\/(?:attribution_link\?(?:\S+))?(?:v\/|embed\/|watch\/|(?:user\/(?:\S+)\/)?watch(?:\S+)v\=))|(?:youtu.be\/|y2u.be\/))([A-Za-z0-9_-]{11})/i);
    if (matches && matches[1]) {
      return matches[1];
    }
  };

  /**
   * Load the IFrame Player API asynchronously.
   */
  var loadAPI = function (loaded) {
    if (window.onYouTubeIframeAPIReady !== undefined) {
      // Someone else is loading, hook in
      var original = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function (id) {
        loaded(id);
        original(id);
      };
    }
    else {
      // Load the API our self
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = loaded;
    }
  };

  /** @constant {Object} */
  var LABELS = {
    highres: '2160p', // Old API support
    hd2160: '2160p', // (New API)
    hd1440: '1440p',
    hd1080: '1080p',
    hd720: '720p',
    large: '480p',
    medium: '360p',
    small: '240p',
    tiny: '144p',
    auto: 'Auto'
  };

  /** @private */
  var numInstances = 0;

  // Extract the current origin (used for security)
  var ORIGIN = window.location.href.match(/http[s]?:\/\/[^\/]+/);
  ORIGIN = !ORIGIN || ORIGIN[0] === undefined ? undefined : ORIGIN[0];
  // ORIGIN = undefined is needed to support fetching file from device local storage

  return YouTube;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(H5P.VideoYouTube);
;
/** @namespace H5P */
H5P.VideoPanopto = (function ($) {

  /**
   * Panopto video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   * @param {Object} l10n Localization strings
   */
  function Panopto(sources, options, l10n) {
    var self = this;

    self.volume = 100;
    self.toSeek = undefined;

    var player;
    var playbackRate = 1;
    let canHasAutoplay;
    var id = 'h5p-panopto-' + numInstances;
    numInstances++;
    let isLoaded = false;
    let isPlayerReady = false;

    var $wrapper = $('<div/>');
    var $placeholder = $('<div/>', {
      id: id,
      html: '<div>' + l10n.loading + '</div>'
    }).appendTo($wrapper);

    // Determine autoplay/play.
    try {
      if (document.featurePolicy.allowsFeature('autoplay') !== false) {
        canHasAutoplay = true;
      }
    }
    catch (err) {}

    /**
     * Use the Panopto API to create a new player
     *
     * @private
     */
    var create = function () {
      if (!$placeholder.is(':visible') || player !== undefined) {
        return;
      }

      if (window.EmbedApi === undefined) {
        // Load API first
        loadAPI(create);
        return;
      }

      var width = $wrapper.width();
      if (width < 200) {
        width = 200;
      }

      const videoId = getId(sources[0].path);
      player = new EmbedApi(id, {
        width: width,
        height: width * (9/16),
        serverName: videoId[0],
        sessionId: videoId[1],
        videoParams: { // Optional
          interactivity: 'none',
          showtitle: false,
          autohide: true,
          offerviewer: false,
          autoplay: false,
          showbrand: false,
          start: 0,
          hideoverlay: !options.controls,
        },
        events: {
          onIframeReady: function () {
            isPlayerReady = true;
            $placeholder.children(0).text('');
            if (options.autoplay && canHasAutoplay) {
              player.loadVideo();
              isLoaded = true;
            }

            self.trigger('containerLoaded');
            self.trigger('resize'); // Avoid black iframe if loading is slow
          },
          onReady: function () {
            self.videoLoaded = true;
            self.trigger('loaded');

            if (typeof self.oldTime === 'number') {
              self.seek(self.oldTime);
            }
            else if (typeof self.startAt === 'number' && self.startAt > 0) {
              self.seek(self.startAt);
            }
            if (player.hasCaptions()) {
              const captions = [];

              const captionTracks = player.getCaptionTracks();
              for (trackIndex in captionTracks) {
                captions.push(new H5P.Video.LabelValue(captionTracks[trackIndex], trackIndex));
              }

              // Select active track
              currentTrack = player.getSelectedCaptionTrack();
              currentTrack = captions[currentTrack] ? captions[currentTrack] : null;

              self.trigger('captions', captions);
            }
          },
          onStateChange: function (state) {
            if ([H5P.Video.PLAYING, H5P.Video.PAUSED].includes(state) && typeof self.seekToTime === 'number') {
              player.seekTo(self.seekToTime);
              delete self.seekToTime;
            }
            // since panopto has different load sequence in IV, need additional condition here
            if (self.WAS_RESET) {
              self.WAS_RESET = false;
            }

            // TODO: Playback rate fix for IE11?
            if (state > -1 && state < 4) {
              self.trigger('stateChange', state);
            }
          },
          onPlaybackRateChange: function () {
            self.trigger('playbackRateChange', self.getPlaybackRate());
          },
          onError: function (error) {
            if (error === ApiError.PlayWithSoundNotAllowed) {
              // pause and allow user to handle playing
              self.pause();

              self.unMute(); // because player is automuted on this error
            }
            else {
              self.trigger('error', l10n.unknownError);
            }
          },
          onLoginShown: function () {
            $placeholder.children().first().remove(); // Remove loading message
            self.trigger('loaded'); // Resize parent
          }
        }
      });
    };

    /**
     * Indicates if the video must be clicked for it to start playing.
     * This is always true for Panopto since all videos auto play.
     *
     * @public
     */
    self.pressToPlay = true;

    /**
    * Appends the video player to the DOM.
    *
    * @public
    * @param {jQuery} $container
    */
    self.appendTo = function ($container) {
      $container.addClass('h5p-panopto').append($wrapper);
      create();
    };

    /**
     * Get list of available qualities. Not available until after play.
     *
     * @public
     * @returns {Array}
     */
    self.getQualities = function () {
      // Not available for Panopto
    };

    /**
     * Get current playback quality. Not available until after play.
     *
     * @public
     * @returns {String}
     */
    self.getQuality = function () {
      // Not available for Panopto
    };

    /**
     * Set current playback quality. Not available until after play.
     * Listen to event "qualityChange" to check if successful.
     *
     * @public
     * @params {String} [quality]
     */
    self.setQuality = function (quality) {
      // Not available for Panopto
    };

    /**
     * Start the video.
     *
     * @public
     */
    self.play = function () {
      if (!player || !player.playVideo || !isPlayerReady) {
        return;
      }
      if (isLoaded || self.videoLoaded) {
        player.playVideo();
      }
      else {
        player.loadVideo(); // Loads and starts playing
        isLoaded = true;
      }
    };

    /**
     * Pause the video.
     *
     * @public
     */
    self.pause = function () {
      if (!player || !player.pauseVideo) {
        return;
      }
      try {
        player.pauseVideo();
      }
      catch (err) {
        // Swallow Panopto throwing an error. This has been seen in the authoring
        // tool if Panopto has been used inside Iv inside CP
      }
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    self.seek = function (time) {
      if (!player || !player.seekTo || !self.videoLoaded) {
        return;
      }
      if (!player.isReady) {
        self.seekToTime = time;
        return;
      }

      player.seekTo(time);

      if (self.WAS_RESET) {
        // need to check just to be sure, since state === 1 is unusable
        delete self.seekToTime;
        self.WAS_RESET = false;
      }
    };

    /**
     * Recreate player with initial time
     *
     * @public
     * @param {Number} time
     */
    self.resetPlayback = function (time) {
      if (player && player.isReady && self.videoLoaded) {
        self.seek(time);
        self.pause();
      }
      else {
        self.seekToTime = time;
      }
    }

    /**
     * Get elapsed time since video beginning.
     *
     * @public
     * @returns {Number}
     */
    self.getCurrentTime = function () {
      if (!player || !player.getCurrentTime) {
        return;
      }

      return player.getCurrentTime();
    };

    /**
     * Get total video duration time.
     *
     * @public
     * @returns {Number}
     */
    self.getDuration = function () {
      if (!player || !player.getDuration) {
        return;
      }

      return player.getDuration();
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    self.getBuffered = function () {
      // Not available for Panopto
    };

    /**
     * Turn off video sound.
     *
     * @public
     */
    self.mute = function () {
      if (!player || !player.muteVideo) {
        return;
      }

      player.muteVideo();
    };

    /**
     * Turn on video sound.
     *
     * @public
     */
    self.unMute = function () {
      if (!player || !player.unmuteVideo) {
        return;
      }

      player.unmuteVideo();

      // The volume is set to 0 when the browser prevents autoplay,
      // causing there to be no sound despite unmuting
      self.setVolume(self.volume);
    };

    /**
     * Check if video sound is turned on or off.
     *
     * @public
     * @returns {Boolean}
     */
    self.isMuted = function () {
      if (!player || !player.isMuted) {
        return;
      }

      return player.isMuted();
    };

    /**
     * Check video is loaded and ready to play
     *
     * @public
     * @returns {Boolean}
     */
    self.isLoaded = function () {
      return isPlayerReady;
    };

    /**
     * Return the video sound level.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    self.getVolume = function () {
      if (!player || !player.getVolume) {
        return;
      }

      return player.getVolume() * 100;
    };

    /**
     * Set video sound level.
     *
     * @public
     * @param {Number} level Between 0 and 100.
     */
    self.setVolume = function (level) {
      if (!player || !player.setVolume) {
        return;
      }

      player.setVolume(level/100);
      self.volume = level;
    };

    /**
     * Get list of available playback rates.
     *
     * @public
     * @returns {Array} available playback rates
     */
    self.getPlaybackRates = function () {
      return [0.25, 0.5, 1, 1.25, 1.5, 2];
    };

    /**
     * Get current playback rate.
     *
     * @public
     * @returns {Number} such as 0.25, 0.5, 1, 1.25, 1.5 and 2
     */
    self.getPlaybackRate = function () {
      if (!player || !player.getPlaybackRate) {
        return;
      }

      return player.getPlaybackRate();
    };

    /**
     * Set current playback rate.
     * Listen to event "playbackRateChange" to check if successful.
     *
     * @public
     * @params {Number} suggested rate that may be rounded to supported values
     */
    self.setPlaybackRate = function (newPlaybackRate) {
      if (!player || !player.setPlaybackRate) {
        return;
      }

      player.setPlaybackRate(newPlaybackRate);
    };

    /**
     * Set current captions track.
     *
     * @param {H5P.Video.LabelValue} Captions track to show during playback
     */
    self.setCaptionsTrack = function (track) {
      if (!track) {
        player.disableCaptions();
        currentTrack = null;
      }
      else {
        player.enableCaptions(track.value + '');
        currentTrack = track;
      }
    };

    /**
     * Figure out which captions track is currently used.
     *
     * @return {H5P.Video.LabelValue} Captions track
     */
    self.getCaptionsTrack = function () {
      return currentTrack; // No function for getting active caption track?
    };

    // Respond to resize events by setting the player size.
    self.on('resize', function () {
      if (!$wrapper.is(':visible')) {
        return;
      }

      if (!player) {
        // Player isn't created yet. Try again.
        create();
        return;
      }

      // Use as much space as possible
      $wrapper.css({
        width: '100%',
        height: '100%'
      });

      var width = $wrapper[0].clientWidth;
      var height = options.fit ? $wrapper[0].clientHeight : (width * (9/16));

      // Set size
      $wrapper.css({
        width: width + 'px',
        height: height + 'px'
      });

      const $iframe = $placeholder.children('iframe');
      if ($iframe.length) {
        $iframe.attr('width', width);
        $iframe.attr('height', height);
      }
    });

    let currentTrack;
  }

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  Panopto.canPlay = function (sources) {
    return getId(sources[0].path);
  };

  /**
   * Find id of YouTube video from given URL.
   *
   * @private
   * @param {String} url
   * @returns {String} Panopto video identifier
   */
  var getId = function (url) {
    const matches = url.match(/^[^\/]+:\/\/([^\/]*panopto\.[^\/]+)\/Panopto\/.+\?id=(.+)$/);
    if (matches && matches.length === 3) {
      return [matches[1], matches[2]];
    }
  };

  /**
   * Load the IFrame Player API asynchronously.
   */
  var loadAPI = function (loaded) {
    if (window.onPanoptoEmbedApiReady !== undefined) {
      // Someone else is loading, hook in
      var original = window.onPanoptoEmbedApiReady;
      window.onPanoptoEmbedApiReady = function (id) {
        loaded(id);
        original(id);
      };
    }
    else {
      // Load the API our self
      var tag = document.createElement('script');
      tag.src = 'https://developers.panopto.com/scripts/embedapi.min.js';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onPanoptoEmbedApiReady = loaded;
    }
  };

  /** @private */
  var numInstances = 0;

  return Panopto;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(H5P.VideoPanopto);
;
/** @namespace H5P */
H5P.VideoHtml5 = (function ($) {

  /**
   * HTML5 video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   * @param {Object} l10n Localization strings
   */
  function Html5(sources, options, l10n) {
    var self = this;

    /**
     * Small helper to ensure all video sources get the same cache buster.
     *
     * @private
     * @param {Object} source
     * @return {string}
     */
    const getCrossOriginPath = function (source) {
      let path = H5P.getPath(source.path, self.contentId);
      if (video.crossOrigin !== null && H5P.addQueryParameter && H5PIntegration.crossoriginCacheBuster) {
        path = H5P.addQueryParameter(path, H5PIntegration.crossoriginCacheBuster);
      }
      return path
    };


    /**
     * Register track to video
     *
     * @param {Object} trackData Track object
     * @param {string} trackData.kind Kind of track
     * @param {Object} trackData.track Source path
     * @param {string} [trackData.label] Label of track
     * @param {string} [trackData.srcLang] Language code
     */
    const addTrack = function (trackData) {
      // Skip invalid tracks
      if (!trackData.kind || !trackData.track.path) {
        return;
      }

      var track = document.createElement('track');
      track.kind = trackData.kind;
      track.src = getCrossOriginPath(trackData.track); // Uses same crossOrigin as parent. You cannot mix.
      if (trackData.label) {
        track.label = trackData.label;
      }

      if (trackData.srcLang) {
        track.srcLang = trackData.srcLang;
      }

      return track;
    };

    /**
     * Small helper to set the inital video source.
     * Useful if some of the loading happens asynchronously.
     * NOTE: Setting the crossOrigin must happen before any of the
     * sources(poster, tracks etc.) are loaded
     *
     * @private
     */
    const setInitialSource = function () {
      if (qualities[currentQuality] === undefined) {
        return;
      }

      if (H5P.setSource !== undefined) {
        H5P.setSource(video, qualities[currentQuality].source, self.contentId)
      }
      else {
        // Backwards compatibility (H5P < v1.22)
        const srcPath = H5P.getPath(qualities[currentQuality].source.path, self.contentId);
        if (H5P.getCrossOrigin !== undefined) {
          var crossOrigin = H5P.getCrossOrigin(srcPath);
          video.setAttribute('crossorigin', crossOrigin !== null ? crossOrigin : 'anonymous');
        }
        video.src = srcPath;
      }

      // Add poster if provided
      if (options.poster) {
        video.poster = getCrossOriginPath(options.poster); // Uses same crossOrigin as parent. You cannot mix.
      }

      // Register tracks
      options.tracks.forEach(function (track, i) {
        var trackElement = addTrack(track);
        if (i === 0) {
          trackElement.default = true;
        }
        if (trackElement) {
          video.appendChild(trackElement);
        }
      });
    };

    /**
     * Displayed when the video is buffering
     * @private
     */
    var $throbber = $('<div/>', {
      'class': 'h5p-video-loading'
    });

    /**
     * Used to display error messages
     * @private
     */
    var $error = $('<div/>', {
      'class': 'h5p-video-error'
    });

    /**
     * Keep track of current state when changing quality.
     * @private
     */
    var stateBeforeChangingQuality;
    var currentTimeBeforeChangingQuality;

    /**
     * Avoids firing the same event twice.
     * @private
     */
    var lastState;

    /**
     * Keeps track whether or not the video has been loaded.
     * @private
     */
    var isLoaded = false;

    /**
     *
     * @private
     */
    var playbackRate = 1;
    var skipRateChange = false;

    // Create player
    var video = document.createElement('video');

    // Sort sources into qualities
    var qualities = getQualities(sources, video);
    var currentQuality;

    numQualities = 0;
    for (let quality in qualities) {
      numQualities++;
    }

    if (numQualities > 1 && H5P.VideoHtml5.getExternalQuality !== undefined) {
      H5P.VideoHtml5.getExternalQuality(sources, function (chosenQuality) {
        if (qualities[chosenQuality] !== undefined) {
          currentQuality = chosenQuality;
        }
        setInitialSource();
      });
    }
    else {
      // Select quality and source
      currentQuality = getPreferredQuality();
      if (currentQuality === undefined || qualities[currentQuality] === undefined) {
        // No preferred quality, pick the first.
        for (currentQuality in qualities) {
          if (qualities.hasOwnProperty(currentQuality)) {
            break;
          }
        }
      }
      setInitialSource();
    }

    // Setting webkit-playsinline, which makes iOS 10 beeing able to play video
    // inside browser.
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');

    // Remove buttons in Chrome's video player:
    let controlsList = 'nodownload';
    if (options.disableFullscreen) {
      controlsList += ' nofullscreen';
    }
    if (options.disableRemotePlayback) {
      controlsList += ' noremoteplayback';
    }
    video.setAttribute('controlsList', controlsList);

    // Remove picture in picture as it interfers with other video players
    video.disablePictureInPicture = true;

    // Set options
    video.disableRemotePlayback = (options.disableRemotePlayback ? true : false);
    video.controls = (options.controls ? true : false);
    // Hardcoded autoplay to false to avoid playing videos on init
    video.autoplay = false;
    video.loop = (options.loop ? true : false);
    video.className = 'h5p-video';
    video.style.display = 'block';

    if (options.fit) {
      // Style is used since attributes with relative sizes aren't supported by IE9.
      video.style.width = '100%';
      video.style.height = '100%';
    }

    /**
     * Helps registering events.
     *
     * @private
     * @param {String} native Event name
     * @param {String} h5p Event name
     * @param {String} [arg] Optional argument
     */
    var mapEvent = function (native, h5p, arg) {
      video.addEventListener(native, function () {
        switch (h5p) {
          case 'loaded':
            isLoaded = true;

            if (stateBeforeChangingQuality !== undefined) {
              return; // Avoid loaded event when changing quality.
            }

            // Remove any errors
            if ($error.is(':visible')) {
              $error.remove();
            }

            if (OLD_ANDROID_FIX) {
              var andLoaded = function () {
                video.removeEventListener('durationchange', andLoaded, false);
                // On Android seeking isn't ready until after play.
                self.trigger(h5p);
              };
              video.addEventListener('durationchange', andLoaded, false);
              return;
            }

            if (video.poster) {
              $(video).one('play', function () {
                self.seek(self.getCurrentTime() || options.startAt);
              });
            }
            else {
              self.seek(options.startAt);
            }

            break;

          case 'error':
            // Handle error and get message.
            arg = error(arguments[0], arguments[1]);
            break;

          case 'playbackRateChange':

            // Fix for keeping playback rate in IE11
            if (skipRateChange) {
              skipRateChange = false;
              return; // Avoid firing event when changing back
            }
            if (H5P.Video.IE11_PLAYBACK_RATE_FIX && playbackRate != video.playbackRate) { // Intentional
              // Prevent change in playback rate not triggered by the user
              video.playbackRate = playbackRate;
              skipRateChange = true;
              return;
            }
            // End IE11 fix

            arg = self.getPlaybackRate();
            break;
        }
        self.trigger(h5p, arg);
      }, false);
    };

    /**
     * Handle errors from the video player.
     *
     * @private
     * @param {Object} code Error
     * @param {String} [message]
     * @returns {String} Human readable error message.
     */
    var error = function (code, message) {
      if (code instanceof Event) {

        // No error code
        if (!code.target.error) {
          return '';
        }

        switch (code.target.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = l10n.aborted;
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            message = l10n.networkFailure;
            break;
          case MediaError.MEDIA_ERR_DECODE:
            message = l10n.cannotDecode;
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = l10n.formatNotSupported;
            break;
          case MediaError.MEDIA_ERR_ENCRYPTED:
            message = l10n.mediaEncrypted;
            break;
        }
      }
      if (!message) {
        message = l10n.unknownError;
      }

      // Hide throbber
      $throbber.remove();

      // Display error message to user
      $error.text(message).insertAfter(video);

      // Pass message to our error event
      return message;
    };

    /**
     * Appends the video player to the DOM.
     *
     * @public
     * @param {jQuery} $container
     */
    self.appendTo = function ($container) {
      $container.append(video);
    };

    /**
     * Get list of available qualities. Not available until after play.
     *
     * @public
     * @returns {Array}
     */
    self.getQualities = function () {
      // Create reverse list
      var options = [];
      for (var q in qualities) {
        if (qualities.hasOwnProperty(q)) {
          options.splice(0, 0, {
            name: q,
            label: qualities[q].label
          });
        }
      }

      if (options.length < 2) {
        // Do not return if only one quality.
        return;
      }

      return options;
    };

    /**
     * Get current playback quality. Not available until after play.
     *
     * @public
     * @returns {String}
     */
    self.getQuality = function () {
      return currentQuality;
    };

    /**
     * Set current playback quality. Not available until after play.
     * Listen to event "qualityChange" to check if successful.
     *
     * @public
     * @params {String} [quality]
     */
    self.setQuality = function (quality) {
      if (qualities[quality] === undefined || quality === currentQuality) {
        return; // Invalid quality
      }

      // Keep track of last choice
      setPreferredQuality(quality);

      // Avoid multiple loaded events if changing quality multiple times.
      if (!stateBeforeChangingQuality) {
        // Keep track of last state
        stateBeforeChangingQuality = lastState;

        // Keep track of current time
        currentTimeBeforeChangingQuality = video.currentTime;

        // Seek and start video again after loading.
        var loaded = function () {
          video.removeEventListener('loadedmetadata', loaded, false);
          if (OLD_ANDROID_FIX) {
            var andLoaded = function () {
              video.removeEventListener('durationchange', andLoaded, false);
              // On Android seeking isn't ready until after play.
              self.seek(currentTimeBeforeChangingQuality);
            };
            video.addEventListener('durationchange', andLoaded, false);
          }
          else {
            // Seek to current time.
            self.seek(currentTimeBeforeChangingQuality);
          }

          // Always play to get image.
          video.play();

          if (stateBeforeChangingQuality !== H5P.Video.PLAYING) {
            // Do not resume playing
            video.pause();
          }

          // Done changing quality
          stateBeforeChangingQuality = undefined;

          // Remove any errors
          if ($error.is(':visible')) {
            $error.remove();
          }
        };
        video.addEventListener('loadedmetadata', loaded, false);
      }

      // Keep track of current quality
      currentQuality = quality;
      self.trigger('qualityChange', currentQuality);

      // Display throbber
      self.trigger('stateChange', H5P.Video.BUFFERING);

      // Change source
      video.src = getCrossOriginPath(qualities[quality].source); // (iPad does not support #t=).
      // Note: Optional tracks use same crossOrigin as the original. You cannot mix.

      // Remove poster so it will not show during quality change
      video.removeAttribute('poster');
    };

    /**
     * Starts the video.
     *
     * @public
     * @return {Promise|undefined} May return a Promise that resolves when
     * play has been processed.
     */
    self.play = function () {
      if ($error.is(':visible')) {
        return;
      }

      if (!isLoaded) {
        // Make sure video is loaded before playing
        video.load();

        video.addEventListener('loadeddata', function() {
          video.play();
        }, false);
      }
      else {
        return video.play();
      }
    };

    /**
     * Pauses the video.
     *
     * @public
     */
    self.pause = function () {
      video.pause();
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    self.seek = function (time) {
      video.currentTime = time;
      // Use canplaythrough for IOs devices
      // Use loadedmetadata for all other devices.
      const eventName = navigator.userAgent.match(/iPad|iPod|iPhone/i) ? "canplaythrough" : "loadedmetadata";
      function seekTo() {
        video.currentTime = time;
        video.removeEventListener(eventName, seekTo);
      };

      if (video.readyState === 4) {
        seekTo();
      }
      else {
        video.addEventListener(eventName, seekTo);
      }
    };

    /**
     * Get elapsed time since video beginning.
     *
     * @public
     * @returns {Number}
     */
    self.getCurrentTime = function () {
      return video.currentTime;
    };

    /**
     * Get total video duration time.
     *
     * @public
     * @returns {Number}
     */
    self.getDuration = function () {
      if (isNaN(video.duration)) {
        return;
      }

      return video.duration;
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    self.getBuffered = function () {
      // Find buffer currently playing from
      var buffered = 0;
      for (var i = 0; i < video.buffered.length; i++) {
        var from = video.buffered.start(i);
        var to = video.buffered.end(i);

        if (video.currentTime > from && video.currentTime < to) {
          buffered = to;
          break;
        }
      }

      // To percentage
      return buffered ? (buffered / video.duration) * 100 : 0;
    };

    /**
     * Turn off video sound.
     *
     * @public
     */
    self.mute = function () {
      video.muted = true;
    };

    /**
     * Turn on video sound.
     *
     * @public
     */
    self.unMute = function () {
      video.muted = false;
    };

    /**
     * Check if video sound is turned on or off.
     *
     * @public
     * @returns {Boolean}
     */
    self.isMuted = function () {
      return video.muted;
    };

    /**
     * Returns the video sound level.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    self.getVolume = function () {
      return video.volume * 100;
    };

    /**
     * Set video sound level.
     *
     * @public
     * @param {Number} level Between 0 and 100.
     */
    self.setVolume = function (level) {
      video.volume = level / 100;
    };

    /**
     * Get list of available playback rates.
     *
     * @public
     * @returns {Array} available playback rates
     */
    self.getPlaybackRates = function () {
      /*
       * not sure if there's a common rule about determining good speeds
       * using Google's standard options via a constant for setting
       */
      var playbackRates = PLAYBACK_RATES;

      return playbackRates;
    };

    /**
     * Get current playback rate.
     *
     * @public
     * @returns {Number} such as 0.25, 0.5, 1, 1.25, 1.5 and 2
     */
    self.getPlaybackRate = function () {
      return video.playbackRate;
    };

    /**
     * Set current playback rate.
     * Listen to event "playbackRateChange" to check if successful.
     *
     * @public
     * @params {Number} suggested rate that may be rounded to supported values
     */
    self.setPlaybackRate = function (newPlaybackRate) {
      playbackRate = newPlaybackRate;
      video.playbackRate = newPlaybackRate;
    };

    /**
     * Set current captions track.
     *
     * @param {H5P.Video.LabelValue} Captions track to show during playback
     */
    self.setCaptionsTrack = function (track) {
      for (var i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = (track && track.value === i ? 'showing' : 'disabled');
      }
    };

    /**
     * Figure out which captions track is currently used.
     *
     * @return {H5P.Video.LabelValue} Captions track
     */
    self.getCaptionsTrack = function () {
      for (var i = 0; i < video.textTracks.length; i++) {
        if (video.textTracks[i].mode === 'showing') {
          return new H5P.Video.LabelValue(video.textTracks[i].label, i);
        }
      }

      return null;
    };

    // Register event listeners
    mapEvent('ended', 'stateChange', H5P.Video.ENDED);
    mapEvent('playing', 'stateChange', H5P.Video.PLAYING);
    mapEvent('pause', 'stateChange', H5P.Video.PAUSED);
    mapEvent('waiting', 'stateChange', H5P.Video.BUFFERING);
    mapEvent('loadedmetadata', 'loaded');
    mapEvent('canplay', 'canplay');
    mapEvent('error', 'error');
    mapEvent('ratechange', 'playbackRateChange');

    if (!video.controls) {
      // Disable context menu(right click) to prevent controls.
      video.addEventListener('contextmenu', function (event) {
        event.preventDefault();
      }, false);
    }

    // Display throbber when buffering/loading video.
    self.on('stateChange', function (event) {
      var state = event.data;
      lastState = state;
      if (state === H5P.Video.BUFFERING) {
        $throbber.insertAfter(video);
      }
      else {
        $throbber.remove();
      }
    });

    // Load captions after the video is loaded
    self.on('loaded', function () {
      nextTick(function () {
        var textTracks = [];
        for (var i = 0; i < video.textTracks.length; i++) {
          textTracks.push(new H5P.Video.LabelValue(video.textTracks[i].label, i));
        }
        if (textTracks.length) {
          self.trigger('captions', textTracks);
        }
      });
    });

    // Alternative to 'canplay' event
    /*self.on('resize', function () {
      if (video.offsetParent === null) {
        return;
      }

      video.style.width = '100%';
      video.style.height = '100%';

      var width = video.clientWidth;
      var height = options.fit ? video.clientHeight : (width * (video.videoHeight / video.videoWidth));

      video.style.width = width + 'px';
      video.style.height = height + 'px';
    });*/

    // Video controls are ready
    nextTick(function () {
      self.trigger('ready');
    });

    /**
     * Check video is loaded and ready play.
     *
     * @public
     * @param {Boolean}
     */
    self.isLoaded = function () {
      return isLoaded;
    };
  }

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  Html5.canPlay = function (sources) {
    var video = document.createElement('video');
    if (video.canPlayType === undefined) {
      return false; // Not supported
    }

    // Cycle through sources
    for (var i = 0; i < sources.length; i++) {
      var type = getType(sources[i]);
      if (type && video.canPlayType(type) !== '') {
        // We should be able to play this
        return true;
      }
    }

    return false;
  };

  /**
   * Find source type.
   *
   * @private
   * @param {Object} source
   * @returns {String}
   */
  var getType = function (source) {
    var type = source.mime;
    if (!type) {
      // Try to get type from URL
      var matches = source.path.match(/\.(\w+)$/);
      if (matches && matches[1]) {
        type = 'video/' + matches[1];
      }
    }

    if (type && source.codecs) {
      // Add codecs
      type += '; codecs="' + source.codecs + '"';
    }

    return type;
  };

  /**
   * Sort sources into qualities.
   *
   * @private
   * @static
   * @param {Array} sources
   * @param {Object} video
   * @returns {Object} Quality mapping
   */
  var getQualities = function (sources, video) {
    var qualities = {};
    var qualityIndex = 1;
    var lastQuality;

    // Cycle through sources
    for (var i = 0; i < sources.length; i++) {
      var source = sources[i];

      // Find and update type.
      var type = source.type = getType(source);

      // Check if we support this type
      var isPlayable = type && (type === 'video/unknown' || video.canPlayType(type) !== '');
      if (!isPlayable) {
        continue; // We cannot play this source
      }

      if (source.quality === undefined) {
        /**
         * No quality metadata. Create a quality tag to separate multiple sources of the same type,
         * e.g. if two mp4 files with different quality has been uploaded
         */

        if (lastQuality === undefined || qualities[lastQuality].source.type === type) {
          // Create a new quality tag
          source.quality = {
            name: 'q' + qualityIndex,
            label: (source.metadata && source.metadata.qualityName) ? source.metadata.qualityName : 'Quality ' + qualityIndex // TODO: l10n
          };
          qualityIndex++;
        }
        else {
          /**
           * Assumes quality already exists in a different format.
           * Uses existing label for this quality.
           */
          source.quality = qualities[lastQuality].source.quality;
        }
      }

      // Log last quality
      lastQuality = source.quality.name;

      // Look to see if quality exists
      var quality = qualities[lastQuality];
      if (quality) {
        // We have a source with this quality. Check if we have a better format.
        if (source.mime.split('/')[1] === PREFERRED_FORMAT) {
          quality.source = source;
        }
      }
      else {
        // Add new source with quality.
        qualities[source.quality.name] = {
          label: source.quality.label,
          source: source
        };
      }
    }

    return qualities;
  };

  /**
   * Set preferred video quality.
   *
   * @private
   * @static
   * @param {String} quality Index of preferred quality
   */
  var setPreferredQuality = function (quality) {
    try {
      localStorage.setItem('h5pVideoQuality', quality);
    }
    catch (err) {
      console.warn('Unable to set preferred video quality, localStorage is not available.');
    }
  };

  /**
   * Get preferred video quality.
   *
   * @private
   * @static
   * @returns {String} Index of preferred quality
   */
  var getPreferredQuality = function () {
    // First check localStorage
    let quality;
    try {
      quality = localStorage.getItem('h5pVideoQuality');
    }
    catch (err) {
      console.warn('Unable to retrieve preferred video quality from localStorage.');
    }
    if (!quality) {
      try {
        // The fallback to old cookie solution
        var settings = document.cookie.split(';');
        for (var i = 0; i < settings.length; i++) {
          var setting = settings[i].split('=');
          if (setting[0] === 'H5PVideoQuality') {
            quality = setting[1];
            break;
          }
        }
      }
      catch (err) {
        console.warn('Unable to retrieve preferred video quality from cookie.');
      }
    }
    return quality;
  };

  /**
   * Helps schedule a task for the next tick.
   * @param {function} task
   */
  var nextTick = function (task) {
    setTimeout(task, 0);
  };

  /** @constant {Boolean} */
  var OLD_ANDROID_FIX = false;

  /** @constant {Boolean} */
  var PREFERRED_FORMAT = 'mp4';

  /** @constant {Object} */
  var PLAYBACK_RATES = [0.25, 0.5, 1, 1.25, 1.5, 2];

  if (navigator.userAgent.indexOf('Android') !== -1) {
    // We have Android, check version.
    var version = navigator.userAgent.match(/AppleWebKit\/(\d+\.?\d*)/);
    if (version && version[1] && Number(version[1]) <= 534.30) {
      // Include fix for devices running the native Android browser.
      // (We don't know when video was fixed, so the number is just the lastest
      // native android browser we found.)
      OLD_ANDROID_FIX = true;
    }
  }
  else {
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      // If we're using chrome on a device that isn't Android, prefer the webm
      // format. This is because Chrome has trouble with some mp4 codecs.
      PREFERRED_FORMAT = 'webm';
    }
  }

  return Html5;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(H5P.VideoHtml5);
;
/** @namespace H5P */
H5P.Video = (function ($, ContentCopyrights, MediaCopyright, handlers) {

  /**
   * The ultimate H5P video player!
   *
   * @class
   * @param {Object} parameters Options for this library.
   * @param {Object} parameters.visuals Visual options
   * @param {Object} parameters.playback Playback options
   * @param {Object} parameters.a11y Accessibility options
   * @param {Boolean} [parameters.startAt] Start time of video
   * @param {Number} id Content identifier
   * @param {Object} [extras] Extra parameters.
   */
  function Video(parameters, id, extras = {}) {
    var self = this;
    self.oldTime = extras.previousState?.time;
    self.contentId = id;
    self.WAS_RESET = false;
    self.startAt = parameters.startAt || 0;

    // Ref youtube.js - ipad & youtube - issue
    self.pressToPlay = false;

    // Reference to the handler
    var handlerName = '';

    // Initialize event inheritance
    H5P.EventDispatcher.call(self);

    // Default language localization
    parameters = $.extend(true, parameters, {
      l10n: {
        name: 'Video',
        loading: 'Video player loading...',
        noPlayers: 'Found no video players that supports the given video format.',
        noSources: 'Video source is missing.',
        aborted: 'Media playback has been aborted.',
        networkFailure: 'Network failure.',
        cannotDecode: 'Unable to decode media.',
        formatNotSupported: 'Video format not supported.',
        mediaEncrypted: 'Media encrypted.',
        unknownError: 'Unknown error.',
        vimeoPasswordError: 'Password-protected Vimeo videos are not supported.',
        vimeoPrivacyError: 'The Vimeo video cannot be used due to its privacy settings.',
        vimeoLoadingError: 'The Vimeo video could not be loaded.',
        invalidYtId: 'Invalid YouTube ID.',
        unknownYtId: 'Unable to find video with the given YouTube ID.',
        restrictedYt: 'The owner of this video does not allow it to be embedded.'
      }
    });

    parameters.a11y = parameters.a11y || [];
    parameters.playback = parameters.playback || {};
    parameters.visuals = $.extend(true, parameters.visuals, {
      disableFullscreen: false
    });

    /** @private */
    var sources = [];
    if (parameters.sources) {
      for (var i = 0; i < parameters.sources.length; i++) {
        // Clone to avoid changing of parameters.
        var source = $.extend(true, {}, parameters.sources[i]);

        // Create working URL without html entities.
        source.path = $cleaner.html(source.path).text();
        sources.push(source);
      }
    }

    /** @private */
    var tracks = [];
    parameters.a11y.forEach(function (track) {
      // Clone to avoid changing of parameters.
      var clone = $.extend(true, {}, track);

      // Create working URL without html entities
      if (clone.track && clone.track.path) {
        clone.track.path = $cleaner.html(clone.track.path).text();
        tracks.push(clone);
      }
    });

    /**
     * Handle autoplay. If autoplay is disabled, it will still autopause when
     * video is not visible.
     *
     * @param {*} $container
     */
    const handleAutoPlayPause = function ($container) {
      // Keep the current state
      let state;
      self.on('stateChange', function(event) {
        state = event.data;
      });

      // Keep record of autopauses.
      // I.e: we don't wanna autoplay if the user has excplicitly paused.
      self.autoPaused = !self.pressToPlay;

      new IntersectionObserver(function (entries) {
        const entry = entries[0];

        // This video element became visible
        if (entry.isIntersecting) {
          // Autoplay if autoplay is enabled and it was not explicitly
          // paused by a user
          if (parameters.playback.autoplay && self.autoPaused) {
            self.autoPaused = false;
            self.play();
          }
        }
        else if (state !== Video.PAUSED && state !== Video.ENDED) {
          self.autoPaused = true;
          self.pause();
        }
      }, {
        root: null,
        threshold: [0, 1] // Get events when it is shown and hidden
      }).observe($container.get(0));
    };

    /**
     * Attaches the video handler to the given container.
     * Inserts text if no handler is found.
     *
     * @public
     * @param {jQuery} $container
     */
    self.attach = function ($container) {
      $container.addClass('h5p-video').html('');

      if (self.appendTo !== undefined) {
        self.appendTo($container);

        // Avoid autoplaying in authoring tool
        if (window.H5PEditor === undefined) {
          handleAutoPlayPause($container);
        }
      }
      else if (sources.length) {
        $container.text(parameters.l10n.noPlayers);
      }
      else {
        $container.text(parameters.l10n.noSources);
      }
    };

    /**
     * Get name of the video handler
     *
     * @public
     * @returns {string}
     */
    self.getHandlerName = function() {
      return handlerName;
    };

    /**
    * @public
    * Get current state for resume support.
    *
    * @returns {object} Current state.
    */
    self.getCurrentState = function () {
      if (self.getCurrentTime) {
        return {
          time: self.getCurrentTime() || self.oldTime,
        };
      }
    };

    /**
     * The two functions below needs to be defined in this base class,
     * since it is used in this class even if no handler was found.
     */
    self.seek = () => {};
    self.pause = () => {};

    /**
    * @public
    * Reset current state (time).
    *
    */
    self.resetTask = function () {
      delete self.oldTime;
      self.resetPlayback(parameters.startAt || 0);
    };

    /**
     * Default implementation of resetPlayback. May be overridden by sub classes.
     *
     * @param {*} startAt
     */
    self.resetPlayback = startAt => {
      self.seek(startAt);
      self.pause();
      self.WAS_RESET = true;
    };

    // Resize the video when we know its aspect ratio
    self.on('loaded', function () {
      self.trigger('resize');

      // reset time if wasn't done immediately
      if (self.WAS_RESET) {
        self.seek(parameters.startAt || 0);
        if (!parameters.playback.autoplay) {
          self.pause();
        }
        self.WAS_RESET = false;
      }

    });

    // Find player for video sources
    if (sources.length) {
      const options = {
        controls: parameters.visuals.controls,
        autoplay: parameters.playback.autoplay,
        loop: parameters.playback.loop,
        fit: parameters.visuals.fit,
        poster: parameters.visuals.poster === undefined ? undefined : parameters.visuals.poster,
        tracks: tracks,
        disableRemotePlayback: parameters.visuals.disableRemotePlayback === true,
        disableFullscreen: parameters.visuals.disableFullscreen === true,
        deactivateSound: parameters.playback.deactivateSound,
      }
      if (!self.WAS_RESET) {
        options.startAt = self.oldTime !== undefined ? self.oldTime : (parameters.startAt || 0);
      }

      var html5Handler;
      for (var i = 0; i < handlers.length; i++) {
        var handler = handlers[i];
        if (handler.canPlay !== undefined && handler.canPlay(sources)) {
          handler.call(self, sources, options, parameters.l10n);
          handlerName = handler.name;
          return;
        }

        if (handler === H5P.VideoHtml5) {
          html5Handler = handler;
          handlerName = handler.name;
        }
      }

      // Fallback to trying HTML5 player
      if (html5Handler) {
        html5Handler.call(self, sources, options, parameters.l10n);
      }
    }
  }

  // Extends the event dispatcher
  Video.prototype = Object.create(H5P.EventDispatcher.prototype);
  Video.prototype.constructor = Video;

  // Player states
  /** @constant {Number} */
  Video.ENDED = 0;
  /** @constant {Number} */
  Video.PLAYING = 1;
  /** @constant {Number} */
  Video.PAUSED = 2;
  /** @constant {Number} */
  Video.BUFFERING = 3;
  /**
   * When video is queued to start
   * @constant {Number}
   */
  Video.VIDEO_CUED = 5;


  // Used to convert between html and text, since URLs have html entities.
  var $cleaner = H5P.jQuery('<div/>');

  /**
   * Help keep track of key value pairs used by the UI.
   *
   * @class
   * @param {string} label
   * @param {string} value
   */
  Video.LabelValue = function (label, value) {
    this.label = label;
    this.value = value;
  };

  /** @constant {Boolean} */
  Video.IE11_PLAYBACK_RATE_FIX = (navigator.userAgent.match(/Trident.*rv[ :]*11\./) ? true : false);

  return Video;
})(H5P.jQuery, H5P.ContentCopyrights, H5P.MediaCopyright, H5P.videoHandlers || []);
;
H5P = H5P || {};

/**
 * Will render a Question with multiple choices for answers.
 *
 * Events provided:
 * - h5pQuestionSetFinished: Triggered when a question is finished. (User presses Finish-button)
 *
 * @param {Array} options
 * @param {int} contentId
 * @param {Object} contentData
 * @returns {H5P.QuestionSet} Instance
 */
H5P.QuestionSet = function (options, contentId, contentData) {
  if (!(this instanceof H5P.QuestionSet)) {
    return new H5P.QuestionSet(options, contentId, contentData);
  }
  H5P.EventDispatcher.call(this);
  var $ = H5P.jQuery;
  var self = this;
  this.contentId = contentId;

  var defaults = {
    initialQuestion: 0,
    progressType: 'dots',
    passPercentage: 50,
    questions: [],
    introPage: {
      showIntroPage: false,
      title: '',
      introduction: '',
      startButtonText: 'Start'
    },
    texts: {
      prevButton: 'Previous question',
      nextButton: 'Next question',
      finishButton: 'Finish',
      submitButton: 'Submit',
      textualProgress: 'Question: @current of @total questions',
      jumpToQuestion: 'Question %d of %total',
      questionLabel: 'Question',
      readSpeakerProgress: 'Question @current of @total',
      unansweredText: 'Unanswered',
      answeredText: 'Answered',
      currentQuestionText: 'Current question',
      navigationLabel: 'Questions'
    },
    endGame: {
      showResultPage: true,
      noResultMessage: 'Finished',
      message: 'Your result:',
      scoreBarLabel: 'You got @finals out of @totals points',
      oldFeedback: {
        successGreeting: '',
        successComment: '',
        failGreeting: '',
        failComment: ''
      },
      overallFeedback: [],
      finishButtonText: 'Finish',
      submitButtonText: 'Submit',
      solutionButtonText: 'Show solution',
      retryButtonText: 'Retry',
      showAnimations: false,
      skipButtonText: 'Skip video',
      showSolutionButton: true,
      showRetryButton: true
    },
    override: {},
    disableBackwardsNavigation: false
  };
  this.isSubmitting = contentData
         && (contentData.isScoringEnabled || contentData.isReportingEnabled);
  var params = $.extend(true, {}, defaults, options);

  var initialParams = $.extend(true, {}, defaults, options);
  var poolOrder; // Order of questions in a pool
  var currentQuestion = 0;
  var questionInstances = [];
  var questionOrder; //Stores order of questions to allow resuming of question set
  var $myDom;
  var scoreBar;
  var up;
  var renderSolutions = false;
  var showingSolutions = false;
  contentData = contentData || {};

  // Bring question set up to date when resuming
  if (contentData.previousState) {
    if (contentData.previousState.progress) {
      currentQuestion = contentData.previousState.progress;
    }
    questionOrder = contentData.previousState.order;
  }

  /**
   * Randomizes questions in an array and updates an array containing their order
   * @param  {array} questions
   * @return {Object.<array, array>} questionOrdering
   */
  var randomizeQuestionOrdering = function (questions) {

    // Save the original order of the questions in a multidimensional array [[question0,0],[question1,1]...
    var questionOrdering = questions.map(function (questionInstance, index) {
      return [questionInstance, index];
    });

    // Shuffle the multidimensional array
    questionOrdering = H5P.shuffleArray(questionOrdering);

    // Retrieve question objects from the first index
    questions = [];
    for (var i = 0; i < questionOrdering.length; i++) {
      questions[i] = questionOrdering[i][0];
    }

    // Retrieve the new shuffled order from the second index
    var newOrder = [];
    for (var j = 0; j < questionOrdering.length; j++) {

      // Use a previous order if it exists
      if (contentData.previousState && contentData.previousState.questionOrder) {
        newOrder[j] = questionOrder[questionOrdering[j][1]];
      }
      else {
        newOrder[j] = questionOrdering[j][1];
      }
    }

    // Return the questions in their new order *with* their new indexes
    return {
      questions: questions,
      questionOrder: newOrder
    };
  };

  // Create a pool (a subset) of questions if necessary
  if (params.poolSize > 0) {

    // If a previous pool exists, recreate it
    if (contentData.previousState && contentData.previousState.poolOrder) {
      poolOrder = contentData.previousState.poolOrder;

      // Recreate the pool from the saved data
      var pool = [];
      for (var i = 0; i < poolOrder.length; i++) {
        pool[i] = params.questions[poolOrder[i]];
      }

      // Replace original questions with just the ones in the pool
      params.questions = pool;
    }
    else { // Otherwise create a new pool
      // Randomize and get the results
      var poolResult = randomizeQuestionOrdering(params.questions);
      var poolQuestions = poolResult.questions;
      poolOrder = poolResult.questionOrder;

      // Discard extra questions

      poolQuestions = poolQuestions.slice(0, params.poolSize);
      poolOrder = poolOrder.slice(0, params.poolSize);

      // Replace original questions with just the ones in the pool
      params.questions = poolQuestions;
    }
  }

  // Set overrides for questions
  var override;
  if (params.override.showSolutionButton || params.override.retryButton || params.override.checkButton === false) {
    override = {};
    if (params.override.showSolutionButton) {
      // Force "Show solution" button to be on or off for all interactions
      override.enableSolutionsButton =
          (params.override.showSolutionButton === 'on' ? true : false);
    }

    if (params.override.retryButton) {
      // Force "Retry" button to be on or off for all interactions
      override.enableRetry =
          (params.override.retryButton === 'on' ? true : false);
    }

    if (params.override.checkButton === false) {
      // Force "Check" button to be on or off for all interactions
      override.enableCheckButton = params.override.checkButton;
    }
  }

  /**
   * Generates question instances from H5P objects
   *
   * @param  {object} questions H5P content types to be created as instances
   * @return {array} Array of questions instances
   */
  var createQuestionInstancesFromQuestions = function (questions) {
    var result = [];
    // Create question instances from questions
    // Instantiate question instances
    for (var i = 0; i < questions.length; i++) {

      var question;
      // If a previous order exists, use it
      if (questionOrder !== undefined) {
        question = questions[questionOrder[i]];
      }
      else {
        // Use a generic order when initialzing for the first time
        question = questions[i];
      }

      if (override) {
        // Extend subcontent with the overrided settings.
        $.extend(question.params.behaviour, override);
      }

      question.params = question.params || {};
      var hasAnswers = contentData.previousState && contentData.previousState.answers;
      var questionInstance = H5P.newRunnable(question, contentId, undefined, undefined,
        {
          previousState: hasAnswers ? contentData.previousState.answers[i] : undefined,
          parent: self
        });
      questionInstance.on('resize', function () {
        up = true;
        self.trigger('resize');
      });
      result.push(questionInstance);
    }

    return result;
  };

  // Create question instances from questions given by params
  questionInstances = createQuestionInstancesFromQuestions(params.questions);
  params.noOfQuestionAnswered = 0;
  if (contentData.previousState) {
    // get numbers of questions answered by user
    if (contentData.previousState.answers) {
      for (var i = 0; i < questionInstances.length; i++) {
        let answered = questionInstances[i].getAnswerGiven();
        if (answered){
          params.noOfQuestionAnswered++;
        }
      }
    }
  }

  // Create html for intro page layout
  self.$introPage = '';
  if (params.introPage.showIntroPage && params.noOfQuestionAnswered === 0) {
    self.$introPage = $('<div>', {
      class: 'intro-page'
    });
  
    if (params.introPage.title) {
      $('<div>', {
        class: 'title',
        html: '<h1>' + 
              params.introPage.title + 
              '</h1>',
        appendTo: self.$introPage
      });
    }

    if (params.introPage.introduction) {
      $('<div>', {
        class: 'introduction',
        html: params.introPage.introduction,
        appendTo: self.$introPage
      });
    }

    self.$introButtonsContainer = $('<div>', {
      class: 'buttons',
      appendTo: self.$introPage
    });
  
    $('<button>', {
      class: 'qs-startbutton h5p-joubelui-button h5p-button',
      html: params.introPage.startButtonText,
      appendTo: self.$introButtonsContainer
    });
  }

  // Create html for progress announcer
  self.$progressAnnouncer = $('<div>', {
    class: 'qs-progress-announcer',
    tabindex: '-1'
  });

  // Create html for questionset
  self.$questionsContainer = $('<div>', {
    class: 'questionset ' + 
    ((params.introPage.showIntroPage && params.noOfQuestionAnswered === 0) ? 'hidden' : ''),
  });

  for (let i=0; i<params.questions.length; i++) {
    $('<div>', {
      class: 'question-container',
      appendTo: self.$questionsContainer
    });
  }

  self.$footer = $('<div>', {
    class: 'qs-footer',
    appendTo: self.$questionsContainer
  });

  self.$progressBar = $('<div>', {
    class: 'qs-progress',
    role: 'navigation',
    'aria-label': params.texts.navigationLabel,
    appendTo: self.$footer
  });

  if (params.progressType == "dots") {
    self.$dotsContainer = $('<ul>', {
      class: 'dots-container',
      appendTo: self.$progressBar
    });

    for (let i=0; i<params.questions.length; i++) {
      $('<li>', {
        class: 'progress-item',
        html: '<a href="#" class= "progress-dot unanswered ' + 
              (params.disableBackwardsNavigation ? 'disabled' : '') +
              '" ' +
              'aria-label=' +
                '"' +
                params.texts.jumpToQuestion.replace("%d", i + 1).replace("%total", params.questions.length) +
                ', ' +
                params.texts.unansweredText +
                '" ' +
              'tabindex="-1" ' +
              (params.disableBackwardsNavigation ? 'aria-disabled="true"' : '') +
              '></a>',
        appendTo: self.$dotsContainer
      })
    }
  }

  else if (params.progressType == "textual") {
    $('<span>', {
      class: 'progress-text',
      appendTo: self.$progressBar
    })
}

  // Randomize questions only on instantiation
  if (params.randomQuestions && contentData.previousState === undefined) {
    var result = randomizeQuestionOrdering(questionInstances);
    questionInstances = result.questions;
    questionOrder = result.questionOrder;
  }

  // Resize all interactions on resize
  self.on('resize', function () {
    if (up) {
      // Prevent resizing the question again.
      up = false;
      return;
    }

    for (var i = 0; i < questionInstances.length; i++) {
      questionInstances[i].trigger('resize');
    }
  });

  // Update button state.
  var _updateButtons = function () {
    // Verify that current question is answered when backward nav is disabled
    if (params.disableBackwardsNavigation) {
      if (questionInstances[currentQuestion].getAnswerGiven() &&
          questionInstances.length-1 !== currentQuestion) {
        questionInstances[currentQuestion].showButton('next');
      }
      else {
        questionInstances[currentQuestion].hideButton('next');
      }
    }

    var answered = true;
    for (var i = questionInstances.length - 1; i >= 0; i--) {
      answered = answered && (questionInstances[i]).getAnswerGiven();
    }

    if (currentQuestion === (params.questions.length - 1) &&
        questionInstances[currentQuestion]) {
      if (answered) {
        questionInstances[currentQuestion].showButton('finish');
      }
      else {
        questionInstances[currentQuestion].hideButton('finish');
      }
    }
  };

  var _showQuestion = function (questionNumber, preventAnnouncement) {
    // Sanitize input.
    if (questionNumber < 0) {
      questionNumber = 0;
    }
    if (questionNumber >= params.questions.length) {
      questionNumber = params.questions.length - 1;
    }

    currentQuestion = questionNumber;

    // Hide all questions
    $('.question-container', $myDom).hide().eq(questionNumber).show();

    if (questionInstances[questionNumber]) {
      // Trigger resize on question in case the size of the QS has changed.
      var instance = questionInstances[questionNumber];
      instance.setActivityStarted();
      if (instance.$ !== undefined) {
        instance.trigger('resize');
      }
    }

    // Update progress indicator
    // Test if current has been answered.
    if (params.progressType === 'textual') {
      $('.progress-text', $myDom).text(params.texts.textualProgress.replace("@current", questionNumber+1).replace("@total", params.questions.length));
    }
    else {
      // Set currentNess
      var previousQuestion = $('.progress-dot.current', $myDom).parent().index();
      if (previousQuestion >= 0) {
        toggleCurrentDot(previousQuestion, false);
        toggleAnsweredDot(previousQuestion, questionInstances[previousQuestion].getAnswerGiven());
      }
      toggleCurrentDot(questionNumber, true);
    }

    if (!preventAnnouncement) {
      // Announce question number of total, must use timeout because of buttons logic
      setTimeout(function () {
        var humanizedProgress = params.texts.readSpeakerProgress
          .replace('@current', (currentQuestion + 1).toString())
          .replace('@total', questionInstances.length.toString());

        $('.qs-progress-announcer', $myDom)
          .html(humanizedProgress)
          .show().focus();

        if (instance && instance.readFeedback) {
          instance.readFeedback();
        }
      }, 0);
    }

    // Remember where we are
    _updateButtons();
    self.trigger('resize');
    return currentQuestion;
  };

  /**
   * Show solutions for subcontent, and hide subcontent buttons.
   * Used for contracts with integrated content.
   * @public
   */
  var showSolutions = function () {
    showingSolutions = true;
    for (var i = 0; i < questionInstances.length; i++) {

      // Enable back and forth navigation in solution mode
      toggleDotsNavigation(true);
      if (i < questionInstances.length - 1) {
        questionInstances[i].showButton('next');
      }
      if (i > 0) {
        questionInstances[i].showButton('prev');
      }

      try {
        // Do not read answers
        questionInstances[i].toggleReadSpeaker(true);
        questionInstances[i].showSolutions();
        questionInstances[i].toggleReadSpeaker(false);
      }
      catch (error) {
        H5P.error("subcontent does not contain a valid showSolutions function");
        H5P.error(error);
      }
    }
  };

  /**
   * Toggles whether dots are enabled for navigation
   */
  var toggleDotsNavigation = function (enable) {
    $('.progress-dot', $myDom).each(function () {
      $(this).toggleClass('disabled', !enable);
      $(this).attr('aria-disabled', enable ? 'false' : 'true');
      // Remove tabindex
      if (!enable) {
        $(this).attr('tabindex', '-1');
      }
    });
  };

  /**
   * Resets the task and every subcontent task.
   * Used for contracts with integrated content.
   * @public
   */
  this.resetTask = function () {

    // Clear previous state to ensure questions are created cleanly
    contentData.previousState = [];

    showingSolutions = false;

    for (var i = 0; i < questionInstances.length; i++) {
      try {
        questionInstances[i].resetTask();

        // Hide back and forth navigation in normal mode
        if (params.disableBackwardsNavigation) {
          toggleDotsNavigation(false);

          // Check if first question is answered by default
          if (i === 0 && questionInstances[i].getAnswerGiven()) {
            questionInstances[i].showButton('next');
          }
          else {
            questionInstances[i].hideButton('next');
          }

          questionInstances[i].hideButton('prev');
        }
      }
      catch (error) {
        H5P.error("subcontent does not contain a valid resetTask function");
        H5P.error(error);
      }
    }

    // Hide finish button
    questionInstances[questionInstances.length - 1].hideButton('finish');

    // Mark all tasks as unanswered:
    $('.progress-dot').each(function (idx) {
      toggleAnsweredDot(idx, false);
    });

    //Force the last page to be reRendered
    rendered = false;

    if (params.poolSize > 0) {

      // Make new pool from params.questions
      // Randomize and get the results
      var poolResult = randomizeQuestionOrdering(initialParams.questions);
      var poolQuestions = poolResult.questions;
      poolOrder = poolResult.questionOrder;

      // Discard extra questions
      poolQuestions = poolQuestions.slice(0, params.poolSize);
      poolOrder = poolOrder.slice(0, params.poolSize);

      // Replace original questions with just the ones in the pool
      params.questions = poolQuestions;

      // Recreate the question instances
      questionInstances = createQuestionInstancesFromQuestions(params.questions);

      // Update buttons
      initializeQuestion();

    }
    else if (params.randomQuestions) {
      randomizeQuestions();
    }

  };

  var rendered = false;

  this.reRender = function () {
    rendered = false;
  };

  /**
   * Randomizes question instances
   */
  var randomizeQuestions = function () {

    var result = randomizeQuestionOrdering(questionInstances);
    questionInstances = result.questions;
    questionOrder = result.questionOrder;

    replaceQuestionsInDOM(questionInstances);
  };

  /**
   * Empty the DOM of all questions, attach new questions and update buttons
   *
   * @param  {type} questionInstances Array of questions to be attached to the DOM
   */
  var replaceQuestionsInDOM = function (questionInstances) {

    // Find all question containers and detach questions from them
    $('.question-container', $myDom).each(function () {
      $(this).children().detach();
    });

    // Reattach questions and their buttons in the new order
    for (var i = 0; i < questionInstances.length; i++) {

      var question = questionInstances[i];

      // Make sure styles are not being added twice
      $('.question-container:eq(' + i + ')', $myDom).attr('class', 'question-container');

      question.attach($('.question-container:eq(' + i + ')', $myDom));

      //Show buttons if necessary
      if (questionInstances[questionInstances.length -1] === question &&
          question.hasButton('finish')) {
        question.showButton('finish');
      }

      if (questionInstances[questionInstances.length -1] !== question &&
          question.hasButton('next')) {
        question.showButton('next');
      }

      if (questionInstances[0] !== question &&
          question.hasButton('prev') &&
          !params.disableBackwardsNavigation) {
        question.showButton('prev');
      }

      // Hide relevant buttons since the order has changed
      if (questionInstances[0] === question) {
        question.hideButton('prev');
      }

      if (questionInstances[questionInstances.length-1] === question) {
        question.hideButton('next');
      }

      if (questionInstances[questionInstances.length-1] !== question) {
        question.hideButton('finish');
      }
    }
  };

  var moveQuestion = function (direction) {
    if (params.disableBackwardsNavigation && !questionInstances[currentQuestion].getAnswerGiven()) {
      questionInstances[currentQuestion].hideButton('next');
      questionInstances[currentQuestion].hideButton('finish');
      return;
    }

    if (currentQuestion + direction >= questionInstances.length) {
      _displayEndGame();
    }
    else {
      // Allow movement if backward navigation enabled or answer given
      _showQuestion(currentQuestion + direction);
    }
  };

  /**
   * Toggle answered state of dot at given index
   * @param {number} dotIndex Index of dot
   * @param {boolean} isAnswered True if is answered, False if not answered
   */
  var toggleAnsweredDot = function (dotIndex, isAnswered) {
    var $el = $('.progress-dot:eq(' + dotIndex +')', $myDom);

    // Skip current button
    if ($el.hasClass('current')) {
      return;
    }

    // Ensure boolean
    isAnswered = !!isAnswered;

    var label = params.texts.jumpToQuestion
      .replace('%d', (dotIndex + 1).toString())
      .replace('%total', $('.progress-dot', $myDom).length) +
      ', ' +
      (isAnswered ? params.texts.answeredText : params.texts.unansweredText);

    $el.toggleClass('unanswered', !isAnswered)
      .toggleClass('answered', isAnswered)
      .attr('aria-label', label);
  };

  /**
   * Toggle current state of dot at given index
   * @param dotIndex
   * @param isCurrent
   */
  var toggleCurrentDot = function (dotIndex, isCurrent) {
    var $el = $('.progress-dot:eq(' + dotIndex +')', $myDom);
    var texts = params.texts;
    var label = texts.jumpToQuestion
      .replace('%d', (dotIndex + 1).toString())
      .replace('%total', $('.progress-dot', $myDom).length);

    if (!isCurrent) {
      var isAnswered = $el.hasClass('answered');
      label += ', ' + (isAnswered ? texts.answeredText : texts.unansweredText);
    }
    else {
      label += ', ' + texts.currentQuestionText;
    }

    var disabledTabindex = params.disableBackwardsNavigation && !showingSolutions;
    $el.toggleClass('current', isCurrent)
      .attr('aria-label', label)
      .attr('tabindex', isCurrent && !disabledTabindex ? 0 : -1);
  };

  var _displayEndGame = function () {
    $('.progress-dot.current', $myDom).removeClass('current');
    if (rendered) {
      $myDom.children().hide().filter('.questionset-results').show();
      self.trigger('resize');
      return;
    }
    //Remove old score screen.
    $myDom.children().hide().filter('.questionset-results').remove();
    rendered = true;

    // Get total score.
    var finals = self.getScore();
    var totals = self.getMaxScore();

    var scoreString = H5P.Question.determineOverallFeedback(params.endGame.overallFeedback, finals / totals).replace('@score', finals).replace('@total', totals);
    var success = ((100 * finals / totals) >= params.passPercentage);

    /**
     * Makes our buttons behave like other buttons.
     *
     * @private
     * @param {string} classSelector
     * @param {function} handler
     */
    var hookUpButton = function (classSelector, handler) {
      $(classSelector, $myDom).click(handler).keypress(function (e) {
        if (e.which === 32) {
          handler();
          e.preventDefault();
        }
      });
    };

    var displayResults = function () {
      self.triggerXAPICompleted(self.getScore(), self.getMaxScore(), success);

      var eparams = {
        message: params.endGame.showResultPage ? params.endGame.message : params.endGame.noResultMessage,
        comment: params.endGame.showResultPage ? (success ? params.endGame.oldFeedback.successGreeting : params.endGame.oldFeedback.failGreeting) : undefined,
        resulttext: params.endGame.showResultPage ? (success ? params.endGame.oldFeedback.successComment : params.endGame.oldFeedback.failComment) : undefined,
        finishButtonText: (self.isSubmitting) ? params.endGame.submitButtonText : params.endGame.finishButtonText,
        solutionButtonText: params.endGame.solutionButtonText,
        retryButtonText: params.endGame.retryButtonText
      };

      // Create html for end screen
      self.$resultPage = $('<div>', {
        'class': 'questionset-results'
      });
    
      $('<div>', {
        class: 'greeting',
        html: eparams.message,
        appendTo: self.$resultPage
      });
    
      $('<div>', {
        class: 'feedback-section',
        html: '<div class="feedback-scorebar"></div>' +
              '<div class="feedback-text"></div>',
        appendTo: self.$resultPage
      });
    
      if (params.comment) {
        $('<div>', {
          'class': 'result-header',
          html: eparams.comment,
          appendTo: self.$resultPage
        });
      }
    
      if (params.resulttext) {
        $('<div>', {
          class: 'result-text',
          html: eparams.resulttext,
          appendTo: self.$resultPage
        });
      }
      
      self.$buttonsContainer = $('<div>', {
        class: 'buttons',
        appendTo: self.$resultPage
      });

      if (params.endGame.showSolutionButton) {
        $('<button>', {
          class: 'h5p-joubelui-button h5p-button qs-solutionbutton',
          type: 'button',
          html: eparams.solutionButtonText,
          appendTo: self.$buttonsContainer
        });
      }

      if (params.endGame.showRetryButton) {
        $('<button>', {
          class: 'h5p-joubelui-button h5p-button qs-retrybutton',
          type: 'button',
          html: eparams.retryButtonText,
          appendTo: self.$buttonsContainer
        })
      }

      // Show result page.
      $myDom.children().hide();
      $myDom.append(self.$resultPage);

      if (params.endGame.showResultPage) {
        hookUpButton('.qs-solutionbutton', function () {
          showSolutions();
          $myDom.children().hide().filter('.questionset').show();
          _showQuestion(params.initialQuestion);
        });
        hookUpButton('.qs-retrybutton', function () {
          self.resetTask();
          $myDom.children().hide();

          var $intro = $('.intro-page', $myDom);
          if ($intro.length) {
            // Show intro
            $('.intro-page', $myDom).show();
            $('.qs-startbutton', $myDom).focus();
          }
          else {
            // Show first question
            $('.questionset', $myDom).show();
            _showQuestion(params.initialQuestion);
          }
        });

        if (scoreBar === undefined) {
          scoreBar = H5P.JoubelUI.createScoreBar(totals);
        }
        scoreBar.appendTo($('.feedback-scorebar', $myDom));
        $('.feedback-text', $myDom).html(scoreString);

        // Announce that the question set is complete
        setTimeout(function () {
          $('.qs-progress-announcer', $myDom)
            .html(eparams.message + 
                  scoreString + '.' +
                  (params.endGame.scoreBarLabel).replace('@finals', finals).replace('@totals', totals) + '.' +
                  eparams.comment + '.' +
                  eparams.resulttext)
            .show().focus();
          scoreBar.setMaxScore(totals);
          scoreBar.setScore(finals);
        }, 0);
      }
      else {
        // Remove buttons and feedback section
        $('.qs-solutionbutton, .qs-retrybutton, .feedback-section', $myDom).remove();
      }

      self.trigger('resize');
    };

    if (params.endGame.showAnimations) {
      var videoData = success ? params.endGame.successVideo : params.endGame.failVideo;
      if (videoData) {
        $myDom.children().hide();
        var $videoContainer = $('<div class="video-container"></div>').appendTo($myDom);

        var video = new H5P.Video({
          sources: videoData,
          fitToWrapper: true,
          controls: false,
          autoplay: false
        }, contentId);
        video.on('stateChange', function (event) {
          if (event.data === H5P.Video.ENDED) {
            displayResults();
            $videoContainer.hide();
          }
        });
        video.attach($videoContainer);
        // Resize on video loaded
        video.on('loaded', function () {
          self.trigger('resize');
        });
        video.play();

        if (params.endGame.skippable) {
          $('<a class="h5p-joubelui-button h5p-button skip">' + params.endGame.skipButtonText + '</a>').click(function () {
            video.pause();
            $videoContainer.hide();
            displayResults();
          }).appendTo($videoContainer);
        }

        return;
      }
    }
    // Trigger finished event.
    displayResults();
    self.trigger('resize');
  };

  var registerImageLoadedListener = function (question) {
    H5P.on(question, 'imageLoaded', function () {
      self.trigger('resize');
    });
  };

  /**
   * Initialize a question and attach it to the DOM
   *
   */
  function initializeQuestion() {
    // Attach questions
    for (var i = 0; i < questionInstances.length; i++) {
      var question = questionInstances[i];

      // Make sure styles are not being added twice
      $('.question-container:eq(' + i + ')', $myDom).attr('class', 'question-container');

      question.attach($('.question-container:eq(' + i + ')', $myDom));

      // Listen for image resize
      registerImageLoadedListener(question);

      // Add finish button
      const finishButtonText = (self.isSubmitting) ? params.texts.submitButton : params.texts.finishButton
      question.addButton('finish', finishButtonText,
        moveQuestion.bind(this, 1), false);

      // Add next button
      question.addButton('next', '', moveQuestion.bind(this, 1),
        !params.disableBackwardsNavigation || !!question.getAnswerGiven(), {
          href: '#', // Use href since this is a navigation button
          'aria-label': params.texts.nextButton
        });

      // Add previous button
      question.addButton('prev', '', moveQuestion.bind(this, -1),
        !(questionInstances[0] === question || params.disableBackwardsNavigation), {
          href: '#', // Use href since this is a navigation buttonq
          'aria-label': params.texts.prevButton
        });

      // Hide next button if it is the last question
      if (questionInstances[questionInstances.length -1] === question) {
        question.hideButton('next');
      }

      question.on('xAPI', function (event) {
        var shortVerb = event.getVerb();
        if (shortVerb === 'interacted' ||
          shortVerb === 'answered' ||
          shortVerb === 'attempted') {
          toggleAnsweredDot(currentQuestion,
            questionInstances[currentQuestion].getAnswerGiven());
          _updateButtons();
        }
        if (shortVerb === 'completed') {
          // An activity within this activity is not allowed to send completed events
          event.setVerb('answered');
        }
        if (event.data.statement.context.extensions === undefined) {
          event.data.statement.context.extensions = {};
        }
        event.data.statement.context.extensions['http://id.tincanapi.com/extension/ending-point'] = currentQuestion + 1;
      });

      // Mark question if answered
      toggleAnsweredDot(i, question.getAnswerGiven());
    }
  }

  this.attach = function (target) {
    if (this.isRoot()) {
      this.setActivityStarted();
    }
    if (typeof(target) === "string") {
      $myDom = $('#' + target);
    }
    else {
      $myDom = $(target);
    }

    // Render own DOM into target.
    $myDom.children().remove();
    $myDom.append(self.$introPage, self.$progressAnnouncer, self.$questionsContainer);
    if (params.backgroundImage !== undefined) {
      $myDom.css({
        overflow: 'hidden',
        background: '#fff url("' + H5P.getPath(params.backgroundImage.path, contentId) + '") no-repeat 50% 50%',
        backgroundSize: '100% auto'
      });
    }

    if (params.introPage.backgroundImage !== undefined) {
      var $intro = $myDom.find('.intro-page');
      if ($intro.length) {
        var bgImg = params.introPage.backgroundImage;
        var bgImgRatio = (bgImg.height / bgImg.width);
        $intro.css({
          background: '#fff url("' + H5P.getPath(bgImg.path, contentId) + '") no-repeat 50% 50%',
          backgroundSize: 'auto 100%',
          minHeight: bgImgRatio * +window.getComputedStyle($intro[0]).width.replace('px','')
        });
      }
    }

    initializeQuestion();

    // Allow other libraries to add transitions after the questions have been inited
    $('.questionset', $myDom).addClass('started');

    $('.qs-startbutton', $myDom)
      .click(function () {
        $(this).parents('.intro-page').hide();
        $('.questionset', $myDom).show();
        _showQuestion(params.initialQuestion);
        event.preventDefault();
      })
      .keydown(function (event) {
        switch (event.which) {
          case 13: // Enter
          case 32: // Space
            $(this).parents('.intro-page').hide();
            $('.questionset', $myDom).show();
            _showQuestion(params.initialQuestion);
            event.preventDefault();
        }
      });

    /**
     * Triggers changing the current question.
     *
     * @private
     * @param {Object} [event]
     */
    var handleProgressDotClick = function (event) {
      // Disable dots when backward nav disabled
      event.preventDefault();
      if (params.disableBackwardsNavigation && !showingSolutions) {
        return;
      }
      _showQuestion($(this).parent().index());
    };

    // Set event listeners.
    $('.progress-dot', $myDom).click(handleProgressDotClick).keydown(function (event) {
      var $this = $(this);
      switch (event.which) {
        case 13: // Enter
        case 32: // Space
          handleProgressDotClick.call(this, event);
          break;

        case 37: // Left Arrow
        case 38: // Up Arrow
          // Go to previous dot
          var $prev = $this.parent().prev();
          if ($prev.length) {
            $prev.children('a').attr('tabindex', '0').focus();
            $this.attr('tabindex', '-1');
          }
          break;

        case 39: // Right Arrow
        case 40: // Down Arrow
          // Go to next dot
          var $next = $this.parent().next();
          if ($next.length) {
            $next.children('a').attr('tabindex', '0').focus();
            $this.attr('tabindex', '-1');
          }
          break;
      }
    });



    // Hide all but current question
    _showQuestion(currentQuestion, true);

    if (renderSolutions) {
      showSolutions();
    }
    // Update buttons in case they have changed (restored user state)
    _updateButtons();

    this.trigger('resize');

    return this;
  };

  // Get current score for questionset.
  this.getScore = function () {
    var score = 0;
    for (var i = questionInstances.length - 1; i >= 0; i--) {
      score += questionInstances[i].getScore();
    }
    return score;
  };

  // Get total score possible for questionset.
  this.getMaxScore = function () {
    var score = 0;
    for (var i = questionInstances.length - 1; i >= 0; i--) {
      score += questionInstances[i].getMaxScore();
    }
    return score;
  };

  /**
   * @deprecated since version 1.9.2
   * @returns {number}
   */
  this.totalScore = function () {
    return this.getMaxScore();
  };

  /**
   * Gather copyright information for the current content.
   *
   * @returns {H5P.ContentCopyrights}
   */
  this.getCopyrights = function () {
    var info = new H5P.ContentCopyrights();

    // IntroPage Background
    if (params.introPage !== undefined && params.introPage.backgroundImage !== undefined && params.introPage.backgroundImage.copyright !== undefined) {
      var introBackground = new H5P.MediaCopyright(params.introPage.backgroundImage.copyright);
      introBackground.setThumbnail(new H5P.Thumbnail(H5P.getPath(params.introPage.backgroundImage.path, contentId), params.introPage.backgroundImage.width, params.introPage.backgroundImage.height));
      info.addMedia(introBackground);
    }

    // Background
    if (params.backgroundImage !== undefined && params.backgroundImage.copyright !== undefined) {
      var background = new H5P.MediaCopyright(params.backgroundImage.copyright);
      background.setThumbnail(new H5P.Thumbnail(H5P.getPath(params.backgroundImage.path, contentId), params.backgroundImage.width, params.backgroundImage.height));
      info.addMedia(background);
    }

    // Questions
    var questionCopyrights;
    for (var i = 0; i < questionInstances.length; i++) {
      var instance = questionInstances[i];
      var instanceParams = params.questions[i].params;

      questionCopyrights = undefined;

      if (instance.getCopyrights !== undefined) {
        // Use the instance's own copyright generator
        questionCopyrights = instance.getCopyrights();
      }
      if (questionCopyrights === undefined) {
        // Create a generic flat copyright list
        questionCopyrights = new H5P.ContentCopyrights();
        H5P.findCopyrights(questionCopyrights, instanceParams.params, contentId,{
          metadata: instanceParams.metadata,
          machineName: instanceParams.library.split(' ')[0]
        });
      }

      // Determine label
      var label = (params.texts.questionLabel + ' ' + (i + 1));
      if (instanceParams.params.contentName !== undefined) {
        label += ': ' + instanceParams.params.contentName;
      }
      else if (instance.getTitle !== undefined) {
        label += ': ' + instance.getTitle();
      }
      questionCopyrights.setLabel(label);

      // Add info
      info.addContent(questionCopyrights);
    }

    // Success video
    var video;
    if (params.endGame.successVideo !== undefined && params.endGame.successVideo.length > 0) {
      video = params.endGame.successVideo[0];
      if (video.copyright !== undefined) {
        info.addMedia(new H5P.MediaCopyright(video.copyright));
      }
    }

    // Fail video
    if (params.endGame.failVideo !== undefined && params.endGame.failVideo.length > 0) {
      video = params.endGame.failVideo[0];
      if (video.copyright !== undefined) {
        info.addMedia(new H5P.MediaCopyright(video.copyright));
      }
    }

    return info;
  };
  this.getQuestions = function () {
    return questionInstances;
  };
  this.showSolutions = function () {
    renderSolutions = true;
  };

  /**
   * Returns the complete state of question set and sub-content
   *
   * @returns {Object} current state
   */
  this.getCurrentState = function () {
    return {
      progress: showingSolutions ? questionInstances.length - 1 : currentQuestion,
      answers: questionInstances.map(function (qi) {
        return qi.getCurrentState();
      }),
      order: questionOrder,
      poolOrder: poolOrder
    };
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   * @return {Object}
   */
  var getxAPIDefinition = function () {
    var definition = {};

    definition.interactionType = 'compound';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': ''
    };

    return definition;
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  var addQuestionToXAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, getxAPIDefinition());
  };

  /**
   * Get xAPI data from sub content types
   *
   * @param {Object} metaContentType
   * @returns {array}
   */
  var getXAPIDataFromChildren = function (metaContentType) {
    return metaContentType.getQuestions().map(function (question) {
      return question.getXAPIData();
    });
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  this.getXAPIData = function () {
    var xAPIEvent = this.createXAPIEventTemplate('answered');
    addQuestionToXAPI(xAPIEvent);
    xAPIEvent.setScoredResult(this.getScore(),
      this.getMaxScore(),
      this,
      true,
      this.getScore() === this.getMaxScore()
    );
    return {
      statement: xAPIEvent.data.statement,
      children: getXAPIDataFromChildren(this)
    };
  };

  /**
   * Get context data.
   * Contract used for confusion report.
   */
  this.getContext = function () {
    // Get question index and add 1, count starts from 0
    let contextObject = {
      type: 'question',
      value: (currentQuestion + 1)
    };

    // Send actual index of the question if questions are randomized
    if (params.randomQuestions) {
      contextObject.actual = questionOrder[currentQuestion] + 1;
    }
    return contextObject;
  };
};

H5P.QuestionSet.prototype = Object.create(H5P.EventDispatcher.prototype);
H5P.QuestionSet.prototype.constructor = H5P.QuestionSet;
;
