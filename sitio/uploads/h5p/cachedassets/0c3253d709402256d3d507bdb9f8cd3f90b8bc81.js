var H5P = H5P || {};

/**
 * Constructor.
 *
 * @param {Object} params Options for this library.
 * @param {Number} id Content identifier
 * @returns {undefined}
 */
(function ($) {
  H5P.Image = function (params, id, extras) {
    H5P.EventDispatcher.call(this);
    this.extras = extras;

    if (params.file === undefined || !(params.file instanceof Object)) {
      this.placeholder = true;
    }
    else {
      this.source = H5P.getPath(params.file.path, id);
      this.width = params.file.width;
      this.height = params.file.height;
    }

    this.alt = (!params.decorative && params.alt !== undefined) ?
      this.stripHTML(this.htmlDecode(params.alt)) :
      '';

    if (params.title !== undefined) {
      this.title = this.stripHTML(this.htmlDecode(params.title));
    }
  };

  H5P.Image.prototype = Object.create(H5P.EventDispatcher.prototype);
  H5P.Image.prototype.constructor = H5P.Image;

  /**
   * Wipe out the content of the wrapper and put our HTML in it.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  H5P.Image.prototype.attach = function ($wrapper) {
    var self = this;
    var source = this.source;

    if (self.$img === undefined) {
      if(self.placeholder) {
        self.$img = $('<div>', {
          width: '100%',
          height: '100%',
          class: 'h5p-placeholder',
          title: this.title === undefined ? '' : this.title,
          on: {
            load: function () {
              self.trigger('loaded');
            }
          }
        });
      } else {
        self.$img = $('<img>', {
          width: '100%',
          height: '100%',
          src: source,
          alt: this.alt,
          title: this.title === undefined ? '' : this.title,
          on: {
            load: function () {
              self.trigger('loaded');
            }
          }
        });
      }
    }

    $wrapper.addClass('h5p-image').html(self.$img);
  };

  /**
   * Retrieve decoded HTML encoded string.
   *
   * @param {string} input HTML encoded string.
   * @returns {string} Decoded string.
   */
  H5P.Image.prototype.htmlDecode = function (input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent;
  };

  /**
   * Retrieve string without HTML tags.
   *
   * @param {string} input Input string.
   * @returns {string} Output string.
   */
  H5P.Image.prototype.stripHTML = function (html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return H5P.Image;
}(H5P.jQuery));
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
(()=>{"use strict";const e=function(e){const t=e.length;return function n(){const i=Array.prototype.slice.call(arguments,0);return i.length>=t?e.apply(null,i):function(){const e=Array.prototype.slice.call(arguments,0);return n.apply(null,i.concat(e))}}},t=(...e)=>e.reduce(((e,t)=>(...n)=>e(t(...n)))),n=e((function(e,t){t.forEach(e)})),i=(e((function(e,t){return t.map(e)})),e((function(e,t){return t.filter(e)}))),o=e((function(e,t){return t.some(e)})),r=e((function(e,t){return-1!=t.indexOf(e)})),s=e((function(e,t){return i((t=>!r(t,e)),t)})),a=e(((e,t)=>t.getAttribute(e))),l=e(((e,t,n)=>n.setAttribute(e,t))),c=e(((e,t)=>t.removeAttribute(e))),h=e(((e,t)=>t.hasAttribute(e))),d=e(((e,t,n)=>n.getAttribute(e)===t)),p=(e(((e,t)=>{const n=a(e,t);l(e,("true"!==n).toString(),t)})),e(((e,t)=>e.appendChild(t))),e(((e,t)=>t.querySelector(e))),e(((e,t)=>{return n=t.querySelectorAll(e),Array.prototype.slice.call(n);var n})),e(((e,t)=>e.removeChild(t))),e(((e,t)=>t.classList.contains(e))),e(((e,t)=>t.classList.add(e)))),u=e(((e,t)=>t.classList.remove(e))),g=p("hidden"),f=u("hidden"),b=(e(((e,t)=>(e?f:g)(t))),e(((e,t,n)=>{n.classList[t?"add":"remove"](e)})),c("tabindex")),v=(n(b),l("tabindex","0")),m=l("tabindex","-1"),y=h("tabindex");class w{constructor(e){Object.assign(this,{listeners:{},on:function(e,t,n){const i={listener:t,scope:n};return this.listeners[e]=this.listeners[e]||[],this.listeners[e].push(i),this},fire:function(e,t){return(this.listeners[e]||[]).every((function(e){return!1!==e.listener.call(e.scope||this,t)}))},propagate:function(e,t){let n=this;e.forEach((e=>t.on(e,(t=>n.fire(e,t)))))}}),this.plugins=e||[],this.elements=[],this.negativeTabIndexAllowed=!1,this.on("nextElement",this.nextElement,this),this.on("previousElement",this.previousElement,this),this.on("firstElement",this.firstElement,this),this.on("lastElement",this.lastElement,this),this.initPlugins()}addElement(e){this.elements.push(e),this.firesEvent("addElement",e),1===this.elements.length&&this.setTabbable(e)}insertElementAt(e,t){this.elements.splice(t,0,e),this.firesEvent("addElement",e),1===this.elements.length&&this.setTabbable(e)}removeElement(e){this.elements=s([e],this.elements),y(e)&&(this.setUntabbable(e),this.elements[0]&&this.setTabbable(this.elements[0])),this.firesEvent("removeElement",e)}count(){return this.elements.length}firesEvent(e,t){const n=this.elements.indexOf(t);return this.fire(e,{element:t,index:n,elements:this.elements,oldElement:this.tabbableElement})}nextElement({index:e}){const t=e===this.elements.length-1,n=this.elements[t?0:e+1];this.setTabbable(n),n.focus()}firstElement(){const e=this.elements[0];this.setTabbable(e),e.focus()}lastElement(){const e=this.elements[this.elements.length-1];this.setTabbable(e),e.focus()}setTabbableByIndex(e){const t=this.elements[e];t&&this.setTabbable(t)}setTabbable(e){n(this.setUntabbable.bind(this),this.elements),v(e),this.tabbableElement=e}setUntabbable(e){e!==document.activeElement&&(this.negativeTabIndexAllowed?m(e):b(e))}previousElement({index:e}){const t=0===e,n=this.elements[t?this.elements.length-1:e-1];this.setTabbable(n),n.focus()}useNegativeTabIndex(){this.negativeTabIndexAllowed=!0,this.elements.forEach((e=>{e.hasAttribute("tabindex")||m(e)}))}initPlugins(){this.plugins.forEach((function(e){void 0!==e.init&&e.init(this)}),this)}}const E="aria-grabbed",k=l(E),x=d(E,"true"),Z=i(h(E)),P=t(n(l(E,"false")),Z),$=t(o(x),Z);class O{init(e){this.controls=e,this.controls.on("select",this.select,this)}addElement(e){k("false",e),this.controls.addElement(e)}setAllGrabbedToFalse(){P(this.controls.elements)}hasAnyGrabbed(){return $(this.controls.elements)}select({element:e}){const t=x(e);this.setAllGrabbedToFalse(),t||k("true",e)}}const T="aria-dropeffect",A=l(T,"none"),D=l(T,"move"),S=i(h(T)),C=t(n(D),S),I=t(n(A),S);class B{init(e){this.controls=e}setAllToMove(){C(this.controls.elements)}setAllToNone(){I(this.controls.elements)}}B.DropEffect={COPY:"copy",MOVE:"move",EXECUTE:"execute",POPUP:"popup",NONE:"none"};class z{constructor(){this.selectability=!0}init(e){this.boundHandleKeyDown=this.handleKeyDown.bind(this),this.controls=e,this.controls.on("addElement",this.listenForKeyDown,this),this.controls.on("removeElement",this.removeKeyDownListener,this)}listenForKeyDown({element:e}){e.addEventListener("keydown",this.boundHandleKeyDown)}removeKeyDownListener({element:e}){e.removeEventListener("keydown",this.boundHandleKeyDown)}handleKeyDown(e){switch(e.which){case 27:this.close(e.target),e.preventDefault(),e.stopPropagation();break;case 35:this.lastElement(e.target),e.preventDefault(),e.stopPropagation();break;case 36:this.firstElement(e.target),e.preventDefault(),e.stopPropagation();break;case 13:case 32:this.select(e.target),e.preventDefault(),e.stopPropagation();break;case 37:case 38:this.hasChromevoxModifiers(e)||(this.previousElement(e.target),e.preventDefault(),e.stopPropagation());break;case 39:case 40:this.hasChromevoxModifiers(e)||(this.nextElement(e.target),e.preventDefault(),e.stopPropagation())}}hasChromevoxModifiers(e){return e.shiftKey||e.ctrlKey}previousElement(e){!1!==this.controls.firesEvent("beforePreviousElement",e)&&(this.controls.firesEvent("previousElement",e),this.controls.firesEvent("afterPreviousElement",e))}nextElement(e){!1!==this.controls.firesEvent("beforeNextElement",e)&&(this.controls.firesEvent("nextElement",e),this.controls.firesEvent("afterNextElement",e))}select(e){this.selectability&&!1!==this.controls.firesEvent("before-select",e)&&(this.controls.firesEvent("select",e),this.controls.firesEvent("after-select",e))}firstElement(e){!1!==this.controls.firesEvent("beforeFirstElement",e)&&(this.controls.firesEvent("firstElement",e),this.controls.firesEvent("afterFirstElement",e))}lastElement(e){!1!==this.controls.firesEvent("beforeLastElement",e)&&(this.controls.firesEvent("lastElement",e),this.controls.firesEvent("afterLastElement",e))}disableSelectability(){this.selectability=!1}enableSelectability(){this.selectability=!0}close(e){!1!==this.controls.firesEvent("before-close",e)&&(this.controls.firesEvent("close",e),this.controls.firesEvent("after-close",e))}}class q{constructor(){this.selectability=!0,this.handleClickBound=this.handleClick.bind(this),this.handleDragBound=this.handleDrag.bind(this)}init(e){this.controls=e,this.controls.on("addElement",this.listenForKeyDown,this),this.controls.on("removeElement",this.unlistenForKeyDown,this)}listenForKeyDown({element:e}){e.addEventListener("click",this.handleClickBound),e.addEventListener("drag",this.handleClickBound)}unlistenForKeyDown({element:e}){e.removeEventListener("click",this.handleClickBound),e.removeEventListener("drag",this.handleDragBound)}handleClick(e){this.controls.firesEvent("select",e.currentTarget)}handleDrag(e){this.controls.firesEvent("drag",e.currentTarget)}disableSelectability(){this.selectability=!1}enableSelectability(){this.selectability=!0}}function H(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var F=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}var t,n;return t=e,n=[{key:"setElementOpacity",value:function(t,n){e.setOpacity(t,"borderColor",n),e.setOpacity(t,"boxShadow",n),e.setOpacity(t,"background",n)}},{key:"setOpacity",value:function(t,n,i){if("background"===n)return e.setOpacity(t,"backgroundColor",i),void e.setOpacity(t,"backgroundImage",i);function o(e,t){if("borderColor"===e)return{borderTopColor:t,borderRightColor:t,borderBottomColor:t,borderLeftColor:t};var n={};return n[e]=t,n}i=void 0===i?1:i/100;var r=t.css(n),s=o(n,"");for(var a in t.css(s),s)break;var l=t.css(a);""!==l&&"none"!==l||(l=r),l=e.setAlphas(l,"rgba(",i),l=e.setAlphas(l,"rgb(",i),t.css(o(n,l))}},{key:"setAlphas",value:function(e,t,n){if(e){for(var i=e.indexOf(t);-1!==i;){var o=e.indexOf(")",i),r=e.substring(i+t.length,o).split(",");r[3]=void 0!==r[3]?parseFloat(r[3])*n:n,i=(e=e.substring(0,i)+"rgba("+r.join(",")+e.substring(o,e.length)).indexOf(t,o)}return e}}},{key:"elementToDraggable",value:function(e,t){for(var n=0;n<e.length;n++)if(e[n]){var i=e[n].findElement(t);if(i)return i.draggable=e[n],i}}},{key:"elementToDropZone",value:function(e,t){for(var n=0;n<e.length;n++)if(e[n].$dropZone.is(t))return e[n]}},{key:"positionToPercentage",value:function(e,t){return{top:100*parseInt(t.css("top"))/e.innerHeight()+"%",left:100*parseInt(t.css("left"))/e.innerWidth()+"%"}}},{key:"addHover",value:function(t,n){t.hover((function(){t.addClass("h5p-draggable-hover"),t.parent().hasClass("h5p-dragging")||e.setElementOpacity(t,n)}),(function(){t.parent().hasClass("h5p-dragging")||setTimeout((function(){t.removeClass("h5p-draggable-hover"),e.setElementOpacity(t,n)}),1)})),e.setElementOpacity(t,n)}},{key:"strip",value:function(e){var t=document.createElement("div");return t.innerHTML=e,t.textContent||t.innerText||""}}],null&&H(t.prototype,null),n&&H(t,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function R(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var L=H5P.jQuery,j=function(){function e(t,n,i){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);var o=this;H5P.EventDispatcher.call(o),o.id=n,o.showLabel=t.showLabel,o.label=t.label,o.x=t.x,o.y=t.y,o.width=t.width,o.height=t.height,o.backgroundOpacity=t.backgroundOpacity,o.tip=t.tipsAndFeedback.tip||"",o.single=t.single,o.autoAlignable=t.autoAlign,o.alignables=[],o.l10n=i}var t,n;return t=e,(n=[{key:"appendTo",value:function(e,t){var n=this,i='<div class="h5p-inner"></div>',o="";n.showLabel&&(i='<div class="h5p-label">'+n.label+'<span class="h5p-hidden-read"></span></div>'+i,o=" h5p-has-label"),i='<span class="h5p-hidden-read">'+n.l10n.prefix.replace("{num}",n.id+1)+"</span>"+i,n.$dropZone=L("<div/>",{class:"h5p-dropzone"+o,tabindex:"-1",role:"button","aria-disabled":!0,css:{left:n.x+"%",top:n.y+"%",width:n.width+"em",height:n.height+"em"},html:i}).appendTo(e).children(".h5p-inner").droppable({activeClass:"h5p-active",tolerance:"intersect",accept:function(e){var i=F.elementToDraggable(t,e);return!!i&&n.accepts(i.draggable,t)},drop:function(e,t){var i=L(this);F.setOpacity(i.removeClass("h5p-over"),"background",n.backgroundOpacity),t.draggable.data("addToZone",n.id),-1===n.getIndexOf(t.draggable)&&n.alignables.push(t.draggable),n.autoAlignable.enabled&&n.autoAlign()},over:function(){F.setOpacity(L(this).addClass("h5p-over"),"background",n.backgroundOpacity)},out:function(){F.setOpacity(L(this).removeClass("h5p-over"),"background",n.backgroundOpacity)}}).end().focus((function(){r instanceof H5P.jQuery&&r.attr("tabindex","0")})).blur((function(){r instanceof H5P.jQuery&&r.attr("tabindex","-1")}));var r=H5P.JoubelUI.createTip(n.tip,{tipLabel:n.l10n.tipLabel,tabcontrol:!0});r instanceof H5P.jQuery&&L("<span/>",{class:"h5p-dq-tipwrap","aria-label":n.l10n.tipAvailable,append:r,appendTo:n.$dropZone}),t.forEach((function(e){var t=e.element.$;e.isInDropZone(n.id)&&-1===n.getIndexOf(t)&&n.alignables.push(t)})),n.autoAlignable.enabled&&n.autoAlign(),setTimeout((function(){n.updateBackgroundOpacity()}),0)}},{key:"updateBackgroundOpacity",value:function(){F.setOpacity(this.$dropZone.children(".h5p-label"),"background",this.backgroundOpacity),F.setOpacity(this.$dropZone.children(".h5p-inner"),"background",this.backgroundOpacity)}},{key:"accepts",value:function(e,t){var n=this;if(!e.hasDropZone(n.id))return!1;if(n.single)for(var i=0;i<t.length;i++)if(t[i]&&t[i].isInDropZone(n.id))return!1;return!0}},{key:"getIndexOf",value:function(e){for(var t=0;t<this.alignables.length;t++)if(this.alignables[t][0]===e[0])return t;return-1}},{key:"removeAlignable",value:function(e){var t=this,n=t.getIndexOf(e);-1!==n&&(t.alignables.splice(n,1),void 0===t.autoAlignTimer&&t.autoAlignable.enabled&&(t.autoAlignTimer=setTimeout((function(){delete t.autoAlignTimer,t.autoAlign()}),1)))}},{key:"autoAlign",value:function(){for(var e,t,n=this,i=n.$dropZone.parent()[0].getBoundingClientRect(),o=n.autoAlignable.spacing/n.autoAlignable.size.width*100,r=n.autoAlignable.spacing/n.autoAlignable.size.height*100,s={x:n.x+o,y:n.y+r},a=n.$dropZone[0].getBoundingClientRect(),l={x:a.width-2*o,y:a.height-2*r},c={x:l.x,y:l.y},h=0,d=function(){e.css({left:s.x+"%",top:s.y+"%"}),n.trigger("elementaligned",e);var o=t.width+n.autoAlignable.spacing;c.x-=o,s.x+=o/i.width*100;var r=t.height+n.autoAlignable.spacing;r>h&&(h=r)},p=0;p<n.alignables.length;p++)if(e=n.alignables[p],t=e[0].getBoundingClientRect(),c.x>=t.width)d();else{if(c.x=l.x,s.x=n.x+o,h&&(c.y-=h,s.y+=h/i.height*100,h=0),c.y<=0)return;d()}}},{key:"highlight",value:function(){this.$dropZone.attr("aria-disabled","false").children(".h5p-inner").addClass("h5p-active")}},{key:"dehighlight",value:function(){this.$dropZone.attr("aria-disabled","true").children(".h5p-inner").removeClass("h5p-active")}},{key:"reset",value:function(){this.alignables=[]}}])&&R(t.prototype,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function Q(e){return Q="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},Q(e)}function K(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function X(e,t){return X=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},X(e,t)}function M(e,t){if(t&&("object"===Q(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return N(e)}function N(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function U(e){return U=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},U(e)}var _=H5P.jQuery,G=function(e){return e.stopPropagation()},W=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&X(e,t)}(s,H5P.EventDispatcher);var t,n,i,o,r=(i=s,o=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=U(i);if(o){var n=U(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return M(this,e)});function s(e,t,n,i,o,a){var l;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,s);var c=N(l=r.call(this));if(c.$=_(c),c.id=t,c.elements=[],c.x=e.x,c.y=e.y,c.width=e.width,c.height=e.height,c.backgroundOpacity=e.backgroundOpacity,c.dropZones=e.dropZones,c.type=e.type,c.multiple=e.multiple,c.l10n=i,c.allDropzones=o,c.draggableNum=a,n){c.multiple&&c.elements.push({});for(var h=0;h<n.length;h++)c.elements.push({dropZone:n[h].dz,position:{left:n[h].x+"%",top:n[h].y+"%"}})}return l}return t=s,(n=[{key:"appendTo",value:function(e,t){var n=this;if(n.elements.length)for(var i=0;i<n.elements.length;i++)n.attachElement(i,e,t);else n.attachElement(null,e,t)}},{key:"attachElement",value:function(e,t,n){var i,o=this;null===e?(i={},o.elements.push(i),e=o.elements.length-1):i=o.elements[e],_.extend(i,{clone:function(){o.attachElement(null,t,n)},reset:function(){void 0!==i.dropZone&&(o.trigger("leavingDropZone",i),delete i.dropZone),o.multiple&&(i.$.remove(),delete o.elements[e],o.trigger("elementremove",i.$[0])),delete i.position}}),i.$=_("<div/>",{class:"h5p-draggable",tabindex:"-1",role:"button",css:{left:o.x+"%",top:o.y+"%",width:o.width+"em",height:o.height+"em"},appendTo:t,title:o.type.params.title}).on("click",(function(){o.trigger("focus",this)})).on("touchmove",G).on("touchstart",G).on("touchend",G).draggable({revert:function(e){t.removeClass("h5p-dragging");var n=_(this);return n.data("uiDraggable").originalPosition={top:o.y+"%",left:o.x+"%"},o.updatePlacement(i),n[0].setAttribute("aria-grabbed","false"),o.trigger("dragend"),!e},start:function(){var e=_(this),n=o.mustCopyElement(i);n&&i.clone(),e.removeClass("h5p-wrong").detach().appendTo(t),t.addClass("h5p-dragging"),F.setElementOpacity(e,o.backgroundOpacity),this.setAttribute("aria-grabbed","true"),o.trigger("focus",this),o.trigger("dragstart",{element:this,effect:n?"copy":"move"})},stop:function(){var n=_(this);i.position=F.positionToPercentage(t,n),n.css(i.position);var r=n.data("addToZone");void 0!==r?(n.removeData("addToZone"),o.addToDropZone(e,i,r)):i.reset()}}).css("position",""),o.element=i,i.position&&(i.$.css(i.position),o.updatePlacement(i)),F.addHover(i.$,o.backgroundOpacity),H5P.newRunnable(o.type,n,i.$),_('<span class="h5p-hidden-read">'+o.l10n.prefix.replace("{num}",o.draggableNum)+"</span>").prependTo(i.$),_('<span class="h5p-hidden-read"></span>').appendTo(i.$),setTimeout((function(){F.setElementOpacity(i.$,o.backgroundOpacity)}),0),o.trigger("elementadd",i.$[0])}},{key:"setFeedback",value:function(e,t){this.elements.forEach((function(n){n.dropZone===t&&(void 0===n.$feedback&&(n.$feedback=_("<span>",{class:"h5p-hidden-read",appendTo:n.$})),n.$feedback.html(e))}))}},{key:"mustCopyElement",value:function(e){return this.multiple&&void 0===e.dropZone}},{key:"hasDropZone",value:function(e){for(var t=0;t<this.dropZones.length;t++)if(parseInt(this.dropZones[t])===e)return!0;return!1}},{key:"addToDropZone",value:function(e,t,n){var i=this;if(i.multiple)for(var o=0;o<i.elements.length;o++)if(o!==e&&void 0!==i.elements[o]&&i.elements[o].dropZone===n)return void 0!==i.elements[e].dropZone&&i.elements[e].dropZone!==n&&i.trigger("leavingDropZone",t),t.$.remove(),delete i.elements[e],void i.trigger("elementremove",this.element.$[0]);void 0!==t.dropZone&&t.dropZone!==n&&i.trigger("leavingDropZone",t),t.dropZone=n,i.updatePlacement(t),i.trigger("interacted")}},{key:"updatePlacement",value:function(e){if(e.$suffix&&e.$suffix.remove(),void 0!==e.dropZone){e.$.addClass("h5p-dropped"),F.setElementOpacity(e.$,self.backgroundOpacity);var t=this.allDropzones[e.dropZone].label;if(t){var n=document.createElement("div");n.innerHTML=t,t=n.innerText}else t=e.dropZone+1;e.$suffix=_('<span class="h5p-hidden-read">'+this.l10n.suffix.replace("{num}",t)+"</span>").appendTo(e.$)}else e.$.removeClass("h5p-dropped").removeClass("h5p-wrong").removeClass("h5p-correct").css({border:"",background:""}),F.setElementOpacity(e.$,this.backgroundOpacity)}},{key:"resetPosition",value:function(){var e=this;this.elements.forEach((function(t){if(t.$feedback&&(t.$feedback.remove(),delete t.$feedback),void 0!==t.dropZone){var n=t.$;n.animate({left:e.x+"%",top:e.y+"%"},(function(){e.multiple&&(void 0!==n.dropZone&&e.trigger("leavingDropZone",n),n.remove(),e.elements.indexOf(t)>=0&&delete e.elements[e.elements.indexOf(t)],e.trigger("elementremove",n[0]))})),e.updatePlacement(t)}})),e.element&&(void 0!==e.element.dropZone&&(e.trigger("leavingDropZone",e.element),delete e.element.dropZone),e.updatePlacement(e.element))}},{key:"findElement",value:function(e){for(var t=this,n=0;n<t.elements.length;n++)if(void 0!==t.elements[n]&&t.elements[n].$.is(e))return{element:t.elements[n],index:n}}},{key:"isInDropZone",value:function(e){for(var t=this,n=0;n<t.elements.length;n++)if(void 0!==t.elements[n]&&t.elements[n].dropZone===e)return!0;return!1}},{key:"disable",value:function(){for(var e=this,t=0;t<e.elements.length;t++){var n=e.elements[t];n&&(n.$.draggable("disable"),e.trigger("elementremove",n.$[0]))}}},{key:"enable",value:function(){for(var e=this,t=0;t<e.elements.length;t++){var n=e.elements[t];n&&(n.$.draggable("enable"),e.trigger("elementadd",n.$[0]))}}},{key:"results",value:function(e,t,n){var i,o,r,s,a=this,l=0;if(a.rawPoints=0,void 0===t){for(i=0;i<a.elements.length;i++)void 0!==(r=a.elements[i])&&void 0!==r.dropZone&&(!0!==e&&a.markElement(r,"wrong",n),l--);return l}for(i=0;i<a.elements.length;i++)if(void 0!==(r=a.elements[i])&&void 0!==r.dropZone){for(s=!1,o=0;o<t.length;o++)if(r.dropZone===t[o]){!0!==e&&a.markElement(r,"correct",n),s=!0,a.rawPoints++,l++;break}s||(!0!==e&&a.markElement(r,"wrong",n),l--)}return l}},{key:"markElement",value:function(e,t,n){var i=_("<span/>",{class:"h5p-hidden-read",html:this.l10n[t+"Answer"]+". "});n&&(i=i.add(n.getElement("correct"===t))),e.$suffix=e.$suffix.add(i),e.$.addClass("h5p-"+t).append(i),F.setElementOpacity(e.$,this.backgroundOpacity)}}])&&K(t.prototype,n),Object.defineProperty(t,"prototype",{writable:!1}),s}(),V=H5P.jQuery,Y=0;function J(e,t,n){var i,o,r=this;Y++,this.id=this.contentId=t,this.contentData=n,H5P.Question.call(r,"dragquestion"),this.options=V.extend(!0,{},{scoreShow:"Check",tryAgain:"Retry",grabbablePrefix:"Grabbable {num} of {total}.",grabbableSuffix:"Placed in dropzone {num}.",dropzonePrefix:"Dropzone {num} of {total}.",noDropzone:"No dropzone",tipLabel:"Show tip.",tipAvailable:"Tip available",correctAnswer:"Correct answer",wrongAnswer:"Wrong answer",feedbackHeader:"Feedback",scoreBarLabel:"You got :num out of :total points",scoreExplanationButtonLabel:"Show score explanation",question:{settings:{questionTitle:this.contentData&&this.contentData.metadata&&this.contentData.metadata.title?this.contentData.metadata.title:"Drag and drop",size:{width:620,height:310}},task:{elements:[],dropZones:[]}},overallFeedback:[],behaviour:{enableRetry:!0,enableCheckButton:!0,preventResize:!1,singlePoint:!1,applyPenalties:!0,enableScoreExplanation:!0,dropZoneHighlighting:"dragging",autoAlignSpacing:2,showScorePoints:!0,showTitle:!1},a11yCheck:"Check the answers. The responses will be marked as correct, incorrect, or unanswered.",a11yRetry:"Retry the task. Reset all responses and start the task over again.",submit:"Submit"},e),this.options.behaviour.singlePoint&&(this.options.behaviour.enableScoreExplanation=!1),this.draggables=[],this.dropZones=[],this.answered=n&&void 0!==n.previousState&&void 0!==n.previousState.answers&&n.previousState.answers.length,this.blankIsCorrect=!0,this.backgroundOpacity=void 0===this.options.behaviour.backgroundOpacity||""===this.options.behaviour.backgroundOpacity.trim()?void 0:this.options.behaviour.backgroundOpacity,r.$noDropZone=V('<div class="h5p-dq-no-dz" role="button" style="display:none;"><span class="h5p-hidden-read">'+r.options.noDropzone+"</span></div>");var s=ee(r.draggables,r.dropZones,r.$noDropZone[0]),a=function(e){for(var t=0;t<s.drop.elements.length;t++)s.drop.elements[t].setAttribute("aria-dropeffect",e)},l=[],c=this.options.question.task;for(this.correctDZs=[],i=0;i<c.dropZones.length;i++){l.push(!0);var h=c.dropZones[i].correctElements;for(o=0;o<h.length;o++){var d=h[o];void 0===this.correctDZs[d]&&(this.correctDZs[d]=[]),this.correctDZs[d].push(i)}}this.weight=1;var p=function(e){return!(void 0===e.dropZones||!e.dropZones.length)},u={prefix:r.options.grabbablePrefix.replace("{total}",c.elements.filter(p).length),suffix:r.options.grabbableSuffix,correctAnswer:r.options.correctAnswer,wrongAnswer:r.options.wrongAnswer},g=1;for(i=0;i<c.elements.length;i++){var f=c.elements[i];if(p(f)){void 0!==this.backgroundOpacity&&(f.backgroundOpacity=this.backgroundOpacity);var b=null;n&&void 0!==n.previousState&&void 0!==n.previousState.answers&&void 0!==n.previousState.answers[i]&&(b=n.previousState.answers[i]);var v=new W(f,i,b,u,c.dropZones,g++),m="dragging"===r.options.behaviour.dropZoneHighlighting;for(v.on("elementadd",(function(e){s.drag.addElement(e.data)})),v.on("elementremove",(function(e){s.drag.removeElement(e.data),"true"===e.data.getAttribute("aria-grabbed")&&(s.drag.firesEvent("select",e.data),e.data.removeAttribute("aria-grabbed"))})),v.on("focus",(function(e){s.drag.setTabbable(e.data),e.data.focus()})),v.on("dragstart",(function(e){m&&r.$container.addClass("h5p-dq-highlight-dz"),a(e.data)})),v.on("dragend",(function(){m&&r.$container.removeClass("h5p-dq-highlight-dz"),a("none")})),v.on("interacted",(function(){r.answered=!0,r.triggerXAPI("interacted")})),v.on("leavingDropZone",(function(e){r.dropZones[e.data.dropZone].removeAlignable(e.data.$)})),this.draggables[i]=v,o=0;o<f.dropZones.length;o++)l[f.dropZones[o]]=!1}}this.numDropZonesWithoutElements=0;var y={prefix:r.options.dropzonePrefix.replace("{total}",c.dropZones.length),tipLabel:r.options.tipLabel,tipAvailable:r.options.tipAvailable};for(i=0;i<c.dropZones.length;i++){var w=c.dropZones[i];!0===l[i]&&(this.numDropZonesWithoutElements+=1),this.blankIsCorrect&&w.correctElements.length&&(this.blankIsCorrect=!1),w.autoAlign={enabled:w.autoAlign,spacing:r.options.behaviour.autoAlignSpacing,size:r.options.question.settings.size},this.dropZones[i]=new j(w,i,y),this.dropZones[i].on("elementaligned",(function(e){for(var t=e.data,n=0;n<r.draggables.length;n++){var i=r.draggables[n];if(i&&i.elements&&i.elements.length)for(var o=0;o<i.elements.length;o++){var s=i.elements[o];if(s&&s.$[0]===t[0])return void(s.position=F.positionToPercentage(r.$container,s.$))}}}))}this.on("resize",r.resize,r),this.on("domChanged",(function(e){r.contentId===e.data.contentId&&r.trigger("resize")})),this.on("enterFullScreen",(function(){r.$container&&(r.$container.parents(".h5p-content").css("height","100%"),r.trigger("resize"))})),this.on("exitFullScreen",(function(){r.$container&&(r.$container.parents(".h5p-content").css("height","auto"),r.trigger("resize"))}))}J.prototype=Object.create(H5P.Question.prototype),J.prototype.constructor=J,J.prototype.registerDomElements=function(){var e=this;e.options.behaviour.showTitle&&(e.$introduction=V('<p class="h5p-dragquestion-introduction" id="dq-intro-'+Y+'">'+e.options.question.settings.questionTitle+"</p>"),e.setIntroduction(e.$introduction));var t="";if(void 0!==this.options.question.settings.background&&(t+="h5p-dragquestion-has-no-background"),"always"===e.options.behaviour.dropZoneHighlighting&&(t&&(t+=" "),t+="h5p-dq-highlight-dz-always"),e.setContent(e.createQuestionContent(),{class:t}),!1!==H5P.canHasFullScreen&&this.options.behaviour.enableFullScreen){var n=function(){H5P.isFullscreen?H5P.exitFullScreen(e.$container):H5P.fullScreen(e.$container.parent().parent(),e)},i=V("<div/>",{class:"h5p-my-fullscreen-button-enter",title:this.options.localize.fullscreen,role:"button",tabindex:0,on:{click:n,keypress:function(e){13!==e.which&&32!==e.which||(n(),e.preventDefault())}},prependTo:this.$container.parent()});this.on("enterFullScreen",(function(){i.attr("class","h5p-my-fullscreen-button-exit"),i.attr("title",this.options.localize.exitFullscreen)})),this.on("exitFullScreen",(function(){i.attr("class","h5p-my-fullscreen-button-enter"),i.attr("title",this.options.localize.fullscreen)}))}e.registerButtons(),setTimeout((function(){e.trigger("resize")}),200)},J.prototype.getXAPIData=function(){var e=this.createXAPIEventTemplate("answered");return this.addQuestionToXAPI(e),this.addResponseToXAPI(e),{statement:e.data.statement}},J.prototype.addQuestionToXAPI=function(e){var t=e.getVerifiedStatementValue(["object","definition"]);V.extend(t,this.getXAPIDefinition())},J.prototype.getXAPIDefinition=function(){var e={};e.description={"en-US":V("<div>"+this.options.question.settings.questionTitle+"</div>").text()},e.type="http://adlnet.gov/expapi/activities/cmi.interaction",e.interactionType="matching",e.source=[];for(var t=0;t<this.options.question.task.elements.length;t++){var n=this.options.question.task.elements[t];if(n.dropZones&&n.dropZones.length){var i=n.type.params.alt?n.type.params.alt:n.type.params.text;e.source.push({id:""+t,description:{"en-US":V("<div>"+i+"</div>").text()}})}}e.correctResponsesPattern=[""],e.target=[];var o=!0;for(t=0;t<this.options.question.task.dropZones.length;t++)if(e.target.push({id:""+t,description:{"en-US":V("<div>"+this.options.question.task.dropZones[t].label+"</div>").text()}}),this.options.question.task.dropZones[t].correctElements)for(var r=0;r<this.options.question.task.dropZones[t].correctElements.length;r++){var s=this.options.question.task,a=s.elements[s.dropZones[t].correctElements[r]];!a||a.dropZones.indexOf(t.toString())<0||(o||(e.correctResponsesPattern[0]+="[,]"),e.correctResponsesPattern[0]+=t+"[.]"+s.dropZones[t].correctElements[r],o=!1)}return e},J.prototype.addResponseToXAPI=function(e){var t=this.getMaxScore(),n=this.getScore(),i=n==t;e.setScoredResult(n,t,this,!0,i),e.data.statement.result.response=this.getUserXAPIResponse()},J.prototype.getUserXAPIResponse=function(){var e=this.getUserAnswers();return e?e.filter((function(e){return e.elements.length})).map((function(e){return e.elements.filter((function(e){return void 0!==e.dropZone})).map((function(t){return t.dropZone+"[.]"+e.index})).join("[,]")})).filter((function(e){return void 0!==e&&""!==e})).join("[,]"):""},J.prototype.getUserAnswers=function(){return this.draggables.map((function(e,t){return{index:t,draggable:e}})).filter((function(e){return void 0!==e.draggable&&e.draggable.elements})).map((function(e){return{index:e.index,elements:e.draggable.elements}}))},J.prototype.createQuestionContent=function(){var e;this.$container=V('<div class="h5p-inner" role="application" aria-labelledby="dq-intro-'+Y+'"></div>'),void 0!==this.options.question.settings.background&&this.$container.css("backgroundImage",'url("'+H5P.getPath(this.options.question.settings.background.path,this.id)+'")');var t=this.options.question.task;for(e=0;e<t.elements.length;e++){var n=t.elements[e];if(void 0!==n.dropZones&&0!==n.dropZones.length)this.draggables[e].appendTo(this.$container,this.id);else{var i=this.addElement(n,"static",e);H5P.newRunnable(n.type,this.id,i),function(e,t){setTimeout((function(){F.setOpacity(e,"background",t.backgroundOpacity)}),0)}(i,n)}}for(this.$noDropZone.appendTo(this.$container),e=0;e<this.dropZones.length;e++)this.dropZones[e].appendTo(this.$container,this.draggables);return this.$container},J.prototype.registerButtons=function(){this.options.behaviour.enableCheckButton&&this.addSolutionButton(),this.addRetryButton()},J.prototype.addSolutionButton=function(){var e=this;this.addButton("check-answer",this.options.scoreShow,(function(){e.answered=!0,e.showAllSolutions(),e.showScore(),e.addExplanation();var t=e.createXAPIEventTemplate("answered");e.addQuestionToXAPI(t),e.addResponseToXAPI(t),e.trigger(t),(e.$introduction?e.$introduction:e.$container.children().first()).focus()}),!0,{"aria-label":this.options.a11yCheck},{contentData:this.contentData,textIfSubmitting:this.options.submit})},J.prototype.addExplanation=function(){var e=this,t=this.options.question.task,n=[];t.dropZones.forEach((function(t,i){var o={correct:t.tipsAndFeedback.feedbackOnCorrect,incorrect:t.tipsAndFeedback.feedbackOnIncorrect};if(void 0!==o.correct||void 0!==o.incorrect){var r=t.correctElements,s={};e.draggables.forEach((function(e){e.elements.forEach((function(t){t.dropZone==i&&(s[e.id]={instance:e,correct:-1!==r.indexOf(""+e.id)})}))})),Object.keys(s).forEach((function(e){var r=s[e],a=F.strip(r.instance.type.params.alt||r.instance.type.params.text)||"?",l=F.strip(t.label);r.correct&&o.correct?(n.push({correct:l+" + "+a,text:o.correct}),r.instance.setFeedback(o.correct,i)):!r.correct&&o.incorrect&&(n.push({correct:l+" + ",wrong:a,text:o.incorrect}),r.instance.setFeedback(o.incorrect,i))}))}})),0!==n.length&&this.setExplanation(n,this.options.feedbackHeader)},J.prototype.addRetryButton=function(){var e=this;this.addButton("try-again",this.options.tryAgain,(function(){e.resetTask(),e.showButton("check-answer"),e.hideButton("try-again")}),!1,{"aria-label":this.options.a11yRetry})},J.prototype.addElement=function(e,t,n){return V('<div class="h5p-'+t+'" style="left:'+e.x+"%;top:"+e.y+"%;width:"+e.width+"em;height:"+e.height+'em"></div>').appendTo(this.$container).data("id",n)},J.prototype.resize=function(e){var t=this;if(void 0!==this.$container&&this.$container.is(":visible")){t.dropZones.forEach((function(e){e.updateBackgroundOpacity()}));var n=e&&e.data&&e.data.decreaseSize;n||(this.$container.css("height","99999px"),t.$container.parents(".h5p-standalone.h5p-dragquestion").css("width",""));var i=this.options.question.settings.size,o=i.width/i.height,r=this.$container.parent(),s=r.width()-parseFloat(r.css("margin-left"))-parseFloat(r.css("margin-right")),a=t.$container.parents(".h5p-standalone.h5p-dragquestion.h5p-semi-fullscreen");if(a.length){a.css("width",""),n||(t.$container.css("width","10px"),a.css("width",""),setTimeout((function(){t.trigger("resize",{decreaseSize:!0})}),200));var l=V(window.frameElement);l&&(s=l.parent().width(),a.css("width",s+"px"))}var c=s/o;s<=0&&(s=i.width,c=i.height),this.$container.css({width:s+"px",height:c+"px",fontSize:s/i.width*16+"px"})}},J.prototype.disableDraggables=function(){this.draggables.forEach((function(e){e.disable()}))},J.prototype.enableDraggables=function(){this.draggables.forEach((function(e){e.enable()}))},J.prototype.showAllSolutions=function(e){var t;this.points=0,this.rawPoints=0,this.blankIsCorrect&&(this.points=1,this.rawPoints=1),!e&&this.options.behaviour.showScorePoints&&!this.options.behaviour.singlePoint&&this.options.behaviour.applyPenalties&&(t=new H5P.Question.ScorePoints);for(var n=0;n<this.draggables.length;n++){var i=this.draggables[n];void 0!==i&&(e||i.disable(),this.points+=i.results(e,this.correctDZs[n],t),this.rawPoints+=i.rawPoints)}this.points<0&&(this.points=0),!this.answered&&this.blankIsCorrect&&(this.points=this.weight),this.options.behaviour.singlePoint&&(this.points=this.points===this.calculateMaxScore()?1:0),e||this.hideButton("check-answer"),this.options.behaviour.enableRetry&&!e&&this.showButton("try-again"),!this.hasButton("check-answer")||!1!==this.options.behaviour.enableRetry&&this.points!==this.getMaxScore()||this.hideButton("try-again")},J.prototype.showSolutions=function(){this.showAllSolutions(),this.showScore(),this.hideButton("check-answer"),this.hideButton("try-again"),this.disableDraggables()},J.prototype.resetTask=function(){if(this.points=0,this.rawPoints=0,this.answered=!1,this.$container)this.dropZones.forEach((function(e){e.reset()})),this.enableDraggables(),this.draggables.forEach((function(e){e.resetPosition()}));else for(var e=0;e<this.draggables.length;e++)if(void 0!==this.draggables[e])for(var t=0;t<this.draggables[e].elements.length;t++)void 0!==this.draggables[e].elements[t]&&(this.draggables[e].elements[t].dropZone=void 0,this.draggables[e].elements[t].position=void 0);this.showButton("check-answer"),this.hideButton("try-again"),this.removeFeedback(),this.setExplanation()},J.prototype.calculateMaxScore=function(){var e=0;if(this.blankIsCorrect)return 1;for(var t=this.options.question.task.elements,n=0;n<t.length;n++){var i=this.correctDZs[n];void 0!==i&&i.length&&(t[n].multiple?e+=i.length:e++)}return e},J.prototype.getMaxScore=function(){return this.options.behaviour.singlePoint?this.weight:this.calculateMaxScore()},J.prototype.getScore=function(){this.showAllSolutions(!0);var e=this.options.behaviour.applyPenalties||this.options.behaviour.singlePoint?this.points:this.rawPoints;return delete this.points,delete this.rawPoints,e},J.prototype.getAnswerGiven=function(){return this.answered||this.blankIsCorrect},J.prototype.showScore=function(){var e=this.calculateMaxScore();this.options.behaviour.singlePoint&&(e=1);var t=this.options.behaviour.applyPenalties||this.options.behaviour.singlePoint?this.points:this.rawPoints,n=H5P.Question.determineOverallFeedback(this.options.overallFeedback,t/e).replace("@score",t).replace("@total",e),i=!(!this.options.behaviour.enableScoreExplanation||!this.options.behaviour.applyPenalties)&&this.options.scoreExplanation;this.setFeedback(n,t,e,this.options.scoreBarLabel,i,void 0,this.options.scoreExplanationButtonLabel)},J.prototype.getCurrentState=function(){for(var e={answers:[]},t=0;t<this.draggables.length;t++){var n=this.draggables[t];if(void 0!==n){for(var i=[],o=0;o<n.elements.length;o++){var r=n.elements[o];void 0!==r&&void 0!==r.dropZone&&i.push({x:Number(r.position.left.replace("%","")),y:Number(r.position.top.replace("%","")),dz:r.dropZone})}i.length&&(e.answers[t]=i)}}return e},J.prototype.getTitle=function(){return H5P.createTitle(this.contentData&&this.contentData.metadata&&this.contentData.metadata.title?this.contentData.metadata.title:"Drag and drop")};var ee=function(e,t,n){var i,o={drag:new w([new z,new q,new O]),drop:new w([new z,new q,new B])};o.drag.useNegativeTabIndex(),o.drop.useNegativeTabIndex();var r=function(){i.draggable.trigger("dragend"),i.element.$.removeClass("h5p-draggable-hover"),F.setElementOpacity(i.element.$,i.draggable.backgroundOpacity),-1!==o.drop.elements.indexOf(n)&&(o.drop.removeElement(n),n.style.display="none");for(var e=0;e<t.length;e++){var r=t[e];r.dehighlight(),-1!==o.drop.elements.indexOf(r.$dropZone[0])&&o.drop.removeElement(r.$dropZone[0])}if(i.element.$.is(":visible"))i.element.$.focus();else{var s=i.draggable.elements[i.draggable.elements.length-1].$;o.drag.setTabbable(s[0]),s.focus()}i=void 0};return o.drag.on("select",(function(s){var a=F.elementToDraggable(e,s.element);if(i)r();else{var l;(i=a).element.$.addClass("h5p-draggable-hover"),F.setElementOpacity(i.element.$,i.draggable.backgroundOpacity),i.draggable.trigger("dragstart",i.draggable.mustCopyElement(i.element)?"copy":"move"),o.drop.addElement(n),n.style.display="block",n.style.left=i.draggable.x+"%",n.style.top=i.draggable.y+"%",n.style.width=i.draggable.width+"em",n.style.height=i.draggable.height+"em";for(var c=0;c<t.length;c++){var h=t[c];h.accepts(i.draggable,e)&&(h.highlight(),o.drop.addElement(h.$dropZone[0]),l&&i.element.dropZone!==h.id||(l=h.$dropZone))}l&&(o.drop.setTabbable(l[0]),l.focus())}})),o.drop.on("select",(function(e){if(i){if(e.element===n)return void 0!==i.element.dropZone&&i.element.reset(),void(void 0!==i&&(i.element.$.css({left:i.draggable.x+"%",top:i.draggable.y+"%",width:i.draggable.width+"em",height:i.draggable.height+"em"}),i.draggable.updatePlacement(i.element),i.element.$[0].setAttribute("aria-grabbed","false"),r()));var o=F.elementToDropZone(t,e.element);i.draggable.mustCopyElement(i.element)&&i.element.clone(),i.draggable.addToDropZone(i.index,i.element,o.id),i.element.$.css({left:o.x+"%",top:o.y+"%"}),-1===o.getIndexOf(i.element.$)&&o.alignables.push(i.element.$),o.autoAlign(),i.element.$[0].setAttribute("aria-grabbed","false"),r()}})),o};H5P.DragQuestion=J})();;
